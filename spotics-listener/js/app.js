let pollingInterval = null;

async function init() {
  try {
    const justAuth = await handleAuthCallback();
    if (justAuth) {
      console.log('✅ Logged in to Last.fm');
    }
  } catch (err) {
    showError(err.message);
    return;
  }

  const storedKey = await getSessionKey();
  if (storedKey) {
    sessionKey = storedKey;
    toggleUI(true);
    try {
      await fetchAndStore();
      await refreshUI();
      startPolling();
    } catch (err) {
      showError(err.message);
      if (err.message.includes('Not authenticated')) {
        toggleUI(false);
      }
    }
  } else {
    toggleUI(false);
  }

  document.getElementById('connect-btn').addEventListener('click', initiateLogin);
  document.getElementById('fetch-now-btn').addEventListener('click', async () => {
    try {
      await fetchAndStore();
      await refreshUI();
    } catch (err) {
      showError(err.message);
    }
  });
}

async function fetchAndStore() {
  const tracks = await fetchRecentTracks();
  let newCount = 0;

  for (const track of tracks) {
    const id = `${track.played_at}_${track.track_id}`;
    const exists = await dbGet('history', id);
    if (!exists) {
      await savePlay(track);
      newCount += 1;
    }
  }

  console.log(`Stored ${newCount} new tracks.`);
}

async function refreshUI() {
  await updateDashboard();
  const plays = await getAllPlays();
  renderRecentTracks(plays);
}

function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    try {
      await fetchAndStore();
      await refreshUI();
    } catch (err) {
      console.warn('Polling error:', err);
    }
  }, CONFIG.pollIntervalMs);

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      try {
        await fetchAndStore();
        await refreshUI();
      } catch (err) {}
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
