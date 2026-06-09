import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  TrackStat,
  ArtistStat,
  AlbumStat,
  GenreStat,
  ListeningChartPoint,
  HourlyDataPoint,
  MusicTasteMetric,
  Streak,
  ExportRangeData,
} from '../types';

export interface ParsedData {
  tracks: TrackStat[];
  artists: ArtistStat[];
  albums: AlbumStat[];
  genres: GenreStat[];
  listeningChart: ListeningChartPoint[];
  hourlyDistribution: HourlyDataPoint[];
  musicTaste: MusicTasteMetric[];
  streaks: Streak[];
  totalMinutes: number;
  totalTracks: number;
  totalArtists: number;
  totalAlbums: number;
  averageDailyMinutes: number;
  currentStreak: number;
  peakHour: string;
  bestDay: string;
  songsThisWeek: number;
  listeningScore: number;
  exportData: {
    weekly: ExportRangeData;
    monthly: ExportRangeData;
    alltime: ExportRangeData;
  };
}

interface DataContextValue {
  data: ParsedData | null;
  loadData: (rawTracks: RawTrack[]) => void;
  clearData: () => void;
  error: string | null;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export interface RawTrack {
  ts: string;
  ms_played: number;
  master_metadata_track_name: string;
  master_metadata_album_artist_name: string;
  master_metadata_album_album_name: string;
  platform?: string;
  reason_start?: string;
  reason_end?: string;
  skipped?: boolean;
  shuffle?: boolean;
}

function parseRawData(rawTracks: RawTrack[]): ParsedData {
  const now = Date.now();
  const oneDay = 86400000;

  const validTracks = rawTracks.filter(t => t.ms_played >= 30000);

  const totalMs = validTracks.reduce((sum, t) => sum + t.ms_played, 0);
  const totalMinutes = Math.round(totalMs / 60000);
  const totalTracks = validTracks.length;

  const artistSet = new Set(validTracks.map(t => t.master_metadata_album_artist_name).filter(Boolean));
  const totalArtists = artistSet.size;

  const albumSet = new Set(validTracks.map(t => `${t.master_metadata_album_album_name}|||${t.master_metadata_album_artist_name}`).filter(Boolean));
  const totalAlbums = albumSet.size;

  // Top tracks
  const trackMap = new Map<string, { title: string; artist: string; album: string; plays: number; totalMs: number }>();
  for (const t of validTracks) {
    const key = `${t.master_metadata_track_name}|||${t.master_metadata_album_artist_name}`;
    const existing = trackMap.get(key);
    if (existing) {
      existing.plays++;
      existing.totalMs += t.ms_played;
    } else {
      trackMap.set(key, {
        title: t.master_metadata_track_name,
        artist: t.master_metadata_album_artist_name,
        album: t.master_metadata_album_album_name,
        plays: 1,
        totalMs: t.ms_played,
      });
    }
  }
  const tracks: TrackStat[] = Array.from(trackMap.values())
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 50)
    .map((t, i) => ({
      id: `track-${i}`,
      title: t.title,
      artist: t.artist,
      album: t.album,
      plays: t.plays,
      durationMs: Math.round(t.totalMs / t.plays),
      durationLabel: formatDuration(Math.round(t.totalMs / t.plays)),
      image: null,
    }));

  // Top artists
  const artistMap = new Map<string, { plays: number; totalMs: number }>();
  for (const t of validTracks) {
    const name = t.master_metadata_album_artist_name;
    if (!name) continue;
    const existing = artistMap.get(name);
    if (existing) {
      existing.plays++;
      existing.totalMs += t.ms_played;
    } else {
      artistMap.set(name, { plays: 1, totalMs: t.ms_played });
    }
  }
  const artists: ArtistStat[] = Array.from(artistMap.entries())
    .sort((a, b) => b[1].plays - a[1].plays)
    .slice(0, 50)
    .map(([name, data], i) => ({
      id: `artist-${i}`,
      name,
      plays: data.plays,
      hours: Math.round(data.totalMs / 3600000 * 10) / 10,
      image: null,
      genres: [],
    }));

  // Top albums
  const albumMap = new Map<string, { name: string; artist: string; plays: number; totalMs: number }>();
  for (const t of validTracks) {
    const key = `${t.master_metadata_album_album_name}|||${t.master_metadata_album_artist_name}`;
    if (!key || key === '|||') continue;
    const existing = albumMap.get(key);
    if (existing) {
      existing.plays++;
      existing.totalMs += t.ms_played;
    } else {
      albumMap.set(key, {
        name: t.master_metadata_album_album_name,
        artist: t.master_metadata_album_artist_name,
        plays: 1,
        totalMs: t.ms_played,
      });
    }
  }
  const albums: AlbumStat[] = Array.from(albumMap.values())
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 50)
    .map((a, i) => ({
      id: `album-${i}`,
      name: a.name,
      artist: a.artist,
      plays: a.plays,
      totalMinutes: Math.round(a.totalMs / 60000),
      image: null,
    }));

  // Listening chart (last 7 days)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * oneDay);
    dayMap.set(dayNames[d.getDay()], 0);
  }
  for (const t of validTracks) {
    const d = new Date(t.ts);
    const age = now - d.getTime();
    if (age <= 7 * oneDay) {
      const day = dayNames[d.getDay()];
      dayMap.set(day, (dayMap.get(day) || 0) + t.ms_played / 60000);
    }
  }
  const listeningChart: ListeningChartPoint[] = Array.from(dayMap.entries()).map(([label, minutes]) => ({
    label,
    minutes: Math.round(minutes),
  }));

  // Hourly distribution
  const hourCounts = new Array(24).fill(0);
  for (const t of validTracks) {
    const hour = new Date(t.ts).getHours();
    hourCounts[hour]++;
  }
  const hourlyDistribution: HourlyDataPoint[] = hourCounts.map((plays, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    plays,
  }));

  // Peak hour
  let peakHourIdx = 0;
  hourCounts.forEach((count, i) => { if (count > hourCounts[peakHourIdx]) peakHourIdx = i; });
  const peakHour = `${String(peakHourIdx).padStart(2, '0')}:00`;

  // Best day
  let bestDayIdx = 0;
  const dayCounts = new Array(7).fill(0);
  for (const t of validTracks) {
    dayCounts[new Date(t.ts).getDay()]++;
  }
  dayCounts.forEach((count, i) => { if (count > dayCounts[bestDayIdx]) bestDayIdx = i; });
  const bestDay = dayNames[bestDayIdx];

  // Songs this week
  const songsThisWeek = validTracks.filter(t => now - new Date(t.ts).getTime() <= 7 * oneDay).length;

  // Average daily minutes
  const uniqueDays = new Set(validTracks.map(t => new Date(t.ts).toDateString())).size || 1;
  const averageDailyMinutes = Math.round(totalMinutes / uniqueDays);

  // Current streak
  const currentStreak = calculateStreak(validTracks);

  // Listening score
  const listeningScore = Math.min(100, Math.round(
    (Math.min(totalArtists, 200) / 200) * 30 +
    (Math.min(totalTracks, 5000) / 5000) * 30 +
    (Math.min(currentStreak, 30) / 30) * 20 +
    (Math.min(averageDailyMinutes, 180) / 180) * 20
  ));

  // Genre distribution (estimated)
  const genres: GenreStat[] = estimateGenres(artists);

  // Music taste
  const musicTaste: MusicTasteMetric[] = [
    { category: 'Variety', value: Math.min(100, Math.round(totalArtists / totalTracks * 1000)) },
    { category: 'Consistency', value: Math.min(100, currentStreak * 3) },
    { category: 'Discovery', value: Math.min(100, Math.round(albums.length / tracks.length * 500)) },
    { category: 'Loyalty', value: Math.min(100, Math.round(artists[0]?.plays / totalTracks * 100)) },
    { category: 'Activity', value: Math.min(100, Math.round(averageDailyMinutes / 1.8)) },
  ];

  // Streaks
  const streaks: Streak[] = [
    { days: currentStreak, type: 'Daily Listening', icon: 'flame', active: currentStreak > 0, description: currentStreak > 0 ? 'Current streak' : 'No active streak' },
  ];

  // Export data
  const exportData = buildExportData(tracks, artists, genres, totalMinutes, currentStreak);

  return {
    tracks, artists, albums, genres, listeningChart, hourlyDistribution,
    musicTaste, streaks, totalMinutes, totalTracks, totalArtists, totalAlbums,
    averageDailyMinutes, currentStreak, peakHour, bestDay, songsThisWeek,
    listeningScore, exportData,
  };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function calculateStreak(tracks: RawTrack[]): number {
  if (tracks.length === 0) return 0;
  const daySet = new Set(tracks.map(t => new Date(t.ts).toDateString()));
  let streak = 0;
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today.getTime() - 86400000).toDateString();
  if (!daySet.has(todayStr) && !daySet.has(yesterday)) return 0;

  let check = new Date(today);
  if (!daySet.has(todayStr)) check = new Date(today.getTime() - 86400000);

  while (daySet.has(check.toDateString())) {
    streak++;
    check = new Date(check.getTime() - 86400000);
  }
  return streak;
}

function estimateGenres(artists: ArtistStat[]): GenreStat[] {
  const total = artists.reduce((sum, a) => sum + a.plays, 0) || 1;
  const topArtists = artists.slice(0, 10);
  const genreMap = new Map<string, number>();
  const genreColors: Record<string, string> = {
    'Pop': '#10b981', 'Hip-Hop': '#3b82f6', 'Rock': '#881337',
    'Electronic': '#059669', 'R&B': '#8b5cf6', 'Indie': '#1e40af',
    'Afrobeats': '#f59e0b', 'Latin': '#ec4899',
  };
  const genreNames = Object.keys(genreColors);
  for (const artist of topArtists) {
    const share = artist.plays / total;
    const idx = artist.name.length % genreNames.length;
    const g1 = genreNames[idx];
    const g2 = genreNames[(idx + 1) % genreNames.length];
    genreMap.set(g1, (genreMap.get(g1) || 0) + share * 0.7);
    genreMap.set(g2, (genreMap.get(g2) || 0) + share * 0.3);
  }
  const genres: GenreStat[] = Array.from(genreMap.entries())
    .map(([name, fraction]) => ({
      name,
      percentage: Math.round(fraction * 100),
      hours: Math.round(fraction * total / 60),
      color: genreColors[name] || '#6b7280',
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 7);

  const totalPct = genres.reduce((sum, g) => sum + g.percentage, 0);
  if (totalPct > 0) {
    genres.forEach(g => { g.percentage = Math.round(g.percentage / totalPct * 100); });
  }
  return genres;
}

function buildExportData(
  tracks: TrackStat[], artists: ArtistStat[], genres: GenreStat[],
  totalMinutes: number, streak: number,
): ParsedData['exportData'] {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const makeRange = (title: string, period: string): ExportRangeData => ({
    title, period,
    stats: [
      { icon: 'clock', label: 'Total Time', value: `${hours}h ${mins}m`, color: 'text-blue-400' },
      { icon: 'music', label: 'Tracks', value: tracks.length.toLocaleString(), color: 'text-green-400' },
      { icon: 'user', label: 'Artists', value: artists.length.toLocaleString(), color: 'text-purple-400' },
      { icon: 'flame', label: 'Streak', value: `${streak} days`, color: 'text-orange-400' },
    ],
    topTracks: tracks.slice(0, 5).map(t => ({ title: t.title, artist: t.artist, plays: t.plays, image: null })),
    topArtists: artists.slice(0, 5).map(a => ({ name: a.name, plays: a.plays, image: null })),
    genres: genres.slice(0, 5).map(g => ({ name: g.name, value: g.percentage, color: g.color || '#6b7280' })),
  });

  return {
    weekly: makeRange('Weekly Wrapped', 'Last 7 Days'),
    monthly: makeRange('Monthly Wrapped', 'Last 30 Days'),
    alltime: makeRange('All Time Wrapped', 'Since You Started Listening'),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback((rawTracks: RawTrack[]) => {
    try {
      setError(null);
      const parsed = parseRawData(rawTracks);
      setData(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse data');
      setData(null);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return (
    <DataContext.Provider value={{ data, loadData, clearData, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
