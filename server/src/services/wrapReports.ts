import { pool } from '../lib/db';
import type {
  Activity,
  DailyWrapPayload,
  IconName,
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
  const [summaryResult, activityResult] = await Promise.all([
    pool.query('SELECT * FROM listening_summaries WHERE user_id = $1', [userId]),
    pool.query(
      'SELECT * FROM activities WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT 500',
      [userId],
    ),
  ]);

  const summaries = new Map<string, NormalizedListeningSummary>();
  summaryResult.rows.forEach((row) => {
    const normalized = normalizeSummary(row as ListeningSummary);
    summaries.set(normalized.timeframe, normalized);
  });

  const activities = activityResult.rows as Activity[];
  const now = new Date();

  for (const timeframe of WRAP_TIMEFRAMES) {
    const builder = builders[timeframe];
    const result = builder({ summaries, activities, now });

    await pool.query(
      `INSERT INTO wrap_reports
         (user_id, timeframe, period_start, period_end, payload, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, timeframe) DO UPDATE
         SET period_start = EXCLUDED.period_start,
             period_end   = EXCLUDED.period_end,
             payload      = EXCLUDED.payload,
             generated_at = EXCLUDED.generated_at`,
        [
          userId,
          timeframe,
          result.periodStart,
          result.periodEnd,
          result.payload,
          new Date().toISOString(),
        ],
    );
  }
}

export async function getWrapReportForUser<T extends WrapTimeframe>(
  userId: string,
  timeframe: T,
): Promise<WrapReport<WrapPayloadMap[T]> | null> {
  const result = await pool.query(
    'SELECT * FROM wrap_reports WHERE user_id = $1 AND timeframe = $2',
    [userId, timeframe],
  );

  if (!result.rows[0]) {
    return null;
  }

  const record = result.rows[0] as WrapReportRecord;
  return {
    id: record.id,
    timeframe: record.timeframe,
    periodStart: record.period_start,
    periodEnd: record.period_end,
    generatedAt: record.generated_at,
    payload: record.payload as unknown as WrapPayloadMap[T],
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
    payload: ((summary.payload as unknown) as NormalizedListeningSummary['payload']) ?? null,
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
  const mood = determineMood(totalMinutes, totalTracks, topGenre);
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
      content: { totalTracks: totalTracks ?? 0, totalMinutes: Math.round(totalMinutes), topGenre, mood },
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

  return { periodStart: formatDate(start), periodEnd: formatDate(end), payload: { slides } };
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
  const achievements = buildWeeklyAchievements(totalMinutes, uniqueArtists, streak, totalTracks);

  const slides = [
    {
      id: 'weekly-intro',
      type: 'intro' as const,
      title: "This Week's Soundtrack",
      subtitle: `${formatMonthDay(start)} - ${formatMonthDay(end)}`,
      content: { totalTracks, totalHours: Math.floor(totalMinutes / 60), totalMinutes: Math.round(totalMinutes % 60), uniqueArtists, topGenre },
    },
    { id: 'weekly-tracks', type: 'top-tracks' as const, title: 'Your Top 3 Tracks', content: topTracks },
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
      content: { dailyAverage, peakDay: peakDayData.day, peakDayTracks: peakDayData.count, longestSession, discoveries, streak },
    },
    { id: 'weekly-achievements', type: 'achievements' as const, title: 'Weekly Achievements', content: achievements },
  ];

  return { periodStart: formatDate(start), periodEnd: formatDate(end), payload: { slides } };
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

  // Build timeline from actual monthly activity data
  const timeline = buildYearTimelineFromActivities(activities, genres, totalTracks);
  const achievements = buildYearlyAchievements(totalMinutes, totalTracks, genres.length, activities.length);
  const personality = determinePersonality(summary, activities);
  const insights = buildYearlyInsights(summary, activities);

  const slides = [
    {
      id: 'yearly-intro',
      type: 'intro' as const,
      title: `Your ${now.getFullYear()} Wrapped`,
      subtitle: 'A Year in Music',
      content: { totalTracks, totalHours: Math.round(totalMinutes / 60), totalArtists, totalGenres: genres.length },
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
    { id: 'yearly-songs', type: 'top-songs' as const, title: 'Your Top 5 Songs of the Year', content: topTracks },
    {
      id: 'yearly-genres',
      type: 'genres' as const,
      title: 'Your Genre Journey',
      content: {
        topGenre: genres[0]?.name ?? 'Pop',
        percentage: genres[0]?.percentage ?? 0,
        genres: genres.slice(0, 5).map((genre) => ({ name: genre.name, value: genre.percentage, color: pickGenreColor(genre.name) })),
      },
    },
    {
      id: 'yearly-habits',
      type: 'listening-habits' as const,
      title: 'Your Listening Personality',
      content: { personality: personality.title, description: personality.description, traits: personality.traits, insights },
    },
    { id: 'yearly-timeline', type: 'timeline' as const, title: 'Year in Review', content: timeline },
    { id: 'yearly-achievements', type: 'achievements' as const, title: `Your ${now.getFullYear()} Achievements`, content: achievements },
    {
      id: 'yearly-stats',
      type: 'stats' as const,
      title: 'By the Numbers',
      content: {
        totalMinutes: Math.round(totalMinutes),
        songsPerDay: totalTracks ? Math.round(totalTracks / 365) : 0,
        longestStreak: Math.max(1, computeStreak(activities, now)),
        favoriteTime: personality.favoriteTime,
        topMonth: timeline.reduce((max, m) => m.plays > max.plays ? m : max, timeline[0])?.month ?? 'Jun',
        uniquePlays: totalTracks,
      },
    },
    {
      id: 'yearly-thanks',
      type: 'thank-you' as const,
      title: 'Thank You for Listening',
      subtitle: "Here's to another year of great music!",
      content: { yearlyRank: formatYearlyRank(totalTracks), totalListeners: '10M+', shareMessage: `Share your ${now.getFullYear()} Wrapped` },
    },
  ];

  return { periodStart: formatDate(start), periodEnd: formatDate(end), payload: { slides } };
}

// ---- helpers ----

function sumActivityMinutes(activities: Activity[]) {
  return activities.reduce((sum, activity) => {
    const durationMs = Number(activity.metadata?.durationMs) || 0;
    return sum + durationMs / 60000;
  }, 0);
}

function determineMood(totalMinutes: number, totalTracks: number, topGenre: string = '') {
  const genre = topGenre.toLowerCase();
  if (genre.includes('metal') || genre.includes('rock') || genre.includes('punk')) return 'Energetic';
  if (genre.includes('jazz') || genre.includes('classical') || genre.includes('ambient')) return 'Relaxed';
  if (genre.includes('electronic') || genre.includes('dance') || genre.includes('edm')) return 'Energized';
  if (genre.includes('r&b') || genre.includes('soul')) return 'Chill';
  if (totalMinutes > 150 || totalTracks > 40) return 'Energized';
  if (totalMinutes > 90) return 'Focused';
  if (totalTracks > 20) return 'Vibrant';
  return 'Chill';
}

function buildComparisonLabel(today: number, average: number) {
  if (!average || average === 0) return 'on par with yesterday';
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
  const topBucket = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0];
  if (!topBucket) return '—';
  return formatHourRange(topBucket[0]);
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

function getTrackTitle(track: TrackLike) { return track?.title ?? '—'; }
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
  const seconds = Math.floor((durationMs % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
function estimatePlaysFromActivity(track: TrackLike) {
  if (!track) return 0;
  if (isSummaryTrack(track)) return track.plays;
  const durationMs = Number(track.metadata?.durationMs) || 0;
  return Math.max(1, Math.round((durationMs / 60000) * 2));
}
function computePeakDay(activities: Activity[]) {
  if (!activities.length) return { day: 'Saturday', count: 0 };
  const buckets = new Map<string, number>();
  activities.forEach((activity) => {
    const label = new Date(activity.occurred_at).toLocaleDateString('en', { weekday: 'long' });
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  });
  const top = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0];
  return top ? { day: top[0], count: top[1] } : { day: 'Saturday', count: 0 };
}
function buildLongestSessionLabel(totalMinutes: number) {
  const sessionMinutes = Math.max(30, Math.round(totalMinutes / 3));
  const hours = Math.floor(sessionMinutes / 60);
  const minutes = sessionMinutes % 60;
  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
}
function buildWeeklyAchievements(totalMinutes: number, uniqueArtists: number, streak: number, totalTracks: number) {
  const achievements: Array<{ icon: IconName; title: string; desc: string; color: string }> = [
    { icon: 'trophy', title: 'Music Marathon', desc: `Listened for ${Math.round(totalMinutes)} minutes`, color: 'from-yellow-500 to-orange-500' },
    { icon: 'star', title: 'Variety King', desc: `Explored ${uniqueArtists} artists`, color: 'from-purple-500 to-pink-500' },
    { icon: 'flame', title: 'Perfect Week', desc: `${streak}-day listening streak`, color: 'from-red-500 to-orange-500' },
  ];
  if (totalTracks > 50) {
    achievements.push({ icon: 'zap', title: 'Binge Listener', desc: `${totalTracks} tracks this week`, color: 'from-blue-500 to-cyan-500' });
  }
  return achievements;
}

function buildYearTimelineFromActivities(activities: Activity[], genres: SummaryGenre[], totalTracks: number) {
  // Group activities by month and calculate actual stats
  const monthData = new Map<string, { plays: number; durationMs: number; tracks: Set<string> }>();
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  activities.forEach((activity) => {
    const date = new Date(activity.occurred_at);
    const month = monthLabels[date.getMonth()];
    const existing = monthData.get(month) ?? { plays: 0, durationMs: 0, tracks: new Set<string>() };
    existing.plays += 1;
    existing.durationMs += Number(activity.metadata?.durationMs) || 0;
    existing.tracks.add(activity.title);
    monthData.set(month, existing);
  });

  // If we have actual monthly data, use it; otherwise fall back to summary-based estimates
  const hasRealData = monthData.size > 0;
  const moods = ['Chill', 'Energetic', 'Upbeat', 'Intense', 'Festive', 'Focused', 'Relaxed', 'Vibrant'];
  const highlights = [
    'Started the year strong',
    'Deep dive into new sounds',
    'Spring vibes took over',
    'Summer anthems on repeat',
    'Autumn reflections',
    'Holiday classics',
    'Mid-year discovery phase',
    'Late night sessions',
    'Genre exploration month',
    'Peak listening energy',
    'Cozy indoor tunes',
    'Year-end favorites',
  ];

  // Select 5 representative months (spaced out)
  const selectedMonths = hasRealData
    ? Array.from(monthData.keys()).sort((a, b) => monthLabels.indexOf(a) - monthLabels.indexOf(b))
    : ['Jan', 'Mar', 'May', 'Aug', 'Nov'];

  // If we have more than 5 months, pick the most active ones spaced out
  const finalMonths = selectedMonths.length > 5
    ? [selectedMonths[0], selectedMonths[Math.floor(selectedMonths.length * 0.25)], selectedMonths[Math.floor(selectedMonths.length * 0.5)], selectedMonths[Math.floor(selectedMonths.length * 0.75)], selectedMonths[selectedMonths.length - 1]]
    : selectedMonths;

  return finalMonths.map((month, index) => {
    const data = monthData.get(month);
    const plays = data?.plays ?? Math.max(50, Math.round(totalTracks / 12));
    const topGenre = genres[index % genres.length]?.name ?? 'Pop';
    return {
      month,
      highlight: data
        ? `${highlights[monthLabels.indexOf(month) % highlights.length]} with ${plays} plays`
        : `${highlights[index]} with ${topGenre}`,
      plays,
      mood: moods[monthLabels.indexOf(month) % moods.length],
    };
  });
}

function buildYearlyAchievements(totalMinutes: number, totalTracks: number, totalGenres: number, activityCount: number) {
  const achievements: Array<{ icon: IconName; title: string; desc: string; color: string }> = [
    { icon: 'crown', title: 'Top Listener', desc: `Logged ${Math.round(totalMinutes / 60)} hours`, color: 'from-yellow-500 to-orange-500' },
    { icon: 'trophy', title: 'Music Marathon', desc: `${totalTracks} tracks this year`, color: 'from-purple-500 to-pink-500' },
  ];

  if (totalGenres > 3) {
    achievements.push({ icon: 'sparkles', title: 'Explorer Badge', desc: `Dove into ${totalGenres} genres`, color: 'from-blue-500 to-cyan-500' });
  }
  if (activityCount > 100) {
    achievements.push({ icon: 'heart', title: 'Collector', desc: `${activityCount} listening sessions`, color: 'from-red-500 to-pink-500' });
  }
  if (totalMinutes > 1000) {
    achievements.push({ icon: 'zap', title: 'Power User', desc: 'Over 1,000 minutes of music', color: 'from-emerald-500 to-green-500' });
  }

  return achievements;
}

function determinePersonality(summary?: NormalizedListeningSummary, activities?: Activity[]) {
  const variety = summary?.payload?.genreDistribution?.length ?? 0;
  const avgDailyMinutes = summary?.payload?.stats.averageDailyMinutes ?? 0;
  const totalTracks = summary?.payload?.stats.totalTracks ?? 0;

  // Calculate actual favorite listening time from activities
  const favoriteTime = calculateFavoriteTime(activities ?? []);

  const traits = [
    { label: 'Variety', value: Math.min(100, variety * 10), icon: 'star' as const },
    { label: 'Discovery', value: Math.min(100, (summary?.payload?.topArtists?.length ?? 0) * 5), icon: 'zap' as const },
    { label: 'Consistency', value: Math.min(100, Math.round(avgDailyMinutes * 2)), icon: 'award' as const },
  ];

  // Determine personality based on actual listening patterns
  if (variety > 8 && totalTracks > 100) {
    return { title: 'The Explorer', description: 'You love discovering new music across many genres and artists', traits, favoriteTime };
  }
  if (avgDailyMinutes > 60) {
    return { title: 'The Devotee', description: 'Music is a constant companion in your daily life', traits, favoriteTime };
  }
  if (variety < 4 && totalTracks > 50) {
    return { title: 'The Curator', description: 'You perfect playlists and return to trusted sounds', traits, favoriteTime };
  }
  if (avgDailyMinutes < 20 && totalTracks > 30) {
    return { title: 'The Casual', description: 'You enjoy music in bursts with focused listening', traits, favoriteTime };
  }
  return { title: 'The Enthusiast', description: 'You have a healthy appetite for music across different moods', traits, favoriteTime };
}

function calculateFavoriteTime(activities: Activity[]): string {
  if (!activities.length) return '6 PM - 9 PM';

  const hourBuckets = new Map<number, number>();
  activities.forEach((activity) => {
    const hour = new Date(activity.occurred_at).getHours();
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);
  });

  // Group into time ranges
  const ranges = [
    { label: 'Morning (6AM - 12PM)', hours: [6, 7, 8, 9, 10, 11] },
    { label: 'Afternoon (12PM - 6PM)', hours: [12, 13, 14, 15, 16, 17] },
    { label: 'Evening (6PM - 12AM)', hours: [18, 19, 20, 21, 22, 23] },
    { label: 'Late Night (12AM - 6AM)', hours: [0, 1, 2, 3, 4, 5] },
  ];

  let maxCount = 0;
  let favoriteRange = ranges[2]; // default evening

  for (const range of ranges) {
    const count = range.hours.reduce((sum, h) => sum + (hourBuckets.get(h) ?? 0), 0);
    if (count > maxCount) {
      maxCount = count;
      favoriteRange = range;
    }
  }

  // Find peak hour within favorite range
  let peakHour = favoriteRange.hours[0];
  let peakCount = 0;
  for (const hour of favoriteRange.hours) {
    const count = hourBuckets.get(hour) ?? 0;
    if (count > peakCount) {
      peakCount = count;
      peakHour = hour;
    }
  }

  return `${formatHour(peakHour)} - ${formatHour((peakHour + 2) % 24)}`;
}

function buildYearlyInsights(summary: NormalizedListeningSummary | undefined, activities: Activity[]) {
  const insights: string[] = [];

  const artistCount = summary?.payload?.topArtists?.length ?? 0;
  const genreCount = summary?.payload?.genreDistribution?.length ?? 0;
  const totalMinutes = summary?.payload?.stats.totalMinutes ?? 0;

  if (artistCount > 0) {
    insights.push(`Discovered ${artistCount} top artists`);
  }
  if (genreCount > 0) {
    insights.push(`Explored ${genreCount} different genres`);
  }
  if (activities.length > 0) {
    insights.push(`Logged ${activities.length} listening sessions`);
  }
  if (totalMinutes > 60) {
    insights.push(`Spent ${Math.round(totalMinutes / 60)} hours with your favorite music`);
  }
  const topArtist = summary?.payload?.topArtists?.[0];
  if (topArtist) {
    insights.push(`Your top artist was ${topArtist.name}`);
  }

  return insights.length > 0 ? insights : ['Keep listening to build your insights!'];
}

function pickGenreColor(name: string) {
  const n = name.toLowerCase();
  if (n.includes('pop')) return 'from-purple-500 to-purple-600';
  if (n.includes('hip') || n.includes('rap')) return 'from-pink-500 to-pink-600';
  if (n.includes('rock')) return 'from-blue-500 to-blue-600';
  if (n.includes('elect') || n.includes('house') || n.includes('techno')) return 'from-cyan-500 to-cyan-600';
  if (n.includes('indie')) return 'from-green-500 to-green-600';
  if (n.includes('r&b') || n.includes('soul')) return 'from-amber-500 to-orange-600';
  if (n.includes('jazz')) return 'from-yellow-500 to-amber-600';
  if (n.includes('classical')) return 'from-rose-500 to-pink-600';
  if (n.includes('country')) return 'from-emerald-500 to-teal-600';
  if (n.includes('metal')) return 'from-red-600 to-rose-700';
  return 'from-purple-500 to-pink-500';
}

function formatPercentile(topArtistPlays: number, totalTracks: number) {
  if (!totalTracks) return 'Top 25%';
  const ratio = Math.min(99, Math.max(1, Math.round((topArtistPlays / totalTracks) * 100)));
  return `Top ${Math.max(1, 100 - ratio)}%`;
}

function formatGlobalRank(topArtistPlays: number) {
  return `#${Math.max(1, Math.round(20000 - topArtistPlays * 10)).toLocaleString()}`;
}

function calculateGrowthLabel(plays: number) {
  if (!plays) return 'steady';
  const growth = Math.min(150, Math.max(-50, plays - 50));
  return `${growth >= 0 ? '+' : ''}${growth}%`;
}

function formatYearlyRank(totalTracks: number) {
  return `#${Math.max(1, 1000 - Math.round(totalTracks / 10))}`;
}

function formatReadableDate(date: Date) {
  return date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}
function formatMonthDay(date: Date) {
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
function formatDate(date: Date) { return date.toISOString().slice(0, 10); }
function startOfDay(date: Date) { const c = new Date(date); c.setHours(0, 0, 0, 0); return c; }
function endOfDay(date: Date) { const c = new Date(date); c.setHours(23, 59, 59, 999); return c; }
function addDays(date: Date, amount: number) { const c = new Date(date); c.setDate(c.getDate() + amount); return c; }
function formatHourRange(hour: number) { return `${formatHour(hour)} - ${formatHour((hour + 1) % 24)}`; }
function formatHour(hour: number) { const m = hour >= 12 ? 'PM' : 'AM'; return `${((hour + 11) % 12) + 1} ${m}`; }
function startOfYear(date: Date) { return new Date(date.getFullYear(), 0, 1); }
function endOfYear(date: Date) { return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999); }
function isSummaryTrack(track: TrackLike): track is SummaryTrack { return Boolean(track && 'album' in track); }
function isActivityTrack(track: TrackLike): track is Activity { return Boolean(track && 'activity_type' in track); }
