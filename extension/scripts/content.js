// Spotics Scrobbler - Content Script
// Observes the Spotify Web Player DOM to detect currently playing tracks
// and sends scrobble events to the background script.

(() => {
  'use strict';

  // Prevent double-injection
  if (window.__SPOTICS_SCROBBLER_LOADED) return;
  window.__SPOTICS_SCROBBLER_LOADED = true;

  // --- State ---
  let currentTrack = null;
  let trackStartTime = null;
  let lastScrobbledTrack = null;
  let observer = null;
  let statusIndicator = null;
  let pollInterval = null;

  // --- DOM Selectors for Spotify Web Player ---
  const SELECTORS = {
    nowPlayingWidget: '[data-testid="now-playing-widget"]',
    trackInfo: '[data-testid="context-item-info-title"]',
    trackLink: 'a[data-testid="context-item-link"]',
    artistInfo: '[data-testid="context-item-info-subtitles"]',
    artistLinks: 'a[href*="/artist/"]',
    playButton: '[data-testid="control-button-playpause"]',
    albumArt: 'img[data-testid="cover-art-image"]',
    progressBar: '[data-testid="playback-progressbar"]',
    playbarControls: '.playback-bar',
    duration: '[data-testid="playback-duration"]',
    nowPlayingIndicator: '[data-testid="now-playing"]',
    nowPlayingBar: '[data-testid="now-playing-bar"]',
    playbackControls: '[data-testid="playback-controls"]',
  };

  // --- Track Data Extraction ---

  function extractTrackData() {
    try {
      // Strategy 1: Use aria-label from now-playing widget (most reliable)
      const widget = document.querySelector(SELECTORS.nowPlayingWidget);
      if (widget) {
        const ariaLabel = widget.getAttribute('aria-label');
        if (ariaLabel) {
          const parts = ariaLabel.split(',').map(s => s.trim());
          if (parts.length >= 2) {
            const title = parts[0];
            const artist = parts[1].replace(/\s+(by|from)\s+.*/, '').trim();
            const albumArtImg = widget.querySelector('img');
            const albumArt = albumArtImg ? albumArtImg.src : null;
            return { title, artist, albumArt };
          }
        }
      }

      // Strategy 2: Extract from track link and artist elements
      const trackLink = document.querySelector(SELECTORS.trackLink) ||
                        document.querySelector(SELECTORS.trackInfo);
      const artistEl = document.querySelector(SELECTORS.artistInfo);

      if (trackLink) {
        const title = trackLink.textContent.trim();
        let artist = 'Unknown Artist';

        if (artistEl) {
          const artistLinks = artistEl.querySelectorAll('a[href*="/artist/"]');
          if (artistLinks.length > 0) {
            artist = Array.from(artistLinks).map(a => a.textContent.trim()).join(', ');
          } else {
            artist = artistEl.textContent.trim();
          }
        }

        const albumArtImg = document.querySelector('.cover-art img') ||
                           document.querySelector('[data-testid="cover-art-image"]');
        const albumArt = albumArtImg ? albumArtImg.src : null;

        const durationEl = document.querySelector(SELECTORS.duration) ||
                          document.querySelector('.playback-bar__progress-time-elapsed');
        let durationMs = 0;
        if (durationEl) {
          durationMs = parseDuration(durationEl.textContent);
        }

        if (title && title !== 'Unknown Track') {
          return { title, artist, albumArt, durationMs };
        }
      }

      // Strategy 3: Extract from document title
      const docTitle = document.title;
      if (docTitle && docTitle !== 'Spotify' && docTitle !== 'Spotify – Web Player' && docTitle !== 'Spotify - Web Player') {
        const separators = [' - ', ' · ', ' \u2013 ', ' – '];
        for (const sep of separators) {
          if (docTitle.includes(sep)) {
            const parts = docTitle.split(sep).map(s => s.trim());
            if (parts.length === 2) {
              return {
                title: parts[0],
                artist: parts[1],
                albumArt: null,
                durationMs: 0,
              };
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('[Spotics Scrobbler] Error extracting track data:', error);
      return null;
    }
  }

  function parseDuration(text) {
    if (!text) return 0;
    const parts = text.split(':').map(Number);
    if (parts.length === 2) {
      return (parts[0] * 60 + parts[1]) * 1000;
    }
    if (parts.length === 3) {
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
    return 0;
  }

  // --- Playback State Detection ---

  function getPlaybackState() {
    try {
      const playButton = document.querySelector(SELECTORS.playButton);
      if (playButton) {
        const ariaLabel = playButton.getAttribute('aria-label');
        if (ariaLabel) {
          const label = ariaLabel.toLowerCase();
          if (label.includes('pause') || label === 'pause') return 'playing';
          if (label.includes('play') || label === 'play') return 'paused';
        }
        const svgTitle = playButton.querySelector('svg title');
        if (svgTitle) {
          const text = svgTitle.textContent.toLowerCase();
          if (text.includes('pause')) return 'playing';
          if (text.includes('play')) return 'paused';
        }
      }

      const indicator = document.querySelector(SELECTORS.nowPlayingIndicator);
      if (indicator) return 'playing';

      return 'playing';
    } catch {
      return 'unknown';
    }
  }

  // --- Scrobble Logic ---

  function isSameTrack(track1, track2) {
    if (!track1 || !track2) return false;
    return (
      track1.title?.toLowerCase() === track2.title?.toLowerCase() &&
      track1.artist?.toLowerCase() === track2.artist?.toLowerCase()
    );
  }

  function shouldScrobble(track, elapsedMs, durationMs) {
    if (!track || !track.title) return false;
    if (durationMs > 0 && durationMs < 30000) return false;
    if (isSameTrack({ title: track.title, artist: track.artist }, lastScrobbledTrack)) return false;

    // Threshold: 30 seconds OR 50% of track duration, whichever is less (min 30s)
    const halfDuration = durationMs > 0 ? durationMs / 2 : 30000;
    const scrobbleThreshold = Math.max(Math.min(halfDuration, 240000), 30000);
    if (elapsedMs < scrobbleThreshold) return false;

    return true;
  }

  // --- Communication with Background Script ---

  function sendToBackground(message) {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.debug('[Spotics Scrobbler] Background message deferred:', chrome.runtime.lastError.message);
        }
      });
    } catch (error) {
      console.warn('[Spotics Scrobbler] Failed to send message to background:', error);
    }
  }

  // --- Status Indicator ---

  function updateStatus(state, trackInfo) {
    if (!statusIndicator) createStatusIndicator();
    if (!statusIndicator) return;

    if (state === 'active' && trackInfo) {
      statusIndicator.style.display = 'flex';
      statusIndicator.querySelector('.spotics-indicator-text').textContent =
        `Scrobbling: ${trackInfo.title.substring(0, 20)}${trackInfo.title.length > 20 ? '...' : ''}`;
      statusIndicator.style.borderColor = '#10b981';
    } else if (state === 'waiting') {
      statusIndicator.style.display = 'flex';
      statusIndicator.querySelector('.spotics-indicator-text').textContent = 'Spotics: Waiting for music...';
      statusIndicator.style.borderColor = '#6b7280';
    } else {
      statusIndicator.style.display = 'none';
    }
  }

  function createStatusIndicator() {
    const existing = document.getElementById('spotics-scrobbler-indicator');
    if (existing) existing.remove();

    statusIndicator = document.createElement('div');
    statusIndicator.id = 'spotics-scrobbler-indicator';
    statusIndicator.innerHTML = `
      <span class="spotics-indicator-dot"></span>
      <span class="spotics-indicator-text">Spotics Scrobbler</span>
    `;
    statusIndicator.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 16px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid #10b981;
      border-radius: 6px;
      padding: 6px 12px;
      display: none;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      color: #e5e7eb;
      backdrop-filter: blur(8px);
      pointer-events: none;
      transition: all 0.3s ease;
    `;

    const dot = document.createElement('style');
    dot.textContent = `
      .spotics-indicator-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        animation: spotics-pulse 2s infinite;
      }
      @keyframes spotics-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;
    statusIndicator.appendChild(dot);
    document.body.appendChild(statusIndicator);
  }

  // --- Main Check ---

  function checkPlayback() {
    const state = getPlaybackState();
    const trackData = extractTrackData();

    if (state === 'playing' && trackData && trackData.title) {
      if (!isSameTrack(trackData, currentTrack)) {
        const now = Date.now();

        // Scrobble previous track if it qualifies
        if (currentTrack && trackStartTime) {
          const elapsed = now - trackStartTime;
          if (shouldScrobble(currentTrack, elapsed, currentTrack.durationMs || 0)) {
            sendToBackground({
              type: 'SCROBBLE',
              data: {
                title: currentTrack.title,
                artist: currentTrack.artist,
                albumArt: currentTrack.albumArt || null,
                durationMs: currentTrack.durationMs || 0,
                timestamp: new Date(trackStartTime).toISOString(),
                playedMs: elapsed,
                source: 'spotify_web_player',
              }
            });
            lastScrobbledTrack = { title: currentTrack.title, artist: currentTrack.artist };
            console.log('[Spotics Scrobbler] Scrobbled:', currentTrack.artist, '-', currentTrack.title);
          }
        }

        // Start tracking new track
        currentTrack = trackData;
        trackStartTime = now;

        sendToBackground({
          type: 'NOW_PLAYING',
          data: {
            title: trackData.title,
            artist: trackData.artist,
            albumArt: trackData.albumArt || null,
            durationMs: trackData.durationMs || 0,
            timestamp: new Date(now).toISOString(),
            source: 'spotify_web_player',
          }
        });

        console.log('[Spotics Scrobbler] Now playing:', trackData.artist, '-', trackData.title);
        updateStatus('active', trackData);
      } else {
        // Same track still playing — check for scrobble
        if (currentTrack && trackStartTime) {
          const elapsed = Date.now() - trackStartTime;
          if (shouldScrobble(currentTrack, elapsed, currentTrack.durationMs || 0)) {
            sendToBackground({
              type: 'SCROBBLE',
              data: {
                title: currentTrack.title,
                artist: currentTrack.artist,
                albumArt: currentTrack.albumArt || null,
                durationMs: currentTrack.durationMs || 0,
                timestamp: new Date(trackStartTime).toISOString(),
                playedMs: elapsed,
                source: 'spotify_web_player',
              }
            });
            lastScrobbledTrack = { title: currentTrack.title, artist: currentTrack.artist };
            trackStartTime = Date.now();
            console.log('[Spotics Scrobbler] Scrobbled:', currentTrack.artist, '-', currentTrack.title);
          }
        }
      }
    } else if (state === 'paused') {
      updateStatus('waiting', null);
    }
  }

  // --- Observer Setup ---

  function startObserving() {
    checkPlayback();

    const targetNode = document.body;

    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      if (window.__SPOTICS_CHECK_PENDING) return;
      window.__SPOTICS_CHECK_PENDING = true;
      requestAnimationFrame(() => {
        checkPlayback();
        window.__SPOTICS_CHECK_PENDING = false;
      });
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'src', 'title', 'data-testid'],
      characterData: false,
    });

    // Poll every 3s as backup
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(checkPlayback, 3000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkPlayback();
      }
    });

    console.log('[Spotics Scrobbler] Content script active — observing Spotify Web Player');
    createStatusIndicator();
    updateStatus('waiting', null);
  }

  // --- Spotify Detection ---

  function waitForSpotify() {
    const check = () => {
      if (document.querySelector(SELECTORS.nowPlayingWidget) ||
          document.querySelector(SELECTORS.trackLink) ||
          document.querySelector(SELECTORS.playButton) ||
          document.title.includes('Spotify') ||
          document.title.includes('•')) {
        return true;
      }
      return false;
    };

    if (check()) {
      startObserving();
      return;
    }

    const obs = new MutationObserver((_, o) => {
      if (check()) {
        o.disconnect();
        startObserving();
      }
    });

    obs.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      obs.disconnect();
    }, 30000);
  }

  // --- Init ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSpotify);
  } else {
    waitForSpotify();
  }
})();
