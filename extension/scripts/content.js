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

  // --- DOM Selectors for Spotify Web Player ---
  // These target the now-playing bar at the bottom of the player.
  // Spotify uses data-testid attributes which are more stable than class names.
  const SELECTORS = {
    // The now-playing widget container
    nowPlayingWidget: '[data-testid="now-playing-widget"]',
    
    // Track info container
    trackInfo: '[data-testid="context-item-info-title"]',
    
    // Fallback: the now-playing bar's track name link
    trackLink: 'a[data-testid="context-item-link"]',
    
    // Artist info
    artistInfo: '[data-testid="context-item-info-subtitles"]',
    
    // Fallback: artist links in now-playing bar
    artistLinks: 'a[href*="/artist/"]',
    
    // Playback controls — play button
    playButton: '[data-testid="control-button-playpause"]',
    
    // Album art image in now-playing bar
    albumArt: 'img[data-testid="cover-art-image"]',
    
    // Progress bar (to detect seeking/pausing)
    progressBar: '[data-testid="playback-progressbar"]',
    
    // Duration display
    playbarControls: '.playback-bar',
    
    // Track duration from playback bar
    duration: '[data-testid="playback-duration"]',
    
    // Currently playing indicator (the equalizer icon)
    nowPlayingIndicator: '[data-testid="now-playing"]',
  };

  // --- Track Data Extraction ---

  function extractTrackData() {
    try {
      // Strategy 1: Use aria-label from now-playing widget (most reliable)
      const widget = document.querySelector(SELECTORS.nowPlayingWidget);
      if (widget) {
        const ariaLabel = widget.getAttribute('aria-label');
        if (ariaLabel) {
          // Format is typically: "Track Name, Artist Name, Context Type"
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
          // May contain multiple artists
          const artistLinks = artistEl.querySelectorAll('a[href*="/artist/"]');
          if (artistLinks.length > 0) {
            artist = Array.from(artistLinks).map(a => a.textContent.trim()).join(', ');
          } else {
            artist = artistEl.textContent.trim();
          }
        }
        
        // Get album art
        const albumArtImg = document.querySelector('.cover-art img') ||
                           document.querySelector('[data-testid="cover-art-image"]');
        const albumArt = albumArtImg ? albumArtImg.src : null;
        
        // Get duration from playback bar
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

      // Strategy 3: Use Spotify's internal player state via the __spotify global
      if (window.__spotify && window.__spotify.player) {
        try {
          // Some Spotify versions expose playback state
          const session = window.__spotify.session;
          if (session) {
            const track = session?.track;
            if (track) {
              return {
                title: track.name || track.metadata?.title,
                artist: track.metadata?.artist_name || track.artists?.[0]?.name || 'Unknown Artist',
                albumArt: track.metadata?.image_url,
                durationMs: track.metadata?.duration || track.duration || 0,
              };
            }
          }
        } catch (e) {
          // Internal API access failed, continue with DOM approach
        }
      }

      // Strategy 4: Extract from document title
      // Spotify sets the tab title to "Artist - Track Name" or "Track Name - Artist"
      const title = document.title;
      if (title && title !== 'Spotify' && title !== 'Spotify – Web Player' && title !== 'Spotify - Web Player') {
        // Common formats: "Song Name - Artist" or "Artist - Song Name" or "Song Name · Artist"
        const separators = [' - ', ' · ', ' \u2013 ', ' – '];
        for (const sep of separators) {
          if (title.includes(sep)) {
            const parts = title.split(sep).map(s => s.trim());
            if (parts.length === 2) {
              // Heuristic: if one part looks like an artist (shorter, common patterns)
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
      // Check if Spotify is currently playing by looking at the play/pause button
      const playButton = document.querySelector(SELECTORS.playButton);
      if (playButton) {
        const ariaLabel = playButton.getAttribute('aria-label');
        if (ariaLabel) {
          const label = ariaLabel.toLowerCase();
          if (label.includes('pause') || label === 'pause') return 'playing';
          if (label.includes('play') || label === 'play') return 'paused';
        }
        // Check for SVG icon inside the button
        const svgTitle = playButton.querySelector('svg title');
        if (svgTitle) {
          const text = svgTitle.textContent.toLowerCase();
          if (text.includes('pause')) return 'playing';
          if (text.includes('play')) return 'paused';
        }
      }

      // Fallback: check if there's a now-playing indicator
      const indicator = document.querySelector(SELECTORS.nowPlayingIndicator);
      if (indicator) return 'playing';

      // Default assumption
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
    // Standard scrobble rules:
    // 1. Track must have played for at least 50% of its duration OR 4 minutes (whichever is less)
    // 2. Track must be longer than 30 seconds
    // 3. Track must be different from the last scrobbled track

    if (!track || !track.title) return false;
    if (durationMs > 0 && durationMs < 30000) return false;
    if (isSameTrack({ title: track.title, artist: track.artist }, lastScrobbledTrack)) return false;

    const halfDuration = durationMs > 0 ? durationMs / 2 : 240000;
    const scrobbleThreshold = Math.min(halfDuration, 240000); // 4 max minutes

    return elapsedMs >= scrobbleThreshold;
  }

  // --- Communication with Background Script ---

  function sendToBackground(message) {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          // Background script might not be ready, that's okay
          console.debug('[Spotics Scrobler] Background message deferred:', chrome.runtime.lastError.message);
        }
      });
    } catch (error) {
      console.warn('[Spotics Scrobbler] Failed to send message to background:', error);
    }
  }

  // --- Main Observer ---

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

  function checkPlayback() {
    const state = getPlaybackState();
    const trackData = extractTrackData();

    if (state === 'playing' && trackData && trackData.title) {
      if (!isSameTrack(trackData, currentTrack)) {
        // New track started
        const now = Date.now();

        // Scrobble the previous track if it existed
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
          }
        }

        // Start tracking new track
        currentTrack = trackData;
        trackStartTime = now;

        // Also send "now playing" notification
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

        updateStatus('active', trackData);
      } else {
        // Still playing same track — check if it should be scrobbled
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
            // Reset start time to avoid double scrobble
            trackStartTime = Date.now();
          }
        }
      }
    } else if (state === 'paused') {
      updateStatus('waiting', null);
    }
  }

  // --- MutationObserver Setup ---

  function startObserving() {
    // Initial check
    checkPlayback();

    // Set up a MutationObserver to detect DOM changes in the playbar
    const targetNode = document.body;
    
    if (observer) observer.disconnect();
    
    observer = new MutationObserver((mutations) => {
      // Throttle checks to avoid excessive polling
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

    // Also poll periodically as a backup (Spotify may re-render without triggering mutations)
    window.__SPOTICS_POLL_INTERVAL = setInterval(checkPlayback, 5000);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkPlayback();
      }
    });

    console.log('[Spotics Scrobbler] Content script active — observing Spotify Web Player');
    createStatusIndicator();
    updateStatus('waiting', null);
  }

  // --- Spotify Web Player Detection ---

  function waitForSpotify() {
    const check = () => {
      // Look for the Spotify Web Player's now-playing bar
      const playbar = document.querySelector('[data-testid="now-playing-bar"]') ||
                      document.querySelector('[data-testid="now-playing-widget"]') ||
                      document.querySelector('.Root__now-playing-bar') ||
                      document.querySelector('[data-testid="playback-controls"]');

      if (playbar) {
        return true;
      }

      // Also check if title contains Spotify-specific text
      if (document.title.includes('Spotify') || document.title.includes('spotify')) {
        return true;
      }

      return false;
    };

    if (check()) {
      startObserving();
      return;
    }

    // Wait for Spotify to load its player UI
    const observer = new MutationObserver((_, obs) => {
      if (check()) {
        obs.disconnect();
        startObserving();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Timeout after 30s
    setTimeout(() => {
      observer.disconnect();
      if (!window.__SPOTICS_SCROBBLER_LOADED) return;
      console.warn('[Spotics Scrobbler] Timed out waiting for Spotify player UI');
    }, 30000);
  }

  // --- Init ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSpotify);
  } else {
    waitForSpotify();
  }
})();
