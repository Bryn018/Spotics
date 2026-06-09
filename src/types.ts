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
  color?: string;
}

export interface ListeningChartPoint {
  label: string;
  minutes: number;
}

export interface HourlyDataPoint {
  hour: string;
  plays: number;
}

export interface MusicTasteMetric {
  category: string;
  value: number;
}

export interface Streak {
  days: number;
  type: string;
  icon: string;
  active: boolean;
  description: string;
}

export interface ExportStat {
  icon: string;
  label: string;
  value: string;
  color: string;
}

export interface ExportTrack {
  title: string;
  artist: string;
  plays: number;
  image: string | null;
}

export interface ExportArtist {
  name: string;
  plays: number;
  image: string | null;
}

export interface ExportGenre {
  name: string;
  value: number;
  color: string;
}

export interface ExportRangeData {
  title: string;
  period: string;
  stats: ExportStat[];
  topTracks: ExportTrack[];
  topArtists: ExportArtist[];
  genres: ExportGenre[];
}
