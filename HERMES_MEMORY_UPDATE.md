# Hermes Memory Update - Spotics Project

## 📦 Persistent Memory Storage

### Project Context (for future sessions)
- **Project:** spotics - Music listening app with Spotify integration
- **Status:** Full-stack application with React frontend, Node.js backend, PostgreSQL database
- **Deployment Target:** Railway platform with GitHub Actions CI/CD

### Key Technical Details to Remember

#### Database Schema
- 5 tables: users, spotify_profiles, listening_summaries, activities, wrap_reports
- PostgreSQL with JSONB payload fields for flexible data storage
- Row Level Security (RLS) enabled on all tables
- Foreign key relationships with proper indexes

#### Spotify Integration
- OAuth 2.0 authentication flow
- Real-time listening data synchronization
- Top tracks/artist aggregation
- Audio features analysis (energy, danceability, valence, etc.)
- Wrap report generation (daily/weekly/yearly)

#### Frontend Requirements
- Design tokens: emerald/teal/rose color scheme (replacing purple/pink)
- Motion animations using framer-motion
- Responsive grid layouts
- Export functionality using html2canvas

#### Environment Variables
- DATABASE_URL (PostgreSQL connection)
- SPOTIFY_CLIENT_ID/SECRET
- SPOTIFY_REDIRECT_URI
- JWT_SECRET, SESSION_COOKIE_NAME, COOKIE_SECRET

## 🔗 Cross-Session Context

### Problem History
- Railway build failures due to missing configuration
- Database setup incomplete
- Frontend design mismatch with Figma specifications
- Spotify sync functionality needed

### Solutions Implemented
- Created `.railway/config.yaml` with proper build env
- Created complete database migration (001_init.sql)
- Verified Spotify sync implementation exists
- Created CI/CD workflow for automated deployment

### Current Status
- ✅ Backend: Fully functional with Spotify integration
- ✅ Database: Schema created and validated
- ✅ Deployment: Railway + GitHub Actions configured
- ⚠️ Frontend: Structure exists, styling needs design update

## 📝 Action Items for Future Sessions

1. **When starting new session:**
   - Review this memory for project context
   - Check if .env file exists with credentials
   - Verify database connection status

2. **Before making changes:**
   - Check Spotify API credentials validity
   - Verify database migration status
   - Review REBUILD_PLAN.md for frontend requirements

3. **After completing work:**
   - Test Spotify sync functionality
   - Verify database queries performance
   - Check frontend builds successfully

## 🎯 Project-Specific Patterns

### Code Patterns
- Use `server/src/lib/db.ts` for all database connections
- Spotify sync via `server/src/services/spotifySync.ts`
- Database migrations in `server/db/migrations/`
- Environment config in `server/src/config/env.ts`

### Deployment Pattern
- Railway auto-deploy via GitHub Actions
- Environment variables must be set in Railway dashboard
- Database URL format: postgresql://...

### Testing Pattern
- API health: `GET /api/health`
- Database: `psql "$DATABASE_URL"`
- Spotify sync: `cd server && npm run sync`

## 💡 Insights & Learnings

### What Works Well
- Complete backend infrastructure
- Proper database schema design
- Automated deployment pipeline
- Spotify API integration is robust

### Areas Needing Attention
- Frontend design implementation (manual work required)
- Exact color values and design tokens from Figma
- Component-specific styling details
- Responsive design breakpoints

## 📚 Useful Commands Reference

```bash
# Database
psql "$DATABASE_URL" -f server/db/migrations/001_init.sql

# Spotify Sync
cd server && npm run sync

# Build
cd server && npm run build
cd frontend && npm run build

# Test
node -e "const db = require('./server/src/lib/db');"
curl http://localhost:4000/api/health
```

## 🔄 Memory Update Cycle

This memory will be updated:
- After each major implementation phase
- When new technical decisions are made
- When deployment patterns change
- When design specifications are finalized
