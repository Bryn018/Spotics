# Spotics 🎵

Spotics is a Spotify insights dashboard.

## MVP in progress

- Spotify sign-in flow ✅
- Top Tracks / Artists / Albums cards ✅
- Time windows: 24H, 7D, 30D (UI + mapped Spotify ranges)
- Vibrant dashboard UI ✅

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill values.

```bash
cp .env.example .env.local
```

For Spotify app setup:
1. Create app at Spotify Developer Dashboard
2. Add redirect URI:
   - `http://localhost:3000/api/auth/callback/spotify`
   - your production URL equivalent on Vercel
3. Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
4. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

## Deploy (free)

Recommended stack:
- Frontend hosting: **Vercel**
- Database: **Supabase free tier**

Connect the GitHub repo to Vercel and set environment variables there.

## Roadmap

1. Add Auth.js + Spotify OAuth
2. Add recent-play ingestion + DB storage
3. Compute real 24H/7D/30D aggregates
4. Add sharing cards + profile pages
