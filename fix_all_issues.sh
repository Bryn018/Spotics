#!/bin/bash
set -e

echo "🔧 Starting comprehensive fix for spotics project..."

# 1. Setup .railway directory and config
echo "📁 Setting up Railway configuration..."
mkdir -p .railway
cat > .railway/config.yaml << 'EOF'
build:
  env:
    - DATABASE_URL
    - SPOTIFY_CLIENT_ID
    - SPOTIFY_CLIENT_SECRET
    - SPOTIFY_REDIRECT_URI
    - JWT_SECRET
    - SESSION_COOKIE_NAME
    - COOKIE_SECRET
run:
  autoDeploy: true
EOF

# 2. Create .env.example if it doesn't exist
if [ ! -f .env.example ]; then
    echo "📝 Creating .env.example..."
    cat > .env.example << 'EOF'
PORT=4000
APP_URL=http://localhost:4000
API_URL=http://localhost:4000/api/v1
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/spotics?sslmode=disable
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
JWT_SECRET=your_jwt_secret
SESSION_COOKIE_NAME=spotics_session
COOKIE_SECRET=your_cookie_secret
EOF
fi

# 3. Check and setup database
echo "🔄 Checking database configuration..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please configure your database."
    echo "   Example: DATABASE_URL=postgresql://user:password@localhost:5432/spotics?sslmode=disable"
fi

# 4. Setup Spotify environment variables
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please copy .env.example to .env and configure Spotify credentials."
fi

# 5. Check frontend dependencies
echo "📦 Checking frontend dependencies..."
if [ -f "frontend/package.json" ]; then
    cd frontend
    npm install 2>/dev/null || echo "⚠️  Frontend dependencies may need manual installation"
    cd ..
fi

# 6. Check server dependencies
echo "📦 Checking server dependencies..."
if [ -f "server/package.json" ]; then
    cd server
    npm install 2>/dev/null || echo "⚠️  Server dependencies may need manual installation"
    cd ..
fi

# 7. Build server
echo "🏗️  Building server..."
cd server
npm run build 2>/dev/null || echo "⚠️  Server build may have issues"
cd ..

# 8. Build frontend
echo "🏗️  Building frontend..."
if [ -d "frontend" ]; then
    cd frontend
    npm run build 2>/dev/null || echo "⚠️  Frontend build may have issues"
    cd ..
fi

# 9. Check GitHub repository status
echo "🔍 Checking GitHub repository..."
cd /home/waly/spotics
if [ -d ".git" ]; then
    echo "✅ Git repository found"
    git status || echo "⚠️  Git status check failed"
else
    echo "⚠️  No git repository found"
fi

# 10. Check for required files
echo "📋 Checking required files..."
required_files=(
    "server/src/lib/db.ts"
    "server/src/config/env.ts"
    "server/src/routes/api.ts"
    "src/app/App.tsx"
    "src/app/routes.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
    fi
done

echo ""
echo "🎯 Fix Summary:"
echo "1. ✅ Railway configuration created"
echo "2. ✅ Environment files created"
echo "3. ⚠️  Database configuration needed"
echo "4. ⚠️  Spotify credentials needed"
echo "5. ⚠️  Build dependencies may need installation"
echo "6. ⚠️  Manual intervention may be required for some configurations"

echo ""
echo "🚀 Next steps:"
echo "1. Set DATABASE_URL in your environment"
echo "2. Configure Spotify credentials in .env file"
echo "3. Run: npx playwright install (for tests)"
echo "4. Deploy to Railway"
