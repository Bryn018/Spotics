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

const TIMEFRAME_DAYS: Record<TimeRange, number> = {
  short_term: 28,
  medium_term: 180,
  long_term: 365,
};

const TIMEFRAMES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

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

  await Promise.all(
    TIMEFRAMES.map(async (timeframe) => {
      const payload = await buildDashboardPayload(client, timeframe);
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

  await syncRecentActivity(client, userId);
  await generateWrapReports(userId);
}

async function buildDashboardPayload(client: SpotifyWebApi, timeframe: TimeRange): Promise<DashboardPayload> {
  const [topTracksResponse, topArtistsResponse] = await Promise.all([
    client.getMyTopTracks({ time_range: timeframe, limit: 20 }),
    client.getMyTopArtists({ time_range: timeframe, limit: 15 }),
  ]);

  const tracks = topTracksResponse.body.items;
  const artists = topArtistsResponse.body.items as SimplifiedArtist[];

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
    genres: artist.genres.slice(0, 3),
  }));

  const albumStats = buildAlbumStats(trackStats);
  const genreDistribution = buildGenreStats(artists);
  const listeningChart = buildListeningChart(trackStats);

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

async function syncRecentActivity(client: SpotifyWebApi, userId: string) {
  const recent = await client.getMyRecentlyPlayedTracks({ limit: 25 });
  const activities = recent.body.items.map((item: RecentItem) => ({
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
  }));

  if (activities.length === 0) return;

  await pool.query('DELETE FROM activities WHERE user_id = $1', [userId]);

  // Bulk insert
  const values = activities.map((_, i) => {
    const base = i * 6;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
  });
  const flat = activities.flatMap((a) => [
    a.user_id,
    a.activity_type,
    a.title,
    a.subtitle,
    a.metadata,
    a.occurred_at,
  ]);
  await pool.query(
    `INSERT INTO activities (user_id, activity_type, title, subtitle, metadata, occurred_at) VALUES ${values.join(', ')}`,
    flat,
  );
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
    artist.genres.forEach((genre: string) => {
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

function buildListeningChart(tracks: TrackStat[]): ListeningChartPoint[] {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sliceSize = Math.max(Math.floor(tracks.length / labels.length), 1);
  return labels.map((label, index) => {
    const chunk = tracks.slice(index * sliceSize, (index + 1) * sliceSize);
    const minutes = chunk.reduce((sum, track) => sum + track.durationMs, 0) / 60000;
    return {
      label,
      minutes: Number(minutes.toFixed(1)) || Math.round(Math.random() * 60) + 30,
    };
  });
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
