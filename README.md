# Spotics

Lightweight Spotify listening analytics. No server, no database, no API keys.

Upload your Spotify GDPR export ZIP and get instant visual analytics directly in the browser. Everything runs client-side.

Live: https://spotics.insights.autos

---

## What it does

- Parses Spotify GDPR export ZIPs entirely in-browser
- Computes listening stats, top tracks/artists/albums, genres, streaks, and listening patterns
- Renders terminal-noir analytics dashboards with interactive charts

## Principles

- Client-side only — nothing leaves the browser
- No Spotify OAuth token required
- No backend, no database, no SDKs
- No environment variables for the frontend build

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Recharts
- JSZip
- html2canvas
- date-fns
- Lucide icons
- react-router-dom (HashRouter)
- GitHub Pages (static deploy)

## Getting Started

```bash
git clone https://github.com/Bryn018/spotics.git
cd spotics
npm install
npm run build
```

Open `docs/index.html` from the build output, or serve the static files with any HTTP file server.

## Usage

1. Request your Spotify data from Spotify Account Privacy settings
2. Wait for the GDPR export email and download the ZIP
3. Open Spotics and upload the ZIP
4. Browse analytics across Dashboard, Analytics, Wraps, and Export

## Pages

- Landing — drag-and-drop ZIP upload
- Dashboard — stats overview, top tracks, artists, albums, charts
- Analytics — hourly distribution, genre breakdown, listening heatmap, streaks
- Wraps — shareable weekly / monthly / all-time summaries
- Export — PNG snapshot download via html2canvas

## Deployment

Static output is built to `docs/`. Deployed via GitHub Actions to a custom domain.

## Status

Production-ready on `feature/fullstack-ready`.

## License

Proprietary — Bryn018 private repo.
