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

function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 250);
  }, duration);
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
  const connectBtnDash = document.getElementById('connect-btn-dash');
  const fetchBtnDash = document.getElementById('fetch-now-btn-dash');
  const connectBtn = document.getElementById('connect-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  if (connectBtnDash) connectBtnDash.classList.toggle('hidden', authenticated);
  if (fetchBtnDash) fetchBtnDash.classList.toggle('hidden', !authenticated);
  if (connectBtn) connectBtn.classList.toggle('hidden', authenticated);
  if (refreshBtn) refreshBtn.classList.toggle('hidden', !authenticated);
}

function renderTrackList(containerId, plays, limit = 20) {
  const list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = '';
  const sorted = [...plays].sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
  const slice = limit ? sorted.slice(0, limit) : sorted;

  slice.forEach((play, index) => {
    const li = document.createElement('li');
    li.className = 'track-item';
    li.innerHTML = `
      <span class="track-num">${index + 1}</span>
      <img class="track-cover" src="${play.album_cover || ''}" alt="" onerror="this.style.display='none'">
      <div class="track-info">
        <div class="track-name">${esc(play.track_name)}</div>
        <div class="track-artist">${esc(play.artist_name)}</div>
      </div>
      <div class="track-time">${timeAgo(play.played_at)}</div>
    `;
    list.appendChild(li);
  });
}

function renderArtistBars(artistCounts, limit = 7) {
  const el = document.getElementById('artist-list');
  if (!el) return;
  const sorted = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (!sorted.length) {
    el.innerHTML = '<div class="empty">No artist data yet</div>';
    return;
  }
  const max = sorted[0][1];
  el.innerHTML = sorted
    .map(
      ([name, count]) => `
      <div class="artist-row">
        <div class="artist-info">
          <div class="artist-name">${esc(name)}</div>
          <div class="artist-bar-wrap">
            <div class="artist-bar-fill" style="width:${Math.round((count / max) * 100)}%"></div>
          </div>
        </div>
        <div class="artist-count">${count}</div>
      </div>
    `
    )
    .join('');
}

function renderHeatmap(plays) {
  const wrap = document.getElementById('heatmap-wrap');
  const legend = document.getElementById('heatmap-legend');
  if (!wrap) return;

  const dayCounts = {};
  plays.forEach((p) => {
    const day = p.played_at.slice(0, 10);
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(dayCounts), 1);
  const days = [];
  const now = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  wrap.innerHTML = `
    <div class="heatmap">
      ${weeks
        .map(
          (week) => `
        <div class="heatmap-col">
          ${week
            .map((day) => {
              const count = dayCounts[day] || 0;
              const level =
                count === 0
                  ? ''
                  : count < maxCount * 0.25
                    ? 'l1'
                    : count < maxCount * 0.5
                      ? 'l2'
                      : count < maxCount * 0.75
                        ? 'l3'
                        : 'l4';
              return `<div class="heatmap-cell ${level}" title="${day}: ${count} plays"></div>`;
            })
            .join('')}
        </div>
      `
        )
        .join('')}
    </div>
  `;

  if (legend) legend.style.display = 'flex';
}

function computeWeekStats(plays) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = plays.filter((p) => new Date(p.played_at).getTime() > weekAgo);
  const artists = new Set(recent.map((p) => p.artist_name)).size;
  const hours = {};
  recent.forEach((p) => {
    const h = new Date(p.played_at).getHours();
    hours[h] = (hours[h] || 0) + 1;
  });

  const wsPlays = document.getElementById('ws-plays');
  const wsArtists = document.getElementById('ws-artists');
  const wsPeak = document.getElementById('ws-peak');

  if (wsPlays) wsPlays.textContent = String(recent.length);
  if (wsArtists) wsArtists.textContent = String(artists);

  const entries = Object.entries(hours);
  if (entries.length && wsPeak) {
    const peak = entries.sort((a, b) => b[1] - a[1])[0][0];
    wsPeak.textContent = `${peak}:00`;
  }
}

async function refreshDashboard(period = 'all') {
  const plays = await getAllPlays();
  if (!plays.length) {
    // New design stats
    ['stat-tracks', 'stat-artists', 'stat-top-artist', 'stat-days'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = id === 'stat-top-artist' ? '—' : '0';
    });
    // Old design stats
    ['total-tracks', 'total-artists', 'top-artist-name', 'days-tracked'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = id === 'top-artist-name' ? '—' : '0';
    });
    const historyBadge = document.getElementById('history-badge');
    const dataCountLabel = document.getElementById('data-count-label');
    if (historyBadge) historyBadge.textContent = '0';
    if (dataCountLabel) dataCountLabel.textContent = 'No data stored';
    return;
  }

  let filtered = plays;
  if (period === 'week') {
    const cutoff = Date.now() - 7 * 86400000;
    filtered = plays.filter((p) => new Date(p.played_at).getTime() > cutoff);
  }
  if (period === 'month') {
    const cutoff = Date.now() - 30 * 86400000;
    filtered = plays.filter((p) => new Date(p.played_at).getTime() > cutoff);
  }

  const artistCounts = {};
  const days = new Set();
  filtered.forEach((p) => {
    artistCounts[p.artist_name] = (artistCounts[p.artist_name] || 0) + 1;
    days.add(p.played_at.slice(0, 10));
  });

  const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // New design stats
  const statTracks = document.getElementById('stat-tracks');
  const statArtists = document.getElementById('stat-artists');
  const statTopArtist = document.getElementById('stat-top-artist');
  const statDays = document.getElementById('stat-days');
  if (statTracks) statTracks.textContent = String(filtered.length);
  if (statArtists) statArtists.textContent = String(Object.keys(artistCounts).length);
  if (statTopArtist) statTopArtist.textContent = topArtist.length > 12 ? `${topArtist.slice(0, 12)}…` : topArtist;
  if (statDays) statDays.textContent = String(days.size);

  // Old design stats
  const totalTracksEl = document.getElementById('total-tracks');
  const totalArtistsEl = document.getElementById('total-artists');
  const topArtistNameEl = document.getElementById('top-artist-name');
  const daysTrackedEl = document.getElementById('days-tracked');
  if (totalTracksEl) totalTracksEl.textContent = String(filtered.length);
  if (totalArtistsEl) totalArtistsEl.textContent = String(Object.keys(artistCounts).length);
  if (topArtistNameEl) topArtistNameEl.textContent = topArtist;
  if (daysTrackedEl) daysTrackedEl.textContent = String(days.size);

  const historyBadge = document.getElementById('history-badge');
  const dataCountLabel = document.getElementById('data-count-label');
  if (historyBadge) historyBadge.textContent = String(plays.length);
  if (dataCountLabel) dataCountLabel.textContent = `${plays.length.toLocaleString()} plays stored`;

  renderArtistBars(artistCounts);
  renderTrackList('recent-list', plays, 12);
  renderTrackList('recent-list-dash', plays, 10);
  renderHeatmap(plays);
  computeWeekStats(plays);

  const last = await getLastFetchTimestamp();
  const fetchEl = document.getElementById('last-fetch-time');
  if (fetchEl) fetchEl.textContent = last ? `Last updated ${timeAgo(last)}` : 'Never fetched';
}

async function refreshHistory(sort = 'newest', filter = '') {
  let plays = await getAllPlays();
  const query = (filter || '').toLowerCase();
  if (query) {
    plays = plays.filter((p) => p.track_name.toLowerCase().includes(query) || p.artist_name.toLowerCase().includes(query));
  }

  switch (sort) {
    case 'oldest':
      plays.sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime());
      break;
    case 'artist':
      plays.sort((a, b) => a.artist_name.localeCompare(b.artist_name));
      break;
    case 'track':
      plays.sort((a, b) => a.track_name.localeCompare(b.track_name));
      break;
    default:
      plays.sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime());
  }

  renderTrackList('history-list', plays, 0);
}

async function exportJSON() {
  const plays = await getAllPlays();
  if (!plays.length) {
    showToast('No data to export', 'error');
    return;
  }
  const blob = new Blob([JSON.stringify(plays, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spotics_history_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${plays.length} plays`, 'success');
}

function showConfigModal() {
  const keyEl = document.getElementById('cfg-api-key');
  const secretEl = document.getElementById('cfg-api-secret');
  const usernameEl = document.getElementById('cfg-username');
  if (keyEl) keyEl.value = CONFIG.apiKey || '';
  if (secretEl) secretEl.value = CONFIG.apiSecret || '';
  if (usernameEl) usernameEl.value = CONFIG.username || '';
  const modal = document.getElementById('config-modal');
  if (modal) modal.classList.add('show');
}

function hideConfigModal() {
  const modal = document.getElementById('config-modal');
  if (modal) modal.classList.remove('show');
}
