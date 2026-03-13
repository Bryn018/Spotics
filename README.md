# Spotics 🎵

Spotics is a **Last.fm-first music insights dashboard** focused on a clean wrapped-style experience:
- real listening-history windows from Last.fm scrobbles
- top tracks, artists, albums, and activity views
- dedicated analytics page
- simple deployment on Railway

Built with **Next.js App Router + NextAuth + Last.fm API**.

---

## Features

- Last.fm sign-in using username verification
- Dashboard with:
  - hero summary
  - top tracks
  - top artists
  - top albums
  - recent activity
  - listening score
- Dedicated analytics page with:
  - weekly listening chart
  - insight cards
  - genre distribution
- Range switcher: `7d`, `30d`, `all`
- No database required for v1

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- NextAuth v4
- Last.fm API
- Tailwind CSS v4
- Railway deployment

---

## Project Structure

```text
src/
  app/
    page.tsx                         # Landing/sign-in page
    dashboard/page.tsx               # Main dashboard
    dashboard/analytics/page.tsx     # Dedicated analytics view
    api/auth/[...nextauth]/route.ts  # Auth endpoint
  components/
    lastfm-signin.tsx                # Last.fm sign-in form
  lib/
    auth.ts                          # NextAuth configuration
    lastfm.ts                        # Last.fm helpers
    rate-limit.ts                    # Lightweight rate limiting
  types/
    next-auth.d.ts                   # Session/token type extensions
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
LASTFM_API_KEY=your_lastfm_api_key
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3) Last.fm setup

- Create a Last.fm API app and get an API key
- Set `LASTFM_API_KEY` in your env
- Users sign in using their public Last.fm username

### 4) Run

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

### Railway (recommended)

Set these environment variables in Railway:

```env
LASTFM_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-railway-domain.up.railway.app
AUTH_TRUST_HOST=true
```

Then deploy from GitHub.

---

## Troubleshooting

- **Last.fm sign-in fails**
  - Verify `LASTFM_API_KEY`
  - Confirm the username exists publicly on Last.fm
- **Auth/session issues**
  - Verify `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `AUTH_TRUST_HOST`
- **Dashboard looks empty**
  - Confirm the Last.fm account has scrobble history

---

## Roadmap

- Persistent saved snapshots in a later v2
- Shareable public wrapped cards
- More analytics and comparisons
- Optional Spotify support later

---

## License

Educational / personal project.
