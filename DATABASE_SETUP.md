# Database Setup for Spotics

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SPOTIFY_CLIENT_ID` - Spotify Developer credentials
- `SPOTIFY_CLIENT_SECRET` - Spotify Developer credentials  
- `SPOTIFY_REDIRECT_URI` - Your callback URL
- `JWT_SECRET` - Secret key for JWT signing
- `SESSION_COOKIE_NAME` - Session cookie name
- `COOKIE_SECRET` - Cookie encryption secret

### Database Migration

Apply the schema migration:

```bash
psql "$DATABASE_URL" -f server/db/migrations/001_init.sql
```

## Database Schema

Tables created:
1. **users** - User accounts
2. **spotify_profiles** - Spotify OAuth data
3. **listening_summaries** - Listening history by timeframe
4. **activities** - User activity tracking
5. **wrap_reports** - Generated Spotify Wrapped reports

## Spotify API Setup

1. Go to https://developer.spotify.com/dashboard/
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback`
4. Copy Client ID and Client Secret to `.env`

## Testing Connection

```bash
# Test database connection
node -e "const db = require('./server/src/lib/db'); console.log('DB connected')"

# Test API health
curl http://localhost:4000/api/health
```
