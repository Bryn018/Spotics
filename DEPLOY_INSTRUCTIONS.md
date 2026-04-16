# Automated Deployment Instructions

## Prerequisites
Set these environment variables before deploying:

```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
export SPOTIFY_CLIENT_ID="your_spotify_client_id"
export SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"  
export SPOTIFY_REDIRECT_URI="https://your-domain.com/api/auth/callback"
export JWT_SECRET="your_jwt_secret_key"
export SESSION_COOKIE_NAME="spotics_session"
export COOKIE_SECRET="your_cookie_secret"
export NODE_ENV="production"
export CLIENT_URL="https://your-production-domain.com"
```

## One-Command Deployment to Railway

```bash
# 1. Push code to GitHub
git add -A && git commit -m "feat: deploy spotics v2 with full stack integration"
git push origin feature/fullstack-ready

# 2. Deploy via Railway CLI
railway up --yes
```

## Manual Deployment Steps

### Step 1: Configure Environment
Copy `.env.example` to `.env` and fill in all credentials:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### Step 2: Build Frontend
```bash
cd design_source && npm install && npm run build
mkdir -p ../server/public
cp -r dist ../server/public/
cd ..
```

### Step 3: Install Server Dependencies
```bash
cd server && npm install --production && cd ..
```

### Step 4: Run Database Migrations
```bash
# Requires DATABASE_URL to be set
npx prisma migrate deploy
```

### Step 5: Start Server
```bash
npm start
```

## Verification

### Check Server Health
```bash
curl http://localhost:4000/api/health
# Expected: {"ok":true,"ts":"2024-..."}
```

### Check Database Connection
```bash
node -e "const db=require('./server/src/lib/db'); console.log('DB connected')"
```

### Test Spotify Auth (requires browser)
```bash
# Visit: http://localhost:4000/api/auth/login
# Should redirect to Spotify login
```

## Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

Then:
```bash
docker build -t spotics .
docker run -p 4000:4000 --env-file .env spotics
```

## Troubleshooting

### Railway Build Fails
- Check `.railway/config.yaml` has all required env vars
- Ensure `npm run build` works locally first
- Verify `package.json` has correct start script

### Spotify Auth Redirect Issues
- Verify `SPOTIFY_REDIRECT_URI` matches exactly what's registered in Spotify Developer Dashboard
- Check CORS settings in `server/src/index.ts`

### Database Connection Failed
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db?sslmode=require`
- For Neon: use `postgresql://...?sslmode=require`

### Frontend Shows Blank
- Check browser console for errors
- Verify `server/public/index.html` exists
- Ensure all API calls return correct CORS headers

## Monitoring

### Logs
```bash
# Railway logs
railway logs --follow

# Local logs
npm start 2>&1 | tee server.log
```

### Health Endpoints
- `GET /api/health` - Server health
- `GET /api/me` - Current user (requires auth)
- `GET /api/stats` - Database stats (add this endpoint)
