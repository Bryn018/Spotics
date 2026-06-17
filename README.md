# SpoTics — Your Listening Universe

Client-side Last.fm listening analytics dashboard. Connect your Last.fm account to track your listening history with zero server infrastructure.

**Live:** https://spotics.insights.autos

---

## Pages

- **Dashboard** — Top artists, albums, obsession tracks, now playing, recently played, weekly stats
- **History** — Full scrobble history with search and sort
- **Insights** — Peak hours/days, hourly distribution (area chart), day-of-week (polar rose chart), artist discovery
- **Taste Profile** — Diversity score, loyalty vs exploration, sound radar, artist distribution, taste summary
- **Timeline** — Monthly breakdown, milestones (scrobble counts, artist discoveries, year-first plays), on-this-day, activity heatmap
- **Sessions** — Session detection, distribution, deep dives, recent sessions
- **Compare** — Side-by-side period comparison (top artists, shared vs unique, overview stats)
- **Settings** — Last.fm config, poll interval, disconnect, clear data, theme toggle

---

## How It Works

```
Spotify (any device)
       |
       v (native scrobbling)
Last.fm
       |
       v (API: user.getRecentTracks, user.getTopArtists, etc.)
Browser -> IndexedDB -> Dashboard
```

1. User connects Spotify to Last.fm in Last.fm settings (free, one-time setup)
2. User clicks "Connect Last.fm" on Spotics -> OAuth flow -> session key stored in IndexedDB
3. Background polling fetches recent tracks from Last.fm API
4. Data rendered across 8 pages with charts, stats, and analytics

---

## Tech Stack

- **Vanilla JavaScript** — no build step, no framework, single HTML file with inline CSS/JS
- **Last.fm API** — user.getRecentTracks, user.getTopArtists, user.getTopAlbums, auth.getSession
- **IndexedDB** — local storage for session key and listening history
- **SVG Charts** — area charts, polar rose charts, radar charts (all hand-built, no charting library)
- **GitHub Pages** — static hosting via `spotics-listener/` folder
- **Custom domain** — `spotics.insights.autos`

---

## Deployment

The `spotics-listener/` folder is deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `feature/fullstack-ready`.

---

## Project Structure

```
spotics-listener/
  index.html          # All pages, inline CSS + inline JS (~2966 lines)
  CNAME               # Custom domain for GitHub Pages
  css/
    style.css         # Additional styles
  js/
    app.js            # Entry point: init, polling, event handlers
    config.js         # Last.fm API credentials + poll interval
    db.js             # IndexedDB wrapper (session, history)
    lastfm.js         # Last.fm API client (auth, fetch, MD5 signing)
    ui.js             # Page rendering (dashboard, insights, taste, timeline, sessions, compare)
    charts.js         # Chart rendering helpers
  assets/
    favicon.ico
    favicon.png
    apple-touch-icon.png
```

---

## Configuration

Edit `spotics-listener/js/config.js` with your Last.fm credentials:

```javascript
const CONFIG = {
  apiKey: 'YOUR_LASTFM_API_KEY',
  apiSecret: 'YOUR_LASTFM_SHARED_SECRET',
  username: 'YOUR_LASTFM_USERNAME',
  pollIntervalMs: 5 * 60 * 1000,
};
```

Get credentials at: https://www.last.fm/api/account/create

---

## License

Proprietary — Bryn018 private repo.
