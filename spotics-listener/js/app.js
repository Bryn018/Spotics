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

  document.getElementById('connect-btn')?.addEventListener('click', initiateLogin);
  document.getElementById('connect-btn-dash')?.addEventListener('click', initiateLogin);
  document.getElementById('connect-settings-btn')?.addEventListener('click', initiateLogin);

  document.getElementById('refresh-btn')?.addEventListener('click', async () => {
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

  document.querySelectorAll('.card-tab').forEach((tab) => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.card-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const period = tab.dataset.period || 'all';
      await refreshDashboard(period);
    });
  });

  document.getElementById('export-btn')?.addEventListener('click', exportJSON);
  document.getElementById('export-settings-btn')?.addEventListener('click', exportJSON);

  document.getElementById('disconnect-btn')?.addEventListener('click', async () => {
    if (!confirm('Disconnect Last.fm from this device?')) return;
    await dbClear('session');
    sessionKey = null;
    updateAuthUI(false);
    setActivePage('dashboard');
    showToast('Disconnected');
  });

  document.getElementById('clear-data-btn')?.addEventListener('click', async () => {
    if (!confirm('Delete all listening history? This cannot be undone.')) return;
    await dbClear('history');
    await refreshDashboard();
    showToast('All data cleared');
  });

  const pollSelect = document.getElementById('poll-interval-select');
  if (pollSelect) {
    pollSelect.value = String(CONFIG.pollIntervalMs);
    pollSelect.addEventListener('change', () => {
      const ms = Number(pollSelect.value);
      CONFIG.pollIntervalMs = ms;
      startPolling();
      showToast(`Poll interval updated`);
    });
  }

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('dark-toggle')?.addEventListener('click', toggleTheme);

  document.getElementById('edit-config-btn')?.addEventListener('click', () => {
    showConfigModal();
    if (CONFIG.apiKey) {
      document.getElementById('cfg-api-key').value = CONFIG.apiKey;
      document.getElementById('cfg-api-secret').value = CONFIG.apiSecret || '';
      document.getElementById('cfg-username').value = CONFIG.username || '';
    }
  });
  document.getElementById('modal-cancel')?.addEventListener('click', hideConfigModal);
  document.getElementById('modal-save')?.addEventListener('click', async () => {
    const newKey = document.getElementById('cfg-api-key').value.trim();
    const newSecret = document.getElementById('cfg-api-secret').value.trim();
    const newUsername = document.getElementById('cfg-username').value.trim();
    if (!newKey || !newSecret || !newUsername) {
      showToast('All config fields are required');
      return;
    }
    CONFIG.apiKey = newKey;
    CONFIG.apiSecret = newSecret;
    CONFIG.username = newUsername;
    hideConfigModal();
    showToast('Config saved');
  });

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  searchInput?.addEventListener('input', () => refreshHistory(sortSelect?.value || 'newest', searchInput.value));
  sortSelect?.addEventListener('change', () => refreshHistory(sortSelect.value, searchInput?.value || ''));

  // Keep legacy dashboard hooks if present.
  document.getElementById('connect-btn-dash')?.addEventListener('click', initiateLogin);
  document.getElementById('fetch-now-btn-dash')?.addEventListener('click', async () => {
    await fetchAndStore();
    await refreshDashboard();
    showToast('Data refreshed');
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
  } catch (err) {
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
