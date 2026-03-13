# Spotics 🎵

Spotics is a music insights dashboard that supports **Last.fm (recommended)** and **Spotify (beta)**:
- **Real activity windows** from listening history (24H / 7D / 30D)
- **Top tracks/artists** by source
- **Now Playing** with graceful fallbacks when endpoints are restricted

Built with **Next.js App Router + NextAuth + Last.fm API + Spotify Web API**.

---

## Features

- Last.fm sign-in (username verification)
- Spotify OAuth sign-in (beta)
- Secure token refresh flow for Spotify
- Dashboard with:
  - Now Playing panel
  - Top 10 tracks, artists, and albums
  - Source-aware insights (Last.fm recommended, Spotify fallback)
- Range switcher: `7d`, `30d`, `all`
- Graceful fallback mode when some Spotify endpoints are unavailable

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- NextAuth v4
- Spotify Web API
- Tailwind CSS v4

---

## Project Structure

```text
src/
  app/
    page.tsx                         # Landing/sign-in page
    dashboard/page.tsx               # Main dashboard
    dashboard/analytics/page.tsx     # Dedicated analytics view
  lib/
    auth.ts                          # NextAuth configuration
    spotify.ts                       # Spotify API calls + window aggregation
    lastfm.ts                        # Last.fm helpers
    supabase.ts                      # Supabase client helpers
  types/
    next-auth.d.ts                   # Session/token type extensions
supabase/
  migrations/001_init.sql            # Database schema bootstrap
```

---

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local`:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
LASTFM_API_KEY=your_lastfm_api_key
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3) Last.fm setup (recommended)

- Create API account/app at Last.fm and get an API key
- Set `LASTFM_API_KEY` in your env
- Users sign in using their Last.fm username
- If users scrobble from Spotify to Last.fm, they still get Spotify-based listening insights

### 4) Spotify app setup (optional beta)

In Spotify Developer Dashboard:

- Create app (or use existing)
- Add Redirect URI:
  - `http://localhost:3000/api/auth/callback/spotify`
- For production, also add:
  - `https://your-domain.com/api/auth/callback/spotify`

### 5) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Build & Quality

```bash
npm run lint
npm run build
npm run start
```

---

## Deployment

### Railway + Supabase (recommended)

- Create the Supabase project and run `supabase/migrations/001_init.sql`
- Create Railway service from repo
- Add env vars:
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `LASTFM_API_KEY`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `AUTH_TRUST_HOST=true`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Ensure Spotify callback includes Railway URL:
  - `https://<your-domain>/api/auth/callback/spotify`

See `RAILWAY_SUPABASE_SETUP.md` for the exact handoff checklist.

---

## Troubleshooting

- **Last.fm sign-in fails**
  - Verify `LASTFM_API_KEY` and that the username exists
- **`invalid_client` (Spotify)**
  - Wrong Spotify client id/secret
- **`redirect_uri_mismatch` (Spotify)**
  - Callback URI in Spotify dashboard does not exactly match app callback
- **Auth callback loops / session issues**
  - `NEXTAUTH_URL` incorrect for current environment
- **Spotify login blocked by policy**
  - Use Last.fm as primary sign-in path (recommended)

---

## Roadmap

- Persist listening history for long-term analytics
- Weekly/period comparisons
- Shareable profile cards
- Genre/mood trend visualizations

---

## License

Educational / personal project.
