import SpotifyWebApi from 'spotify-web-api-node';
import { pool } from '../lib/db';
import { getSpotifyClientForUser } from '../lib/spotifyClient';
import { generateWrapReports } from './wrapReports';
import type {
  AlbumStat,
  ArtistStat,
  DashboardPayload,
  GenreStat,
  ListeningChartPoint,
  TimeRange,
  TrackStat,
} from '../types';
import crypto from 'crypto';

const TIMEFRAME_DAYS: Record<TimeRange, number> = {
  short_term: 28,
  medium_term: 180,
  long_term: 365,
};

const TIMEFRAMES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

// How far back to fetch listening history on initial sync (4 weeks in ms)
const HISTORY_LOOKBACK_MS = 28 * 24 * 60 * 60 * 1000;

// Spotify pagination page size
const RECENT_TRACKS_LIMIT = 50;

type SimplifiedArtist = {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  images?: { url: string }[];
};

type RecentItem = {
  track: {
    name: string;
    artists: { name: string }[];
    album: { name: string; images?: { url: string }[] };
    duration_ms: number;
    preview_url: string | null;
  };
  played_at: string;
};

export async function syncUserListeningData(userId: string) {
  const client = await getSpotifyClientForUser(userId);

  // Step 1: Pull up to 4 weeks of raw listening history
  await syncRecentActivity(client, userId);

  // Step 2: Build dashboard summaries using real history for charts
  await Promise.all(
    TIMEFRAMES.map(async (timeframe) => {
      const payload = await buildDashboardPayload(client, userId, timeframe);
      await pool.query(
        `INSERT INTO listening_summaries
           (user_id, timeframe, total_minutes, total_tracks, total_artists, payload, fetched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, timeframe) DO UPDATE
           SET total_minutes = EXCLUDED.total_minutes,
               total_tracks  = EXCLUDED.total_tracks,
               total_artists = EXCLUDED.total_artists,
               payload       = EXCLUDED.payload,
               fetched_at    = EXCLUDED.fetched_at`,
        [
          userId,
          timeframe,
          Math.round(payload.stats.totalMinutes),
          payload.stats.totalTracks,
          payload.stats.totalArtists,
          JSON.stringify(payload),
          new Date().toISOString(),
        ],
      );
    }),
  );

  await generateWrapReports(userId);
}

async function buildDashboardPayload(
  client: SpotifyWebApi,
  userId: string,
  timeframe: TimeRange,
): Promise<DashboardPayload> {
  const [topTracksResponse, topArtistsResponse] = await Promise.all([
    client.getMyTopTracks({ time_range: timeframe, limit: 20 }),
    client.getMyTopArtists({ time_range: timeframe, limit: 15 }),
  ]);

  const tracks = topTracksResponse.body.items ?? [];
  const artists = (topArtistsResponse.body.items ?? []) as SimplifiedArtist[];

  if (!tracks.length || !artists.length) {
    return getEmptyPayload();
  }

  const trackStats = tracks.map<TrackStat>((track, index) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    album: track.album.name,
    plays: estimatePlays(track.popularity, index),
    durationMs: track.duration_ms,
    durationLabel: formatDuration(track.duration_ms),
    image: track.album.images?.[0]?.url ?? null,
  }));

  const artistStats = artists.map<ArtistStat>((artist, index) => ({
    id: artist.id,
    name: artist.name,
    plays: estimatePlays(artist.popularity, index, 600),
    hours: Number(((artist.popularity / 100) * 50).toFixed(1)),
    image: artist.images?.[0]?.url ?? null,
    genres: (artist.genres ?? []).slice(0, 3),
  }));

  const albumStats = buildAlbumStats(trackStats);
  const genreDistribution = buildGenreStats(artists);

  // Build listening chart from actual DB history (last 7 days)
  const listeningChart = await buildListeningChartFromHistory(userId);

  const totalMinutes = trackStats.reduce((sum, track) => sum + track.durationMs, 0) / 60000;
  const uniqueArtists = new Set(tracks.flatMap((track) => track.artists.map((a) => a.id))).size;

  return {
    hero: {
      totalTracks: trackStats.length,
      totalArtists: uniqueArtists,
      topArtist: artistStats[0]?.name ?? null,
    },
    stats: {
      totalMinutes: Number(totalMinutes.toFixed(1)),
      totalTracks: trackStats.length,
      totalArtists: uniqueArtists,
      averageDailyMinutes: Number((totalMinutes / TIMEFRAME_DAYS[timeframe]).toFixed(1)),
    },
    listeningScore: Number(
      Math.min(10, Math.max(1, trackStats.reduce((sum, track) => sum + track.plays, 0) / trackStats.length / 80)).toFixed(1),
    ),
    topTracks: trackStats,
    topArtists: artistStats,
    topAlbums: albumStats,
    listeningChart,
    genreDistribution,
  };
}

/**
 * Paginate through Spotify recently-played history going back 4 weeks.
 * Stores every play as an activity row with deduplication by (user_id, occurred_at).
 */
export async function syncRecentActivity(client: SpotifyWebApi, userId: string) {
  const cutoffDate = new Date(Date.now() - HISTORY_LOOKBACK_MS);
  const allActivities: Array<{
    id: string;
    user_id: string;
    activity_type: string;
    title: string;
    subtitle: string;
    metadata: string;
    occurred_at: string;
  }> = [];

  let beforeTimestamp: number | undefined;
  let pageCount = 0;
  const maxPages = 20; // Safety guard (20 × 50 = 1000 tracks max)

  while (pageCount < maxPages) {
    const params: any = { limit: RECENT_TRACKS_LIMIT };
    if (beforeTimestamp) {
      params.before = beforeTimestamp;
    }

    const recent = await client.getMyRecentlyPlayedTracks(params);
    const items: RecentItem[] = recent.body.items ?? [];

    if (items.length === 0) break;

    for (const item of items) {
      const playedAt = new Date(item.played_at);
      // Stop if we've gone past the 4-week cutoff
      if (playedAt < cutoffDate) {
        pageCount = maxPages; // Force outer loop exit
        break;
      }

      allActivities.push({
        id: crypto.randomUUID(),
        user_id: userId,
        activity_type: 'listened',
        title: item.track.name,
        subtitle: item.track.artists.map((artist) => artist.name).join(', '),
        metadata: JSON.stringify({
          image: item.track.album.images?.[0]?.url ?? null,
          album: item.track.album.name,
          durationMs: item.track.duration_ms,
          previewUrl: item.track.preview_url,
        }),
        occurred_at: item.played_at,
      });

      // Track oldest timestamp for next page
      const ts = playedAt.getTime();
      if (!beforeTimestamp || ts < beforeTimestamp) {
        beforeTimestamp = ts - 1; // -1ms to avoid overlap
      }
    }

    // If last batch was smaller than limit, we've reached the end
    if (items.length < RECENT_TRACKS_LIMIT) break;
    pageCount++;
  }

  if (allActivities.length === 0) return;

  // Deduplicate against existing DB rows by occurred_at
  const existingResult = await pool.query(
    'SELECT occurred_at FROM activities WHERE user_id = $1 AND occurred_at >= $2',
    [userId, cutoffDate.toISOString()],
  );
  const existingTimestamps = new Set(existingResult.rows.map((r) => new Date(r.occurred_at).toISOString()));

  const newActivities = allActivities.filter((a) => !existingTimestamps.has(a.occurred_at));
  if (newActivities.length === 0) return;

  // Bulk insert
  const values = newActivities.map((_, i) => {
    const base = i * 7;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
  });
  const flat = newActivities.flatMap((a) => [
    a.id,
    a.user_id,
    a.activity_type,
    a.title,
    a.subtitle,
    a.metadata,
    a.occurred_at,
  ]);

  await pool.query(
    `INSERT INTO activities (id, user_id, activity_type, title, subtitle, metadata, occurred_at) VALUES ${values.join(', ')}`,
    flat,
  );
}

/**
 * Build a 7-day listening chart from actual stored activities.
 * Returns minutes listened for each of the last 7 days (Mon-Sun relative to today).
 */
async function buildListeningChartFromHistory(userId: string): Promise<ListeningChartPoint[]> {
  const result = await pool.query(
    `SELECT
       metadata->>'durationMs' as duration_ms,
       occurred_at
     FROM activities
     WHERE user_id = $1
       AND occurred_at >= NOW() - INTERVAL '7 days'
     ORDER BY occurred_at DESC`,
    [userId],
  );

  // Group by day of week
  const dayMinutes = new Map<string, number>();
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

  for (const row of result.rows) {
    const date = new Date(row.occurred_at);
    const label = labels[date.getDay()] as string;
    const durationMs = Number(row.duration_ms) || 0;
    dayMinutes.set(label, (dayMinutes.get(label) ?? 0) + durationMs / 60000);
  }

  // Reorder so today is last, going back 6 days
  const today = new Date().getDay();
  const orderedLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    orderedLabels.push(labels[(today - i + 7) % 7] as string);
  }

  return orderedLabels.map((label) => ({
    label,
    minutes: Number((dayMinutes.get(label) ?? 0).toFixed(1)),
  }));
}

function estimatePlays(popularity: number, position: number, base = 450) {
  const popularityFactor = Math.max(popularity, 30) / 100;
  const decay = Math.max(1 - position * 0.05, 0.4);
  return Math.round(base * popularityFactor * decay);
}

function formatDuration(durationMs: number) {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function buildAlbumStats(tracks: TrackStat[]): AlbumStat[] {
  const albums = new Map<string, AlbumStat>();
  tracks.forEach((track) => {
    const key = `${track.album}-${track.artist}`;
    const existing = albums.get(key);
    if (existing) {
      existing.plays += Math.round(track.plays * 0.7);
      existing.totalMinutes += Number((track.durationMs / 60000).toFixed(1));
    } else {
      albums.set(key, {
        id: key,
        name: track.album,
        artist: track.artist,
        plays: Math.round(track.plays * 0.8),
        totalMinutes: Number((track.durationMs / 60000).toFixed(1)),
        image: track.image,
      });
    }
  });
  return Array.from(albums.values()).sort((a, b) => b.plays - a.plays).slice(0, 6);
}

function buildGenreStats(artists: SimplifiedArtist[]): GenreStat[] {
  const counts = new Map<string, number>();
  artists.forEach((artist) => {
    (artist.genres ?? []).forEach((genre: string) => {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    });
  });
  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0) || 1;
  return Array.from(counts.entries())
    .map<GenreStat>(([name, count]) => ({
      name,
      hours: Number(((count / counts.size) * 40).toFixed(1)),
      percentage: Number(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
}

function getEmptyPayload(): DashboardPayload {
  return {
    hero: { totalTracks: 0, totalArtists: 0 },
    stats: { totalMinutes: 0, totalTracks: 0, totalArtists: 0, averageDailyMinutes: 0 },
    listeningScore: 0,
    topTracks: [],
    topArtists: [],
    topAlbums: [],
    listeningChart: [],
    genreDistribution: [],
  };
}
