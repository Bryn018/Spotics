# Spotics

Lightweight Spotify listening analytics. Two modes: GDPR export upload (fully client-side) and live scrobbling via browser extension.

Live: https://spotics.insights.autos

---

## Two Modes

### GDPR Export (Client-Side)
Upload your Spotify GDPR export ZIP and get instant visual analytics directly in the browser. Everything runs client-side — nothing leaves the browser.

### Live Scrobbler (Extension + Server)
Install the Spotics Scrobbler browser extension to track your listening in real time on Spotify Web Player. Scrobbles are sent to your Spotics dashboard with full analytics.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4 + Recharts
- **Extension:** Chrome Manifest V3 (content script + service worker)
- **Server:** Cloudflare Worker + D1 database (free tier)
- **Auth:** API keys (register via server or extension popup)
- **Hosting:** GitHub Pages (frontend) + Cloudflare Workers (API)

## Getting Started

```bash
git clone https://github.com/Bryn018/spotics.git
cd spotics
npm install
npm run build
```

## Pages

- **Landing** — choose between GDPR upload or Live Scrobbler
- **Dashboard** — GDPR data: stats overview, top tracks, artists, albums, charts
- **Analytics** — hourly distribution, genre breakdown, listening heatmap, streaks
- **Live** — real-time scrobbling dashboard with now-playing, stats, heatmap
- **Wraps** — shareable weekly / monthly / all-time summaries
- **Export** — PNG snapshot download

## Deploying the Scrobble Server

See `server/README.md` for Cloudflare Worker + D1 setup.

## Loading the Extension (Development)

1. Run `npm run build` to build the frontend
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select the `extension/` folder
5. Configure API key in the popup

## Architecture

```
Spotify Web Player
       │
       ▼
┌─────────────────────────┐
│  Scrobbler Extension    │
│  (content.js observes   │
│   DOM, background.js    │
│   POSTs to API)         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Cloudflare Worker      │
│  (scrobble API + D1 DB) │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Spotics Frontend       │
│  (GitHub Pages,        │
│   reads from API)       │
└─────────────────────────┘
```

## License

Proprietary — Bryn018 private repo.
