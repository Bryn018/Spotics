# Spotics Scrobble Server

Cloudflare Worker + D1 database for receiving and storing scrobble events from the Spotics Scrobbler browser extension.

## Setup

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

3. Create the D1 database:
   ```bash
   wrangler d1 create spotics-scrobbles
   # Copy the database_id into wrangler.toml
   ```

4. Run the schema:
   ```bash
   wrangler d1 execute spotics-scrobbles --file=schema.sql
   ```

5. Deploy the worker:
   ```bash
   wrangler deploy
   ```

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register a new API key |

### Authenticated (requires `X-API-Key` header)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/scrobble` | Submit a scrobble event |
| `POST` | `/now-playing` | Update now-playing status |
| `GET` | `/now-playing` | Get current now-playing track |
| `GET` | `/scrobbles` | Get scrobble history (paginated) |
| `GET` | `/stats` | Get aggregated stats |
| `GET` | `/stats/top-artists` | Get top artists |
| `GET` | `/stats/top-tracks` | Get top tracks |
| `GET` | `/stats/listening` | Get daily/hourly stats |
| `GET` | `/stats/heatmap` | Get listening heatmap (7x24) |

## Query Parameters

- `period`: `7d`, `30d`, `90d`, `1y`, `all` (default: `all`)
- `limit`: Max results (default: 50, max: 200)
- `offset`: Pagination offset (default: 0)
- `from`/`to`: ISO timestamp range filter

## Free Tier Limits

- Cloudflare Workers: 100,000 requests/day
- Cloudflare D1: 5GB storage, 10M reads/month, 500K writes/month
