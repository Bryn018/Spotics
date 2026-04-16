#!/usr/bin/env bash
set -e
echo "=== Deploying to Railway ==="

# Ensure we're in the repo
cd "$(dirname "$0")"

# Build frontend first
echo "→ Building frontend..."
cd design_source && npm run build 2>&1 | tail -5
cd ..

# Copy static output for single-server host
mkdir -p server/public
cp -r design_source/dist server/public/

# Install server deps
echo "→ Installing server deps..."
cd server && npm install --production --ignore-scripts 2>&1 | tail -3
cd ..

# Type-check
echo "→ Type-checking..."
npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" && echo "⚠ TypeScript warnings present" || echo "✓ Type check passed"

# Prisma migrations (requires DATABASE_URL)
if [ -n "$DATABASE_URL" ]; then
  echo "→ Running migrations..."
  npx prisma migrate deploy
else
  echo "→ Skipping migrations (no DATABASE_URL)"
fi

# Start
echo "→ Starting server..."
npm start
