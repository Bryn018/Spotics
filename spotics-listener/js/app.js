let pollingInterval = null;

async function init() {
  try {
    const justAuth = await handleAuthCallback();
    if (justAuth) showToast('Logged in to Last.fm ✅');
  } catch (err) {
    showToast(err.message);
  }

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  const storedKey = await getSessionKey();
  if (storedKey) {
    sessionKey = storedKey;
    updateAuthUI(true);
    try {
      await fetchAndStore();
      await refreshDashboard();
      startPolling();
    } catch (err) {
      showToast(err.message);
      if (err.message.includes('Not authenticated')) {
        updateAuthUI(false);
      }
    }
  } else {
    updateAuthUI(false);
  }

  document.getElementById('connect-btn-dash')?.addEventListener('click', initiateLogin);
  document.getElementById('fetch-now-btn-dash')?.addEventListener('click', async () => {
    await fetchAndStore();
    await refreshDashboard();
    showToast('Data refreshed');
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      setActivePage(page);
      if (page === 'history') await refreshHistory();
      if (page === 'dashboard') await refreshDashboard();
    });
  });

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('dark-mode-checkbox')?.addEventListener('change', toggleTheme);

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  searchInput?.addEventListener('input', () => refreshHistory(sortSelect?.value || 'newest', searchInput.value));
  sortSelect?.addEventListener('change', () => refreshHistory(sortSelect.value, searchInput?.value || ''));

  document.getElementById('export-btn')?.addEventListener('click', exportJSON);

  document.getElementById('disconnect-btn')?.addEventListener('click', async () => {
    await dbClear('session');
    sessionKey = null;
    updateAuthUI(false);
    setActivePage('dashboard');
    showToast('Disconnected');
  });

  document.getElementById('clear-data-btn')?.addEventListener('click', async () => {
    if (confirm('Delete all listening history? This cannot be undone.')) {
      await dbClear('history');
      await refreshDashboard();
      showToast('All data cleared');
    }
  });

  // Bind legacy dashboard hooks when present.
  document.getElementById('connect-btn')?.addEventListener('click', initiateLogin);
  document.getElementById('fetch-now-btn')?.addEventListener('click', async () => {
    try {
      await fetchAndStore();
      await refreshUI();
    } catch (err) {
      showError(err.message);
    }
  });
}

async function fetchAndStore() {
  try {
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
    console.log(`Stored ${newCount} new tracks`);
  } catch (err) {
    console.error(err);
    if (err.message.includes('Not authenticated')) {
      updateAuthUI(false);
      toggleUI(false);
    }
  }
}

function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    await fetchAndStore();
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      await refreshDashboard();
    }
  }, CONFIG.pollIntervalMs);

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      await fetchAndStore();
      if (document.getElementById('page-dashboard')?.classList.contains('active')) await refreshDashboard();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
