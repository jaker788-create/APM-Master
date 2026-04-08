/**
 * APM Master — Update Check Analytics Proxy (D1)
 *
 * Proxies version check requests to GitHub raw, logs telemetry to D1.
 * Routes:
 *   GET /check/stable?v=...&id=...&r=...&t=...&b=...  → proxy + log
 *   GET /check/beta?v=...&id=...&r=...&t=...&b=...    → proxy + log
 *   GET /stats?key=SECRET                               → analytics JSON
 *   GET /stats?key=SECRET&days=N                        → custom range (default 30)
 *   GET /dashboard?key=SECRET                           → visual analytics dashboard
 */

const GITHUB_URLS = {
	stable: 'https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js',
	beta: 'https://raw.githubusercontent.com/jaker788-create/APM-Master/Beta/forecast.user.js',
};

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// --- Version check proxy ---
		if (path === '/check/stable' || path === '/check/beta') {
			const track = path === '/check/beta' ? 'beta' : 'stable';
			return handleCheck(url, track, request, env);
		}

		// --- Stats endpoint ---
		if (path === '/stats') {
			return handleStats(url, env);
		}

		// --- Dashboard ---
		if (path === '/dashboard') {
			return handleDashboard(url, env);
		}

		// --- Init endpoint (one-time DB setup) ---
		if (path === '/init') {
			return handleInit(url, env);
		}

		return new Response('Not found', { status: 404 });
	},
};

async function handleCheck(url, track, request, env) {
	const params = {
		v: url.searchParams.get('v') || 'unknown',
		id: url.searchParams.get('id') || 'unknown',
		r: url.searchParams.get('r') || 'unknown',
		t: track,
		b: url.searchParams.get('b') || 'unknown',
	};

	// Cloudflare provides country from the request
	const country = request.cf?.country || 'unknown';

	// Log telemetry to D1 (non-blocking, analytics failure is non-fatal)
	const logPromise = logTelemetry(params, country, env).catch(() => {});

	// Proxy the real file from GitHub
	let response;
	try {
		const ghResponse = await fetch(GITHUB_URLS[track], {
			headers: { 'User-Agent': 'APM-Update-Proxy' },
		});

		response = new Response(ghResponse.body, {
			status: ghResponse.status,
			headers: {
				'Content-Type': 'text/javascript; charset=utf-8',
				'Cache-Control': 'no-cache',
				'Access-Control-Allow-Origin': '*',
			},
		});
	} catch (e) {
		response = new Response('Upstream fetch failed', { status: 502 });
	}

	await logPromise;
	return response;
}

async function logTelemetry(params, country, env) {
	if (!env.APM_DB) return;

	await env.APM_DB.prepare(`
		INSERT INTO checks (user_id, version, region, track, browser, country, checked_at)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
	`).bind(params.id, params.v, params.r, params.t, params.b, country).run();
}

async function handleInit(url, env) {
	const secret = env.STATS_SECRET || '';
	if (secret && url.searchParams.get('key') !== secret) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!env.APM_DB) {
		return jsonResponse({ error: 'D1 not configured' }, 500);
	}

	await env.APM_DB.batch([
		env.APM_DB.prepare("CREATE TABLE IF NOT EXISTS checks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, version TEXT NOT NULL, region TEXT NOT NULL DEFAULT 'unknown', track TEXT NOT NULL DEFAULT 'stable', browser TEXT NOT NULL DEFAULT 'unknown', country TEXT NOT NULL DEFAULT 'unknown', checked_at TEXT NOT NULL DEFAULT (datetime('now')))"),
		env.APM_DB.prepare("CREATE INDEX IF NOT EXISTS idx_checks_date ON checks (checked_at)"),
		env.APM_DB.prepare("CREATE INDEX IF NOT EXISTS idx_checks_user ON checks (user_id)"),
		env.APM_DB.prepare("CREATE INDEX IF NOT EXISTS idx_checks_version ON checks (version)"),
	]);

	return jsonResponse({ ok: true, message: 'Database initialized' });
}

async function handleStats(url, env) {
	const secret = env.STATS_SECRET || '';
	if (secret && url.searchParams.get('key') !== secret) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!env.APM_DB) {
		return jsonResponse({ error: 'D1 not configured' }, 500);
	}

	const days = Math.min(parseInt(url.searchParams.get('days')) || 30, 90);

	// Run all queries in parallel
	const [daily, versions, regions, browsers, totals, newUsers] = await Promise.all([
		// Daily active users
		env.APM_DB.prepare(`
			SELECT date(checked_at) as day, COUNT(DISTINCT user_id) as users
			FROM checks
			WHERE checked_at >= datetime('now', ?)
			GROUP BY day ORDER BY day DESC
		`).bind(`-${days} days`).all(),

		// Version distribution (latest check per user in the period)
		env.APM_DB.prepare(`
			SELECT version, COUNT(*) as users FROM (
				SELECT user_id, version FROM checks
				WHERE checked_at >= datetime('now', ?)
				GROUP BY user_id
				HAVING checked_at = MAX(checked_at)
			) GROUP BY version ORDER BY users DESC
		`).bind(`-${days} days`).all(),

		// Region breakdown
		env.APM_DB.prepare(`
			SELECT region, COUNT(DISTINCT user_id) as users
			FROM checks
			WHERE checked_at >= datetime('now', ?)
			GROUP BY region ORDER BY users DESC
		`).bind(`-${days} days`).all(),

		// Browser breakdown
		env.APM_DB.prepare(`
			SELECT browser, COUNT(DISTINCT user_id) as users
			FROM checks
			WHERE checked_at >= datetime('now', ?)
			GROUP BY browser ORDER BY users DESC
		`).bind(`-${days} days`).all(),

		// Totals: unique users for DAU (today), WAU (7d), MAU (30d)
		env.APM_DB.prepare(`
			SELECT
				COUNT(DISTINCT CASE WHEN checked_at >= datetime('now', '-1 day') THEN user_id END) as dau,
				COUNT(DISTINCT CASE WHEN checked_at >= datetime('now', '-7 days') THEN user_id END) as wau,
				COUNT(DISTINCT CASE WHEN checked_at >= datetime('now', '-30 days') THEN user_id END) as mau,
				COUNT(DISTINCT user_id) as total_all_time
			FROM checks
		`).all(),

		// New users (first seen in the period)
		env.APM_DB.prepare(`
			SELECT date(first_seen) as day, COUNT(*) as new_users FROM (
				SELECT user_id, MIN(checked_at) as first_seen
				FROM checks GROUP BY user_id
			)
			WHERE first_seen >= datetime('now', ?)
			GROUP BY day ORDER BY day DESC
		`).bind(`-${days} days`).all(),
	]);

	const t = totals.results?.[0] || {};

	return jsonResponse({
		period: { days, generated: new Date().toISOString() },
		summary: {
			dau: t.dau || 0,
			wau: t.wau || 0,
			mau: t.mau || 0,
			totalAllTime: t.total_all_time || 0,
		},
		dailyActive: Object.fromEntries((daily.results || []).map(r => [r.day, r.users])),
		newUsers: Object.fromEntries((newUsers.results || []).map(r => [r.day, r.new_users])),
		versions: Object.fromEntries((versions.results || []).map(r => [r.version, r.users])),
		regions: Object.fromEntries((regions.results || []).map(r => [r.region, r.users])),
		browsers: Object.fromEntries((browsers.results || []).map(r => [r.browser, r.users])),
	});
}

async function handleDashboard(url, env) {
	const secret = env.STATS_SECRET || '';
	if (secret && url.searchParams.get('key') !== secret) {
		return new Response('Unauthorized', { status: 401 });
	}

	const key = url.searchParams.get('key') || '';
	const statsUrl = `/stats?key=${encodeURIComponent(key)}&days=30`;

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>APM Master Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #0f1117; color: #e0e0e0; padding: 24px; }
  h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 8px; color: #fff; }
  .subtitle { color: #888; font-size: 0.85rem; margin-bottom: 24px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card { background: #1a1d27; border-radius: 12px; padding: 20px; border: 1px solid #2a2d3a; }
  .card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 4px; }
  .card .value { font-size: 2rem; font-weight: 700; color: #fff; }
  .card .value.accent { color: #60a5fa; }
  .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .chart-box { background: #1a1d27; border-radius: 12px; padding: 20px; border: 1px solid #2a2d3a; }
  .chart-box h2 { font-size: 0.9rem; font-weight: 600; margin-bottom: 16px; color: #ccc; }
  .chart-box.wide { grid-column: 1 / -1; }
  .tables { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
  .table-box { background: #1a1d27; border-radius: 12px; padding: 20px; border: 1px solid #2a2d3a; }
  .table-box h2 { font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; color: #ccc; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; padding: 6px 0; border-bottom: 1px solid #2a2d3a; }
  td { padding: 8px 0; font-size: 0.85rem; border-bottom: 1px solid #1e2130; }
  td:last-child { text-align: right; font-weight: 600; color: #60a5fa; }
  .loading { text-align: center; padding: 60px; color: #666; }
  .error { color: #f87171; background: #1a1d27; padding: 20px; border-radius: 12px; border: 1px solid #7f1d1d; }
  @media (max-width: 800px) { .charts, .tables { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<h1>APM Master Analytics</h1>
<div class="subtitle" id="period">Loading...</div>
<div id="content"><div class="loading">Fetching analytics data...</div></div>
<script>
(async () => {
  try {
    const res = await fetch('${statsUrl}');
    if (!res.ok) throw new Error('Failed: ' + res.status);
    const d = await res.json();

    document.getElementById('period').textContent =
      'Period: ' + d.period.days + ' days | Generated: ' + new Date(d.period.generated).toLocaleString();

    const dailyDays = Object.keys(d.dailyActive).sort();
    const dailyCounts = dailyDays.map(k => d.dailyActive[k]);
    const newDays = Object.keys(d.newUsers).sort();
    const newCounts = newDays.map(k => d.newUsers[k]);
    const verLabels = Object.keys(d.versions);
    const verCounts = Object.values(d.versions);
    const regLabels = Object.keys(d.regions);
    const regCounts = Object.values(d.regions);
    const brLabels = Object.keys(d.browsers).map(b => ({fx:'Firefox',cr:'Chrome',edge:'Edge',other:'Other'}[b]||b));
    const brCounts = Object.values(d.browsers);

    document.getElementById('content').innerHTML = \`
      <div class="summary">
        <div class="card"><div class="label">Today (DAU)</div><div class="value accent">\${d.summary.dau}</div></div>
        <div class="card"><div class="label">This Week (WAU)</div><div class="value">\${d.summary.wau}</div></div>
        <div class="card"><div class="label">This Month (MAU)</div><div class="value">\${d.summary.mau}</div></div>
        <div class="card"><div class="label">All Time</div><div class="value">\${d.summary.totalAllTime}</div></div>
      </div>
      <div class="charts">
        <div class="chart-box wide"><h2>Daily Active Users</h2><canvas id="dauChart"></canvas></div>
        <div class="chart-box"><h2>Version Distribution</h2><canvas id="verChart"></canvas></div>
        <div class="chart-box"><h2>Browser Split</h2><canvas id="brChart"></canvas></div>
      </div>
      <div class="tables">
        <div class="table-box"><h2>Versions</h2><table><thead><tr><th>Version</th><th>Users</th></tr></thead><tbody>\${
          verLabels.map((v,i) => '<tr><td>'+v+'</td><td>'+verCounts[i]+'</td></tr>').join('')
        }</tbody></table></div>
        <div class="table-box"><h2>Regions</h2><table><thead><tr><th>Region</th><th>Users</th></tr></thead><tbody>\${
          regLabels.map((r,i) => '<tr><td>'+r+'</td><td>'+regCounts[i]+'</td></tr>').join('')
        }</tbody></table></div>
        <div class="table-box"><h2>New Users</h2><table><thead><tr><th>Date</th><th>New</th></tr></thead><tbody>\${
          newDays.slice(-10).reverse().map((d2,i) => '<tr><td>'+d2+'</td><td>'+newCounts[newDays.indexOf(d2)]+'</td></tr>').join('')
        }</tbody></table></div>
      </div>
    \`;

    const gridColor = '#2a2d3a';
    const textColor = '#888';
    const defaults = { responsive: true, plugins: { legend: { display: false } } };

    new Chart(document.getElementById('dauChart'), {
      type: 'line',
      data: {
        labels: dailyDays.map(d2 => d2.slice(5)),
        datasets: [{
          data: dailyCounts,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96,165,250,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: '#60a5fa',
        }]
      },
      options: { ...defaults, scales: {
        x: { ticks: { color: textColor, maxRotation: 45 }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } }
      }}
    });

    const palette = ['#60a5fa','#f472b6','#34d399','#fbbf24','#a78bfa','#fb923c','#22d3ee','#e879f9'];
    new Chart(document.getElementById('verChart'), {
      type: 'doughnut',
      data: { labels: verLabels, datasets: [{ data: verCounts, backgroundColor: palette.slice(0, verLabels.length) }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 12 } } } }
    });

    new Chart(document.getElementById('brChart'), {
      type: 'doughnut',
      data: { labels: brLabels, datasets: [{ data: brCounts, backgroundColor: palette.slice(0, brLabels.length) }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 12 } } } }
    });

  } catch (e) {
    document.getElementById('content').innerHTML = '<div class="error">Error loading analytics: ' + e.message + '</div>';
  }
})();
</script>
</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
}

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
