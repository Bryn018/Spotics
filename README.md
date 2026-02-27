# Spotics 🎵

Spotics is a Spotify insights dashboard that blends:
- **Real activity windows** (24H / 7D / 30D from recently played tracks)
- **Spotify affinity insights** (top tracks/artists from Spotify profile taste)

## Current MVP

- Spotify sign-in flow ✅
- Token refresh handling ✅
- Dashboard with Now Playing ✅
- Real 24H/7D/30D window aggregates ✅
- Spotify top tracks/artists comparison ✅

## Run locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Environment

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Fill values in `.env.local`:

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Spotify app setup

1. Create an app at Spotify Developer Dashboard
2. Add Redirect URI(s):
   - `http://localhost:3000/api/auth/callback/spotify`
   - your production URL equivalent, e.g. `https://your-domain.com/api/auth/callback/spotify`
3. Copy Spotify Client ID/Secret into env

## Deploy

### Option A (easiest): Vercel
- Connect GitHub repo
- Add env vars in project settings
- Deploy

### Option B: Railway
- Create a new service from GitHub repo
- Set env vars:
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=https://<your-railway-domain>`
- Ensure Spotify Redirect URI includes:
  - `https://<your-railway-domain>/api/auth/callback/spotify`

## Common auth errors

- `invalid_client`
  - Wrong Spotify client ID/secret
- `redirect_uri_mismatch`
  - Callback URL in Spotify dashboard does not exactly match app URL
- Sign-in loop / callback errors
  - Wrong `NEXTAUTH_URL` for current environment

## CI

GitHub Actions runs on push/PR:
- `npm ci`
- `npm run lint`
- `npm run build`

## Roadmap

1. Persist play history to DB for deeper analytics
2. Add compare mode (this week vs last week)
3. Add profile pages + share cards
4. Add genre and mood trend charts
