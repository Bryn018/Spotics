# Spotics – Spotify Insights Dashboard

Full-stack Spotics build featuring a Vite + React frontend, Express API, Supabase persistence, and Spotify OAuth.

## Local Development

### 1. Frontend
```bash
cd spotics
cp .env.example .env.local # optional – only VITE_API_URL is required locally
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` and points to the API URL you set in `VITE_API_URL` (default `http://localhost:4000`).

### 2. API Server
```bash
cd spotics/server
cp .env.example .env
# fill in Supabase + Spotify values (anon key, service role key, client/secret, redirect URI)
npm install
npm run dev
```
Server runs at `http://localhost:4000` with cookies enabled for OAuth flows.

## Supabase Schema
If this is a new Supabase project, run the built-in migration:
```bash
cd spotics
supabase link --project-ref <your-ref>
supabase db push
```
(or copy `supabase/migrations/20260317_init.sql` into Supabase Studio’s SQL editor and run it.)

## Production Build (Docker/Railway)
The included `Dockerfile` builds both the Vite client and Express server, then serves the static assets from the API process. To run locally:
```bash
cd spotics
docker build -t spotics .
docker run --env-file server/.env -p 4000:4000 spotics
```

### Required Environment Variables
Set these in Railway (or any host):
```
NODE_ENV=production
PORT=4000
APP_URL=https://<your-domain>
API_URL=https://<your-domain>
CLIENT_URL=https://<your-domain>
VITE_API_URL=https://<your-domain>
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=https://<your-domain>/auth/callback
JWT_SECRET=...
SESSION_COOKIE_NAME=spotics_session
COOKIE_SECRET=...
```

On Railway, point the service to the repo root, select the Dockerfile build, and deploy. The app (API + static client) will be available at the Railway-provided domain.
