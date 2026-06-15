/**
 * Last.fm API interaction.
 * Uses blueimp-md5 loaded via CDN (see index.html).
 */

let sessionKey = null;

function initiateLogin() {
  const redirectUri = window.location.origin + window.location.pathname;
  const authUrl = `https://www.last.fm/api/auth/?api_key=${CONFIG.apiKey}&cb=${encodeURIComponent(redirectUri)}`;
  window.location = authUrl;
}

async function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return false;

  // Build the signature string (as per Last.fm documentation)
  const sigString = `api_key${CONFIG.apiKey}methodauth.getSessiontoken${token}${CONFIG.apiSecret}`;
  console.log('Signature string:', sigString);

  // Use the reliable blueimp-md5 function
  const apiSig = md5(sigString);
  const url = `https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${CONFIG.apiKey}&token=${token}&api_sig=${apiSig}&format=json`;

  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Last.fm auth error: ${data.message}`);
  }

  sessionKey = data.session.key;
  await saveSessionKey(sessionKey);
  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
}

async function fetchRecentTracks() {
  if (!sessionKey) {
    const stored = await getSessionKey();
    if (!stored) throw new Error('Not authenticated');
    sessionKey = stored;
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${CONFIG.username}&api_key=${CONFIG.apiKey}&limit=50&format=json&sk=${sessionKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Last.fm error: ${data.message}`);
  }

  return data.recenttracks.track
    .filter(t => !t['@attr']?.nowplaying && t.date)
    .map(item => ({
      track_id: item.url,
      track_name: item.name,
      artist_name: item.artist['#text'],
      album_cover: item.image?.find(i => i.size === 'large')?.['#text'] ||
                   item.image?.[item.image.length-1]?.['#text'] || '',
      duration_ms: 0,
      played_at: new Date(item.date.uts * 1000).toISOString(),
    }));
}
