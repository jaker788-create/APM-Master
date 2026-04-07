/**
 * APM Master — Update Check Analytics Proxy
 *
 * Proxies version check requests to GitHub raw, logs telemetry to KV.
 * Routes:
 *   GET /check/stable?v=...&id=...&r=...&t=...&b=...  → proxy + log
 *   GET /check/beta?v=...&id=...&r=...&t=...&b=...    → proxy + log
 *   GET /stats?key=SECRET                               → analytics JSON
 */

const GITHUB_URLS = {
	stable: 'https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js',
	beta: 'https://raw.githubusercontent.com/jaker788-create/APM-Master/Beta/forecast.user.js',
};

const KV_TTL = 90 * 24 * 60 * 60; // 90 days in seconds

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// --- Version check proxy ---
		if (path === '/check/stable' || path === '/check/beta') {
			const track = path === '/check/beta' ? 'beta' : 'stable';
			return handleCheck(url, track, env);
		}

		// --- Stats endpoint ---
		if (path === '/stats') {
			return handleStats(url, env);
		}

		return new Response('Not found', { status: 404 });
	},
};

async function handleCheck(url, track, env) {
	// Extract telemetry from query params
	const params = {
		v: url.searchParams.get('v') || 'unknown',
		id: url.searchParams.get('id') || 'unknown',
		r: url.searchParams.get('r') || 'unknown',
		t: track,
		b: url.searchParams.get('b') || 'unknown',
	};

	// Log telemetry to KV (non-blocking, analytics failure is non-fatal)
	const logPromise = logTelemetry(params, env).catch(() => {});

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

	// Wait for telemetry write to finish (best-effort)
	await logPromise;
	return response;
}

async function logTelemetry(params, env) {
	if (!env.APM_ANALYTICS) return;

	const today = new Date().toISOString().split('T')[0];
	const key = `stats:${today}`;

	// Read existing daily aggregate
	let data = await env.APM_ANALYTICS.get(key, { type: 'json' });
	if (!data) data = { users: {} };

	// Upsert this user's entry
	data.users[params.id] = {
		v: params.v,
		r: params.r,
		t: params.t,
		b: params.b,
		ts: Date.now(),
	};

	await env.APM_ANALYTICS.put(key, JSON.stringify(data), { expirationTtl: KV_TTL });
}

async function handleStats(url, env) {
	// Simple secret-based auth
	const secret = env.STATS_SECRET || '';
	if (secret && url.searchParams.get('key') !== secret) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!env.APM_ANALYTICS) {
		return jsonResponse({ error: 'KV not configured' }, 500);
	}

	// Gather last 14 days
	const days = [];
	const now = new Date();
	for (let i = 0; i < 14; i++) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		days.push(d.toISOString().split('T')[0]);
	}

	const results = {};
	let totalUnique = new Set();
	let versionCounts = {};
	let regionCounts = {};
	let browserCounts = {};

	for (const day of days) {
		const data = await env.APM_ANALYTICS.get(`stats:${day}`, { type: 'json' });
		const userCount = data ? Object.keys(data.users).length : 0;
		results[day] = userCount;

		if (data) {
			for (const [id, info] of Object.entries(data.users)) {
				totalUnique.add(id);
				versionCounts[info.v] = (versionCounts[info.v] || 0) + 1;
				regionCounts[info.r] = (regionCounts[info.r] || 0) + 1;
				browserCounts[info.b] = (browserCounts[info.b] || 0) + 1;
			}
		}
	}

	return jsonResponse({
		period: { from: days[days.length - 1], to: days[0] },
		dailyActive: results,
		uniqueUsers14d: totalUnique.size,
		versions: versionCounts,
		regions: regionCounts,
		browsers: browserCounts,
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
