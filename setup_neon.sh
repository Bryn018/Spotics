#!/bin/bash
# Neon Database Setup Script
# This script sets up the Neon database for spotics

set -e

echo "🚀 Setting up Neon database for spotics..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it with: export DATABASE_URL='postgresql://...'"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Create database schema
echo "📝 Creating database schema..."
psql "$DATABASE_URL" -f server/db/migrations/001_init.sql

echo "✅ Database schema created successfully"

# Verify tables
echo "📋 Verifying tables..."
psql "$DATABASE_URL" -c "\dt"

echo ""
echo "🎉 Neon database setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Spotify credentials in .env file"
echo "2. Deploy to Railway: railway up --yes"
echo "3. Test API: curl http://localhost:4000/api/health"
