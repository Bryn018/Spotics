import { supabaseAdmin } from '../lib/supabase';
import type {
  Activity,
  DailyWrapPayload,
  ListeningSummary,
  NormalizedListeningSummary,
  WeeklyWrapPayload,
  WrapPayloadMap,
  WrapReport,
  WrapTimeframe,
  YearlyWrapPayload,
} from '../types';
import type { WrapReportRecord } from '../types';

type SummaryPayload = NonNullable<NormalizedListeningSummary['payload']>;
type SummaryTrack = SummaryPayload['topTracks'][number];
type SummaryArtist = SummaryPayload['topArtists'][number];
type SummaryGenre = SummaryPayload['genreDistribution'][number];
type TrackLike = Activity | SummaryTrack | undefined;

const WRAP_TIMEFRAMES: WrapTimeframe[] = ['daily', 'weekly', 'yearly'];

interface BuildContext {
  summaries: Map<string, NormalizedListeningSummary>;
  activities: Activity[];
  now: Date;
}

interface BuildResult<TPayload> {
  periodStart: string;
  periodEnd: string;
  payload: TPayload;
}

type PayloadBuilder<TPayload> = (context: BuildContext) => BuildResult<TPayload>;

type GeneratorMap = {
  daily: PayloadBuilder<DailyWrapPayload>;
  weekly: PayloadBuilder<WeeklyWrapPayload>;
  yearly: PayloadBuilder<YearlyWrapPayload>;
};

const builders: GeneratorMap = {
  daily: buildDailyPayload,
  weekly: buildWeeklyPayload,
  yearly: buildYearlyPayload,
};

export async function generateWrapReports(userId: string) {
  const [{ data: summaryRows, error: summaryError }, { data: activityRows, error: activityError }] = await Promise.all([
    supabaseAdmin.from('listening_summaries').select('*').eq('user_id', userId),
    supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(200),
  ]);

  if (summaryError) throw summaryError;
  if (activityError) throw activityError;

  const summaries = new Map<string, NormalizedListeningSummary>();
  (summaryRows ?? []).forEach((row) => {
    const normalized = normalizeSummary(row as ListeningSummary);
    summaries.set(normalized.timeframe, normalized);
  });

  const activities = (activityRows ?? []) as Activity[];
  const now = new Date();

  for (const timeframe of WRAP_TIMEFRAMES) {
    const builder = builders[timeframe];
    const result = builder({ summaries, activities, now });

    await supabaseAdmin.from('wrap_reports').upsert(
      {
        user_id: userId,
        timeframe,
        period_start: result.periodStart,
        period_end: result.periodEnd,
        payload: result.payload,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,timeframe' },
    );
  }
}

export async function getWrapReportForUser<T extends WrapTimeframe>(
  userId: string,
  timeframe: T,
): Promise<WrapReport<WrapPayloadMap[T]> | null> {
  const { data, error } = await supabaseAdmin
    .from('wrap_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('timeframe', timeframe)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const record = data as WrapReportRecord;
  return {
    id: record.id,
    timeframe: record.timeframe,
    periodStart: record.period_start,
    periodEnd: record.period_end,
    generatedAt: record.generated_at,
    payload: record.payload as WrapPayloadMap[T],
  };
}

function normalizeSummary(summary: ListeningSummary): NormalizedListeningSummary {
  return {
    id: summary.id,
    timeframe: summary.timeframe,
    totals: {
      minutes: summary.total_minutes ?? 0,
      tracks: summary.total_tracks ?? 0,
      artists: summary.total_artists ?? 0,
    },
    payload: (summary.payload as NormalizedListeningSummary['payload']) ?? null,
    fetchedAt: summary.fetched_at,
  };
}

function buildDailyPayload({ summaries, activities, now }: BuildContext): BuildResult<DailyWrapPayload> {
  const summary = summaries.get('short_term');
  const start = startOfDay(now);
  const end = endOfDay(now);
  const todayActivities = activities.filter((activity) => new Date(activity.occurred_at) >= start);

  const totalMinutes = sumActivityMinutes(todayActivities) || (summary?.payload?.stats.totalMinutes ?? 0) / 30;
  const totalTracks = todayActivities.length || summary?.payload?.stats.totalTracks || 0;
  const topTrack = todayActivities[0] ?? summary?.payload?.topTracks?.[0];
  const secondTrack = todayActivities[1] ?? summary?.payload?.topTracks?.[1] ?? topTrack;
  const topGenre = summary?.payload?.genreDistribution?.[0]?.name ?? 'Pop';
  const mood = determineMood(totalMinutes, totalTracks);
  const comparison = buildComparisonLabel(totalMinutes, summary?.payload?.stats.averageDailyMinutes ?? totalMinutes);
  const peakHour = findPeakHour(todayActivities);
  const streak = computeStreak(activities, now);
  const addedToLibrary = secondTrack ? (isActivityTrack(secondTrack) ? secondTrack.activity_type !== 'listened' : true) : false;

  const slides = [
    {
      id: 'daily-intro',
      type: 'intro' as const,
      title: "Today's Musical Journey",
      subtitle: formatReadableDate(now),
      content: {
        totalTracks: totalTracks ?? 0,
        totalMinutes: Math.round(totalMinutes),
        topGenre,
        mood,
      },
    },
    {
      id: 'daily-top-song',
      type: 'top-song' as const,
      title: 'Your Top Song Today',
      content: {
        track: getTrackTitle(topTrack),
        artist: getTrackArtist(topTrack),
        plays: estimatePlaysFromActivity(topTrack) || 1,
        image: getTrackImage(topTrack) ?? null,
        duration: formatDurationLabel(topTrack),
      },
    },
    {
      id: 'daily-time',
      type: 'listening-time' as const,
      title: 'Time Well Spent',
      content: {
        hours: Math.floor(totalMinutes / 60),
        minutes: Math.round(totalMinutes % 60),
        comparison,
        peakHour,
        streak,
      },
    },
    {
      id: 'daily-discovery',
      type: 'discovery' as const,
      title: 'New Discovery',
      content: {
        track: getTrackTitle(secondTrack),
        artist: getTrackArtist(secondTrack),
        image: getTrackImage(secondTrack) ?? null,
        addedToLibrary,
      },
    },
  ];

  return {
    periodStart: formatDate(start),
    periodEnd: formatDate(end),
    payload: { slides },
  };
}

function buildWeeklyPayload({ summaries, activities, now }: BuildContext): BuildResult<WeeklyWrapPayload> {
  const summary = summaries.get('short_term');
  const start = startOfDay(addDays(now, -6));
  const end = endOfDay(now);
  const weekActivities = activities.filter((activity) => {
    const date = new Date(activity.occurred_at);
    return date >= start && date <= end;
  });

  const totalMinutes = sumActivityMinutes(weekActivities) || (summary?.payload?.stats.totalMinutes ?? 0) / 4;
  const totalTracks = weekActivities.length || summary?.payload?.stats.totalTracks || 0;
  const uniqueArtists = new Set(weekActivities.map((activity) => activity.subtitle ?? activity.title)).size || summary?.payload?.stats.totalArtists || 0;
  const topGenre = summary?.payload?.genreDistribution?.[0]?.name ?? 'Pop & Hip Hop';

  const topTracks = (summary?.payload?.topTracks ?? []).slice(0, 3).map((track, index) => ({
    rank: index + 1,
    track: track.title,
    artist: track.artist,
    plays: track.plays,
    image: track.image,
  }));

  const topArtist = summary?.payload?.topArtists?.[0];
  const dailyAverage = Number((totalTracks / 7).toFixed(1));
  const peakDayData = computePeakDay(weekActivities);
  const longestSession = buildLongestSessionLabel(totalMinutes);
  const discoveries = Math.max(1, Math.round(uniqueArtists * 0.15));
  const streak = computeStreak(activities, now);

  const achievements = buildWeeklyAchievements(totalMinutes, uniqueArtists, streak);

  const slides = [
    {
      id: 'weekly-intro',
      type: 'intro' as const,
      title: "This Week's Soundtrack",
      subtitle: `${formatMonthDay(start)} - ${formatMonthDay(end)}`,
      content: {
        totalTracks,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: Math.round(totalMinutes % 60),
        uniqueArtists,
        topGenre,
      },
    },
    {
      id: 'weekly-tracks',
      type: 'top-tracks' as const,
      title: 'Your Top 3 Tracks',
      content: topTracks,
    },
    {
      id: 'weekly-artist',
      type: 'top-artist' as const,
      title: 'Artist of the Week',
      content: {
        artist: topArtist?.name ?? 'Unknown Artist',
        plays: topArtist?.plays ?? 0,
        hours: Math.floor((topArtist?.hours ?? 0)),
        minutes: Math.round(((topArtist?.hours ?? 0) % 1) * 60),
        image: topArtist?.image ?? null,
        growth: `${calculateGrowthLabel(topArtist?.plays ?? 0)} from last week`,
      },
    },
    {
      id: 'weekly-stats',
      type: 'stats' as const,
      title: 'Week in Numbers',
      content: {
        dailyAverage,
        peakDay: peakDayData.day,
        peakDayTracks: peakDayData.count,
        longestSession,
        discoveries,
        streak,
      },
    },
    {
      id: 'weekly-achievements',
      type: 'achievements' as const,
      title: 'Weekly Achievements',
      content: achievements,
    },
  ];

  return {
    periodStart: formatDate(start),
    periodEnd: formatDate(end),
    payload: { slides },
  };
}

function buildYearlyPayload({ summaries, activities, now }: BuildContext): BuildResult<YearlyWrapPayload> {
  const summary = summaries.get('long_term') ?? summaries.get('medium_term');
  const start = startOfYear(now);
  const end = endOfYear(now);
  const totalMinutes = summary?.payload?.stats.totalMinutes ?? 0;
  const totalTracks = summary?.payload?.stats.totalTracks ?? 0;
  const totalArtists = summary?.payload?.stats.totalArtists ?? 0;
  const genres = summary?.payload?.genreDistribution ?? [];
  const topArtist = summary?.payload?.topArtists?.[0];
  const topTracks = (summary?.payload?.topTracks ?? []).slice(0, 5).map((track, index) => ({
    rank: index + 1,
    track: track.title,
    artist: track.artist,
    plays: track.plays,
    image: track.image,
  }));

  const timeline = buildYearTimeline(genres, totalTracks);
  const achievements = buildYearlyAchievements(totalMinutes, totalTracks, genres.length);
  const personality = determinePersonality(summary);
  const insights = buildYearlyInsights(summary, activities.length);

  const slides = [
    {
      id: 'yearly-intro',
      type: 'intro' as const,
      title: 'Your 2026 Wrapped',
      subtitle: 'A Year in Music',
      content: {
        totalTracks,
        totalHours: Math.round(totalMinutes / 60),
        totalArtists,
        totalGenres: genres.length,
      },
    },
    {
      id: 'yearly-artist',
      type: 'top-artist' as const,
      title: 'Your #1 Artist',
      content: {
        artist: topArtist?.name ?? 'Unknown Artist',
        plays: topArtist?.plays ?? 0,
        hours: Math.floor(topArtist?.hours ?? 0),
        minutes: Math.round(((topArtist?.hours ?? 0) % 1) * 60),
        image: topArtist?.image ?? null,
        percentile: formatPercentile(topArtist?.plays ?? 0, totalTracks),
        globalRank: formatGlobalRank(topArtist?.plays ?? 0),
      },
    },
    {
      id: 'yearly-songs',
      type: 'top-songs' as const,
      title: 'Your Top 5 Songs of the Year',
      content: topTracks,
    },
    {
      id: 'yearly-genres',
      type: 'genres' as const,
      title: 'Your Genre Journey',
      content: {
        topGenre: genres[0]?.name ?? 'Pop',
        percentage: genres[0]?.percentage ?? 0,
        genres: genres.slice(0, 5).map((genre) => ({
          name: genre.name,
          value: genre.percentage,
          color: pickGenreColor(genre.name),
        })),
      },
    },
    {
      id: 'yearly-habits',
      type: 'listening-habits' as const,
      title: 'Your Listening Personality',
      content: {
        personality: personality.title,
        description: personality.description,
        traits: personality.traits,
        insights,
      },
    },
    {
      id: 'yearly-timeline',
      type: 'timeline' as const,
      title: 'Year in Review',
      content: timeline,
    },
    {
      id: 'yearly-achievements',
      type: 'achievements' as const,
      title: 'Your 2026 Achievements',
      content: achievements,
    },
    {
      id: 'yearly-stats',
      type: 'stats' as const,
      title: 'By the Numbers',
      content: {
        totalMinutes: Math.round(totalMinutes),
        songsPerDay: totalTracks ? Math.round(totalTracks / 365) : 0,
        longestStreak: Math.max(1, computeStreak(activities, now)),
        favoriteTime: personality.favoriteTime,
        topMonth: timeline[2]?.month ?? 'Jun',
        uniquePlays: totalTracks,
      },
    },
    {
      id: 'yearly-thanks',
      type: 'thank-you' as const,
      title: 'Thank You for Listening',
      subtitle: "Here’s to another year of great music!",
      content: {
        yearlyRank: formatYearlyRank(totalTracks),
        totalListeners: '10M+',
        shareMessage: 'Share your 2026 Wrapped',
      },
    },
  ];

  return {
    periodStart: formatDate(start),
    periodEnd: formatDate(end),
    payload: { slides },
  };
}

function sumActivityMinutes(activities: Activity[]) {
  return activities.reduce((sum, activity) => {
    const durationMs = Number(activity.metadata?.durationMs) || 0;
    return sum + durationMs / 60000;
  }, 0);
}

function determineMood(totalMinutes: number, totalTracks: number) {
  if (totalMinutes > 150 || totalTracks > 40) return 'Energized';
  if (totalMinutes > 90) return 'Focused';
  if (totalTracks > 20) return 'Vibrant';
  return 'Chill';
}

function buildComparisonLabel(today: number, average: number) {
  if (!average) return 'on par with yesterday';
  const delta = ((today - average) / average) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(0)}% from yesterday`;
}

function findPeakHour(activities: Activity[]) {
  if (!activities.length) return '—';
  const buckets = new Map<number, number>();
  activities.forEach((activity) => {
    const hour = new Date(activity.occurred_at).getHours();
    buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
  });
  const [hour] = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0];
  return formatHourRange(hour);
}

function computeStreak(activities: Activity[], now: Date) {
  const days = new Set<string>();
  activities.forEach((activity) => {
    days.add(formatDate(startOfDay(new Date(activity.occurred_at))));
  });

  let streak = 0;
  let cursor = startOfDay(now);
  while (days.has(formatDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function getTrackTitle(track: TrackLike) {
  if (!track) return '—';
  return track.title ?? '—';
}

function getTrackArtist(track: TrackLike) {
  if (!track) return '—';
  return isSummaryTrack(track) ? track.artist : track.subtitle ?? '—';
}

function getTrackImage(track: TrackLike) {
  if (!track) return null;
  return isSummaryTrack(track) ? track.image ?? null : ((track.metadata?.image as string | null) ?? null);
}

function formatDurationLabel(track: TrackLike) {
  if (!track) return '0:00';
  if (isSummaryTrack(track) && track.durationLabel) return track.durationLabel;
  const durationMs = isActivityTrack(track) ? Number(track.metadata?.durationMs) || 0 : 0;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function estimatePlaysFromActivity(track: TrackLike) {
  if (!track) return 0;
  if (isSummaryTrack(track)) return track.plays;
  const durationMs = Number(track.metadata?.durationMs) || 0;
  return Math.max(1, Math.round((durationMs / 60000) * 2));
}

function computePeakDay(activities: Activity[]) {
  if (!activities.length) {
    return { day: 'Saturday', count: 0 };
  }
  const buckets = new Map<string, number>();
  activities.forEach((activity) => {
    const date = new Date(activity.occurred_at);
    const label = date.toLocaleDateString('en', { weekday: 'long' });
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  });
  const [day, count] = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0];
  return { day, count };
}

function buildLongestSessionLabel(totalMinutes: number) {
  const sessionMinutes = Math.max(30, Math.round(totalMinutes / 3));
  const hours = Math.floor(sessionMinutes / 60);
  const minutes = sessionMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function buildWeeklyAchievements(totalMinutes: number, uniqueArtists: number, streak: number) {
  return [
    {
      icon: 'trophy' as const,
      title: 'Music Marathon',
      desc: `Listened for ${Math.round(totalMinutes)} minutes`,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: 'star' as const,
      title: 'Variety King',
      desc: `Explored ${uniqueArtists} artists`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: 'flame' as const,
      title: 'Perfect Week',
      desc: `${streak}-day listening streak`,
      color: 'from-red-500 to-orange-500',
    },
  ];
}

function buildYearTimeline(genres: SummaryGenre[], totalTracks: number) {
  const templateMonths = ['Jan', 'Mar', 'Jun', 'Sep', 'Dec'];
  const moods = ['Chill', 'Energetic', 'Upbeat', 'Intense', 'Festive'];
  const highlights = ['Started the year strong', 'Pop took over', 'Summer vibes', 'Rock comeback', 'Holiday classics'];
  return templateMonths.map((month, index) => ({
    month,
    highlight: `${highlights[index]} with ${genres[index % genres.length]?.name ?? 'Pop'}`,
    plays: Math.max(100, Math.round(totalTracks / templateMonths.length) + index * 57),
    mood: moods[index] ?? 'Vibe',
  }));
}

function buildYearlyAchievements(totalMinutes: number, totalTracks: number, totalGenres: number) {
  return [
    {
      icon: 'crown' as const,
      title: 'Top Listener',
      desc: `Logged ${Math.round(totalMinutes / 60)} hours`,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: 'trophy' as const,
      title: 'Music Marathon',
      desc: `${totalTracks} tracks this year`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: 'sparkles' as const,
      title: 'Explorer Badge',
      desc: `Dove into ${totalGenres} genres`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: 'heart' as const,
      title: 'Collector',
      desc: 'Saved your favorites all year',
      color: 'from-red-500 to-pink-500',
    },
  ];
}

function determinePersonality(summary?: NormalizedListeningSummary) {
  const variety = summary?.payload?.genreDistribution?.length ?? 0;
  const traits = [
    { label: 'Variety', value: Math.min(100, variety * 8), icon: 'star' as const },
    { label: 'Discovery', value: Math.min(100, (summary?.payload?.topArtists?.length ?? 0) * 6), icon: 'zap' as const },
    { label: 'Consistency', value: Math.min(100, Math.round((summary?.payload?.stats.averageDailyMinutes ?? 0) * 2)), icon: 'award' as const },
  ];

  if (variety > 10) {
    return {
      title: 'The Explorer',
      description: 'You love discovering new music and artists',
      traits,
      favoriteTime: '8 PM - 11 PM',
    };
  }
  return {
    title: 'The Curator',
    description: 'You perfect playlists and return to trusted sounds',
    traits,
    favoriteTime: '5 PM - 8 PM',
  };
}

function buildYearlyInsights(summary: NormalizedListeningSummary | undefined, activityCount: number) {
  return [
    `Discovered ${summary?.payload?.topArtists?.length ?? 0} artists`,
    `Explored ${summary?.payload?.genreDistribution?.length ?? 0} genres`,
    `Logged ${activityCount} listening sessions`,
  ];
}

function pickGenreColor(name: string) {
  if (name.toLowerCase().includes('pop')) return 'from-purple-500 to-purple-600';
  if (name.toLowerCase().includes('hip')) return 'from-pink-500 to-pink-600';
  if (name.toLowerCase().includes('rock')) return 'from-blue-500 to-blue-600';
  if (name.toLowerCase().includes('elect')) return 'from-cyan-500 to-cyan-600';
  if (name.toLowerCase().includes('indie')) return 'from-green-500 to-green-600';
  return 'from-purple-500 to-pink-500';
}

function formatPercentile(topArtistPlays: number, totalTracks: number) {
  if (!totalTracks) return 'Top 25%';
  const ratio = Math.min(99, Math.max(1, Math.round((topArtistPlays / totalTracks) * 100)));
  return `Top ${Math.max(1, 100 - ratio)}%`;
}

function formatGlobalRank(topArtistPlays: number) {
  const rank = Math.max(1, Math.round(20000 - topArtistPlays * 10));
  return `#${rank.toLocaleString()}`;
}

function calculateGrowthLabel(plays: number) {
  if (!plays) return 'steady';
  const growth = Math.min(150, Math.max(-50, plays - 50));
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${growth}%`;
}

function formatYearlyRank(totalTracks: number) {
  const rank = Math.max(1, 1000 - Math.round(totalTracks / 10));
  return `#${rank}`;
}

function formatReadableDate(date: Date) {
  return date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMonthDay(date: Date) {
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatHourRange(hour: number) {
  const startLabel = formatHour(hour);
  const endLabel = formatHour((hour + 1) % 24);
  return `${startLabel} - ${endLabel}`;
}

function formatHour(hour: number) {
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const normalized = ((hour + 11) % 12) + 1;
  return `${normalized} ${meridiem}`;
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function isSummaryTrack(track: TrackLike): track is SummaryTrack {
  return Boolean(track && 'album' in track);
}

function isActivityTrack(track: TrackLike): track is Activity {
  return Boolean(track && 'activity_type' in track);
}
