# Spotics: Supabase + Railway setup

## Supabase
Create a new Supabase project, then collect:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Run the SQL in:
- `supabase/migrations/001_init.sql`

## Railway
Create a Railway project from this GitHub repo.

Set these variables in Railway:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `LASTFM_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_TRUST_HOST=true`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## OAuth callback URLs
### Spotify
Add both callback URLs in Spotify Developer Dashboard:
- `http://localhost:3000/api/auth/callback/spotify`
- `https://<your-railway-domain>/api/auth/callback/spotify`

## Human-in-the-loop steps
You will need to do these personally:
1. Create the Supabase project
2. Paste the SQL migration into Supabase SQL editor
3. Add Railway environment variables
4. Add the Railway callback URL in Spotify developer settings

Once those are ready, the app can be deployed cleanly on Railway.
