# SpoTics Listener

Client-side Last.fm listening analytics dashboard. Connect your Last.fm account to track your Spotify listening history with zero server infrastructure.

**Live:** https://spotics.insights.autos

---

## Features

- **Last.fm Integration** — Connect via OAuth, no Spotify Developer account needed
- **Real-time Now Playing** — See what's currently playing via Last.fm's now-playing flag
- **Full History** — Paginated access to your entire scrobble history
- **Top Artists / Albums / Tracks** — Time-range filtered (Week / Month / All time)
- **Obsession Tracking** — Most repeated tracks with horizontal bar visualization
- **Activity Heatmap** — 12-week streak and playback pattern visualization
- **Configurable Polling** — 10s to 30m intervals (default 5 minutes), persisted in localStorage
- **Dark/Light Mode** — Theme toggle with system preference detection
- **100% Client-Side** — Runs entirely in browser, IndexedDB for local storage

---

## How It Works

```
Spotify (any device)
       │
       ▼ (native scrobbling)
Last.fm
       │
       ▼ (API: user.getRecentTracks, user.getTopArtists, etc.)
Browser → IndexedDB → Dashboard
```

1. User connects Spotify → Last.fm in Last.fm settings (free, one-time setup)
2. User clicks "Connect Last.fm" on Spotics → OAuth flow → session key stored in IndexedDB
3. Background polling fetches recent tracks, top artists/albums from Last.fm API
4. Data rendered in dashboard with charts, stats, and Now Playing widget

---

## Tech Stack

- **Vanilla JavaScript** (ES modules) — no build step, no framework
- **Last.fm API** — user.getRecentTracks, user.getTopArtists, user.getTopAlbums, auth.getSession
- **IndexedDB** — local storage for tokens, session key, and listening history
- **Chart.js** — via inline implementation for top artists/albums visualization
- **GitHub Pages** — static hosting via `spotics-listener/` folder

---

## Deployment

The `spotics-listener/` folder is deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `feature/fullstack-ready`.

```yaml
# .github/workflows/deploy.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./spotics-listener
```

Custom domain: `spotics.insights.autos` (configured in repo Pages settings)

---

## Project Structure

```
spotics-listener/
├── index.html          # Main dashboard (HTML + inline CSS + JS entry)
├── CNAME               # Custom domain for GitHub Pages
├── css/
│   └── style.css       # Additional styles
├── js/
│   ├── app.js          # Entry point: init, polling, event handlers
│   ├── config.js       # Last.fm API credentials + poll intervals
│   ├── db.js           # IndexedDB wrapper (tokens, history, settings)
│   ├── lastfm.js       # Last.fm API client (auth, fetch, MD5 signing)
│   ├── ui.js           # Dashboard rendering (stats, charts, lists)
│   └── charts.js       # Chart rendering helpers
└── assets/
    ├── favicon.ico
    ├── favicon.png
    └── apple-touch-icon.png
```

---

## Configuration

Edit `spotics-listener/js/config.js` with your Last.fm credentials:

```javascript
const CONFIG = {
  apiKey: 'YOUR_LASTFM_API_KEY',
  apiSecret: 'YOUR_LASTFM_SHARED_SECRET',
  redirectUri: 'https://YOUR_DOMAIN/',  // Must match Last.fm app settings
  pollIntervals: [10000, 30000, 60000, 300000, 600000, 1800000], // ms
  defaultPollInterval: 300000 // 5 minutes
};
```

Get credentials at: https://www.last.fm/api/account/create

---

## License

Proprietary — Bryn018 private repo.