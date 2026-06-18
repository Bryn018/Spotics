/**
 * Spotics — UI Rendering Module
 * All DOM manipulation and rendering functions.
 */
(function (global) {
  'use strict';

  // ── Utility helpers ──

  function esc(text) {
    const d = document.createElement('div');
    d.textContent = String(text == null ? '' : text);
    return d.innerHTML;
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    const d = Math.floor(h / 24);
    if (d < 7) return d + 'd ago';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function showToast(msg, type) {
    type = type || 'default';
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.borderLeftColor =
      type === 'error' ? 'var(--danger)' :
      type === 'success' ? 'var(--success)' : 'var(--accent)';
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3500);
  }

  function setPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    var page = document.getElementById('page-' + pageId);
    var navItem = document.querySelector('[data-page="' + pageId + '"]');
    if (page) page.classList.add('active');
    if (navItem) navItem.classList.add('active');
  }

  function setConnectedUI(on, username) {
    username = username || '';
    var connectBtn = document.getElementById('connect-btn');
    var refreshBtn = document.getElementById('refresh-btn');
    var connectSettingsBtn = document.getElementById('connect-settings-btn');
    var disconnectRow = document.getElementById('disconnect-row');
    var userAvatar = document.getElementById('user-avatar');
    var userNameDisplay = document.getElementById('user-name-display');
    var userStatus = document.getElementById('user-status');
    var settingsUserDisplay = document.getElementById('settings-user-display');
    var freqBars = document.getElementById('freq-bars');
    var dashSub = document.getElementById('dash-sub');

    if (connectBtn) connectBtn.classList.toggle('hidden', on);
    if (refreshBtn) refreshBtn.classList.toggle('hidden', !on);
    if (connectSettingsBtn) connectSettingsBtn.classList.toggle('hidden', on);
    if (disconnectRow) disconnectRow.style.display = on ? 'flex' : 'none';

    if (userAvatar) userAvatar.textContent = on ? username.slice(0, 2).toUpperCase() : '\u2014';
    if (userNameDisplay) userNameDisplay.textContent = on ? username : 'Not connected';
    if (userStatus) {
      userStatus.textContent = on ? 'Active' : 'Connect to start';
      userStatus.className = 'user-status' + (on ? ' live' : '');
    }
    if (settingsUserDisplay) settingsUserDisplay.textContent = on ? username : 'Not connected';
    if (freqBars) freqBars.classList.toggle('paused', !on);
    if (dashSub) {
      dashSub.textContent = on
        ? 'Tracking ' + username + ' \u00b7 Last updated ' + timeAgo(new Date().toISOString())
        : 'Connect your Last.fm account to start tracking';
    }
  }

  // ── Track list rendering ──

  function renderTrackList(containerId, plays, limit) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var sorted = plays.slice().sort(function (a, b) {
      return new Date(b.played_at) - new Date(a.played_at);
    });
    var slice = limit ? sorted.slice(0, limit) : sorted;
    if (!slice.length) {
      el.innerHTML = '<div class="empty">No tracks found</div>';
      return;
    }
    el.innerHTML = slice.map(function (p, i) {
      return '<li class="track-item">' +
        '<span class="track-num">' + (i + 1) + '</span>' +
        '<img class="track-cover" src="' + esc(p.album_cover || '') + '" alt="" ' +
          'onerror="this.style.background=\'var(--surface3)\';this.removeAttribute(\'src\')">' +
        '<div class="track-info">' +
          '<div class="track-name">' + esc(p.track_name) + '</div>' +
          '<div class="track-artist">' + esc(p.artist_name) + '</div>' +
        '</div>' +
        '<div class="track-time">' + timeAgo(p.played_at) + '</div>' +
      '</li>';
    }).join('');
  }

  // ── Artist bars rendering ──

  var ARTIST_RANK_KEY = 'spotics_artist_ranks';

  function loadRanks(storageKey) {
    try {
      var raw = localStorage.getItem(storageKey || ARTIST_RANK_KEY);
      if (!raw) return new Map();
      var obj = JSON.parse(raw);
      var map = new Map();
      Object.keys(obj).forEach(function (period) {
        map.set(period, new Map(Object.entries(obj[period])));
      });
      return map;
    } catch (e) { return new Map(); }
  }

  function saveRanks(ranksMap, storageKey) {
    try {
      var obj = {};
      ranksMap.forEach(function (inner, period) {
        obj[period] = Object.fromEntries(inner);
      });
      localStorage.setItem(storageKey || ARTIST_RANK_KEY, JSON.stringify(obj));
    } catch (e) { /* quota exceeded */ }
  }

  function renderArtistBars(artistCounts, limit, period) {
    var el = document.getElementById('artist-list');
    if (!el) return;
    var sorted = Object.entries(artistCounts).sort(function (a, b) { return b[1] - a[1]; }).slice(0, limit || 7);
    if (!sorted.length) {
      el.innerHTML = '<div class="empty">No artist data yet</div>';
      return;
    }
    var max = sorted[0][1];
    period = period || 'all';
    var allPrev = loadRanks();
    var prevRanks = allPrev.get(period) || new Map();
    var newRanks = new Map();

    el.innerHTML = sorted.map(function (entry, i) {
      var name = entry[0], count = entry[1];
      var currentRank = i + 1;
      newRanks.set(name, currentRank);
      var prevRank = prevRanks.get(name);
      var deltaLabel = 'same';
      if (typeof prevRank === 'number') {
        deltaLabel = currentRank < prevRank ? 'up' : currentRank > prevRank ? 'down' : 'same';
      }
      var arrow = deltaLabel === 'up' ? '\u2191' : deltaLabel === 'down' ? '\u2193' : '=';
      return '<div class="artist-row">' +
        '<span class="artist-rank">' + currentRank + '</span>' +
        '<span class="artist-delta ' + deltaLabel + '">' + arrow + '</span>' +
        '<div class="artist-info">' +
          '<div class="artist-name">' + esc(name) + '</div>' +
          '<div class="artist-bar-wrap">' +
            '<div class="artist-bar-fill" style="width:' + Math.round((count / max) * 100) + '%"></div>' +
          '</div>' +
        '</div>' +
        '<span class="artist-count">' + count + '</span>' +
      '</div>';
    }).join('');

    allPrev.set(period, newRanks);
    saveRanks(allPrev);
  }

  // ── Album grid rendering ──

  function renderAlbumGrid(albumCounts, limit) {
    var el = document.getElementById('album-grid');
    if (!el) return;
    var sorted = Object.entries(albumCounts)
      .filter(function (e) { return e[1].name; })
      .sort(function (a, b) { return b[1].count - a[1].count; })
      .slice(0, limit || 8);
    if (!sorted.length) {
      el.innerHTML = '<div class="empty">No album data yet</div>';
      return;
    }
    el.innerHTML = sorted.map(function (e) {
      var meta = e[1];
      return '<div class="album-card">' +
        '<div class="album-cover">' +
          (meta.cover
            ? '<img src="' + esc(meta.cover) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">' +
              '<div class="no-cover" style="display:none">No cover</div>'
            : '<div class="no-cover">No cover</div>') +
        '</div>' +
        '<div class="album-meta">' +
          '<div class="album-name" title="' + esc(meta.name) + '">' + esc(meta.name) + '</div>' +
          '<div class="album-artist">' + esc(meta.artist || '') + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ── Track obsession rendering ──

  var TRACK_RANK_KEY = 'spotics_track_ranks';

  function renderTrackCounts(trackCounts, limit, period) {
    var el = document.getElementById('track-list');
    if (!el) return;
    var items = Object.entries(trackCounts).map(function (e) {
      var parts = e[0].split('|||');
      return { key: e[0], track_name: parts[0], artist_name: parts[1], count: e[1] };
    }).sort(function (a, b) {
      return b.count - a.count || a.key.localeCompare(b.key);
    }).slice(0, limit || 6);

    if (!items.length) {
      el.innerHTML = '<div class="empty">No repeated tracks yet</div>';
      return;
    }
    var max = items[0].count;
    period = period || 'all';
    var allPrev = loadRanks(TRACK_RANK_KEY);
    var prevRanks = allPrev.get(period) || new Map();
    var newRanks = new Map();

    el.innerHTML = items.map(function (t, i) {
      var currentRank = i + 1;
      newRanks.set(t.key, currentRank);
      var prevRank = prevRanks.get(t.key);
      var deltaLabel = 'same';
      if (typeof prevRank === 'number') {
        deltaLabel = currentRank < prevRank ? 'up' : currentRank > prevRank ? 'down' : 'same';
      }
      var arrow = deltaLabel === 'up' ? '\u2191' : deltaLabel === 'down' ? '\u2193' : '=';
      return '<div class="artist-row track-row">' +
        '<span class="artist-rank">' + currentRank + '</span>' +
        '<span class="track-delta ' + deltaLabel + '">' + arrow + '</span>' +
        '<div class="artist-info">' +
          '<div class="artist-name">' + esc(t.track_name) + '</div>' +
          '<div class="artist-bar-wrap">' +
            '<div class="artist-bar-fill" style="width:' + Math.round((t.count / max) * 100) + '%"></div>' +
          '</div>' +
        '</div>' +
        '<span class="artist-count">' + t.count + '</span>' +
      '</div>';
    }).join('');

    allPrev.set(period, newRanks);
    saveRanks(allPrev, TRACK_RANK_KEY);
  }

  // ── Heatmap rendering ──

  function renderHeatmap(plays, containerId) {
    var wrap = document.getElementById(containerId || 'heatmap-wrap');
    if (!wrap) return;
    var dayCounts = {};
    plays.forEach(function (p) {
      var day = p.played_at.slice(0, 10);
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    var maxCount = Math.max.apply(null, Object.values(dayCounts).concat([1]));
    var days = [];
    var now = new Date();
    for (var i = 83; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    var weeks = [];
    for (var w = 0; w < days.length; w += 7) {
      weeks.push(days.slice(w, w + 7));
    }
    var html = '<div class="heatmap">' + weeks.map(function (week) {
      return '<div class="heatmap-col">' + week.map(function (day) {
        var c = dayCounts[day] || 0;
        var level = c === 0 ? '' : c < maxCount * 0.25 ? 'l1' : c < maxCount * 0.5 ? 'l2' : c < maxCount * 0.75 ? 'l3' : 'l4';
        return '<div class="heatmap-cell ' + level + '" title="' + day + ': ' + c + ' plays"></div>';
      }).join('') + '</div>';
    }).join('') + '</div>';

    var legend = document.getElementById('heatmap-legend');
    wrap.innerHTML = html;
    if (legend) legend.style.display = 'flex';
  }

  // ── Streak computation ──

  function computeStreak(plays) {
    var countEl = document.getElementById('streak-count');
    var subEl = document.getElementById('streak-sub');
    var gridEl = document.getElementById('streak-grid');
    if (!countEl || !subEl || !gridEl) return;

    var activeDays = new Set(plays.map(function (p) { return p.played_at.slice(0, 10); }));
    var today = new Date().toISOString().slice(0, 10);
    var streak = 0, best = 0, current = 0;
    var d = new Date();
    for (var i = 0; i < 365; i++) {
      var day = d.toISOString().slice(0, 10);
      if (activeDays.has(day)) {
        current++;
        best = Math.max(best, current);
        if (day === today || i === 0) streak = current;
      } else {
        if (day < today) current = 0;
      }
      d.setDate(d.getDate() - 1);
    }
    countEl.innerHTML = streak + '<span>days</span>';
    subEl.textContent = 'Best: ' + best;

    var days = [];
    var now = new Date();
    for (var j = 13; j >= 0; j--) {
      var dd = new Date(now);
      dd.setDate(dd.getDate() - j);
      days.push(dd.toISOString().slice(0, 10));
    }
    gridEl.innerHTML = days.map(function (day) {
      return '<div class="streak-dot' + (activeDays.has(day) ? ' active' : '') + '" title="' + day + '"></div>';
    }).join('');
  }

  // ── Week stats ──

  function computeWeekStats(plays) {
    var weekAgo = Date.now() - 7 * 86400000;
    var recent = plays.filter(function (p) { return new Date(p.played_at).getTime() > weekAgo; });
    var artists = new Set(recent.map(function (p) { return p.artist_name; })).size;
    var hours = {};
    recent.forEach(function (p) {
      var h = new Date(p.played_at).getHours();
      hours[h] = (hours[h] || 0) + 1;
    });
    var peakHour = '\u2014';
    var entries = Object.entries(hours);
    if (entries.length) {
      peakHour = entries.sort(function (a, b) { return b[1] - a[1]; })[0][0] + ':00';
    }
    var wsPlays = document.getElementById('ws-plays');
    var wsArtists = document.getElementById('ws-artists');
    var wsPeak = document.getElementById('ws-peak');
    if (wsPlays) wsPlays.textContent = recent.length;
    if (wsArtists) wsArtists.textContent = artists;
    if (wsPeak) wsPeak.textContent = peakHour;
  }

  // ── Now Playing rendering ──

  function renderNowPlaying(nowPlaying) {
    var row = document.getElementById('now-playing-row');
    if (!row) return;

    if (!nowPlaying) {
      row.style.display = 'none';
      return;
    }

    row.style.display = 'flex';
    var statusEl = document.getElementById('np-status');
    var trackEl = document.getElementById('np-track');
    var artistEl = document.getElementById('np-artist');
    var coverEl = document.getElementById('np-cover');
    var freqBars = document.getElementById('freq-bars');

    if (statusEl) statusEl.textContent = 'Now Playing';
    if (trackEl) trackEl.textContent = nowPlaying.name || 'Unknown track';
    if (artistEl) artistEl.textContent = (nowPlaying.artist && nowPlaying.artist['#text']) || 'Unknown artist';

    var cover = lastfm.getLargeImage(nowPlaying.image);
    if (cover && coverEl) {
      coverEl.src = cover;
      coverEl.style.display = '';
    } else if (coverEl) {
      coverEl.style.display = 'none';
    }
    if (freqBars) freqBars.classList.remove('paused');
  }

  // ── Config modal ──

  function showConfigModal() {
    var keyEl = document.getElementById('cfg-api-key');
    var secretEl = document.getElementById('cfg-api-secret');
    var usernameEl = document.getElementById('cfg-username');
    if (keyEl) keyEl.value = CONFIG.apiKey || '';
    if (secretEl) secretEl.value = CONFIG.apiSecret || '';
    if (usernameEl) usernameEl.value = CONFIG.username || '';
    var modal = document.getElementById('config-modal');
    if (modal) modal.classList.add('show');
  }

  function hideConfigModal() {
    var modal = document.getElementById('config-modal');
    if (modal) modal.classList.remove('show');
  }

  // ── Theme ──

  function applyTheme() {
    var light = localStorage.getItem('spotics_theme') === 'light';
    var root = document.documentElement;
    if (light) {
      root.style.setProperty('--bg', '#F4F4F8');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--surface2', '#F0F0F5');
      root.style.setProperty('--surface3', '#E5E5EE');
      root.style.setProperty('--text', '#0D0D1A');
      root.style.setProperty('--text2', '#555577');
      root.style.setProperty('--text3', '#9999BB');
      root.style.setProperty('--border', 'rgba(0,0,0,0.07)');
      root.style.setProperty('--border2', 'rgba(0,0,0,0.12)');
    } else {
      root.style.removeProperty('--bg');
      root.style.removeProperty('--surface');
      root.style.removeProperty('--surface2');
      root.style.removeProperty('--surface3');
      root.style.removeProperty('--text');
      root.style.removeProperty('--text2');
      root.style.removeProperty('--text3');
      root.style.removeProperty('--border');
      root.style.removeProperty('--border2');
    }
    var tt = document.getElementById('theme-toggle');
    var dt = document.getElementById('dark-toggle');
    if (tt) tt.classList.toggle('light-on', light);
    if (dt) dt.classList.toggle('on', light);
  }

  function toggleTheme() {
    var light = localStorage.getItem('spotics_theme') === 'light';
    localStorage.setItem('spotics_theme', light ? 'dark' : 'light');
    applyTheme();
  }

  // ── Exports ──

  global.ui = {
    esc, timeAgo, showToast, setPage, setConnectedUI,
    renderTrackList, renderArtistBars, renderAlbumGrid, renderTrackCounts,
    renderHeatmap, computeStreak, computeWeekStats, renderNowPlaying,
    showConfigModal, hideConfigModal, applyTheme, toggleTheme,
  };
})(window);
