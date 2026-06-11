// Spotics Scrobbler - Background Service Worker
// Receives scrobble events from the content script and sends them to the Spotics API.

const SPOTICS_API_BASE = 'https://api.spotics.insights.autos';
const SCROBBLE_ENDPOINT = `${SPOTICS_API_BASE}/scrobble`;
const NOW_PLAYING_ENDPOINT = `${SPOTICS_API_BASE}/now-playing`;

// --- Message Handler ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  switch (message.type) {
    case 'SCROBBLE':
      handleScrobble(message.data)
        .then((result) => sendResponse({ success: true, ...result }))
        .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
      return true; // async

    case 'NOW_PLAYING':
      handleNowPlaying(message.data)
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
      return true; // async

    case 'GET_STATUS':
      getStatus()
        .then(sendResponse)
        .catch((err) => sendResponse({ connected: false, error: err.message }));
      return true; // async

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

// --- Scrobble Handling ---

async function handleScrobble(data) {
  const { title, artist, albumArt, durationMs, timestamp, playedMs, source } = data;

  if (!title || !artist) {
    throw new Error('Missing required scrobble fields: title, artist');
  }

  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (!apiKey) {
    throw new Error('No API key configured. Open the extension popup to connect.');
  }

  const payload = {
    title,
    artist,
    album_art: albumArt || null,
    duration_ms: durationMs || 0,
    timestamp: timestamp || new Date().toISOString(),
    played_ms: playedMs || 0,
    source: source || 'spotify_web_player',
  };

  const response = await fetch(SCROBBLE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  // Update stats
  const { scrobbleCount = 0 } = await chrome.storage.local.get(['scrobbleCount']);
  const newCount = scrobbleCount + 1;
  await chrome.storage.local.set({
    scrobbleCount: newCount,
    lastScrobble: payload,
    lastScrobbleTime: Date.now(),
  });

  return { count: newCount };
}

async function handleNowPlaying(data) {
  const { title, artist, albumArt, durationMs, timestamp, source } = data;
  if (!title || !artist) return;

  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (!apiKey) return;

  const payload = {
    title,
    artist,
    album_art: albumArt || null,
    duration_ms: durationMs || 0,
    timestamp: timestamp || new Date().toISOString(),
    source: source || 'spotify_web_player',
  };

  try {
    await fetch(NOW_PLAYING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Now playing is non-critical
  }
}

// --- Status ---

async function getStatus() {
  const {
    apiKey,
    scrobbleCount = 0,
    lastScrobble = null,
    lastScrobbleTime = null,
  } = await chrome.storage.local.get([
    'apiKey', 'scrobbleCount', 'lastScrobble', 'lastScrobbleTime',
  ]);

  return {
    connected: !!apiKey,
    scrobbleCount,
    lastScrobble,
    lastScrobbleTime,
  };
}

// --- Extension Install/Update ---

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Spotics Background] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[Spotics Background] Extension updated');
  }
});

// --- Service Worker Keep-Alive ---
setInterval(() => {
  chrome.storage.local.get(['scrobbleCount']);
}, 25000);
