/**
 * APM Master — Update Check Analytics Proxy (D1)
 *
 * Proxies version check requests to GitHub raw, logs telemetry to D1.
 * Routes:
 *   GET /check/stable?v=...&id=...&r=...&t=...&b=...  → proxy + log
 *   GET /check/beta?v=...&id=...&r=...&t=...&b=...    → proxy + log
 *   GET /stats?key=SECRET                               → analytics JSON
 *   GET /stats?key=SECRET&days=N                        → custom range (default 30)
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

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
