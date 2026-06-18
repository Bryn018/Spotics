/**
 * Spotics — Last.fm API Client
 * Handles OAuth authentication and API calls.
 * Requires blueimp-md5 loaded via CDN (see index.html).
 */
(function (global) {
  'use strict';

  let sessionKey = null;

  /**
   * Initiate Last.fm OAuth flow.
   * Redirects user to Last.fm auth page.
   */
  function initiateLogin() {
    if (!CONFIG.apiKey) {
      if (typeof showConfigModal === 'function') showConfigModal();
      return;
    }
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = 'https://www.last.fm/api/auth/?api_key=' +
      encodeURIComponent(CONFIG.apiKey) +
      '&cb=' + encodeURIComponent(redirectUri);
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback after Last.fm redirects back.
   * Extracts token from URL, exchanges for session key.
   * @returns {boolean} true if authentication succeeded
   */
  async function handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return false;

    if (!CONFIG.apiKey || !CONFIG.apiSecret) {
      if (typeof showToast === 'function') showToast('Set up your API keys first', 'error');
      return false;
    }

    const sigString = 'api_key' + CONFIG.apiKey +
      'methodauth.getSession' +
      'token' + token +
      CONFIG.apiSecret;

    const apiSig = md5(sigString);
    const url = 'https://ws.audioscrobbler.com/2.0/?method=auth.getSession' +
      '&api_key=' + encodeURIComponent(CONFIG.apiKey) +
      '&token=' + encodeURIComponent(token) +
      '&api_sig=' + encodeURIComponent(apiSig) +
      '&format=json';

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error('Last.fm auth error: ' + (data.message || 'Unknown error'));
    }

    sessionKey = data.session.key;
    await saveSessionKey(sessionKey);

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }

  /**
   * Fetch recent tracks from Last.fm API.
   * @returns {{ nowPlaying: object|null, historical: Array }}
   */
  async function fetchRecentTracks() {
    if (!sessionKey) {
      const stored = await getSessionKey();
      if (!stored) throw new Error('Not authenticated');
      sessionKey = stored;
    }

    const url = 'https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks' +
      '&user=' + encodeURIComponent(CONFIG.username) +
      '&api_key=' + encodeURIComponent(CONFIG.apiKey) +
      '&limit=50&format=json&sk=' + encodeURIComponent(sessionKey);

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error('Last.fm error: ' + (data.message || 'Unknown error'));
    }

    const tracks = (data.recenttracks && data.recenttracks.track) || [];

    // Find now playing track
    const nowPlaying = tracks.find(
      t => t['@attr'] && t['@attr'].nowplaying === 'true'
    ) || null;

    // Map historical tracks
    const historical = tracks
      .filter(t => !t['@attr'] || t['@attr'].nowplaying !== 'true')
      .filter(t => t.date)
      .map(t => ({
        track_id: t.url || '',
        track_name: t.name || 'Unknown',
        artist_name: (t.artist && t.artist['#text']) || 'Unknown',
        album_name: (t.album && t.album['#text']) || '',
        album_cover: getLargeImage(t.image),
        duration_ms: 0,
        played_at: new Date(parseInt(t.date.uts, 10) * 1000).toISOString(),
      }));

    return { nowPlaying, historical };
  }

  /**
   * Extract the large image URL from a Last.fm image array.
   */
  function getLargeImage(images) {
    if (!Array.isArray(images) || images.length === 0) return '';
    const large = images.find(img => img.size === 'large');
    return (large && large['#text']) ||
      (images[images.length - 1] && images[images.length - 1]['#text']) || '';
  }

  /**
   * Get the current session key (for internal use).
   */
  function getSession() { return sessionKey; }

  /**
   * Clear the session (for disconnect).
   */
  function clearSession() { sessionKey = null; }

  // ── Exports ──

  global.lastfm = {
    initiateLogin,
    handleAuthCallback,
    fetchRecentTracks,
    getSession,
    clearSession,
    getLargeImage,
  };
})(window);
