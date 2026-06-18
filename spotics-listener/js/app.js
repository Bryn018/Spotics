/**
 * Spotics — Main Application Module
 * Orchestrates all modules: config, db, lastfm, ui, charts.
 */
(function () {
  'use strict';

  var pollingTimer = null;
  var visibilityHandler = null;

  // ── Fetch & Store ──

  async function fetchAndStore() {
    try {
      var result = await lastfm.fetchRecentTracks();
      var nowPlaying = result.nowPlaying;
      var historical = result.historical;

      // Update now playing UI
      ui.renderNowPlaying(nowPlaying);

      // Store new plays
      var newCount = 0;
      for (var i = 0; i < historical.length; i++) {
        var t = historical[i];
        var id = t.played_at + '_' + t.track_id;
        var exists = await db.dbGet('history', id);
        if (!exists) {
          await db.savePlay(t);
          newCount++;
        }
      }

      if (newCount > 0) {
        ui.showToast('+' + newCount + ' new ' + (newCount === 1 ? 'play' : 'plays') + ' added', 'success');
      }
      return newCount;
    } catch (e) {
      if (e.message && e.message.includes('Not authenticated')) {
        ui.setConnectedUI(false);
      } else {
        ui.showToast(e.message, 'error');
      }
      return 0;
    }
  }

  // ── Polling ──

  function startPolling() {
    stopPolling();
    pollingTimer = setInterval(async function () {
      var n = await fetchAndStore();
      if (n > 0) await refreshDashboard();
    }, CONFIG.pollIntervalMs);

    // Single visibility change handler (not stacked)
    if (!visibilityHandler) {
      visibilityHandler = async function () {
        if (document.visibilityState === 'visible') {
          await fetchAndStore();
          await refreshDashboard();
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  // ── Dashboard ──

  async function refreshDashboard(period) {
    period = period || 'all';
    var plays = await db.getAllPlays();

    if (!plays.length) {
      // Reset stats
      ['stat-tracks', 'stat-artists', 'stat-days'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = '0';
      });
      var topEl = document.getElementById('stat-top-artist');
      if (topEl) topEl.textContent = '\u2014';
      var badge = document.getElementById('history-badge');
      if (badge) badge.textContent = '0';
      var countLabel = document.getElementById('data-count-label');
      if (countLabel) countLabel.textContent = 'No data stored';
      return;
    }

    // Filter by period
    var filtered = plays;
    if (period === 'week') {
      var t7 = Date.now() - 7 * 86400000;
      filtered = plays.filter(function (p) { return new Date(p.played_at).getTime() > t7; });
    } else if (period === 'month') {
      var t30 = Date.now() - 30 * 86400000;
      filtered = plays.filter(function (p) { return new Date(p.played_at).getTime() > t30; });
    }

    // Compute stats
    var artistCounts = {};
    var albumCounts = {};
    var trackCounts = {};
    var days = new Set();

    filtered.forEach(function (p) {
      artistCounts[p.artist_name] = (artistCounts[p.artist_name] || 0) + 1;

      if (p.album_name && (p.album_name.trim() || p.album_cover)) {
        var aKey = p.album_name.trim() || p.album_cover;
        if (!albumCounts[aKey]) {
          albumCounts[aKey] = { name: p.album_name, count: 0, cover: p.album_cover, artist: p.artist_name };
        }
        albumCounts[aKey].count++;
      }

      var trackKey = p.track_name + '|||' + p.artist_name;
      trackCounts[trackKey] = (trackCounts[trackKey] || 0) + 1;
      days.add(p.played_at.slice(0, 10));
    });

    var topArtistEntry = Object.entries(artistCounts).sort(function (a, b) { return b[1] - a[1]; })[0];
    var topArtist = topArtistEntry ? topArtistEntry[0] : '\u2014';

    // Update DOM
    var statTracks = document.getElementById('stat-tracks');
    var statArtists = document.getElementById('stat-artists');
    var statTop = document.getElementById('stat-top-artist');
    var statDays = document.getElementById('stat-days');
    var badge = document.getElementById('history-badge');
    var countLabel = document.getElementById('data-count-label');

    if (statTracks) statTracks.textContent = filtered.length.toLocaleString();
    if (statArtists) statArtists.textContent = Object.keys(artistCounts).length.toLocaleString();
    if (statTop) statTop.textContent = topArtist.length > 12 ? topArtist.slice(0, 12) + '\u2026' : topArtist;
    if (statDays) statDays.textContent = days.size;
    if (badge) badge.textContent = plays.length.toLocaleString();
    if (countLabel) countLabel.textContent = plays.length.toLocaleString() + ' plays stored';

    // Render components
    ui.renderArtistBars(artistCounts, 7, period);
    ui.renderAlbumGrid(albumCounts);
    ui.renderTrackList('recent-list', plays, 12);
    ui.renderTrackCounts(trackCounts, 6, period);
    ui.computeWeekStats(filtered);
    ui.computeStreak(filtered);
  }

  // ── History page ──

  async function refreshHistory(sort, filter) {
    sort = sort || 'newest';
    filter = filter || '';
    var plays = await db.getAllPlays();

    if (filter) {
      var q = filter.toLowerCase();
      plays = plays.filter(function (p) {
        return p.track_name.toLowerCase().indexOf(q) !== -1 ||
               p.artist_name.toLowerCase().indexOf(q) !== -1;
      });
    }

    switch (sort) {
      case 'oldest':
        plays.sort(function (a, b) { return new Date(a.played_at) - new Date(b.played_at); });
        break;
      case 'artist':
        plays.sort(function (a, b) { return a.artist_name.localeCompare(b.artist_name); });
        break;
      case 'track':
        plays.sort(function (a, b) { return a.track_name.localeCompare(b.track_name); });
        break;
      default:
        plays.sort(function (a, b) { return new Date(b.played_at) - new Date(a.played_at); });
    }

    var el = document.getElementById('history-list');
    if (!plays.length) {
      el.innerHTML = '<div class="empty">' + (filter ? 'No results for "' + ui.esc(filter) + '"' : 'No history yet') + '</div>';
      return;
    }

    el.innerHTML = plays.map(function (p, i) {
      return '<li class="history-track-item">' +
        '<span class="track-num" style="font-size:0.72rem;width:28px">' + (i + 1) + '</span>' +
        '<img class="track-cover" src="' + ui.esc(p.album_cover || '') + '" alt="" ' +
          'onerror="this.style.background=\'var(--surface3)\';this.removeAttribute(\'src\')">' +
        '<div class="track-info">' +
          '<div class="track-name">' + ui.esc(p.track_name) + '</div>' +
          '<div class="track-artist">' + ui.esc(p.artist_name) + '</div>' +
        '</div>' +
        '<div class="track-time">' + ui.timeAgo(p.played_at) + '</div>' +
      '</li>';
    }).join('');
  }

  // ── Export ──

  async function exportJSON() {
    var plays = await db.getAllPlays();
    if (!plays.length) {
      ui.showToast('No data to export', 'error');
      return;
    }
    var blob = new Blob([JSON.stringify(plays, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'spotics_history_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    ui.showToast('Exported ' + plays.length + ' plays', 'success');
  }

  // ── Insights page ──

  async function renderInsights() {
    var plays = await db.getAllPlays();
    var emptyIds = ['ins-peak-hour', 'ins-peak-day', 'ins-avg-daily', 'ins-total-month'];
    var chartIds = ['ins-hourly-chart', 'ins-dow-chart', 'ins-monthly-chart', 'ins-discovery'];

    if (!plays.length) {
      emptyIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = '\u2014'; });
      chartIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Connect Last.fm to see insights</div>'; });
      return;
    }

    // Hourly distribution
    var hours = new Array(24).fill(0);
    plays.forEach(function (p) { hours[new Date(p.played_at).getHours()]++; });
    var maxHour = Math.max.apply(null, hours);
    var hourLabels = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
    var peakHourIdx = hours.indexOf(maxHour);
    var elPeak = document.getElementById('ins-peak-hour');
    if (elPeak) elPeak.textContent = hourLabels[peakHourIdx];

    var hourlyHtml = hours.map(function (count, h) {
      var pct = maxHour ? Math.round((count / maxHour) * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text3);width:30px;text-align:right">' + hourLabels[h] + '</span>' +
        '<div style="flex:1;height:18px;background:var(--surface3);border-radius:3px;overflow:hidden">' +
          '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:3px"></div>' +
        '</div>' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text2);width:36px;text-align:right">' + count + '</span>' +
      '</div>';
    }).join('');
    var elHourly = document.getElementById('ins-hourly-chart');
    if (elHourly) elHourly.innerHTML = hourlyHtml;

    // Day of week
    var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var dowCounts = new Array(7).fill(0);
    plays.forEach(function (p) { dowCounts[new Date(p.played_at).getDay()]++; });
    var maxDow = Math.max.apply(null, dowCounts);
    var peakDayIdx = dowCounts.indexOf(maxDow);
    var elPeakDay = document.getElementById('ins-peak-day');
    if (elPeakDay) elPeakDay.textContent = dayNames[peakDayIdx];

    var dowHtml = dowCounts.map(function (count, d) {
      var pct = maxDow ? Math.round((count / maxDow) * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text3);width:30px">' + dayNames[d] + '</span>' +
        '<div style="flex:1;height:18px;background:var(--surface3);border-radius:3px;overflow:hidden">' +
          '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:3px"></div>' +
        '</div>' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text2);width:36px;text-align:right">' + count + '</span>' +
      '</div>';
    }).join('');
    var elDow = document.getElementById('ins-dow-chart');
    if (elDow) elDow.innerHTML = dowHtml;

    // Monthly timeline
    var months = {};
    plays.forEach(function (p) {
      var dt = new Date(p.played_at);
      var key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
      months[key] = (months[key] || 0) + 1;
    });
    var sortedMonths = Object.entries(months).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    var maxMonth = sortedMonths.length ? Math.max.apply(null, sortedMonths.map(function (m) { return m[1]; })) : 0;
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var monthlyHtml = sortedMonths.map(function (entry) {
      var key = entry[0], count = entry[1];
      var parts = key.split('-');
      var pct = maxMonth ? Math.round((count / maxMonth) * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text3);width:55px">' + monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0] + '</span>' +
        '<div style="flex:1;height:18px;background:var(--surface3);border-radius:3px;overflow:hidden">' +
          '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:3px"></div>' +
        '</div>' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text2);width:36px;text-align:right">' + count + '</span>' +
      '</div>';
    }).join('');
    var elMonthly = document.getElementById('ins-monthly-chart');
    if (elMonthly) elMonthly.innerHTML = monthlyHtml || '<div class="empty">No data yet</div>';

    // Artist discovery
    var firstListen = {};
    plays.forEach(function (p) {
      if (!firstListen[p.artist_name] || p.played_at < firstListen[p.artist_name]) {
        firstListen[p.artist_name] = p.played_at;
      }
    });
    var discoveries = Object.entries(firstListen).sort(function (a, b) { return b[1].localeCompare(a[1]); }).slice(0, 12);
    var discoveryHtml = discoveries.map(function (entry) {
      var artist = entry[0], date = entry[1];
      var dt = new Date(date);
      var dateStr = monthNames[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
      return '<div class="artist-row" style="margin-bottom:0.5rem">' +
        '<span class="artist-rank" style="font-size:0.65rem;color:var(--text3)">' + dateStr + '</span>' +
        '<div class="artist-info"><div class="artist-name" style="font-size:0.8rem">' + ui.esc(artist) + '</div></div>' +
      '</div>';
    }).join('');
    var elDiscovery = document.getElementById('ins-discovery');
    if (elDiscovery) elDiscovery.innerHTML = discoveryHtml || '<div class="empty">No data yet</div>';

    // Stats
    var uniqueDays = new Set(plays.map(function (p) { return p.played_at.slice(0, 10); })).size;
    var elAvg = document.getElementById('ins-avg-daily');
    if (elAvg) elAvg.textContent = uniqueDays ? Math.round(plays.length / uniqueDays) : 0;

    var now = new Date();
    var thisMonthCount = plays.filter(function (p) {
      var dt = new Date(p.played_at);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }).length;
    var elTotalMonth = document.getElementById('ins-total-month');
    if (elTotalMonth) elTotalMonth.textContent = thisMonthCount.toLocaleString();
  }

  // ── Taste Profile page ──

  var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  async function renderTaste() {
    var plays = await db.getAllPlays();
    var statIds = ['taste-diversity', 'taste-unique', 'taste-top10', 'taste-obscurity'];
    var chartIds = ['taste-loyalty-chart', 'taste-distribution', 'taste-radar', 'taste-summary'];

    if (!plays.length) {
      statIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = '\u2014'; });
      chartIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Connect Last.fm to see your taste profile</div>'; });
      return;
    }

    var artistCounts = {};
    plays.forEach(function (p) { artistCounts[p.artist_name] = (artistCounts[p.artist_name] || 0) + 1; });
    var sorted = Object.entries(artistCounts).sort(function (a, b) { return b[1] - a[1]; });
    var uniqueArtists = sorted.length;
    var totalPlays = plays.length;
    var diversity = Math.round((uniqueArtists / totalPlays) * 100);

    var elDiv = document.getElementById('taste-diversity');
    if (elDiv) elDiv.textContent = diversity + '%';
    var elUnique = document.getElementById('taste-unique');
    if (elUnique) elUnique.textContent = uniqueArtists.toLocaleString();

    var top10Plays = sorted.slice(0, 10).reduce(function (s, e) { return s + e[1]; }, 0);
    var top10Pct = Math.round((top10Plays / totalPlays) * 100);
    var elTop10 = document.getElementById('taste-top10');
    if (elTop10) elTop10.textContent = top10Pct + '%';

    var avgPlaysPerArtist = Math.round(totalPlays / uniqueArtists);
    var obscurity = avgPlaysPerArtist <= 2 ? 'Very obscure' : avgPlaysPerArtist <= 5 ? 'Obscure' : avgPlaysPerArtist <= 10 ? 'Moderate' : avgPlaysPerArtist <= 20 ? 'Mainstream' : 'Very mainstream';
    var elObs = document.getElementById('taste-obscurity');
    if (elObs) elObs.textContent = obscurity;

    // Loyalty vs Exploration
    var top5Plays = sorted.slice(0, 5).reduce(function (s, e) { return s + e[1]; }, 0);
    var loyaltyPct = Math.round((top5Plays / totalPlays) * 100);
    var explorePct = 100 - loyaltyPct;
    var elLoyalty = document.getElementById('taste-loyalty-chart');
    if (elLoyalty) {
      elLoyalty.innerHTML =
        '<div style="margin-bottom:1rem">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
            '<span style="font-size:0.75rem;color:var(--text2)">Top 5 artists (loyalty)</span>' +
            '<span style="font-size:0.75rem;font-family:monospace;color:var(--accent2)">' + loyaltyPct + '%</span>' +
          '</div>' +
          '<div style="height:8px;background:var(--surface3);border-radius:99px;overflow:hidden">' +
            '<div style="height:100%;width:' + loyaltyPct + '%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:99px"></div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
            '<span style="font-size:0.75rem;color:var(--text2)">Long tail (exploration)</span>' +
            '<span style="font-size:0.75rem;font-family:monospace;color:var(--success)">' + explorePct + '%</span>' +
          '</div>' +
          '<div style="height:8px;background:var(--surface3);border-radius:99px;overflow:hidden">' +
            '<div style="height:100%;width:' + explorePct + '%;background:linear-gradient(90deg,#22c55e,#34d399);border-radius:99px"></div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:1rem;display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">' +
          '<div style="background:var(--surface2);border-radius:8px;padding:0.75rem;text-align:center">' +
            '<div style="font-size:1.2rem;font-weight:700;color:var(--accent2)">' + Math.min(sorted.length, 5) + '</div>' +
            '<div style="font-size:0.65rem;color:var(--text3)">Top artists</div>' +
          '</div>' +
          '<div style="background:var(--surface2);border-radius:8px;padding:0.75rem;text-align:center">' +
            '<div style="font-size:1.2rem;font-weight:700;color:var(--success)">' + Math.max(0, uniqueArtists - 5) + '</div>' +
            '<div style="font-size:0.65rem;color:var(--text3)">Long tail</div>' +
          '</div>' +
        '</div>';
    }

    // Distribution
    var maxCount = sorted[0][1];
    var distHtml = sorted.slice(0, 10).map(function (entry, i) {
      var pct = Math.round((entry[1] / maxCount) * 100);
      return '<div class="artist-row" style="margin-bottom:0.5rem">' +
        '<span class="artist-rank">' + (i + 1) + '</span>' +
        '<div class="artist-info">' +
          '<div class="artist-name" style="font-size:0.8rem">' + ui.esc(entry[0]) + '</div>' +
          '<div class="artist-bar-wrap"><div class="artist-bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<span class="artist-count">' + entry[1] + '</span>' +
      '</div>';
    }).join('');
    var elDist = document.getElementById('taste-distribution');
    if (elDist) elDist.innerHTML = distHtml;

    // Radar chart
    var uniqueDaysSet = new Set(plays.map(function (p) { return p.played_at.slice(0, 10); }));
    var metrics = [
      { label: 'Diversity', value: Math.min(diversity / 50, 1) },
      { label: 'Loyalty', value: loyaltyPct / 100 },
      { label: 'Volume', value: Math.min(totalPlays / 5000, 1) },
      { label: 'Consistency', value: Math.min(uniqueDaysSet.size / 365, 1) },
      { label: 'Discovery', value: Math.min(uniqueArtists / 500, 1) },
    ];
    var cx = 100, cy = 100, r = 70, n = metrics.length;
    var radarPoints = metrics.map(function (m, i) {
      var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      var dist = m.value * r;
      return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), label: m.label };
    });
    var polygonPts = radarPoints.map(function (p) { return p.x + ',' + p.y; }).join(' ');
    var gridHtml = [0.25, 0.5, 0.75, 1].map(function (level) {
      var pts = metrics.map(function (_, i) {
        var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        return (cx + level * r * Math.cos(angle)) + ',' + (cy + level * r * Math.sin(angle));
      }).join(' ');
      return '<polygon points="' + pts + '" fill="none" stroke="var(--border)" stroke-width="0.5"/>';
    }).join('');
    var labelHtml = metrics.map(function (m, i) {
      var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      var lx = cx + (r + 18) * Math.cos(angle);
      var ly = cy + (r + 18) * Math.sin(angle);
      return '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="var(--text3)" font-family="DM Sans">' + m.label + '</text>';
    }).join('');
    var elRadar = document.getElementById('taste-radar');
    if (elRadar) {
      elRadar.innerHTML = '<svg viewBox="0 0 200 200" width="200" height="200">' +
        gridHtml +
        '<polygon points="' + polygonPts + '" fill="rgba(139,92,246,0.2)" stroke="var(--accent)" stroke-width="1.5"/>' +
        radarPoints.map(function (p) { return '<circle cx="' + p.x + '" cy="' + p.y + '" r="3" fill="var(--accent2)"/>'; }).join('') +
        labelHtml +
      '</svg>';
    }

    // Summary
    var topArtistName = sorted[0][0];
    var elSummary = document.getElementById('taste-summary');
    if (elSummary) {
      elSummary.innerHTML = '<div style="line-height:1.6">' +
        '<p style="margin-bottom:0.75rem;color:var(--text2);font-size:0.85rem">You\'ve listened to <strong style="color:var(--text)">' + uniqueArtists.toLocaleString() + ' unique artists</strong> across <strong style="color:var(--text)">' + totalPlays.toLocaleString() + ' plays</strong>.</p>' +
        '<p style="margin-bottom:0.75rem;color:var(--text2);font-size:0.85rem">Your most-played artist is <strong style="color:var(--accent2)">' + ui.esc(topArtistName) + '</strong> with <strong style="color:var(--text)">' + sorted[0][1] + '</strong> plays.</p>' +
        '<p style="margin-bottom:0.75rem;color:var(--text2);font-size:0.85rem">Your taste is <strong style="color:var(--text)">' + obscurity.toLowerCase() + '</strong> — you average <strong style="color:var(--text)">' + avgPlaysPerArtist + '</strong> plays per artist.</p>' +
        '<p style="color:var(--text2);font-size:0.85rem">' + (loyaltyPct > 60 ? 'You\'re a <strong style="color:var(--text)">loyal listener</strong> — ' + loyaltyPct + '% of your plays come from just 5 artists.' : 'You\'re an <strong style="color:var(--text)">explorer</strong> — only ' + loyaltyPct + '% of your plays come from your top 5.') + '</p>' +
      '</div>';
    }
  }

  // ── Timeline page ──

  async function renderTimeline() {
    var plays = await db.getAllPlays();
    var statIds = ['tl-first-scrobble', 'tl-top-month', 'tl-total-months', 'tl-longest-streak'];
    var chartIds = ['tl-monthly-breakdown', 'tl-milestones', 'tl-on-this-day', 'tl-heatmap'];

    if (!plays.length) {
      statIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = '\u2014'; });
      chartIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Connect Last.fm to see your timeline</div>'; });
      return;
    }

    var sorted = plays.slice().sort(function (a, b) { return new Date(a.played_at) - new Date(b.played_at); });
    var firstPlay = sorted[0];
    var firstDate = new Date(firstPlay.played_at);
    var elFirst = document.getElementById('tl-first-scrobble');
    if (elFirst) elFirst.textContent = MONTH_NAMES[firstDate.getMonth()] + ' ' + firstDate.getFullYear();

    var months = new Set();
    plays.forEach(function (p) {
      var dt = new Date(p.played_at);
      months.add(dt.getFullYear() + '-' + dt.getMonth());
    });
    var elMonths = document.getElementById('tl-total-months');
    if (elMonths) elMonths.textContent = months.size;

    // Longest streak
    var activeDays = new Set(plays.map(function (p) { return p.played_at.slice(0, 10); }));
    var sortedDays = Array.from(activeDays).sort();
    var longestStreak = 1, currentStreak = 1;
    for (var i = 1; i < sortedDays.length; i++) {
      var prev = new Date(sortedDays[i - 1]);
      var curr = new Date(sortedDays[i]);
      var diff = (curr - prev) / 86400000;
      if (diff === 1) { currentStreak++; longestStreak = Math.max(longestStreak, currentStreak); }
      else { currentStreak = 1; }
    }
    var elStreak = document.getElementById('tl-longest-streak');
    if (elStreak) elStreak.textContent = longestStreak + ' days';

    // Month by month
    var monthData = {};
    plays.forEach(function (p) {
      var dt = new Date(p.played_at);
      var key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
      if (!monthData[key]) monthData[key] = { count: 0, artists: new Set() };
      monthData[key].count++;
      monthData[key].artists.add(p.artist_name);
    });
    var sortedMonthEntries = Object.entries(monthData).sort(function (a, b) { return b[0].localeCompare(a[0]); });
    var topMonth = sortedMonthEntries[0];
    if (topMonth) {
      var parts = topMonth[0].split('-');
      var elTopMonth = document.getElementById('tl-top-month');
      if (elTopMonth) elTopMonth.textContent = MONTH_NAMES[parseInt(parts[1]) - 1] + ' ' + parts[0];
    }
    var maxMonthCount = Math.max.apply(null, sortedMonthEntries.map(function (e) { return e[1].count; }));
    var monthlyHtml = sortedMonthEntries.slice(0, 12).map(function (entry) {
      var key = entry[0], data = entry[1];
      var pct = Math.round((data.count / maxMonthCount) * 100);
      var ymParts = key.split('-');
      return '<div class="artist-row" style="margin-bottom:0.5rem">' +
        '<span class="artist-rank" style="font-size:0.65rem;color:var(--text3);width:55px">' + MONTH_NAMES[parseInt(ymParts[1]) - 1] + ' ' + ymParts[0] + '</span>' +
        '<div class="artist-info"><div class="artist-bar-wrap"><div class="artist-bar-fill" style="width:' + pct + '%"></div></div></div>' +
        '<span class="artist-count" style="width:60px;text-align:right">' + data.count + ' \u00b7 ' + data.artists.size + ' artists</span>' +
      '</div>';
    }).join('');
    var elMonthlyBreakdown = document.getElementById('tl-monthly-breakdown');
    if (elMonthlyBreakdown) elMonthlyBreakdown.innerHTML = monthlyHtml || '<div class="empty">No data</div>';

    // Milestones
    var milestones = [];
    var totalMilestones = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
    totalMilestones.forEach(function (target) {
      if (sorted.length >= target) {
        var play = sorted[target - 1];
        var dt = new Date(play.played_at);
        milestones.push({
          label: target.toLocaleString() + ' scrobbles',
          date: MONTH_NAMES[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear(),
          track: play.track_name + ' \u2014 ' + play.artist_name
        });
      }
    });
    var seenArtists = new Set();
    var artistMilestones = [];
    sorted.forEach(function (p) {
      seenArtists.add(p.artist_name);
      if ([100, 250, 500, 1000, 2500, 5000].indexOf(seenArtists.size) !== -1) {
        var dt = new Date(p.played_at);
        artistMilestones.push({
          label: seenArtists.size + ' unique artists',
          date: MONTH_NAMES[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear(),
          track: p.track_name + ' \u2014 ' + p.artist_name
        });
      }
    });
    var allMilestones = milestones.concat(artistMilestones).sort(function (a, b) { return b.label.localeCompare(a.label); }).slice(0, 8);
    var milestonesHtml = allMilestones.length ? allMilestones.map(function (m) {
      return '<div style="display:flex;gap:12px;margin-bottom:0.75rem;align-items:flex-start">' +
        '<div style="background:var(--accent3);border-radius:6px;padding:0.4rem 0.6rem;flex-shrink:0">' +
          '<div style="font-size:0.7rem;font-weight:700;color:var(--accent2)">' + m.label + '</div>' +
          '<div style="font-size:0.6rem;color:var(--text3)">' + m.date + '</div>' +
        '</div>' +
        '<div style="padding-top:0.3rem"><div style="font-size:0.75rem;color:var(--text2)">' + ui.esc(m.track) + '</div></div>' +
      '</div>';
    }).join('') : '<div class="empty">Keep listening to unlock milestones!</div>';
    var elMilestones = document.getElementById('tl-milestones');
    if (elMilestones) elMilestones.innerHTML = milestonesHtml;

    // On this day
    var today = new Date();
    var todayMonth = today.getMonth(), todayDay = today.getDate();
    var onThisDay = plays.filter(function (p) {
      var dt = new Date(p.played_at);
      return dt.getMonth() === todayMonth && dt.getDate() === todayDay && dt.getFullYear() !== today.getFullYear();
    }).slice(0, 8);
    var onThisDayHtml = onThisDay.length ? onThisDay.map(function (p) {
      var dt = new Date(p.played_at);
      return '<div class="artist-row" style="margin-bottom:0.5rem">' +
        '<span class="artist-rank" style="font-size:0.65rem;color:var(--text3)">' + dt.getFullYear() + '</span>' +
        '<div class="artist-info">' +
          '<div class="artist-name" style="font-size:0.8rem">' + ui.esc(p.track_name) + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">' + ui.esc(p.artist_name) + '</div>' +
        '</div>' +
      '</div>';
    }).join('') : '<div class="empty">No plays on this day in previous years</div>';
    var elOnThisDay = document.getElementById('tl-on-this-day');
    if (elOnThisDay) elOnThisDay.innerHTML = onThisDayHtml;

    // Heatmap (52 weeks)
    var dayMap = {};
    plays.forEach(function (p) { var d = p.played_at.slice(0, 10); dayMap[d] = (dayMap[d] || 0) + 1; });
    var maxDayCount = Math.max.apply(null, Object.values(dayMap).concat([1]));
    var weeks = [];
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    for (var w = 0; w < 52; w++) {
      var week = [];
      for (var d2 = 0; d2 < 7; d2++) {
        var date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d2);
        var key = date.toISOString().slice(0, 10);
        week.push({ count: dayMap[key] || 0, date: key });
      }
      weeks.push(week);
    }
    var cellSize = 10, cellGap = 3;
    var heatmapHtml = '<div style="display:flex;gap:' + cellGap + 'px">' +
      weeks.map(function (week) {
        return '<div style="display:flex;flex-direction:column;gap:' + cellGap + 'px">' +
          week.map(function (day) {
            var intensity = day.count === 0 ? 0 : day.count <= 2 ? 1 : day.count <= 5 ? 2 : day.count <= 10 ? 3 : 4;
            var colors = ['var(--surface3)', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.4)', 'rgba(139,92,246,0.7)', 'var(--accent)'];
            return '<div title="' + day.date + ': ' + day.count + ' plays" style="width:' + cellSize + 'px;height:' + cellSize + 'px;border-radius:2px;background:' + colors[intensity] + '"></div>';
          }).join('') +
        '</div>';
      }).join('') +
    '</div>' +
    '<div style="display:flex;gap:4px;margin-top:8px;align-items:center">' +
      '<span style="font-size:0.6rem;color:var(--text3)">Less</span>' +
      [0, 1, 2, 3, 4].map(function (i) {
        return '<div style="width:8px;height:8px;border-radius:2px;background:' + ['var(--surface3)', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.4)', 'rgba(139,92,246,0.7)', 'var(--accent)'][i] + '"></div>';
      }).join('') +
      '<span style="font-size:0.6rem;color:var(--text3)">More</span>' +
    '</div>';
    var elHeatmap = document.getElementById('tl-heatmap');
    if (elHeatmap) elHeatmap.innerHTML = heatmapHtml;
  }

  // ── Sessions page ──

  async function renderSessions() {
    var plays = await db.getAllPlays();
    var statIds = ['sess-total', 'sess-avg-tracks', 'sess-avg-dur', 'sess-longest'];
    var chartIds = ['sess-dist-chart', 'sess-deep-dives', 'sess-recent'];

    if (!plays.length) {
      statIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = '\u2014'; });
      chartIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Connect Last.fm to see sessions</div>'; });
      return;
    }

    var sorted = plays.slice().sort(function (a, b) { return new Date(a.played_at) - new Date(b.played_at); });
    var SESSION_GAP = 30 * 60 * 1000;
    var sessions = [];
    var current = [sorted[0]];
    for (var i = 1; i < sorted.length; i++) {
      var gap = new Date(sorted[i].played_at) - new Date(sorted[i - 1].played_at);
      if (gap > SESSION_GAP) { sessions.push(current); current = [sorted[i]]; }
      else { current.push(sorted[i]); }
    }
    sessions.push(current);

    var totalSessions = sessions.length;
    var avgTracks = Math.round(sessions.reduce(function (s, sess) { return s + sess.length; }, 0) / totalSessions);
    var durations = sessions.map(function (sess) {
      return sess.length < 2 ? 0 : new Date(sess[sess.length - 1].played_at) - new Date(sess[0].played_at);
    }).filter(function (d) { return d > 0; });
    var avgDur = durations.length ? Math.round(durations.reduce(function (a, b) { return a + b; }, 0) / durations.length / 60000) : 0;
    var longestDur = durations.length ? Math.round(Math.max.apply(null, durations) / 60000) : 0;

    var elTotal = document.getElementById('sess-total');
    if (elTotal) elTotal.textContent = totalSessions.toLocaleString();
    var elAvgTracks = document.getElementById('sess-avg-tracks');
    if (elAvgTracks) elAvgTracks.textContent = avgTracks;
    var elAvgDur = document.getElementById('sess-avg-dur');
    if (elAvgDur) elAvgDur.textContent = avgDur + ' min';
    var elLongest = document.getElementById('sess-longest');
    if (elLongest) elLongest.textContent = longestDur + ' min';

    // Distribution
    var buckets = { '1': 0, '2-5': 0, '6-10': 0, '11-20': 0, '21-50': 0, '50+': 0 };
    sessions.forEach(function (s) {
      var len = s.length;
      if (len === 1) buckets['1']++;
      else if (len <= 5) buckets['2-5']++;
      else if (len <= 10) buckets['6-10']++;
      else if (len <= 20) buckets['11-20']++;
      else if (len <= 50) buckets['21-50']++;
      else buckets['50+']++;
    });
    var maxBucket = Math.max.apply(null, Object.values(buckets));
    var distHtml = Object.entries(buckets).map(function (entry) {
      var pct = maxBucket ? Math.round((entry[1] / maxBucket) * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text3);width:40px">' + entry[0] + ' tracks</span>' +
        '<div style="flex:1;height:18px;background:var(--surface3);border-radius:3px;overflow:hidden">' +
          '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:3px"></div>' +
        '</div>' +
        '<span style="font-size:0.65rem;font-family:monospace;color:var(--text2);width:36px;text-align:right">' + entry[1] + '</span>' +
      '</div>';
    }).join('');
    var elDist = document.getElementById('sess-dist-chart');
    if (elDist) elDist.innerHTML = distHtml;

    // Deep dives
    var deepDives = sessions.filter(function (s) { return s.length >= 3; }).sort(function (a, b) {
      var durA = new Date(a[a.length - 1].played_at) - new Date(a[0].played_at);
      var durB = new Date(b[b.length - 1].played_at) - new Date(b[0].played_at);
      return durB - durA;
    }).slice(0, 5);
    var deepDivesHtml = deepDives.length ? deepDives.map(function (sess) {
      var start = new Date(sess[0].played_at);
      var end = new Date(sess[sess.length - 1].played_at);
      var durMin = Math.round((end - start) / 60000);
      var dateStr = MONTH_NAMES[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
      var timeStr = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0');
      var artists = Array.from(new Set(sess.map(function (p) { return p.artist_name; }))).slice(0, 3).join(', ');
      return '<div style="background:var(--surface2);border-radius:8px;padding:0.75rem;margin-bottom:0.5rem">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:0.3rem">' +
          '<span style="font-size:0.75rem;font-weight:600;color:var(--text)">' + dateStr + ' at ' + timeStr + '</span>' +
          '<span style="font-size:0.7rem;font-family:monospace;color:var(--accent2)">' + sess.length + ' tracks \u00b7 ' + durMin + ' min</span>' +
        '</div>' +
        '<div style="font-size:0.7rem;color:var(--text3)">' + ui.esc(artists) + (new Set(sess.map(function (p) { return p.artist_name; })).size > 3 ? ' +' + (new Set(sess.map(function (p) { return p.artist_name; })).size - 3) + ' more' : '') + '</div>' +
      '</div>';
    }).join('') : '<div class="empty">No long sessions detected yet</div>';
    var elDeep = document.getElementById('sess-deep-dives');
    if (elDeep) elDeep.innerHTML = deepDivesHtml;

    // Recent sessions
    var recentSessions = sessions.slice(-15).reverse();
    var recentHtml = recentSessions.map(function (sess) {
      var start = new Date(sess[0].played_at);
      var end = new Date(sess[sess.length - 1].played_at);
      var durMin = Math.round((end - start) / 60000);
      var dateStr = MONTH_NAMES[start.getMonth()] + ' ' + start.getDate();
      var timeStr = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0');
      var topArtist = sess.reduce(function (acc, p) { acc[p.artist_name] = (acc[p.artist_name] || 0) + 1; return acc; }, {});
      var top = Object.entries(topArtist).sort(function (a, b) { return b[1] - a[1]; })[0][0];
      return '<div class="artist-row" style="margin-bottom:0.5rem">' +
        '<span class="artist-rank" style="font-size:0.65rem;color:var(--text3)">' + dateStr + '</span>' +
        '<div class="artist-info">' +
          '<div class="artist-name" style="font-size:0.8rem">' + sess.length + ' tracks \u00b7 ' + durMin + ' min</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">' + timeStr + ' \u00b7 ' + ui.esc(top) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    var elRecent = document.getElementById('sess-recent');
    if (elRecent) elRecent.innerHTML = recentHtml || '<div class="empty">No sessions yet</div>';
  }

  // ── Compare page ──

  function filterPlaysByPeriod(plays, period) {
    if (period === 'all') return plays;
    var cuts = { week: 7, month: 30, last7: 7, last30: 30, last90: 90, last365: 365 };
    var days = cuts[period] || 30;
    var t = Date.now() - days * 86400000;
    return plays.filter(function (p) { return new Date(p.played_at).getTime() > t; });
  }

  async function renderCompare() {
    var plays = await db.getAllPlays();
    var cmpIds = ['cmp-overview', 'cmp-artists-a', 'cmp-artists-b', 'cmp-shared-artists'];
    if (!plays.length) {
      cmpIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Connect Last.fm to compare</div>'; });
      return;
    }

    var periodA = document.getElementById('cmp-period-a').value;
    var periodB = document.getElementById('cmp-period-b').value;
    var playsA = filterPlaysByPeriod(plays, periodA);
    var playsB = filterPlaysByPeriod(plays, periodB);

    var labels = { week: 'This week', month: 'This month', all: 'All time', last7: 'Last 7 days', last30: 'Last 30 days', last90: 'Last 90 days', last365: 'Last 365 days' };
    var statsA = { tracks: playsA.length, artists: new Set(playsA.map(function (p) { return p.artist_name; })).size, days: new Set(playsA.map(function (p) { return p.played_at.slice(0, 10); })).size };
    var statsB = { tracks: playsB.length, artists: new Set(playsB.map(function (p) { return p.artist_name; })).size, days: new Set(playsB.map(function (p) { return p.played_at.slice(0, 10); })).size };

    function pctDiff(a, b) { if (!b) return a > 0 ? '+100%' : '0%'; var d = Math.round(((a - b) / b) * 100); return d >= 0 ? '+' + d + '%' : d + '%'; }
    function diffColor(a, b) { return a > b ? 'var(--success)' : a < b ? 'var(--danger)' : 'var(--text3)'; }

    var elOverview = document.getElementById('cmp-overview');
    if (elOverview) {
      elOverview.innerHTML = '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:center;text-align:center">' +
        '<div>' +
          '<div style="font-size:0.7rem;color:var(--text3);margin-bottom:0.5rem">' + labels[periodA] + '</div>' +
          '<div style="font-size:1.5rem;font-weight:700;color:var(--text)">' + statsA.tracks.toLocaleString() + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">tracks</div>' +
          '<div style="font-size:1rem;font-weight:600;color:var(--text);margin-top:0.5rem">' + statsA.artists + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">artists</div>' +
          '<div style="font-size:1rem;font-weight:600;color:var(--text);margin-top:0.5rem">' + statsA.days + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">days</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.5rem">' +
          '<div style="font-size:0.75rem;font-weight:600;color:' + diffColor(statsA.tracks, statsB.tracks) + '">' + pctDiff(statsA.tracks, statsB.tracks) + '</div>' +
          '<div style="font-size:0.75rem;font-weight:600;color:' + diffColor(statsA.artists, statsB.artists) + '">' + pctDiff(statsA.artists, statsB.artists) + '</div>' +
          '<div style="font-size:0.75rem;font-weight:600;color:' + diffColor(statsA.days, statsB.days) + '">' + pctDiff(statsA.days, statsB.days) + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:0.7rem;color:var(--text3);margin-bottom:0.5rem">' + labels[periodB] + '</div>' +
          '<div style="font-size:1.5rem;font-weight:700;color:var(--text)">' + statsB.tracks.toLocaleString() + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">tracks</div>' +
          '<div style="font-size:1rem;font-weight:600;color:var(--text);margin-top:0.5rem">' + statsB.artists + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">artists</div>' +
          '<div style="font-size:1rem;font-weight:600;color:var(--text);margin-top:0.5rem">' + statsB.days + '</div>' +
          '<div style="font-size:0.7rem;color:var(--text3)">days</div>' +
        '</div>' +
      '</div>';
    }

    function getTopArtists(pl) {
      var counts = {};
      pl.forEach(function (p) { counts[p.artist_name] = (counts[p.artist_name] || 0) + 1; });
      return Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 7);
    }
    var topA = getTopArtists(playsA);
    var topB = getTopArtists(playsB);
    var maxA = topA.length ? topA[0][1] : 1;
    var maxB = topB.length ? topB[0][1] : 1;

    function renderArtistList(artists, max) {
      return artists.map(function (entry, i) {
        var pct = Math.round((entry[1] / max) * 100);
        return '<div class="artist-row" style="margin-bottom:0.5rem">' +
          '<span class="artist-rank">' + (i + 1) + '</span>' +
          '<div class="artist-info">' +
            '<div class="artist-name" style="font-size:0.8rem">' + ui.esc(entry[0]) + '</div>' +
            '<div class="artist-bar-wrap"><div class="artist-bar-fill" style="width:' + pct + '%"></div></div>' +
          '</div>' +
          '<span class="artist-count">' + entry[1] + '</span>' +
        '</div>';
      }).join('') || '<div class="empty">No data</div>';
    }

    var elArtistsA = document.getElementById('cmp-artists-a');
    if (elArtistsA) elArtistsA.innerHTML = renderArtistList(topA, maxA);
    var elArtistsB = document.getElementById('cmp-artists-b');
    if (elArtistsB) elArtistsB.innerHTML = renderArtistList(topB, maxB);

    var artistsA = new Set(topA.map(function (e) { return e[0]; }));
    var artistsB = new Set(topB.map(function (e) { return e[0]; }));
    var shared = Array.from(artistsA).filter(function (a) { return artistsB.has(a); });
    var onlyA = Array.from(artistsA).filter(function (a) { return !artistsB.has(a); });
    var onlyB = Array.from(artistsB).filter(function (a) { return !artistsA.has(a); });

    var elShared = document.getElementById('cmp-shared-artists');
    if (elShared) {
      elShared.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">' +
        '<div><div style="font-size:0.7rem;color:var(--text3);margin-bottom:0.5rem">Shared (' + shared.length + ')</div>' + (shared.length ? shared.map(function (a) { return '<div style="font-size:0.8rem;color:var(--accent2);margin-bottom:0.3rem">' + ui.esc(a) + '</div>'; }).join('') : '<div class="empty">None</div>') + '</div>' +
        '<div><div style="font-size:0.7rem;color:var(--text3);margin-bottom:0.5rem">Only in A (' + onlyA.length + ')</div>' + (onlyA.length ? onlyA.map(function (a) { return '<div style="font-size:0.8rem;color:var(--text2);margin-bottom:0.3rem">' + ui.esc(a) + '</div>'; }).join('') : '<div class="empty">None</div>') + '</div>' +
        '<div><div style="font-size:0.7rem;color:var(--text3);margin-bottom:0.5rem">Only in B (' + onlyB.length + ')</div>' + (onlyB.length ? onlyB.map(function (a) { return '<div style="font-size:0.8rem;color:var(--text2);margin-bottom:0.3rem">' + ui.esc(a) + '</div>'; }).join('') : '<div class="empty">None</div>') + '</div>' +
      '</div>';
    }
  }

  // ── Event binding ──

  function bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', async function (e) {
        e.preventDefault();
        var p = item.dataset.page;
        ui.setPage(p);
        if (p === 'dashboard') await refreshDashboard();
        if (p === 'history') await refreshHistory();
        if (p === 'insights') await renderInsights();
        if (p === 'taste') await renderTaste();
        if (p === 'timeline') await renderTimeline();
        if (p === 'sessions') await renderSessions();
        if (p === 'compare') await renderCompare();
      });
    });

    // Period tabs
    document.querySelectorAll('.card-tab').forEach(function (tab) {
      tab.addEventListener('click', async function () {
        document.querySelectorAll('.card-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        await refreshDashboard(tab.dataset.period);
      });
    });

    // Connect buttons
    var connectBtn = document.getElementById('connect-btn');
    if (connectBtn) connectBtn.addEventListener('click', lastfm.initiateLogin);
    var connectSettingsBtn = document.getElementById('connect-settings-btn');
    if (connectSettingsBtn) connectSettingsBtn.addEventListener('click', lastfm.initiateLogin);

    // Refresh
    var refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', async function () {
      await fetchAndStore();
      await refreshDashboard();
      ui.showToast('Dashboard updated', 'success');
    });

    // History controls
    var searchInput = document.getElementById('search-input');
    var sortSelect = document.getElementById('sort-select');
    if (searchInput) searchInput.addEventListener('input', function () { refreshHistory(sortSelect ? sortSelect.value : 'newest', searchInput.value); });
    if (sortSelect) sortSelect.addEventListener('change', function () { refreshHistory(sortSelect.value, searchInput ? searchInput.value : ''); });

    // Export
    var exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportJSON);
    var exportSettingsBtn = document.getElementById('export-settings-btn');
    if (exportSettingsBtn) exportSettingsBtn.addEventListener('click', exportJSON);

    // Disconnect
    var disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) disconnectBtn.addEventListener('click', async function () {
      await db.dbClear('session');
      lastfm.clearSession();
      ui.setConnectedUI(false);
      ui.setPage('dashboard');
      stopPolling();
      ui.showToast('Disconnected');
    });

    // Clear data
    var clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) clearBtn.addEventListener('click', async function () {
      if (!confirm('Delete all listening history? This cannot be undone.')) return;
      await db.dbClear('history');
      await refreshDashboard();
      ui.showToast('All history cleared');
    });

    // Theme
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', ui.toggleTheme);
    var darkToggle = document.getElementById('dark-toggle');
    if (darkToggle) darkToggle.addEventListener('click', ui.toggleTheme);

    // Poll interval
    var pollSelect = document.getElementById('poll-interval-select');
    if (pollSelect) {
      pollSelect.value = CONFIG.pollIntervalMs.toString();
      pollSelect.addEventListener('change', function (e) {
        CONFIG.pollIntervalMs = parseInt(e.target.value);
        saveConfig({ pollIntervalMs: CONFIG.pollIntervalMs });
        if (lastfm.getSession()) startPolling();
        ui.showToast('Poll interval updated');
      });
    }

    // Config modal
    var editConfigBtn = document.getElementById('edit-config-btn');
    if (editConfigBtn) editConfigBtn.addEventListener('click', ui.showConfigModal);
    var modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) modalCancel.addEventListener('click', ui.hideConfigModal);
    var modalBg = document.getElementById('config-modal');
    if (modalBg) modalBg.addEventListener('click', function (e) { if (e.target === modalBg) ui.hideConfigModal(); });
    var modalSave = document.getElementById('modal-save');
    if (modalSave) modalSave.addEventListener('click', function () {
      var key = document.getElementById('cfg-api-key').value.trim();
      var secret = document.getElementById('cfg-api-secret').value.trim();
      var username = document.getElementById('cfg-username').value.trim();
      if (!key || !secret || !username) { ui.showToast('All fields are required', 'error'); return; }
      saveConfig({ apiKey: key, apiSecret: secret, username: username });
      ui.hideConfigModal();
      ui.showToast('Configuration saved', 'success');
      ui.setConnectedUI(false, username);
      // Auto-trigger login after saving config
      lastfm.initiateLogin();
    });

    // Compare button
    var cmpRun = document.getElementById('cmp-run');
    if (cmpRun) cmpRun.addEventListener('click', renderCompare);
  }

  // ── Init ──

  async function init() {
    // Apply saved theme
    ui.applyTheme();

    // Handle auth callback (Last.fm redirects back with ?token=xxx)
    try {
      var justAuthed = await lastfm.handleAuthCallback();
      if (justAuthed) {
        ui.showToast('Connected to Last.fm!', 'success');
        ui.setConnectedUI(true, CONFIG.username);
        await fetchAndStore();
        await refreshDashboard();
        startPolling();
        bindEvents();
        return;
      }
    } catch (e) { ui.showToast(e.message, 'error'); }

    // Restore previous session from IndexedDB
    var key = await db.getSessionKey();
    if (key && CONFIG.apiKey) {
      ui.setConnectedUI(true, CONFIG.username);
      await fetchAndStore();
      await refreshDashboard();
      startPolling();
    } else {
      ui.setConnectedUI(false);
    }

    // Bind all event handlers
    bindEvents();
  }

  // Single DOMContentLoaded listener
  document.addEventListener('DOMContentLoaded', init);

  // ── Exports (for debugging) ──
  global.app = { refreshDashboard, refreshHistory, renderInsights, renderTaste, renderTimeline, renderSessions, renderCompare, exportJSON, fetchAndStore, startPolling, stopPolling };
})(window);
