# Railway Deployment Guide for Spotics

## Prerequisites
1. GitHub account with the spotics repo (https://github.com/Bryn018/spotics)
2. Railway account
3. Neon PostgreSQL database URL
4. Spotify Developer credentials (Client ID & Secret)

## Step-by-Step Deployment

### 1. Prepare Environment Variables
Get these values:
- **DATABASE_URL**: From Neon dashboard (Connection Details → Connection string)
- **SPOTIFY_CLIENT_ID**: From Spotify Developer Dashboard
- **SPOTIFY_CLIENT_SECRET**: From Spotify Developer Dashboard
- **SPOTIFY_REDIRECT_URI**: Set to `https://your-railway-domain.up.railway.app/api/auth/callback`
- **JWT_SECRET**: Generate random string (32+ chars)
- **SESSION_COOKIE_NAME**: `spotics_session`
- **COOKIE_SECRET**: Generate random string (32+ chars)
- **NODE_ENV**: `production`
- **CLIENT_URL**: `https://your-railway-domain.up.railway.app`

### 2. Push Code to GitHub
```bash
cd /home/waly/spotics
git add -A
git commit -m "feat: complete Spotics stack integration - auth, db, spotify, frontend"
git push origin feature/fullstack-ready
```

### 3. Connect to Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your `Bryn018/spotics` repository
4. Select the `feature/fullstack-ready` branch
5. Railway will auto-detect it's a Node.js project

### 4. Configure Environment Variables in Railway
In your Railway project dashboard:
- Go to "Variables" tab
- Add each variable from step 1
- **Important**: For SPOTIFY_REDIRECT_URI, use the actual Railway domain once assigned
- Click "Save"

### 5. Trigger Deployment
Railway will automatically:
1. Detect the project is Node.js
2. Run `npm install` (from root package.json)
3. Build frontend: `npm run build` (in design_source/)
4. Start server: `npm start` (from root)

### 6. Monitor Deployment Logs
In Railway dashboard:
- Go to "Logs" tab to see real-time deployment logs
- Watch for:
  - npm install success
  - Vite build completion
  - Prisma migration (if added to start script)
  - Server startup message: "🚀 Server running on port {PORT}"
  - Any errors

### 7. Post-Deployment Verification
Once deployed, verify:
1. **Health Check**: `https://your-domain.com/api/health` → `{"ok":true,"ts":"..."}`
2. **Auth Flow**: `https://your-domain.com/api/auth/login` → redirects to Spotify
3. **Frontend Load**: `https://your-domain.com` → loads Spotics UI
4. **Database**: Check Railway PostgreSQL tab for tables

## Troubleshooting Common Issues

### Build Failures
- Check logs for npm errors
- Ensure `design_source/package.json` has correct dependencies
- Verify `design_source/vite.config.js` exists

### Database Connection Errors
- Verify DATABASE_URL format includes `?sslmode=require`
- Ensure Neon database allows connections from Railway IPs
- Test connection manually with `psql "$DATABASE_URL" -c "SELECT 1"`

### Spotify Auth Issues
- Double-check SPOTIFY_CLIENT_ID and SECRET
- Verify SPOTIFY_REDIRECT_URI matches exactly in Spotify Dashboard
- Ensure callback route `/api/auth/callback` exists

### Server Crashes
- Check logs for unhandled exceptions
- Verify all required env vars are set
- Check TypeScript compilation: `npx tsc --noEmit --skipLibCheck`

## Manual Deploy via Railway CLI (Alternative)
```bash
# Install Railway CLI
npm i -g railway

# Login
railway login

# Link to repo
railway link

# Deploy
railway up

# Monitor logs
railway logs
```

## Rollback if Needed
In Railway dashboard:
- Go to "Deployments" tab
- Select previous successful deployment
- Click "Rollback"

## Success Indicators
- Railway shows "Deployment successful"
- Server logs show "🚀 Server running on port {PORT}"
- Health check endpoint returns 200
- Frontend loads without console errors
- Spotify auth redirects properly

The project is configured for zero-downtime deployments - Railway will keep the old version running until the new one is healthy.
