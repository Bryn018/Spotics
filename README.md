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
- **Listening Sessions** — Auto-detected sessions with deep-dive analysis
- **Taste Profile** — Diversity score, loyalty vs exploration, sound radar
- **Timeline** — Month-by-month breakdown, milestones, "on this day"
- **Compare** — Side-by-side period comparison with shared/unique artist analysis
- **Configurable Polling** — 10s to 30m intervals (default 5 minutes), persisted in localStorage
- **Dark/Light Mode** — Theme toggle with system preference detection
- **100% Client-Side** — Runs entirely in browser, IndexedDB for local storage
- **Zero Hardcoded Secrets** — All API credentials stored in localStorage only

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

- **Vanilla JavaScript** (ES5 IIFE modules) — no build step, no framework
- **Last.fm API** — user.getRecentTracks, user.getTopArtists, user.getTopAlbums, auth.getSession
- **IndexedDB** — local storage for tokens, session key, and listening history
- **Canvas API** — custom bar chart rendering
- **GitHub Pages** — static hosting via `spotics-listener/` folder
- **MD5** — blueimp-md5 via CDN for Last.fm API signature generation

---

## Architecture

The codebase is organized into modular IIFE (Immediately Invoked Function Expression) modules, each responsible for a single concern:

```
spotics-listener/
├── index.html          # Main HTML entry point (structure + inline CSS)
├── CNAME               # Custom domain for GitHub Pages
├── css/
│   └── style.css       # Complete stylesheet (design tokens, components, responsive)
├── js/
│   ├── config.js       # Configuration module (localStorage-based, zero hardcoded secrets)
│   ├── db.js           # IndexedDB wrapper (session, history, CRUD operations)
│   ├── lastfm.js       # Last.fm API client (OAuth, fetch, error handling)
│   ├── charts.js       # Canvas bar chart renderer
│   ├── ui.js           # UI rendering module (all DOM manipulation)
│   └── app.js          # Application orchestrator (init, polling, event binding)
└── assets/
    ├── favicon.svg
    ├── favicon.ico
    ├── favicon.png
    └── apple-touch-icon.png
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `config.js` | Loads/saves API credentials from localStorage. No hardcoded secrets. Validates config. |
| `db.js` | IndexedDB operations: session key storage, play history CRUD, counting. |
| `lastfm.js` | Last.fm OAuth flow, API calls with MD5 signature, response parsing. |
| `charts.js` | Canvas-based horizontal bar charts with high-DPI support. |
| `ui.js` | All DOM rendering: track lists, artist bars, album grids, heatmaps, streak, now playing, theme. |
| `app.js` | Orchestrates all modules: init, polling, event binding, page rendering. |

---

## Security

- **Zero hardcoded secrets** — API keys are never stored in source code
- **localStorage-only credentials** — User enters credentials via modal, stored in localStorage
- **Input sanitization** — All user-generated content escaped via `esc()` helper
- **Security headers** — X-Content-Type-Options, X-Frame-Options, referrer policy
- **SRI hash** — CDN script loaded with Subresource Integrity
- **No eval/Function** — No dynamic code execution
- **CSP-ready** — No inline event handlers, all events bound via addEventListener

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
  deploy:
    environment:
      name: github-pages
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Custom domain: `spotics.insights.autos` (configured in repo Pages settings)

---

## Configuration

On first use, click "Connect Last.fm" → "Edit" in the config modal to enter:

1. **API Key** — Get at https://www.last.fm/api/account/create
2. **Shared Secret** — From your Last.fm API app settings
3. **Username** — Your Last.fm username

Credentials are stored in localStorage and never leave your browser.

### Poll Interval Options

| Value | Interval |
|-------|----------|
| 10,000 ms | 10 seconds |
| 30,000 ms | 30 seconds |
| 60,000 ms | 1 minute |
| 300,000 ms | 5 minutes (default) |
| 600,000 ms | 10 minutes |
| 1,800,000 ms | 30 minutes |

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires: IndexedDB, CSS Custom Properties, ES5, Fetch API

---

## License

Proprietary — Bryn018 private repo.
