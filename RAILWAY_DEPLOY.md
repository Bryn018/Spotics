# Railway deployment guide for Spotics

This phase prepares Spotics for a serious Railway test deployment.

## Services you need

1. **Spotics web service**
2. **PostgreSQL** database in the same Railway project

## Required environment variables

Set these in Railway for the web service:

```env
LASTFM_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://<your-public-railway-domain>
AUTH_TRUST_HOST=true
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_DEBUG=false
```

## First deploy sequence

### 1. Create the database
Add a PostgreSQL service in Railway.

### 2. Connect `DATABASE_URL`
Expose the Postgres `DATABASE_URL` to the web service.

### 3. Set the rest of the env vars
- `LASTFM_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_TRUST_HOST=true`

### 4. Run Prisma deploy commands
Use Railway shell or a one-off command:

```bash
npm run db:generate
npm run db:deploy
```

## Recommended build/start flow

Railway will use:
- build via Nixpacks
- start command from `railway.json`
- healthcheck from `/api/health`

## Production notes

- `NEXTAUTH_URL` must match the real Railway public URL.
- Do not use `prisma migrate dev` in Railway production.
- Use `prisma migrate deploy` instead.
- Healthcheck requires database connectivity.
- If healthcheck fails, verify `DATABASE_URL` first.

## Smoke test checklist

After deploy:

- `/api/health` returns `ok: true`
- landing page loads
- Last.fm profile validation works
- dashboard loads after auth
- sync endpoint works
- history page loads
- analytics page loads

## If deploy breaks

Check in this order:

1. `DATABASE_URL`
2. `NEXTAUTH_URL`
3. `NEXTAUTH_SECRET`
4. Last.fm API key
5. Prisma client generation / migrations
