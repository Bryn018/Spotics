// Spotics Scrobbler - Background Service Worker
// Receives scrobble events from the content script and sends them to the Spotics API.

const SPOTICS_API_BASE = 'https://api.spotics.insights.autos';
const SCROBBLE_ENDPOINT = `${SPOTICS_API_BASE}/scrobble`;
const NOW_PLAYING_ENDPOINT = `${SPOTICS_API_BASE}/now-playing`;

// --- Message Handler ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Spotics Background] Received message:', message.type, 'from:', sender.tab?.url || 'popup');

  if (!message || !message.type) return;

  switch (message.type) {
    case 'SCROBBLE':
      handleScrobble(message.data)
        .then((result) => {
          console.log('[Spotics Background] Scrobble success:', result);
          sendResponse({ success: true, ...result });
        })
        .catch((err) => {
          console.error('[Spotics Background] Scrobble failed:', err.message || err);
          sendResponse({ success: false, error: err.message || String(err) });
        });
      return true; // Keep message channel open for async

    case 'NOW_PLAYING':
      handleNowPlaying(message.data)
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.warn('[Spotics Background] Now playing failed:', err.message || err);
          sendResponse({ success: false, error: err.message || String(err) });
        });
      return true;

    case 'GET_STATUS':
      getStatus().then(sendResponse);
      return true;

    default:
      console.warn('[Spotics Background] Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// --- Scrobble Handling ---

async function handleScrobble(data) {
  const { title, artist, albumArt, durationMs, timestamp, playedMs, source } = data;

  if (!title || !artist) {
    throw new Error('Missing required scrobble fields: title, artist');
  }

  // Get the user's API key from storage
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (!apiKey) {
    console.error('[Spotics Background] NO API KEY in chrome.storage.local!');
    throw new Error('No API key configured. Open the extension popup to set up.');
  }

  console.log('[Spotics Background] API key found:', apiKey.substring(0, 12) + '...');

  const payload = {
    title,
    artist,
    album_art: albumArt || null,
    duration_ms: durationMs || 0,
    timestamp: timestamp || new Date().toISOString(),
    played_ms: playedMs || 0,
    source: source || 'spotify_web_player',
  };

  console.log('[Spotics Background] Sending scrobble to:', SCROBBLE_ENDPOINT);
  console.log('[Spotics Background] Payload:', JSON.stringify(payload).substring(0, 200));

  const response = await fetch(SCROBBLE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  console.log('[Spotics Background] API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Spotics Background] API error:', response.status, errorText);
    throw new Error(`Scrobble API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log('[Spotics Background] API result:', result);

  // Update stats in storage
  const { scrobbleCount = 0 } = await chrome.storage.local.get(['scrobbleCount']);
  const newCount = scrobbleCount + 1;
  await chrome.storage.local.set({
    scrobbleCount: newCount,
    lastScrobble: payload,
    lastScrobbleTime: Date.now(),
  });

  console.log(`[Spotics Background] Scrobbled #${newCount}: ${artist} - ${title}`);
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
  } catch (err) {
    console.warn('[Spotics Background] Now playing update failed:', err);
  }
}

// --- Status ---

async function getStatus() {
  const {
    apiKey,
    scrobbleCount = 0,
    lastScrobble = null,
    lastScrobbleTime = null
  } = await chrome.storage.local.get([
    'apiKey', 'scrobbleCount', 'lastScrobble', 'lastScrobbleTime'
  ]);

  return {
    connected: !!apiKey,
    scrobbleCount,
    lastScrobble,
    lastScrobbleTime,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + '...' : null,
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
// Service workers can be killed after 30s of inactivity. Since we need to
// listen for messages from the content script, we set up a periodic heartbeat.
setInterval(() => {
  chrome.storage.local.get(['scrobbleCount']);
}, 25000);

console.log('[Spotics Background] Service worker started');
