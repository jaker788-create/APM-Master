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
 *
 * Auth: /stats, /dashboard, and /init accept the secret either as
 * ?key=SECRET or as the APM_STATS_KEY cookie (set by /dashboard on first
 * authenticated load, so the secret doesn't linger in browser history or
 * access logs).
 */

const GITHUB_URLS = {
	stable: 'https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js',
	beta: 'https://raw.githubusercontent.com/jaker788-create/APM-Master/Beta/forecast.user.js',
};

const COOKIE_NAME = 'APM_STATS_KEY';
const COOKIE_MAX_AGE = 86400; // 24h

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		if (path === '/check/stable' || path === '/check/beta') {
			const track = path === '/check/beta' ? 'beta' : 'stable';
			return handleCheck(url, track, request, env);
		}

		if (path === '/stats') {
			return handleStats(url, request, env);
		}

		if (path === '/dashboard') {
			return handleDashboard(url, request, env);
		}

		if (path === '/init') {
			return handleInit(url, request, env);
		}

		return new Response('Not found', { status: 404 });
	},
};

// ---- Version check + telemetry ----

async function handleCheck(url, track, request, env) {
	const params = {
		v: url.searchParams.get('v') || 'unknown',
		id: url.searchParams.get('id') || 'unknown',
		r: url.searchParams.get('r') || 'unknown',
		t: track,
		b: url.searchParams.get('b') || 'unknown',
	};

	const country = request.cf?.country || 'unknown';
	const logPromise = logTelemetry(params, country, env).catch(() => {});

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

// ---- Init (one-time DB setup) ----

async function handleInit(url, request, env) {
	if (!checkAuth(url, request, env)) {
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

// ---- Stats JSON ----

async function handleStats(url, request, env) {
	if (!checkAuth(url, request, env)) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!env.APM_DB) {
		return jsonResponse({ error: 'D1 not configured' }, 500);
	}

	const days = Math.min(parseInt(url.searchParams.get('days')) || 30, 90);
	const since = `-${days} days`;

	const [daily, versions, regions, browsers, totals, newUsers, countries, tracks] = await Promise.all([
		env.APM_DB.prepare(`
			SELECT date(checked_at) as day, COUNT(DISTINCT user_id) as users
			FROM checks WHERE checked_at >= datetime('now', ?)
			GROUP BY day ORDER BY day DESC
		`).bind(since).all(),

		env.APM_DB.prepare(`
			SELECT version, COUNT(*) as users FROM (
				SELECT user_id, version FROM checks
				WHERE checked_at >= datetime('now', ?)
				GROUP BY user_id HAVING checked_at = MAX(checked_at)
			) GROUP BY version ORDER BY users DESC
		`).bind(since).all(),

		env.APM_DB.prepare(`
			SELECT region, COUNT(DISTINCT user_id) as users
			FROM checks WHERE checked_at >= datetime('now', ?)
			GROUP BY region ORDER BY users DESC
		`).bind(since).all(),

		env.APM_DB.prepare(`
			SELECT browser, COUNT(DISTINCT user_id) as users
			FROM checks WHERE checked_at >= datetime('now', ?)
			GROUP BY browser ORDER BY users DESC
		`).bind(since).all(),

		env.APM_DB.prepare(`
			SELECT
				COUNT(DISTINCT CASE WHEN checked_at >= datetime('now', '-1 day') THEN user_id END) as dau,
				COUNT(DISTINCT CASE WHEN checked_at >= datetime('now', '-7 days') THEN user_id END) as wau,
				COUNT(DISTINCT CASE WHEN checked_at >= datetime('now', '-30 days') THEN user_id END) as mau,
				COUNT(DISTINCT user_id) as total_all_time
			FROM checks
		`).all(),

		env.APM_DB.prepare(`
			SELECT date(first_seen) as day, COUNT(*) as new_users FROM (
				SELECT user_id, MIN(checked_at) as first_seen
				FROM checks GROUP BY user_id
			) WHERE first_seen >= datetime('now', ?)
			GROUP BY day ORDER BY day DESC
		`).bind(since).all(),

		env.APM_DB.prepare(`
			SELECT country, COUNT(DISTINCT user_id) as users
			FROM checks WHERE checked_at >= datetime('now', ?)
			GROUP BY country ORDER BY users DESC
		`).bind(since).all(),

		env.APM_DB.prepare(`
			SELECT track, COUNT(*) as users FROM (
				SELECT user_id, track FROM checks
				WHERE checked_at >= datetime('now', ?)
				GROUP BY user_id HAVING checked_at = MAX(checked_at)
			) GROUP BY track ORDER BY users DESC
		`).bind(since).all(),
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
		countries: Object.fromEntries((countries.results || []).map(r => [r.country, r.users])),
		tracks: Object.fromEntries((tracks.results || []).map(r => [r.track, r.users])),
	}, 200, { 'Cache-Control': 'private, max-age=30' });
}

// ---- Dashboard (HTML) ----

async function handleDashboard(url, request, env) {
	const secret = env.STATS_SECRET || '';

	if (secret) {
		const queryKey = url.searchParams.get('key');
		const cookieKey = getCookieValue(request.headers.get('Cookie'), COOKIE_NAME);

		// First-time auth via URL: set cookie and redirect to clean URL so the
		// secret doesn't stay in browser history / access logs.
		if (queryKey === secret) {
			const clean = new URL(url);
			clean.searchParams.delete('key');
			return new Response(null, {
				status: 302,
				headers: {
					'Location': clean.pathname + (clean.search || ''),
					'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(secret)}; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}; Path=/`,
				},
			});
		}

		if (cookieKey !== secret) {
			return new Response('Unauthorized', { status: 401 });
		}
	}

	return new Response(dashboardHtml(), {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
			'X-Content-Type-Options': 'nosniff',
			'Referrer-Policy': 'no-referrer',
		},
	});
}

function dashboardHtml() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>APM Master Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #0f1117; color: #e0e0e0; padding: 24px; min-height: 100vh;
  }
  .container { max-width: 1400px; margin: 0 auto; }
  header { margin-bottom: 24px; }
  .header-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  h1 { font-size: 1.5rem; font-weight: 600; color: #fff; }
  .controls { display: flex; gap: 8px; align-items: center; }
  .controls select, .controls button {
    background: #1a1d27; color: #e0e0e0; border: 1px solid #2a2d3a;
    padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;
    font-family: inherit; transition: border-color 120ms;
  }
  .controls select:hover, .controls button:hover { border-color: #60a5fa; }
  .controls button:active { background: #2a2d3a; }
  .controls button:disabled { opacity: 0.5; cursor: not-allowed; }
  .subtitle { color: #888; font-size: 0.8rem; margin-top: 8px; }
  .subtitle .sep { opacity: 0.4; margin: 0 8px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .card { background: #1a1d27; border-radius: 12px; padding: 20px; border: 1px solid #2a2d3a; }
  .card .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 6px; }
  .card .value { font-size: 1.8rem; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; }
  .card .value.accent { color: #60a5fa; }
  .card .hint { font-size: 0.7rem; color: #666; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .charts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .chart-box { background: #1a1d27; border-radius: 12px; padding: 20px; border: 1px solid #2a2d3a; }
  .chart-box h2 { font-size: 0.85rem; font-weight: 600; margin-bottom: 14px; color: #ccc; }
  .chart-box.wide { grid-column: 1 / -1; }
  .chart-wrap { position: relative; height: 260px; }
  .chart-box.wide .chart-wrap { height: 280px; }
  .tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
  .table-box { background: #1a1d27; border-radius: 12px; padding: 20px; border: 1px solid #2a2d3a; }
  .table-box h2 { font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; color: #ccc; }
  .table-box table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  .table-box th { text-align: left; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; padding: 6px 0; border-bottom: 1px solid #2a2d3a; }
  .table-box th.num { text-align: right; }
  .table-box td { padding: 7px 0; font-size: 0.85rem; border-bottom: 1px solid #1e2130; }
  .table-box td.num { text-align: right; font-weight: 600; color: #60a5fa; }
  .table-box tr:last-child td { border-bottom: none; }
  .empty { color: #666; font-size: 0.8rem; padding: 8px 0; }
  .loading { text-align: center; padding: 60px; color: #666; }
  .error { color: #f87171; background: #1a1d27; padding: 20px; border-radius: 12px; border: 1px solid #7f1d1d; }
  .error button { margin-left: 8px; background: #2a2d3a; color: #e0e0e0; border: 1px solid #3a3d4a; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
  .spin { display: inline-block; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 1000px) { .charts { grid-template-columns: 1fr; } }
  @media (max-width: 600px) { body { padding: 16px; } .summary { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="header-top">
      <h1>APM Master Analytics</h1>
      <div class="controls">
        <label for="rangeSelect" style="color:#888;font-size:0.8rem;">Range:</label>
        <select id="rangeSelect" aria-label="Time range">
          <option value="7">7 days</option>
          <option value="30" selected>30 days</option>
          <option value="90">90 days</option>
        </select>
        <button id="refreshBtn" aria-label="Refresh data">&#8634; Refresh</button>
      </div>
    </div>
    <div class="subtitle" id="period">Loading&hellip;</div>
  </header>
  <div id="content"><div class="loading">Fetching analytics data&hellip;</div></div>
</div>
<script>
(() => {
  const fmt = n => (n || 0).toLocaleString();
  const trackLabel = { stable: 'Stable', beta: 'Beta', unknown: 'Unknown' };
  const browserLabel = { fx: 'Firefox', cr: 'Chrome', edge: 'Edge', other: 'Other', unknown: 'Unknown' };

  function compareVersions(a, b) {
    const parseV = (v) => {
      const m = String(v).match(/^(\\d+)\\.(\\d+)\\.(\\d+)(?:[-.](.+))?$/);
      if (!m) return null;
      return { nums: [+m[1], +m[2], +m[3]], pre: m[4] || null };
    };
    const pa = parseV(a), pb = parseV(b);
    if (!pa && !pb) return String(a).localeCompare(String(b));
    if (!pa) return 1;
    if (!pb) return -1;
    for (let i = 0; i < 3; i++) {
      if (pa.nums[i] !== pb.nums[i]) return pb.nums[i] - pa.nums[i];
    }
    // Release > pre-release for the same numeric version
    if (pa.pre && !pb.pre) return 1;
    if (!pa.pre && pb.pre) return -1;
    if (pa.pre && pb.pre) return String(pb.pre).localeCompare(String(pa.pre));
    return 0;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function tableHtml(pairs, headers) {
    if (!pairs.length) return '<div class="empty">No data</div>';
    return '<table><thead><tr><th>' + escapeHtml(headers[0]) +
      '</th><th class="num">' + escapeHtml(headers[1]) + '</th></tr></thead><tbody>' +
      pairs.map(([k, v]) => '<tr><td>' + escapeHtml(k) + '</td><td class="num">' + fmt(v) + '</td></tr>').join('') +
      '</tbody></table>';
  }

  const charts = {};
  let refreshTimer;

  function renderChart(id, config) {
    if (charts[id]) charts[id].destroy();
    const el = document.getElementById(id);
    if (!el) return;
    charts[id] = new Chart(el, config);
  }

  function render(d) {
    const verPairs = Object.entries(d.versions || {}).sort(([a], [b]) => compareVersions(a, b));
    const verLabels = verPairs.map(p => p[0]);
    const verCounts = verPairs.map(p => p[1]);
    const totalVer = verCounts.reduce((s, n) => s + n, 0);
    const threshold = totalVer * 0.03;

    const doughnutPairs = [];
    let otherCount = 0;
    verPairs.forEach(([v, c]) => {
      if (c >= threshold) doughnutPairs.push([v, c]);
      else otherCount += c;
    });
    if (otherCount > 0) doughnutPairs.push(['Other', otherCount]);

    const latestVer = verLabels[0] || '—';
    const latestCount = verCounts[0] || 0;
    const pctLatest = totalVer > 0 ? Math.round(100 * latestCount / totalVer) : 0;

    const dailyDays = Object.keys(d.dailyActive || {}).sort();
    const dailyCounts = dailyDays.map(k => d.dailyActive[k]);
    const newDays = Object.keys(d.newUsers || {}).sort();

    const regPairs = Object.entries(d.regions || {});
    const countryPairs = Object.entries(d.countries || {});
    const browserPairs = Object.entries(d.browsers || {}).map(([k, v]) => [browserLabel[k] || k, v]);
    const trackPairs = Object.entries(d.tracks || {}).map(([k, v]) => [trackLabel[k] || k, v]);
    const newUserPairs = newDays.slice(-10).reverse().map(day => [day, d.newUsers[day]]);

    document.getElementById('period').innerHTML =
      'Period: ' + d.period.days + ' days' +
      '<span class="sep">·</span>' +
      'Updated: ' + new Date(d.period.generated).toLocaleString();

    document.getElementById('content').innerHTML =
      '<div class="summary">' +
        '<div class="card"><div class="label">Today (DAU)</div><div class="value accent">' + fmt(d.summary.dau) + '</div></div>' +
        '<div class="card"><div class="label">This Week (WAU)</div><div class="value">' + fmt(d.summary.wau) + '</div></div>' +
        '<div class="card"><div class="label">This Month (MAU)</div><div class="value">' + fmt(d.summary.mau) + '</div></div>' +
        '<div class="card"><div class="label">All Time</div><div class="value">' + fmt(d.summary.totalAllTime) + '</div></div>' +
        '<div class="card"><div class="label">On Latest</div><div class="value">' + pctLatest + '%</div><div class="hint" title="' + escapeHtml(latestVer) + '">' + escapeHtml(latestVer) + '</div></div>' +
      '</div>' +
      '<div class="charts">' +
        '<div class="chart-box wide"><h2>Daily Active Users</h2><div class="chart-wrap"><canvas id="dauChart" aria-label="Daily active users line chart" role="img"></canvas></div></div>' +
        '<div class="chart-box"><h2>Version Distribution</h2><div class="chart-wrap"><canvas id="verChart" aria-label="Version distribution doughnut chart" role="img"></canvas></div></div>' +
        '<div class="chart-box"><h2>Browser Split</h2><div class="chart-wrap"><canvas id="brChart" aria-label="Browser split doughnut chart" role="img"></canvas></div></div>' +
        '<div class="chart-box"><h2>Track Split</h2><div class="chart-wrap"><canvas id="trackChart" aria-label="Release track doughnut chart" role="img"></canvas></div></div>' +
      '</div>' +
      '<div class="tables">' +
        '<div class="table-box"><h2>Versions</h2>' + tableHtml(verPairs, ['Version', 'Users']) + '</div>' +
        '<div class="table-box"><h2>Regions</h2>' + tableHtml(regPairs, ['Region', 'Users']) + '</div>' +
        '<div class="table-box"><h2>Countries</h2>' + tableHtml(countryPairs, ['Country', 'Users']) + '</div>' +
        '<div class="table-box"><h2>Browsers</h2>' + tableHtml(browserPairs, ['Browser', 'Users']) + '</div>' +
        '<div class="table-box"><h2>New Users (10d)</h2>' + tableHtml(newUserPairs, ['Date', 'New']) + '</div>' +
      '</div>';

    const gridColor = '#2a2d3a';
    const textColor = '#888';
    const palette = ['#60a5fa','#f472b6','#34d399','#fbbf24','#a78bfa','#fb923c','#22d3ee','#e879f9','#94a3b8'];

    renderChart('dauChart', {
      type: 'line',
      data: {
        labels: dailyDays.map(dt => dt.slice(5)),
        datasets: [{
          data: dailyCounts,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96,165,250,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: '#60a5fa',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, maxRotation: 45 }, grid: { color: gridColor } },
          y: { beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } },
        },
      },
    });

    const doughnutOpts = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, padding: 10, boxWidth: 12, font: { size: 11 } } },
      },
    };

    renderChart('verChart', {
      type: 'doughnut',
      data: {
        labels: doughnutPairs.map(p => p[0]),
        datasets: [{
          data: doughnutPairs.map(p => p[1]),
          backgroundColor: palette.slice(0, doughnutPairs.length),
          borderColor: '#0f1117',
          borderWidth: 2,
        }],
      },
      options: doughnutOpts,
    });

    renderChart('brChart', {
      type: 'doughnut',
      data: {
        labels: browserPairs.map(p => p[0]),
        datasets: [{
          data: browserPairs.map(p => p[1]),
          backgroundColor: palette.slice(0, browserPairs.length),
          borderColor: '#0f1117',
          borderWidth: 2,
        }],
      },
      options: doughnutOpts,
    });

    renderChart('trackChart', {
      type: 'doughnut',
      data: {
        labels: trackPairs.map(p => p[0]),
        datasets: [{
          data: trackPairs.map(p => p[1]),
          backgroundColor: ['#60a5fa', '#f472b6', '#94a3b8'].slice(0, trackPairs.length),
          borderColor: '#0f1117',
          borderWidth: 2,
        }],
      },
      options: doughnutOpts,
    });
  }

  async function load(days) {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="spin">&#8634;</span> Refresh';

    try {
      const res = await fetch('/stats?days=' + encodeURIComponent(days), { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();
      render(d);
    } catch (e) {
      document.getElementById('content').innerHTML =
        '<div class="error">Error loading analytics: ' + escapeHtml(e.message || 'Unknown') +
        '<button id="retryBtn">Retry</button></div>';
      const retry = document.getElementById('retryBtn');
      if (retry) retry.onclick = () => load(+document.getElementById('rangeSelect').value);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '&#8634; Refresh';
    }
  }

  function scheduleAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      load(+document.getElementById('rangeSelect').value);
    }, 5 * 60 * 1000);
  }

  document.getElementById('rangeSelect').addEventListener('change', (e) => {
    load(+e.target.value);
    scheduleAutoRefresh();
  });
  document.getElementById('refreshBtn').addEventListener('click', () => {
    load(+document.getElementById('rangeSelect').value);
    scheduleAutoRefresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) load(+document.getElementById('rangeSelect').value);
  });

  scheduleAutoRefresh();
  load(30);
})();
</script>
</body>
</html>`;
}

// ---- Auth + helpers ----

function checkAuth(url, request, env) {
	const secret = env.STATS_SECRET || '';
	if (!secret) return true;
	if (url.searchParams.get('key') === secret) return true;
	const cookieKey = getCookieValue(request.headers.get('Cookie'), COOKIE_NAME);
	return cookieKey === secret;
}

function getCookieValue(cookieHeader, name) {
	if (!cookieHeader) return null;
	const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
	return match ? decodeURIComponent(match[1]) : null;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			...extraHeaders,
		},
	});
}
