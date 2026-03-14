# Spotics

Spotics is a **Last.fm music intelligence platform**.

Instead of pretending to be a one-off wrapped clone, Spotics is being rebuilt as a production-oriented product that:
- tracks a user's listening history from Last.fm
- stores and aggregates listening activity over time
- produces honest dashboards and trend views
- prepares the foundation for recurring recaps, insights, and notifications

This branch introduces the **production foundation** for that direction.

---

## Product direction

### What Spotics is
- a Last.fm-first listening analytics product
- a long-term personal music dashboard
- a foundation for insights, recaps, and trend monitoring

### What Spotics is not
- fake analytics wrapped in pretty cards
- a Spotify clone with ghost integrations
- a one-page demo pretending to be production-ready

---

## Current rebuild goals

This phase focuses on the foundation required for a real product:

- environment validation
- database and Prisma schema scaffolding
- durable data model for users, profiles, scrobbles, rollups, insights, and recaps
- clearer product framing and more honest language
- removal of dead Spotify-era leftovers from the active architecture

---

## Tech stack

- Next.js 16
- TypeScript
- NextAuth v4
- Prisma
- PostgreSQL
- Tailwind CSS v4
- Last.fm API

---

## Environment

Create `.env.local` from `.env.example` and fill in:

```env
LASTFM_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spotics
NEXTAUTH_DEBUG=false
```

Generate a secret if needed:

```bash
openssl rand -base64 32
```

---

## Local development

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run db:generate
```

Push schema to your local database during development:

```bash
npm run db:push
```

Run the app:

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:push
npm run db:migrate
```

---

## Rebuild roadmap

### Phase 1: production foundation
- env validation
- Prisma schema
- cleanup of misleading product positioning
- remove dead integration leftovers

### Phase 2: ingestion and persistence
- initial Last.fm sync
- incremental sync pipeline
- scrobble persistence
- sync logging

### Phase 3: honest dashboard
- persisted metrics
- exact vs estimated labels
- real time-window comparisons

### Phase 4: insights and recaps
- trend detection
- recap generation
- milestone notifications
- shareable outputs

---

## Repo structure

```text
prisma/
  schema.prisma                # Production-oriented domain model
src/
  app/                         # Next.js routes and pages
  components/                  # UI components
  lib/
    auth.ts                    # NextAuth config
    db.ts                      # Prisma client singleton
    env.ts                     # Runtime environment validation
    lastfm.ts                  # Last.fm client/helpers
    rate-limit.ts              # Lightweight app-side rate limiting
  types/
    next-auth.d.ts             # Session/JWT extensions
```

---

## Notes

This branch is intentionally a **foundation rebuild**, not the final product. The goal is to create a clean base for persistence, ingestion, and honest analytics.
