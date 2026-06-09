-- Spotics Scrobble Server - Cloudflare D1 Database Schema

-- Scrobbles table: each row is one track play event
CREATE TABLE IF NOT EXISTS scrobbles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album_art TEXT,
    duration_ms INTEGER DEFAULT 0,
    played_ms INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL,  -- ISO 8601
    source TEXT DEFAULT 'spotify_web_player',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Index for fast lookups by user (api_key) and time
CREATE INDEX IF NOT EXISTS idx_scrobbles_api_key ON scrobbles(api_key);
CREATE INDEX IF NOT EXISTS idx_scrobbles_timestamp ON scrobbles(timestamp);
CREATE INDEX IF NOT EXISTS idx_scrobbles_api_key_timestamp ON scrobbles(api_key, timestamp);

-- Now playing table: tracks current playback state (upsert per user)
CREATE TABLE IF NOT EXISTS now_playing (
    api_key TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album_art TEXT,
    duration_ms INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL,
    source TEXT DEFAULT 'spotify_web_player',
    updated_at TEXT DEFAULT (datetime('now'))
);

-- API keys table: manages user authentication
CREATE TABLE IF NOT EXISTS api_keys (
    key TEXT PRIMARY KEY,
    label TEXT DEFAULT 'default',
    created_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1,
    rate_limit_count INTEGER DEFAULT 0,
    last_used TEXT
);

-- Stats cache: pre-computed aggregations for fast dashboard loading
CREATE TABLE IF NOT EXISTS stats_cache (
    api_key TEXT NOT NULL,
    period TEXT NOT NULL,  -- '7d', '30d', '90d', '1y', 'all'
    stat_type TEXT NOT NULL,  -- 'top_artists', 'top_tracks', 'listening_time', 'genre_dist'
    data TEXT,  -- JSON blob
    computed_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (api_key, period, stat_type)
);
