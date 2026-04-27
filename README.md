# Spotics – Spotify Insights Dashboard

Full-stack Spotify analytics dashboard built with Vite + React, Express, Neon Postgres, and Spotify OAuth PKCE. Deployed on Railway.

Live: https://spotics.insights.autos

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React + TypeScript + TailwindCSS |
| Backend | Express.js (Node.js) |
| Database | Neon Postgres (serverless) |
| Auth | Spotify OAuth PKCE (Better Auth / neon-auth) |
| Hosting | Railway (monorepo deploy) |
| CI/CD | Railway GitHub integration (auto-deploy) |

---

## Local Development

### Prerequisites
- Node.js 18+
- Spotify Developer credentials (client ID/secret)

### 1. Install
```bash
git clone https://github.com/Bryn018/spotics.git
cd spotics
npm install
cd server && npm install && cd ..
```

### 2. Environment
```bash
cp .env.example .env.local          # frontend (VITE_API_URL only)
cp server/.env.example server/.env # backend (Neon + Spotify + secrets)
```

Fill `server/.env` with:
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://...@<neon-host>/neondb
SPOTIFY_CLIENT_ID=<your-client-id>
SPOTIFY_CLIENT_SECRET=<your-client-secret>
SPOTIFY_REDIRECT_URI=http://localhost:4000/auth/callback
JWT_SECRET=<random-32-byte-string>
SESSION_COOKIE_NAME=spotics_session
COOKIE_SECRET=<random-32-byte-string>
VITE_API_URL=http://localhost:4000
```

### 3. Database
The Neon schema is managed via migrations in `server/migrations/`. On a fresh Neon project:
```bash
cd server
npm run db:migrate   # or run the latest migration file in Neon console
```

### 4. Run
```bash
# Terminal 1 – API server
cd server && npm run dev
# → http://localhost:4000

# Terminal 2 – Frontend
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173/dashboard` and click "Connect to Spotify".

---

## Project Structure

```
spotics/
├── src/                    # Vite + React frontend
│   ├── app/
│   │   └── pages/         # Dashboard pages (Home, Analytics, Export)
│   └── styles/            # Global CSS + Tailwind
├── server/                # Express API
│   ├── routes/            # Spotify OAuth + user data endpoints
│   ├── lib/               # Neon DB client + Spotify SDK
│   └── migrations/        # PostgreSQL schema migrations
├── Dockerfile             # Railway production build
└── README.md              # This file
```

---

## Database Schema

Key tables ( migrations in `server/migrations/` ):
- `users` – Spotify user profile
- `sessions` – Auth sessions (JWT-backed)
- `listening_history` – Daily aggregated listen counts
- `top_artists` – Cached top artist snapshots
- `top_tracks` – Cached top track snapshots
- `top_albums` – Cached top album snapshots

To add a migration: create `server/migrations/YYYYMMDD_description.sql` and run it via Neon console or `npm run db:migrate`.

---

## Deployment

### Railway (primary)

Monorepo deploy: single Railway service runs both the API (Express) and serves built static frontend.

**Current configuration:**
- Project: `wonderful-determination`
- Service: `spotics`
- Branch: `feature/fullstack-ready` (default)
- Live URL: https://spotics.insights.autos

**Environment variables (Production):**
```
NODE_ENV=production
PORT=4000
DATABASE_URL=<from Neon>
SPOTIFY_CLIENT_ID=<from Spotify Dev>
SPOTIFY_CLIENT_SECRET=<from Spotify Dev>
SPOTIFY_REDIRECT_URI=https://spotics.insights.autos/auth/callback
JWT_SECRET=<32-byte-random>
SESSION_COOKIE_NAME=spotics_session
COOKIE_SECRET=<32-byte-random>
VITE_API_URL=https://spotics.insights.autos
```

Railway auto-deploys on every push to `feature/fullstack-ready`. Build command: `npm ci && npm run build`. Start command: `node server/dist/index.js`.

---

## Branches

Only **`feature/fullstack-ready`** is active. All other remote branches have been pruned.

---

## Design System

Dashboard matches Figma: https://agile-zero-13740164.figma.site/dashboard

**Colors (Tailwind arbitrary values):**
- `#1DB954` – Primary green (buttons, underlines)
- `#1ED760` – Mint highlight (active states)
- `#22D3EE` – Cyan for large stat numbers
- `#A10E36` – Yearly toggle (active)
- `#002B24` – Hero badge background
- `#1A2233` – Active Days card background
- `#121E21` – Card backgrounds
- `#282828` – Borders

**Sections (top → bottom):**
1. Hero (Year in Review) – badge, headline, 3-summary cards, timeframe toggles, CTA
2. Your Music Stats – 4 detailed metric cards + timeframe filter
3. Top Albums – horizontal grid with rank/cover/title/artist/plays
4. Top Tracks – table with rank/name/artist/album/duration
5. Top Artists – circular portrait grid with name/plays/listening time
6. Weekly Insights – activity graph, 2×2 KPI grid, achievement banners

---

## Troubleshooting

**Spotify OAuth fails** – Verify `SPOTIFY_REDIRECT_URI` in Spotify Dev Console matches Railway domain exactly.

**Stale deployment** – Check Railway GitHub webhook is linked to `feature/fullstack-ready` and that the commit pushed successfully.

**Neon connection refused** – Ensure `DATABASE_URL` is correct and Neon compute isn't paused (free tier auto-pauses after inactivity; first request wakes it).

---

## License

Proprietary – Bryn018 private repo.
