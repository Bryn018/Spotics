import type {
  SpoticsUser,
  DashboardPayload,
  AnalyticsResponse,
  ExportResponse,
  NowPlayingResponse,
  TrackStat,
  ArtistStat,
  AlbumStat,
  GenreStat,
  ListeningChartPoint,
  HourlyDataPoint,
  MusicTasteMetric,
  Achievement,
  Milestone,
  Highlight,
  Streak,
  ExportStat,
  ExportTrack,
  ExportArtist,
  ExportGenre,
  ExportRangeData,
  TimeRange,
} from '../types';

const DEV_PREVIEW_KEY = 'spotics-dev-preview';

export function isDevPreviewEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const url = new URL(window.location.href);
  if (url.searchParams.has('devpreview')) {
    const value = url.searchParams.get('devpreview') !== '0';
    if (value) localStorage.setItem(DEV_PREVIEW_KEY, '1');
    else localStorage.removeItem(DEV_PREVIEW_KEY);
    return value;
  }
  return localStorage.getItem(DEV_PREVIEW_KEY) === '1';
}

export function disableDevPreview(): void {
  localStorage.removeItem(DEV_PREVIEW_KEY);
  window.location.reload();
}

// Mock User
export const mockUser: SpoticsUser = {
  id: 'dev-user-001',
  email: 'dev@spotics.local',
  display_name: 'Dev User',
  avatar_url: 'https://i.pravatar.cc/300?u=dev-spotics',
  country: 'US',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2026-05-06T20:45:00Z',
};

// Helper to generate tracks
function generateMockTracks(count: number): TrackStat[] {
  const titles = ['Blinding Lights', 'Shape of You', 'Dance The Night', 'Flowers', 'Anti-Hero', 'Kill Bill', 'As It Was', 'Stay'];
  const artists = ['The Weeknd', 'Ed Sheeran', 'Dua Lipa', 'Miley Cyrus', 'Taylor Swift', 'SZA', 'Harry Styles', 'The Kid LAROI'];
  return Array.from({ length: count }, (_, i) => ({
    id: `track-${i + 1}`,
    title: titles[i % titles.length],
    artist: artists[i % artists.length],
    album: `Album ${Math.floor(i / 2) + 1}`,
    plays: 150 - i * 10,
    durationMs: 180000 + i * 5000,
    durationLabel: `${3 + Math.floor(i / 2)}:${String(30 + i).padStart(2, '0')}`,
    image: `https://picsum.photos/seed/track${i}/300/300`,
  }));
}

// Helper to generate artists
function generateMockArtists(count: number): ArtistStat[] {
  const names = ['The Weeknd', 'Ed Sheeran', 'Taylor Swift', 'Dua Lipa', 'SZA', 'Harry Styles', 'Miley Cyrus', 'The Kid LAROI'];
  return Array.from({ length: count }, (_, i) => ({
    id: `artist-${i + 1}`,
    name: names[i % names.length],
    plays: 200 - i * 15,
    hours: 25 - i * 1.5,
    image: `https://picsum.photos/seed/artist${i}/300/300`,
    genres: ['Pop', 'R&B', 'Electronic'].slice(0, 1 + (i % 3)),
  }));
}

// Helper to generate albums
function generateMockAlbums(count: number): AlbumStat[] {
  const names = ['After Hours', '÷ (Divide)', 'Midnights', 'Future Nostalgia', 'SOS', 'Harry\'s House', 'Endless Summer Vacation', 'F*CK LOVE'];
  return Array.from({ length: count }, (_, i) => ({
    id: `album-${i + 1}`,
    name: names[i % names.length],
    artist: ['The Weeknd', 'Ed Sheeran', 'Taylor Swift', 'Dua Lipa', 'SZA', 'Harry Styles', 'Miley Cyrus', 'The Kid LAROI'][i % 8],
    plays: 80 - i * 5,
    totalMinutes: 300 - i * 10,
    image: `https://picsum.photos/seed/album${i}/300/300`,
  }));
}

// Mock Dashboard Payload
export function getMockDashboardPayload(timeframe: TimeRange = 'medium_term'): DashboardPayload {
  return {
    hero: {
      totalTracks: 1247,
      totalArtists: 89,
      topArtist: 'The Weeknd',
    },
    stats: {
      totalMinutes: 8540,
      totalTracks: 1247,
      totalArtists: 89,
      averageDailyMinutes: 142,
      currentStreak: 12,
      peakHour: '21:00',
      bestDay: 'Friday',
      songsThisWeek: 23,
    },
    listeningScore: 87,
    topTracks: generateMockTracks(8),
    topArtists: generateMockArtists(6),
    topAlbums: generateMockAlbums(6),
    listeningChart: [
      { label: 'Mon', minutes: 120 },
      { label: 'Tue', minutes: 90 },
      { label: 'Wed', minutes: 150 },
      { label: 'Thu', minutes: 80 },
      { label: 'Fri', minutes: 200 },
      { label: 'Sat', minutes: 180 },
      { label: 'Sun', minutes: 110 },
    ],
    genreDistribution: [
      { name: 'Pop', percentage: 35, hours: 50 },
      { name: 'R&B', percentage: 25, hours: 35 },
      { name: 'Electronic', percentage: 20, hours: 28 },
      { name: 'Hip-Hop', percentage: 15, hours: 21 },
      { name: 'Rock', percentage: 5, hours: 7 },
    ],
  };
}

// Mock Analytics Response
export function getMockAnalyticsResponse(): AnalyticsResponse {
  return {
    stats: [
      { label: 'Total Listening Time', value: '142h 20m', change: '+12%', trend: 'up', icon: 'clock', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
      { label: 'Tracks Played', value: '1,247', change: '+8%', trend: 'up', icon: 'music', color: 'text-green-400', bgColor: 'bg-green-400/10' },
      { label: 'Unique Artists', value: '89', change: '+5%', trend: 'up', icon: 'user', color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
      { label: 'Listening Streak', value: '12 days', change: '0%', trend: 'same', icon: 'flame', color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    ],
    trends: Array.from({ length: 30 }, (_, i) => ({
      label: `Day ${i + 1}`,
      minutes: 100 + Math.floor(Math.random() * 100),
    })),
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      plays: Math.floor(Math.random() * 50) + 10,
    })),
    musicTaste: [
      { category: 'Pop', value: 85 },
      { category: 'R&B', value: 72 },
      { category: 'Electronic', value: 68 },
      { category: 'Hip-Hop', value: 55 },
      { category: 'Rock', value: 40 },
    ],
    topGenres: [
      { name: 'Pop', percentage: 35, hours: 50 },
      { name: 'R&B', percentage: 25, hours: 35 },
      { name: 'Electronic', percentage: 20, hours: 28 },
      { name: 'Hip-Hop', percentage: 15, hours: 21 },
      { name: 'Rock', percentage: 5, hours: 7 },
    ],
    achievements: [
      { id: 1, title: 'Marathon Listener', description: 'Listened for 100+ hours', icon: 'trophy', progress: 85, unlocked: false, color: 'text-yellow-400' },
      { id: 2, title: 'Genre Explorer', description: 'Listened to 10+ genres', icon: 'star', progress: 100, unlocked: true, color: 'text-purple-400' },
      { id: 3, title: 'Streak Master', description: '7-day listening streak', icon: 'flame', progress: 100, unlocked: true, color: 'text-orange-400' },
    ],
    milestones: [
      { id: 1, title: '1000 Tracks Played', date: '2026-04-15', completed: true },
      { id: 2, title: '50 Artists Discovered', date: '2026-03-20', completed: true },
      { id: 3, title: '200 Hours Listened', date: '2026-05-01', completed: false },
    ],
    highlights: [
      { id: 1, title: 'Top Artist: The Weeknd', icon: 'crown', color: 'text-yellow-400', date: '2026-05-06', followers: '12.3M' },
      { id: 2, title: 'Longest Streak: 12 days', icon: 'flame', color: 'text-orange-400', date: '2026-05-05' },
    ],
    streaks: [
      { days: 12, type: 'Daily Listening', icon: 'flame', active: true, description: 'Current streak' },
      { days: 7, type: 'New Discoveries', icon: 'sparkles', active: false, description: 'Previous streak' },
    ],
  };
}

// Mock Export Response
export function getMockExportResponse(): ExportResponse {
  const createRangeData = (title: string, period: string): ExportRangeData => ({
    title,
    period,
    stats: [
      { icon: 'clock', label: 'Total Time', value: '142h 20m', color: 'text-blue-400' },
      { icon: 'music', label: 'Tracks', value: '1,247', color: 'text-green-400' },
      { icon: 'user', label: 'Artists', value: '89', color: 'text-purple-400' },
      { icon: 'flame', label: 'Streak', value: '12 days', color: 'text-orange-400' },
    ],
    topTracks: generateMockTracks(5),
    topArtists: generateMockArtists(5),
    genres: [
      { name: 'Pop', value: 35, color: 'bg-pink-500' },
      { name: 'R&B', value: 25, color: 'bg-purple-500' },
      { name: 'Electronic', value: 20, color: 'bg-blue-500' },
      { name: 'Hip-Hop', value: 15, color: 'bg-green-500' },
      { name: 'Rock', value: 5, color: 'bg-red-500' },
    ],
  });

  return {
    weekly: createRangeData('Weekly Wrapped', 'Apr 30 - May 6, 2026'),
    monthly: createRangeData('Monthly Wrapped', 'April 2026'),
    alltime: createRangeData('All Time Wrapped', 'Since Jan 2024'),
  };
}

// Mock Now Playing
export const mockNowPlaying: NowPlayingResponse = {
  isPlaying: true,
  track: {
    id: 'track-now-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    image: 'https://picsum.photos/seed/now-playing/300/300',
    durationMs: 200000,
    progressMs: 120000,
    previewUrl: 'https://p.scdn.co/mp3-preview/example',
    explicit: false,
    spotifyUrl: 'https://open.spotify.com/track/example',
  },
};
