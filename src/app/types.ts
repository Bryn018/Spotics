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
    currentStreak?: number;
    peakHour?: string;
    bestDay?: string;
    songsThisWeek?: number;
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

export interface NowPlayingTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  image: string | null;
  durationMs: number;
  progressMs: number;
  previewUrl: string | null;
  explicit: boolean;
  spotifyUrl: string | null;
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  track: NowPlayingTrack | null;
}

export type WrapTimeframe = 'daily' | 'weekly' | 'yearly';

export interface WrapReport<TPayload> {
  id: string;
  timeframe: WrapTimeframe;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  payload: TPayload;
}

export type IconName = 'trophy' | 'star' | 'flame' | 'crown' | 'sparkles' | 'heart' | 'award' | 'zap';

export interface DailyWrapPayload {
  slides: DailyWrapSlide[];
}

export type DailyWrapSlide =
  | {
      id: string;
      type: 'intro';
      title: string;
      subtitle: string;
      content: {
        totalTracks: number;
        totalMinutes: number;
        topGenre: string;
        mood: string;
      };
    }
  | {
      id: string;
      type: 'top-song';
      title: string;
      content: {
        track: string;
        artist: string;
        plays: number;
        image: string | null;
        duration: string;
      };
    }
  | {
      id: string;
      type: 'listening-time';
      title: string;
      content: {
        hours: number;
        minutes: number;
        comparison: string;
        peakHour: string;
        streak: number;
      };
    }
  | {
      id: string;
      type: 'discovery';
      title: string;
      content: {
        track: string;
        artist: string;
        image: string | null;
        addedToLibrary: boolean;
      };
    };

export interface WeeklyWrapPayload {
  slides: WeeklyWrapSlide[];
}

export type WeeklyWrapSlide =
  | {
      id: string;
      type: 'intro';
      title: string;
      subtitle: string;
      content: {
        totalTracks: number;
        totalHours: number;
        totalMinutes: number;
        uniqueArtists: number;
        topGenre: string;
      };
    }
  | {
      id: string;
      type: 'top-tracks';
      title: string;
      content: Array<{
        rank: number;
        track: string;
        artist: string;
        plays: number;
        image: string | null;
      }>;
    }
  | {
      id: string;
      type: 'top-artist';
      title: string;
      content: {
        artist: string;
        plays: number;
        hours: number;
        minutes: number;
        image: string | null;
        growth: string;
      };
    }
  | {
      id: string;
      type: 'stats';
      title: string;
      content: {
        dailyAverage: number;
        peakDay: string;
        peakDayTracks: number;
        longestSession: string;
        discoveries: number;
        streak: number;
      };
    }
  | {
      id: string;
      type: 'achievements';
      title: string;
      content: Array<{
        icon: IconName;
        title: string;
        desc: string;
        color: string;
      }>;
    };

export interface YearlyWrapPayload {
  slides: YearlyWrapSlide[];
}

export type YearlyWrapSlide =
  | {
      id: string;
      type: 'intro';
      title: string;
      subtitle: string;
      content: {
        totalTracks: number;
        totalHours: number;
        totalArtists: number;
        totalGenres: number;
      };
    }
  | {
      id: string;
      type: 'top-artist';
      title: string;
      content: {
        artist: string;
        plays: number;
        hours: number;
        minutes: number;
        image: string | null;
        percentile: string;
        globalRank: string;
      };
    }
  | {
      id: string;
      type: 'top-songs';
      title: string;
      content: Array<{
        rank: number;
        track: string;
        artist: string;
        plays: number;
        image: string | null;
      }>;
    }
  | {
      id: string;
      type: 'genres';
      title: string;
      content: {
        topGenre: string;
        percentage: number;
        genres: Array<{
          name: string;
          value: number;
          color: string;
        }>;
      };
    }
  | {
      id: string;
      type: 'listening-habits';
      title: string;
      content: {
        personality: string;
        description: string;
        traits: Array<{
          label: string;
          value: number;
          icon: IconName;
        }>;
        insights: string[];
      };
    }
  | {
      id: string;
      type: 'timeline';
      title: string;
      content: Array<{
        month: string;
        highlight: string;
        plays: number;
        mood: string;
      }>;
    }
  | {
      id: string;
      type: 'achievements';
      title: string;
      content: Array<{
        icon: IconName;
        title: string;
        desc: string;
        color: string;
      }>;
    }
  | {
      id: string;
      type: 'stats';
      title: string;
      content: {
        totalMinutes: number;
        songsPerDay: number;
        longestStreak: number;
        favoriteTime: string;
        topMonth: string;
        uniquePlays: number;
      };
    }
  | {
      id: string;
      type: 'thank-you';
      title: string;
      subtitle: string;
      content: {
        yearlyRank: string;
        totalListeners: string;
        shareMessage: string;
      };
    };

export interface WrapPayloadMap {
  daily: DailyWrapPayload;
  weekly: WeeklyWrapPayload;
  yearly: YearlyWrapPayload;
}
