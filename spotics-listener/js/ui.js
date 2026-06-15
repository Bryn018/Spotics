function showError(message) {
  const errDiv = document.getElementById('error-message');
  errDiv.textContent = message;
  errDiv.classList.remove('hidden');
  setTimeout(() => errDiv.classList.add('hidden'), 8000);
}

function toggleUI(authenticated) {
  document.getElementById('auth-section').classList.toggle('hidden', authenticated);
  document.getElementById('dashboard').classList.toggle('hidden', !authenticated);
}

async function updateDashboard() {
  const plays = await getAllPlays();
  const totalTracks = plays.length;
  const uniqueArtists = new Set(plays.map(p => p.artist_name)).size;

  const artistCounts = {};
  plays.forEach((p) => {
    artistCounts[p.artist_name] = (artistCounts[p.artist_name] || 0) + 1;
  });
  let topArtist = '-';
  let topCount = 0;
  for (const [artist, count] of Object.entries(artistCounts)) {
    if (count > topCount) {
      topCount = count;
      topArtist = artist;
    }
  }

  document.getElementById('total-tracks').textContent = String(totalTracks);
  document.getElementById('total-artists').textContent = String(uniqueArtists);
  document.getElementById('top-artist').textContent = topArtist;

  const lastFetch = await getLastFetchTimestamp();
  if (lastFetch) {
    document.getElementById('last-fetch-time').textContent = `Last updated ${timeAgoString(new Date(lastFetch))}`;
  } else {
    document.getElementById('last-fetch-time').textContent = 'Never fetched';
  }
}

function renderRecentTracks(plays) {
  const list = document.getElementById('recent-list');
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
