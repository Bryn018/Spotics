-- Add unique constraint for deduplication on activities table
-- This prevents duplicate listening activities based on user, Spotify track, and timestamp
CREATE UNIQUE INDEX IF NOT EXISTS idx_activities_user_spotify_occurred
  ON activities(user_id, metadata->>'spotify_track_id', occurred_at);

-- Backfill any existing duplicates (keep the most recent)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, metadata->>'spotify_track_id', occurred_at 
      ORDER BY created_at DESC
    ) AS rn
  FROM activities
)
DELETE FROM activities
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);