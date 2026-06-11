// Spotics Scrobble Server - Cloudflare Worker
//
// Endpoints:
//   POST /scrobble          - Submit a scrobble event
//   POST /now-playing       - Update now-playing status
//   GET  /scrobbles         - Get scrobble history (paginated, filterable)
//   GET  /stats             - Get aggregated stats for the authenticated user
//   GET  /stats/top-artists - Get top artists
//   GET  /stats/top-tracks  - Get top tracks
//   GET  /stats/listening   - Get listening time stats
//   GET  /stats/heatmap     - Get listening heatmap data (hour x day)
//   GET  /now-playing       - Get current now-playing track
//   GET  /health            - Health check
//   POST /auth/register     - Register a new API key

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // --- Public endpoints (no auth required) ---
      if (path === '/health' && method === 'GET') {
        return jsonResponse({ status: 'ok', service: 'spotics-scrobble-server', version: '1.0.0' }, corsHeaders);
      }

      if (path === '/auth/register' && method === 'POST') {
        return handleRegister(env, corsHeaders);
      }

      // --- Authenticated endpoints ---
      const apiKey = extractApiKey(request);
      if (!apiKey) {
        return errorResponse(401, 'Missing API key. Include X-API-Key header.', corsHeaders);
      }

      // Validate API key
      const isValid = await validateApiKey(env, apiKey);
      if (!isValid) {
        return errorResponse(403, 'Invalid API key.', corsHeaders);
      }

      if (path === '/auth/revoke' && method === 'POST') {
        return handleRevoke(env, apiKey, corsHeaders);
      }

      // Update last used timestamp
      await env.DB.prepare('UPDATE api_keys SET last_used = datetime("now"), rate_limit_count = rate_limit_count + 1 WHERE key = ?')
        .bind(apiKey).run();

      // Route authenticated requests
      switch (true) {
        case path === '/scrobble' && method === 'POST':
          return handleScrobble(request, env, apiKey, corsHeaders);

        case path === '/test-scrobble' && method === 'POST':
          return handleTestScrobble(request, env, apiKey, corsHeaders);

        case path === '/now-playing' && method === 'POST':
          return handleNowPlaying(request, env, apiKey, corsHeaders);

        case path === '/now-playing' && method === 'GET':
          return handleGetNowPlaying(env, apiKey, corsHeaders);

        case path === '/scrobbles' && method === 'GET':
          return handleGetScrobbles(request, env, apiKey, corsHeaders);

        case path === '/stats' && method === 'GET':
          return handleGetStats(request, env, apiKey, corsHeaders);

        case path === '/stats/top-artists' && method === 'GET':
          return handleGetTopArtists(request, env, apiKey, corsHeaders);

        case path === '/stats/top-tracks' && method === 'GET':
          return handleGetTopTracks(request, env, apiKey, corsHeaders);

        case path === '/stats/listening' && method === 'GET':
          return handleGetListeningStats(request, env, apiKey, corsHeaders);

        case path === '/stats/heatmap' && method === 'GET':
          return handleGetHeatmap(request, env, apiKey, corsHeaders);

        default:
          return errorResponse(404, `Not found: ${method} ${path}`, corsHeaders);
      }
    } catch (err) {
      console.error('Worker error:', err);
      return errorResponse(500, 'Internal server error', corsHeaders);
    }
  },
};

// --- Auth ---

function extractApiKey(request) {
  const header = request.headers.get('X-API-Key');
  if (header) return header.trim();

  // Also check Authorization header: "Bearer <key>"
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7).trim();
  }

  return null;
}

async function validateApiKey(env, key) {
  // Check if key matches the pattern and exists in DB
  if (!key.startsWith('spotics_')) return false;

  const result = await env.DB.prepare('SELECT key FROM api_keys WHERE key = ? AND is_active = 1')
    .bind(key)
    .first();

  return !!result;
}

async function handleRegister(env, corsHeaders) {
  const apiKey = generateApiKey();

  await env.DB.prepare('INSERT INTO api_keys (key) VALUES (?)')
    .bind(apiKey)
    .run();

  return jsonResponse({
    api_key: apiKey,
    message: 'API key created successfully. Save this key — it won\'t be shown again.',
  }, corsHeaders, 201);
}

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'spotics_live_';
  let suffix = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) {
    suffix += chars[array[i] % chars.length];
  }
  return prefix + suffix;
}

async function handleRevoke(env, apiKey, corsHeaders) {
  // Deactivate current key and all keys owned by this user
  await env.DB.prepare('UPDATE api_keys SET is_active = 0 WHERE key = ?')
    .bind(apiKey)
    .run();

  return jsonResponse({ success: true, message: 'API key revoked successfully.' }, corsHeaders);
}

// --- Scrobble ---

function normalizeScrobble(body) {
  return {
    title: String(body.title || body.data?.title || '').substring(0, 500),
    artist: String(body.artist || body.data?.artist || '').substring(0, 500),
    album_art: body.album_art || body.data?.album_art || body.albumArt || body.data?.albumArt
      ? String(body.album_art || body.data?.album_art || body.albumArt || body.data?.albumArt).substring(0, 1000)
      : null,
    duration_ms: Number(body.duration_ms ?? body.data?.duration_ms ?? body.durationMs ?? body.data?.durationMs ?? 0),
    played_ms: Number(body.played_ms ?? body.data?.played_ms ?? body.playedMs ?? body.data?.playedMs ?? 0),
    timestamp: body.timestamp || body.data?.timestamp || new Date().toISOString(),
    source: body.source || body.data?.source || 'spotify_web_player',
  };
}

async function handleScrobble(request, env, apiKey, corsHeaders) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return errorResponse(400, 'Invalid JSON body', corsHeaders);
  }

  const { title, artist, album_art, duration_ms, timestamp, played_ms, source } = normalizeScrobble(body);

  if (!title || !artist) {
    return errorResponse(400, 'Missing required fields: title, artist', corsHeaders);
  }

  await env.DB.prepare(`
    INSERT INTO scrobbles (api_key, title, artist, album_art, duration_ms, played_ms, timestamp, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    apiKey,
    title,
    artist,
    album_art,
    duration_ms,
    played_ms,
    timestamp,
    source
  ).run();

  return jsonResponse({ success: true, message: 'Scrobble recorded' }, corsHeaders);
}

async function handleTestScrobble(request, env, apiKey, corsHeaders) {
  const body = await request.json().catch(() => ({}));
  const { title, artist, album_art, duration_ms, timestamp, played_ms, source } = normalizeScrobble(body);
  
  const trackTitle = title || 'Test Track';
  const trackArtist = artist || 'Test Artist';
  
  await env.DB.prepare(`
    INSERT INTO scrobbles (api_key, title, artist, album_art, duration_ms, played_ms, timestamp, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    apiKey,
    trackTitle,
    trackArtist,
    album_art || null,
    duration_ms || 180000,
    played_ms || 180000,
    timestamp || new Date().toISOString(),
    source || 'test'
  ).run();

  return jsonResponse({ 
    success: true, 
    message: 'Test scrobble recorded',
    track: { title: trackTitle, artist: trackArtist }
  }, corsHeaders);
}

// --- Now Playing ---

async function handleNowPlaying(request, env, apiKey, corsHeaders) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return errorResponse(400, 'Invalid JSON body', corsHeaders);
  }

  const { title, artist, album_art, duration_ms, timestamp, source } = normalizeScrobble(body);

  if (!title || !artist) {
    return errorResponse(400, 'Missing required fields: title, artist', corsHeaders);
  }

  await env.DB.prepare(`
    INSERT OR REPLACE INTO now_playing (api_key, title, artist, album_art, duration_ms, timestamp, source, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    apiKey,
    title,
    artist,
    album_art,
    duration_ms,
    timestamp,
    source
  ).run();

  return jsonResponse({ success: true }, corsHeaders);
}

async function handleGetNowPlaying(env, apiKey, corsHeaders) {
  const result = await env.DB.prepare(`
    SELECT title, artist, album_art, duration_ms, timestamp, source, updated_at
    FROM now_playing WHERE api_key = ?
  `).bind(apiKey).first();

  if (!result) {
    return jsonResponse({ now_playing: false }, corsHeaders);
  }

  return jsonResponse({ now_playing: true, track: result }, corsHeaders);
}

// --- Scrobble History ---

async function handleGetScrobbles(request, env, apiKey, corsHeaders) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);
  const offset = Number(url.searchParams.get('offset')) || 0;
  const from = url.searchParams.get('from');  // ISO timestamp
  const to = url.searchParams.get('to');      // ISO timestamp

  let query = 'SELECT id, title, artist, album_art, duration_ms, played_ms, timestamp, source FROM scrobbles WHERE api_key = ?';
  const params = [apiKey];

  if (from) {
    query += ' AND timestamp >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND timestamp <= ?';
    params.push(to);
  }

  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM scrobbles WHERE api_key = ?';
  const countParams = [apiKey];
  if (from) { countQuery += ' AND timestamp >= ?'; countParams.push(from); }
  if (to) { countQuery += ' AND timestamp <= ?'; countParams.push(to); }

  const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();

  return jsonResponse({
    scrobbles: results,
    pagination: {
      total: countResult?.total || 0,
      limit,
      offset,
      has_more: offset + limit < (countResult?.total || 0),
    },
  }, corsHeaders);
}

// --- Stats ---

async function handleGetStats(request, env, apiKey, corsHeaders) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all';

  const timeFilter = getTimeFilter(period);

  // Total scrobbles
  const totalResult = await env.DB.prepare(`
    SELECT COUNT(*) as total, COALESCE(SUM(played_ms), 0) as total_ms, COUNT(DISTINCT artist) as unique_artists
    FROM scrobbles WHERE api_key = ? ${timeFilter.sql}
  `).bind(apiKey, ...timeFilter.params).first();

  // Unique tracks
  const tracksResult = await env.DB.prepare(`
    SELECT COUNT(DISTINCT title || '|||' || artist) as unique_tracks
    FROM scrobbles WHERE api_key = ? ${timeFilter.sql}
  `).bind(apiKey, ...timeFilter.params).first();

  return jsonResponse({
    period,
    total_scrobbles: totalResult?.total || 0,
    total_listening_ms: totalResult?.total_ms || 0,
    total_listening_hours: Math.round((totalResult?.total_ms || 0) / 3600000 * 10) / 10,
    unique_artists: totalResult?.unique_artists || 0,
    unique_tracks: tracksResult?.unique_tracks || 0,
  }, corsHeaders);
}

// --- Top Artists ---

async function handleGetTopArtists(request, env, apiKey, corsHeaders) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all';
  const limit = Math.min(Number(url.searchParams.get('limit')) || 25, 100);
  const timeFilter = getTimeFilter(period);

  const { results } = await env.DB.prepare(`
    SELECT artist, COUNT(*) as plays, COALESCE(SUM(played_ms), 0) as total_ms
    FROM scrobbles
    WHERE api_key = ? AND artist != 'Unknown Artist' ${timeFilter.sql}
    GROUP BY artist
    ORDER BY plays DESC
    LIMIT ?
  `).bind(apiKey, ...timeFilter.params, limit).all();

  return jsonResponse({
    period,
    artists: results.map((a, i) => ({
      rank: i + 1,
      name: a.artist,
      plays: a.plays,
      hours: Math.round(a.total_ms / 3600000 * 10) / 10,
    })),
  }, corsHeaders);
}

// --- Top Tracks ---

async function handleGetTopTracks(request, env, apiKey, corsHeaders) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all';
  const limit = Math.min(Number(url.searchParams.get('limit')) || 25, 100);
  const timeFilter = getTimeFilter(period);

  const { results } = await env.DB.prepare(`
    SELECT title, artist, album_art, COUNT(*) as plays, COALESCE(SUM(played_ms), 0) as total_ms
    FROM scrobbles
    WHERE api_key = ? ${timeFilter.sql}
    GROUP BY title, artist
    ORDER BY plays DESC
    LIMIT ?
  `).bind(apiKey, ...timeFilter.params, limit).all();

  return jsonResponse({
    period,
    tracks: results.map((t, i) => ({
      rank: i + 1,
      title: t.title,
      artist: t.artist,
      album_art: t.album_art,
      plays: t.plays,
      total_ms: t.total_ms,
    })),
  }, corsHeaders);
}

// --- Listening Stats (daily/hourly) ---

async function handleGetListeningStats(request, env, apiKey, corsHeaders) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30d';
  const timeFilter = getTimeFilterFromPeriod(period);

  // Daily listening time
  const { results: daily } = await env.DB.prepare(`
    SELECT DATE(timestamp) as day, COUNT(*) as scrobbles, COALESCE(SUM(played_ms), 0) as total_ms
    FROM scrobbles
    WHERE api_key = ? ${timeFilter.sql}
    GROUP BY DATE(timestamp)
    ORDER BY day ASC
  `).bind(apiKey, ...timeFilter.params).all();

  // Hourly distribution
  const { results: hourly } = await env.DB.prepare(`
    SELECT CAST(strftime('%H', timestamp) AS INTEGER) as hour, COUNT(*) as plays
    FROM scrobbles
    WHERE api_key = ? ${timeFilter.sql}
    GROUP BY strftime('%H', timestamp)
    ORDER BY hour ASC
  `).bind(apiKey, ...timeFilter.params).all();

  // Day of week distribution
  const { results: dow } = await env.DB.prepare(`
    SELECT CAST(strftime('%w', timestamp) AS INTEGER) as dow, COUNT(*) as plays
    FROM scrobbles
    WHERE api_key = ? ${timeFilter.sql}
    GROUP BY strftime('%w', timestamp)
    ORDER BY dow ASC
  `).bind(apiKey, ...timeFilter.params).all();

  return jsonResponse({
    period,
    daily: daily.map(d => ({
      date: d.day,
      scrobbles: d.scrobbles,
      minutes: Math.round(d.total_ms / 60000),
    })),
    hourly: hourly.map(h => ({
      hour: `${String(h.hour).padStart(2, '0')}:00`,
      plays: h.plays,
    })),
    day_of_week: dow.map(d => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.dow],
      plays: d.plays,
    })),
  }, corsHeaders);
}

// --- Heatmap ---

async function handleGetHeatmap(request, env, apiKey, corsHeaders) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30d';
  const timeFilter = getTimeFilterFromPeriod(period);

  const { results } = await env.DB.prepare(`
    SELECT
      CAST(strftime('%w', timestamp) AS INTEGER) as dow,
      CAST(strftime('%H', timestamp) AS INTEGER) as hour,
      COUNT(*) as plays
    FROM scrobbles
    WHERE api_key = ? ${timeFilter.sql}
    GROUP BY strftime('%w', timestamp), strftime('%H', timestamp)
    ORDER BY dow, hour
  `).bind(apiKey, ...timeFilter.params).all();

  // Build 7x24 grid
  const heatmap = [];
  for (let d = 0; d < 7; d++) {
    const day = [];
    for (let h = 0; h < 24; h++) {
      const cell = results.find(r => r.dow === d && r.hour === h);
      day.push(cell ? cell.plays : 0);
    }
    heatmap.push(day);
  }

  return jsonResponse({ period, heatmap }, corsHeaders);
}

// --- Helpers ---

function getTimeFilter(period) {
  switch (period) {
    case '7d':
    case 'week':
      return { sql: ' AND timestamp >= datetime("now", "-7 days")', params: [] };
    case '30d':
    case 'month':
      return { sql: ' AND timestamp >= datetime("now", "-30 days")', params: [] };
    case '90d':
    case 'quarter':
      return { sql: ' AND timestamp >= datetime("now", "-90 days")', params: [] };
    case '1y':
    case 'year':
      return { sql: ' AND timestamp >= datetime("now", "-1 year")', params: [] };
    default:
      return { sql: '', params: [] };
  }
}

function getTimeFilterFromPeriod(period) {
  switch (period) {
    case '7d':
      return { sql: ' AND timestamp >= datetime("now", "-7 days")', params: [] };
    case '30d':
      return { sql: ' AND timestamp >= datetime("now", "-30 days")', params: [] };
    case '90d':
      return { sql: ' AND timestamp >= datetime("now", "-90 days")', params: [] };
    case '1y':
      return { sql: ' AND timestamp >= datetime("now", "-1 year")', params: [] };
    default:
      return { sql: '', params: [] };
  }
}

function jsonResponse(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function errorResponse(status, message, headers) {
  return new Response(JSON.stringify({ error: message, status }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
