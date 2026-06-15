function showError(message) {
  const errDiv = document.getElementById('error-message');
  if (!errDiv) return;
  errDiv.textContent = message;
  errDiv.classList.remove('hidden');
  setTimeout(() => errDiv.classList.add('hidden'), 8000);
}

function toggleUI(authenticated) {
  document.getElementById('auth-section')?.classList.toggle('hidden', authenticated);
  document.getElementById('dashboard')?.classList.toggle('hidden', !authenticated);
}

async function updateDashboard() {
  const plays = await getAllPlays();
  const totalTracks = plays.length;
  const uniqueArtists = new Set(plays.map(p => p.artist_name)).size;
  const artistCounts = {};

  plays.forEach((p) => {
    artistCounts[p.artist_name] = (artistCounts[p.artist_name] || 0) + 1;
  });

  let topArtist = '—';
  let topCount = 0;
  for (const [artist, count] of Object.entries(artistCounts)) {
    if (count > topCount) {
      topCount = count;
      topArtist = artist;
    }
  }

  const totalTracksEl = document.getElementById('total-tracks');
  const totalArtistsEl = document.getElementById('total-artists');
  const topArtistNameEl = document.getElementById('top-artist-name');
  const daysTrackedEl = document.getElementById('days-tracked');
  const lastFetchTimeEl = document.getElementById('last-fetch-time');

  if (totalTracksEl) totalTracksEl.textContent = String(totalTracks);
  if (totalArtistsEl) totalArtistsEl.textContent = String(uniqueArtists);
  if (topArtistNameEl) topArtistNameEl.textContent = topArtist;

  const daysSet = new Set(plays.map(p => new Date(p.played_at).toDateString()));
  if (daysTrackedEl) daysTrackedEl.textContent = String(daysSet.size);

  drawTopArtistsChart(artistCounts);

  const lastFetch = await getLastFetchTimestamp();
  if (lastFetchTimeEl) {
    lastFetchTimeEl.textContent = lastFetch ? `Last updated ${timeAgoString(new Date(lastFetch))}` : 'Never fetched';
  }
}

function renderRecentTracks(plays) {
  const list = document.getElementById('recent-list');
  if (!list) return;
  list.innerHTML = '';

  const sorted = Array.from(plays).sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
  const recent = sorted.slice(0, 20);

  for (const play of recent) {
    const li = document.createElement('li');
    li.className = 'track-item';
    li.innerHTML = `
      <img class="track-cover" src="${play.album_cover || ''}" alt="" onerror="this.style.display='none'">
      <div class="track-info">
        <div class="track-name" title="${escapeHtml(play.track_name)}">${escapeHtml(play.track_name)}</div>
        <div class="track-artist" title="${escapeHtml(play.artist_name)}">${escapeHtml(play.artist_name)}</div>
      </div>
      <div class="track-time">${formatPlayedTime(play.played_at)}</div>
    `;
    list.appendChild(li);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatPlayedTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
}

function timeAgoString(date) {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  const diffHrs = Math.round(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.round(diffHrs / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// ---- Extended UI helpers for redesigned pages ----
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}

function applyTheme(mode) {
  document.body.className = mode;
  localStorage.setItem('theme', mode);
  const themeIcon = document.getElementById('theme-icon');
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
  if (themeIcon) themeIcon.textContent = mode === 'dark' ? '☀️' : '🌙';
  if (darkModeCheckbox) darkModeCheckbox.checked = mode === 'dark';
}

function toggleTheme() {
  const newMode = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(newMode);
  if (document.getElementById('page-dashboard')?.classList.contains('active')) {
    refreshDashboard();
  }
}

function setActivePage(pageId) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));

  const page = document.getElementById(`page-${pageId}`);
  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (page) page.classList.add('active');
  if (navItem) navItem.classList.add('active');
}

function updateAuthUI(authenticated) {
  const connectBtn = document.getElementById('connect-btn-dash');
  const fetchBtn = document.getElementById('fetch-now-btn-dash');
  const userDisplay = document.getElementById('user-display');
  const settingsUsername = document.getElementById('settings-username');

  if (connectBtn) connectBtn.classList.toggle('hidden', authenticated);
  if (fetchBtn) fetchBtn.classList.toggle('hidden', !authenticated);
  if (userDisplay) userDisplay.textContent = authenticated ? CONFIG.username : 'Not connected';
  if (settingsUsername) settingsUsername.textContent = authenticated ? CONFIG.username : '—';
}

function renderTrackList(containerId, plays, limit = 20) {
  const list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = '';
  const sorted = [...plays].sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
  const slice = limit ? sorted.slice(0, limit) : sorted;

  slice.forEach((play) => {
    const li = document.createElement('li');
    li.className = 'track-item';
    li.innerHTML = `
      <img class="track-cover" src="${play.album_cover || ''}" alt="" onerror="this.style.display='none'">
      <div class="track-info">
        <div class="track-name">${escapeHtml(play.track_name)}</div>
        <div class="track-artist">${escapeHtml(play.artist_name)}</div>
      </div>
      <div class="track-time">${formatTimeAgo(play.played_at)}</div>
    `;
    list.appendChild(li);
  });
}

function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
}

async function refreshDashboard() {
  const plays = await getAllPlays();
  const totalTracks = plays.length;
  const uniqueArtists = new Set(plays.map(p => p.artist_name)).size;
  const artistCounts = {};
  const daysSet = new Set();

  plays.forEach((p) => {
    artistCounts[p.artist_name] = (artistCounts[p.artist_name] || 0) + 1;
    daysSet.add(new Date(p.played_at).toDateString());
  });

  const totalTracksEl = document.getElementById('total-tracks');
  const totalArtistsEl = document.getElementById('total-artists');
  const topArtistNameEl = document.getElementById('top-artist-name');
  const daysTrackedEl = document.getElementById('days-tracked');

  if (totalTracksEl) totalTracksEl.textContent = String(totalTracks);
  if (totalArtistsEl) totalArtistsEl.textContent = String(uniqueArtists);

  let topArtist = '—';
  let topCount = 0;
  for (const [artist, count] of Object.entries(artistCounts)) {
    if (count > topCount) {
      topCount = count;
      topArtist = artist;
    }
  }
  if (topArtistNameEl) topArtistNameEl.textContent = topArtist;
  if (daysTrackedEl) daysTrackedEl.textContent = String(daysSet.size);

  drawTopArtistsChart(artistCounts);
  renderTrackList('recent-list-dash', plays, 10);

  const last = await getLastFetchTimestamp();
  const fetchEl = document.getElementById('last-fetch-time');
  if (fetchEl) fetchEl.textContent = last ? `Last updated ${formatTimeAgo(last)}` : 'Never fetched';
}

async function refreshHistory(sort = 'newest', filter = '') {
  let plays = await getAllPlays();
  const query = (filter || '').toLowerCase();
  if (query) {
    plays = plays.filter((p) => p.track_name.toLowerCase().includes(query) || p.artist_name.toLowerCase().includes(query));
  }

  switch (sort) {
    case 'oldest':
      plays.sort((a, b) => new Date(a.played_at) - new Date(b.played_at));
      break;
    case 'artist':
      plays.sort((a, b) => a.artist_name.localeCompare(b.artist_name));
      break;
    case 'track':
      plays.sort((a, b) => a.track_name.localeCompare(b.track_name));
      break;
    default:
      plays.sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
  }

  renderTrackList('history-list', plays, 0);
}

async function exportJSON() {
  const plays = await getAllPlays();
  const blob = new Blob([JSON.stringify(plays, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spotics_history_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('History exported!');
}
