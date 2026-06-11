@echo off
REM SpotAPI Service Startup Script for Spotics (Windows)
REM Usage: double-click this file, or run from command prompt
REM 
REM Or with credentials:
REM   set SPOTIFY_USERNAME=your@email.com
REM   set SPOTIFY_PASSWORD=yourpassword
REM   start-spotify-service.bat

echo === SpotAPI Service for Spotics ===
echo.

cd /d "%~dp0"

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Create venv if needed
if not exist "venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv venv
) else (
    echo [1/4] Virtual environment already exists.
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install dependencies
echo [2/4] Installing dependencies...
pip install -q flask flask-cors flask-socketio python-socketio spotapi

REM Check credentials
if "%SPOTIFY_USERNAME%"=="" (
    echo.
    echo [3/4] Spotify credentials not set.
    echo Please enter your Spotify credentials:
    echo.
    set /p SPOTIFY_USERNAME=Spotify email/username: 
    set /p SPOTIFY_PASSWORD=Spotify password: 
) else (
    echo [3/4] Spotify credentials found in environment.
)

REM Kill any existing service on port 3001
echo [4/4] Starting SpotAPI Service on http://localhost:3001 ...
echo.
echo =============================================
echo   Service is running!
echo   Open https://spotics.insights.autos in your browser
echo   The website will automatically detect this service
echo.
echo   Press Ctrl+C to stop
echo =============================================
echo.

python service.py
pause
