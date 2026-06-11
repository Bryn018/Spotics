#!/bin/bash
# SpotAPI Service Startup Script for Spotics
# This script sets up and runs the local Spotify service
#
# Usage:
#   bash start-spotify-service.sh
#
# Or with credentials:
#   SPOTIFY_USERNAME=your@email.com SPOTIFY_PASSWORD=*** bash start-spotify-service.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== SpotAPI Service for Spotics ==="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 is not installed. Please install Python 3.10+ first."
    echo "  Ubuntu/Debian: sudo apt install python3 python3-venv"
    echo "  macOS: brew install python3"
    echo "  Windows: https://www.python.org/downloads/"
    exit 1
fi

# Create venv if needed
if [ ! -d "venv" ]; then
    echo "[1/4] Creating Python virtual environment..."
    python3 -m venv venv
else
    echo "[1/4] Virtual environment already exists."
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "[2/4] Installing dependencies..."
pip install -q flask flask-cors flask-socketio python-socketio spotapi

# Check credentials
if [ -z "$SPOTIFY_USERNAME" ] || [ -z "$SPOTIFY_PASSWORD" ]; then
    echo ""
    echo "[3/4] Spotify credentials not set as environment variables."
    echo "Please enter your Spotify credentials:"
    echo ""
    read -p "Spotify email/username: " SPOTIFY_USERNAME
    read -s -p "Spotify password: " SPOTIFY_PASSWORD
    echo ""
    export SPOTIFY_USERNAME
    export SPOTIFY_PASSWORD
else
    echo "[3/4] Spotify credentials found in environment."
fi

# Kill any existing service on port 3001
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[4/4] Stopping existing service on port 3001..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "[4/4] Starting SpotAPI Service on http://localhost:3001 ..."
echo ""
echo "============================================="
echo "  Service is running!"
echo "  Open https://spotics.insights.autos in your browser"
echo "  The website will automatically detect this service"
echo ""
echo "  Press Ctrl+C to stop"
echo "============================================="
echo ""

python3 service.py
