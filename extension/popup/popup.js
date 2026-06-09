// Spotics Scrobbler - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const setupSection = document.getElementById('setup-section');
  const connectedSection = document.getElementById('connected-section');
  const apiKeyInput = document.getElementById('api-key');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const setupError = document.getElementById('setup-error');
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  const scrobbleCountEl = document.getElementById('scrobble-count');
  const sessionCountEl = document.getElementById('session-count');
  const nowPlayingEl = document.getElementById('now-playing');
  const lastScrobbleEl = document.getElementById('last-scrobble');

  // Check current state
  const { apiKey, scrobbleCount = 0, lastScrobble = null, lastScrobbleTime = null } =
    await chrome.storage.local.get(['apiKey', 'scrobbleCount', 'lastScrobble', 'lastScrobbleTime']);

  if (apiKey) {
    showConnected({ scrobbleCount, lastScrobble, lastScrobbleTime });
  } else {
    showSetup();
  }

  // Connect button
  connectBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showError('Please enter your API key');
      return;
    }

    if (!key.startsWith('spotics_')) {
      showError('Invalid API key format. Keys start with "spotics_"');
      return;
    }

    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;
    hideError();

    try {
      // Validate the key by making a test request
      const response = await fetch('https://api.spotics.insights.autos/health', {
        headers: { 'X-API-Key': key },
      });

      // Even if the health endpoint doesn't exist, a 401/403 means bad key
      // A 200 or 404 means the key format is accepted
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check and try again.');
      }

      // Save the key
      await chrome.storage.local.set({ apiKey: key, sessionScrobbles: 0 });
      showConnected({ scrobbleCount, lastScrobble, lastScrobbleTime });
    } catch (err) {
      showError(err.message || 'Failed to connect. Check your API key.');
      connectBtn.textContent = 'Connect';
      connectBtn.disabled = false;
    }
  });

  // Disconnect button
  disconnectBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['apiKey', 'sessionScrobbles']);
    showSetup();
  });

  // Allow Enter key to submit
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') connectBtn.click();
  });

  // --- UI Functions ---

  function showSetup() {
    setupSection.style.display = 'block';
    connectedSection.style.display = 'none';
    statusBadge.className = 'status-badge disconnected';
    statusText.textContent = 'Disconnected';
    apiKeyInput.value = '';
    connectBtn.textContent = 'Connect';
    connectBtn.disabled = false;
  }

  function showConnected({ scrobbleCount, lastScrobble, lastScrobbleTime }) {
    setupSection.style.display = 'none';
    connectedSection.style.display = 'block';
    statusBadge.className = 'status-badge connected';
    statusText.textContent = 'Connected';

    scrobbleCountEl.textContent = scrobbleCount.toLocaleString();

    const { sessionScrobbles = 0 } = chrome.storage.local.get(['sessionScrobbles']) || {};
    sessionCountEl.textContent = sessionScrobbles;

    // Show last scrobble
    if (lastScrobble) {
      lastScrobbleEl.innerHTML = `
        <div class="track-info">
          <div class="track-details">
            <div class="track-title">${escapeHtml(lastScrobble.title)}</div>
            <div class="track-artist">${escapeHtml(lastScrobble.artist)}</div>
          </div>
        </div>
      `;
    }

    // Poll for updates
    startPolling();
  }

  function showError(msg) {
    setupError.textContent = msg;
    setupError.style.display = 'block';
  }

  function hideError() {
    setupError.style.display = 'none';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Polling for live updates ---

  function startPolling() {
    // Update stats every 3 seconds
    const interval = setInterval(async () => {
      const { apiKey: currentKey } = await chrome.storage.local.get(['apiKey']);
      if (!currentKey) {
        clearInterval(interval);
        showSetup();
        return;
      }

      const { scrobbleCount: count, lastScrobble: last, lastScrobbleTime: lastTime } =
        await chrome.storage.local.get(['scrobbleCount', 'lastScrobble', 'lastScrobbleTime']);

      scrobbleCountEl.textContent = (count || 0).toLocaleString();

      if (last && last !== lastScrobble) {
        lastScrobble = last;
        lastScrobbleEl.innerHTML = `
          <div class="track-info">
            ${last.album_art ? `<img class="track-art" src="${escapeHtml(last.album_art)}" alt="">` : ''}
            <div class="track-details">
              <div class="track-title">${escapeHtml(last.title)}</div>
              <div class="track-artist">${escapeHtml(last.artist)}</div>
            </div>
          </div>
        `;
      }
    }, 3000);
  }
});
