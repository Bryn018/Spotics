// Spotics Scrobbler - Background Service Worker
// Receives scrobble events from the content script and sends them to the Spotics API.

const SPOTICS_API_BASE = 'https://api.spotics.insights.autos';
const SCROBBLE_ENDPOINT = `${SPOTICS_API_BASE}/scrobble`;
const NOW_PLAYING_ENDPOINT = `${SPOTICS_API_BASE}/now-playing`;

// --- Message Handler ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  switch (message.type) {
    case 'SCROBBLE':
      handleScrobble(message.data)
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.error('[Spotics Scrobbler] Scrobble failed:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true; // Keep message channel open for async response

    case 'NOW_PLAYING':
      handleNowPlaying(message.data)
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.warn('[Spotics Scrobbler] Now playing update failed:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true;

    case 'GET_STATUS':
      getStatus().then(sendResponse);
      return true;

    default:
      console.warn('[Spotics Scrobbler] Unknown message type:', message.type);
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
    console.warn('[Spotics Scrobbler] No API key configured. Open the extension popup to set up.');
    return;
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
    throw new Error(`Scrobble API error ${response.status}: ${errorText}`);
  }

  // Update stats in storage
  const { scrobbleCount = 0 } = await chrome.storage.local.get(['scrobbleCount']);
  await chrome.storage.local.set({
    scrobbleCount: scrobbleCount + 1,
    lastScrobble: payload,
    lastScrobbleTime: Date.now(),
  });

  console.log(`[Spotics Scrobbler] Scrobbled: ${artist} - ${title}`);
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
    // Now playing is non-critical, don't throw
    console.warn('[Spotics Scrobbler] Now playing update failed:', err);
  }
}

// --- Status ---

async function getStatus() {
  const { apiKey, scrobbleCount = 0, lastScrobble = null, lastScrobbleTime = null } =
    await chrome.storage.local.get(['apiKey', 'scrobbleCount', 'lastScrobble', 'lastScrobbleTime']);

  return {
    connected: !!apiKey,
    scrobbleCount,
    lastScrobble,
    lastScrobbleTime,
  };
}

// --- Alarm for retrying failed scrobbles ---

chrome.alarms?.onAlarm?.addListener(async (alarm) => {
  if (alarm.name === 'retry-scrobbles') {
    await retryFailedScrobbles();
  }
});

async function retryFailedScrobbles() {
  const { failedScrobbles = [] } = await chrome.storage.local.get(['failedScrobbles']);
  if (failedScrobbles.length === 0) return;

  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (!apiKey) return;

  const remaining = [];
  for (const scrobble of failedScrobbles) {
    try {
      const response = await fetch(SCROBBLE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(scrobble),
      });
      if (!response.ok) remaining.push(scrobble);
    } catch {
      remaining.push(scrobble);
    }
  }

  await chrome.storage.local.set({ failedScrobbles: remaining });
}

// --- Extension Install/Update ---

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Spotics Scrobbler] Extension installed. Open popup to configure.');
    // Open the popup for initial setup
    chrome.action.setPopup({ popup: 'popup/popup.html' });
  } else if (details.reason === 'update') {
    console.log('[Spotics Scrobbler] Extension updated.');
  }
});
