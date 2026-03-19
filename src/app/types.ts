export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpoticsUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardPayload {
  hero: {
    totalTracks: number;
    totalArtists: number;
    topArtist?: string | null;
  };
  stats: {
    totalMinutes: number;
    totalTracks: number;
    totalArtists: number;
    averageDailyMinutes: number;
  };
  listeningScore: number;
  topTracks: TrackStat[];
  topArtists: ArtistStat[];
  topAlbums: AlbumStat[];
  listeningChart: ListeningChartPoint[];
  genreDistribution: GenreStat[];
}

export interface ListeningSummary {
  id: string;
  timeframe: TimeRange;
  totals: {
    minutes: number;
    tracks: number;
    artists: number;
  };
  payload: DashboardPayload | null;
  fetchedAt: string;
}

export interface DashboardResponse {
  user: SpoticsUser | null;
  timeframe: TimeRange;
  summary: ListeningSummary | null;
  summaries: ListeningSummary[];
  activities: Activity[];
}

export interface Activity {
  id: string;
  activity_type: string;
  title: string;
  subtitle?: string | null;
  metadata: {
    image?: string | null;
    album?: string | null;
    durationMs?: number;
    previewUrl?: string | null;
  } | null;
  occurred_at: string;
  created_at: string;
}

export interface TrackStat {
  id: string;
  title: string;
  artist: string;
  album: string;
  plays: number;
  durationMs: number;
  durationLabel: string;
  image: string | null;
}

export interface ArtistStat {
  id: string;
  name: string;
  plays: number;
  hours: number;
  image: string | null;
  genres: string[];
}

export interface AlbumStat {
  id: string;
  name: string;
  artist: string;
  plays: number;
  totalMinutes: number;
  image: string | null;
}

export interface GenreStat {
  name: string;
  percentage: number;
  hours: number;
}

export interface ListeningChartPoint {
  label: string;
  minutes: number;
}
