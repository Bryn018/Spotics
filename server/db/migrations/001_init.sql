-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spotify profiles table
CREATE TABLE spotify_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  spotify_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT[] NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  product TEXT,
  followers INTEGER,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listening summaries table
CREATE TABLE listening_summaries (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('short_term', 'medium_term', 'long_term')),
  total_minutes INTEGER,
  total_tracks INTEGER,
  total_artists INTEGER,
  payload JSONB,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, timeframe)
);

-- Activities table
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  metadata JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wrap reports table
CREATE TABLE wrap_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'yearly')),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  payload JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, timeframe, period_start, period_end)
);

-- User recent tracks table
CREATE TABLE user_recent_tracks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  track_uri TEXT NOT NULL,
  spotify_track_id TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, spotify_track_id)
);

-- Create indexes
CREATE INDEX idx_listening_summaries_user_id ON listening_summaries(user_id);
CREATE INDEX idx_listening_summaries_timeframe ON listening_summaries(timeframe);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_occurred_at ON activities(occurred_at DESC);
CREATE INDEX idx_wrap_reports_user_id ON wrap_reports(user_id);
CREATE INDEX idx_spotify_profiles_user_id ON spotify_profiles(user_id);
CREATE INDEX idx_user_recent_tracks_user_id ON user_recent_tracks(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrap_reports ENABLE ROW LEVEL SECURITY;
