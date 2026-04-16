import { pool } from './db';
import { spotify } from './spotify';

export async function generateListeningSummary(userId: string, timeframe: 'short_term' | 'medium_term' | 'long_term') {
  const token = await spotify.getAccessToken?.() ?? '';
  const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=50`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  const data = await response.json();

  const totalMinutes = Math.floor(data.items.reduce((acc: any, item: any) => acc + (item.played_for_ms ?? 0), 0) / 60000);
  const totalTracks = data.items.length;
  const totalArtists = new Set(data.items.flatMap((item: any) => item.track.artists.map((a: any) => a.id))).size;

  await pool.query(
    `INSERT INTO listening_summaries (user_id, timeframe, total_minutes, total_tracks, total_artists, payload)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, timeframe) DO UPDATE SET
       total_minutes = EXCLUDED.total_minutes,
       total_tracks = EXCLUDED.total_tracks,
       total_artists = EXCLUDED.total_artists,
       payload = EXCLUDED.payload,
       fetched_at = now()`,
    [userId, timeframe, totalMinutes, totalTracks, totalArtists, JSON.stringify(data)],
  );

  return { totalMinutes, totalTracks, totalArtists };
}

export async function generateWrapReport(userId: string, timeframe: 'daily' | 'weekly' | 'yearly', periodStart: string, periodEnd: string) {
  const summaries = await pool.query(
    'SELECT * FROM listening_summaries WHERE user_id = $1 AND timeframe = $2',
    [userId, timeframe],
  );

  const payload = {
    timeframe,
    period: { start: periodStart, end: periodEnd },
    ...(summaries.rows[0] || {}),
  };

  await pool.query(
    `INSERT INTO wrap_reports (user_id, timeframe, period_start, period_end, payload)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, timeframe, period_start, period_end) DO UPDATE SET
       payload = EXCLUDED.payload,
       generated_at = now()`,
    [userId, timeframe, periodStart, periodEnd, JSON.stringify(payload)],
  );

  return payload;
}

export async function getAccessToken(): Promise<string> {
  // Simplified token retrieval
  return '';
}
