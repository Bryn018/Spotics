import { Router, type Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, type AuthedRequest } from '../middleware/requireAuth';
import { pool } from '../lib/db';
import { syncUserListeningData, syncRecentActivity } from '../services/spotifySync';
import { getSpotifyClientForUser } from '../lib/spotifyClient';
import { generateWrapReports, getWrapReportForUser } from '../services/wrapReports';
import type {
  Activity,
  AnalyticsResponse,
  DashboardPayload,
  DashboardResponse,
  ExportResponse,
  ListeningSummary,
  NormalizedListeningSummary,
  TimeRange,
  WrapTimeframe,
} from '../types';

const router = Router();

const timeframeSchema = z
  .enum(['short_term', 'medium_term', 'long_term'])
  .default('medium_term') satisfies z.ZodType<TimeRange>;

const wrapTimeframeSchema = z
  .enum(['daily', 'weekly', 'yearly'])
  .default('daily') satisfies z.ZodType<WrapTimeframe>;

const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

router.use(requireAuth);

router.get(
  '/me',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await pool.query(
      'SELECT id, email, display_name, avatar_url, country, created_at, updated_at FROM users WHERE id = $1',
      [req.auth!.userId],
    );
    res.json({ success: true, data: result.rows[0] ?? null });
  }),
);

router.get(
  '/summaries',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const timeframe = timeframeSchema.parse(req.query.timeframe);

    let queryText: string;
    let params: unknown[];

    if (req.query.timeframe) {
      queryText = `SELECT * FROM listening_summaries WHERE user_id = $1 AND timeframe = $2 ORDER BY fetched_at DESC`;
      params = [req.auth!.userId, timeframe];
    } else {
      queryText = `SELECT * FROM listening_summaries WHERE user_id = $1 ORDER BY fetched_at DESC`;
      params = [req.auth!.userId];
    }

    const result = await pool.query(queryText, params);
    const normalized = result.rows.map(normalizeSummary);
    res.json({ success: true, data: normalized });
  }),
);

router.post(
  '/summaries/sync',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await syncUserListeningData(req.auth!.userId);
    res.status(202).json({ success: true });
  }),
);

// Lightweight endpoint for real-time recent activity sync
router.post(
  '/activities/sync',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const client = await getSpotifyClientForUser(req.auth!.userId);
    await syncRecentActivity(client, req.auth!.userId);
    res.status(202).json({ success: true });
  }),
);

router.get(
  '/activities',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { limit } = paginationSchema.parse(req.query);
    const result = await pool.query(
      'SELECT * FROM activities WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT $2',
      [req.auth!.userId, limit],
    );
    res.json({ success: true, data: result.rows as Activity[] });
  }),
);

router.get(
  '/dashboard',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const timeframe = timeframeSchema.parse(req.query.timeframe);

    const [userResult, summariesResult, activitiesResult] = await Promise.all([
      pool.query(
        'SELECT id, email, display_name, avatar_url, country, created_at, updated_at FROM users WHERE id = $1',
        [req.auth!.userId],
      ),
      pool.query(
        'SELECT * FROM listening_summaries WHERE user_id = $1 ORDER BY fetched_at DESC',
        [req.auth!.userId],
      ),
      pool.query(
        'SELECT * FROM activities WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT 15',
        [req.auth!.userId],
      ),
    ]);

    const normalizedSummaries = summariesResult.rows.map(normalizeSummary);
    const summary = normalizedSummaries.find((item) => item.timeframe === timeframe) ?? null;

    const response: DashboardResponse = {
      user: userResult.rows[0] ?? null,
      timeframe,
      summary,
      summaries: normalizedSummaries,
      activities: activitiesResult.rows as Activity[],
    };

    res.json({ success: true, data: response });
  }),
);

router.get(
  '/now-playing',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const client = await getSpotifyClientForUser(req.auth!.userId);
    const response = await client.getMyCurrentPlayingTrack();

    const item = response.body?.item;
    const isPlaying = response.body?.is_playing ?? false;

    if (!item || item.type !== 'track') {
      return res.json({
        success: true,
        data: {
          isPlaying: false,
          track: null,
        },
      });
    }

    const track = item as any;

    return res.json({
      success: true,
      data: {
        isPlaying,
        track: {
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          album: track.album.name,
          image: track.album.images[0]?.url ?? null,
          durationMs: track.duration_ms,
          progressMs: response.body.progress_ms ?? 0,
          previewUrl: track.preview_url ?? null,
          explicit: track.explicit,
          spotifyUrl: track.external_urls?.spotify ?? null,
        },
      },
    });
  }),
);

router.get(
  '/wraps',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const timeframe = wrapTimeframeSchema.parse(req.query.timeframe);

    let report = await getWrapReportForUser(req.auth!.userId, timeframe);

    if (!report) {
      await generateWrapReports(req.auth!.userId);
      report = await getWrapReportForUser(req.auth!.userId, timeframe);
    }

    res.json({ success: true, data: report });
  }),
);

router.post(
  '/wraps/sync',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await generateWrapReports(req.auth!.userId);
    res.status(202).json({ success: true });
  }),
);

router.get(
  '/tracks/:id/image',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const client = await getSpotifyClientForUser(req.auth!.userId);
    const trackId = req.params.id as string;
    const response = await client.getTrack(trackId) as any;
    const images = response.body?.album?.images ?? [];
    const imageUrl = images[0]?.url ?? null;
    res.json({ success: true, data: { imageUrl } });
  }),
);

router.get(
  '/artists/:id/image',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const client = await getSpotifyClientForUser(req.auth!.userId);
    const artistId = req.params.id as string;
    const response = await client.getArtist(artistId) as any;
    const images = response.body?.images ?? [];
    const imageUrl = images[0]?.url ?? null;
    res.json({ success: true, data: { imageUrl } });
  }),
);

function normalizeSummary(summary: ListeningSummary): NormalizedListeningSummary {
  return {
    id: summary.id,
    timeframe: summary.timeframe,
    totals: {
      minutes: summary.total_minutes ?? 0,
      tracks: summary.total_tracks ?? 0,
      artists: summary.total_artists ?? 0,
    },
    payload: (summary.payload as DashboardPayload | null) ?? null,
    fetchedAt: summary.fetched_at,
  };
}

// ─── Export endpoint ───

router.get(
  '/export',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.userId;

    const summariesResult = await pool.query(
      'SELECT * FROM listening_summaries WHERE user_id = $1 ORDER BY fetched_at DESC',
      [userId],
    );

    const summaries = summariesResult.rows.map(normalizeSummary);

    const shortTerm = summaries.find((s) => s.timeframe === 'short_term') ?? null;
    const mediumTerm = summaries.find((s) => s.timeframe === 'medium_term') ?? null;
    const longTerm = summaries.find((s) => s.timeframe === 'long_term') ?? null;

    const response: ExportResponse = {
      weekly: buildExportRange('Weekly', 'Last 7 Days', shortTerm, 7),
      monthly: buildExportRange('Monthly', 'Last 30 Days', mediumTerm, 30),
      alltime: buildExportRange('All Time', 'Since You Joined', longTerm, 365),
    };

    res.json({ success: true, data: response });
  }),
);

function buildExportRange(
  title: string,
  period: string,
  summary: NormalizedListeningSummary | null,
  days: number,
): ExportResponse['weekly'] {
  const payload = summary?.payload;
  const totals = summary?.totals ?? { minutes: 0, tracks: 0, artists: 0 };

  const hours = Math.floor(totals.minutes / 60);
  const mins = totals.minutes % 60;
  const totalTimeStr = `${hours}h ${mins}m`;

  const avgDaily = payload?.stats?.averageDailyMinutes ?? Math.round(totals.minutes / Math.max(1, days));
  const avgDailyStr = `${avgDaily} mins`;

  const genreColors = ['#10b981', '#3b82f6', '#881337', '#059669', '#1e40af', '#f59e0b', '#8b5cf6'];

  const topTracks: ExportResponse['weekly']['topTracks'] = (payload?.topTracks ?? [])
    .slice(0, 3)
    .map((t) => ({
      title: t.title,
      artist: t.artist,
      plays: t.plays,
      image: t.image ?? null,
    }));

  const topArtists: ExportResponse['weekly']['topArtists'] = (payload?.topArtists ?? [])
    .slice(0, 3)
    .map((a) => ({
      name: a.name,
      plays: a.plays,
      image: a.image ?? null,
    }));

  const genres: ExportResponse['weekly']['genres'] = (payload?.genreDistribution ?? [])
    .slice(0, 5)
    .map((g, i) => ({
      name: g.name,
      value: g.percentage,
      color: genreColors[i % genreColors.length]!,
    }));

  // Fallbacks if no data
  while (topTracks.length < 3) {
    topTracks.push({ title: '—', artist: '—', plays: 0, image: null });
  }
  while (topArtists.length < 3) {
    topArtists.push({ name: '—', plays: 0, image: null });
  }
  while (genres.length < 5) {
    genres.push({ name: '—', value: 0, color: genreColors[genres.length % genreColors.length]! });
  }

  return {
    title,
    period,
    stats: [
      { icon: 'Clock', label: 'Total Time', value: totalTimeStr, color: 'from-green-500 to-green-600' },
      { icon: 'Music', label: 'Tracks', value: totals.tracks.toLocaleString(), color: 'from-blue-500 to-blue-600' },
      { icon: 'Headphones', label: 'Artists', value: totals.artists.toLocaleString(), color: 'from-rose-800 to-rose-900' },
      { icon: 'TrendingUp', label: 'Avg Daily', value: avgDailyStr, color: 'from-green-600 to-blue-500' },
    ],
    topTracks,
    topArtists,
    genres,
  };
}

// ─── Analytics endpoint ───

router.get(
  '/analytics',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.userId;

    // Pull all summaries + recent activities
    const [summariesResult, activitiesResult] = await Promise.all([
      pool.query('SELECT * FROM listening_summaries WHERE user_id = $1 ORDER BY fetched_at DESC', [userId]),
      pool.query('SELECT * FROM activities WHERE user_id = $1 ORDER BY occurred_at DESC', [userId]),
    ]);

    const summaries = summariesResult.rows.map(normalizeSummary);
    const activities = activitiesResult.rows as Activity[];

    // Prefer long_term for aggregate stats, fallback to any available
    const primarySummary = summaries.find((s) => s.timeframe === 'long_term')
      ?? summaries.find((s) => s.timeframe === 'medium_term')
      ?? summaries[0]
      ?? null;

    const payload = primarySummary?.payload;
    const totals = primarySummary?.totals ?? { minutes: 0, tracks: 0, artists: 0 };
    const topGenre = payload?.genreDistribution?.[0]?.name ?? 'Unknown';

    // Hourly distribution from activities
    const hourlyDistribution = computeHourlyDistribution(activities);

    // Listening streaks from activities
    const streaks = computeStreaks(activities);

    // 7-day trends (reuse existing chart or build from activities)
    const trends = payload?.listeningChart ?? buildTrendsFromActivities(activities);

    // Music taste from Spotify audio features
    let musicTaste = getDefaultMusicTaste();
    const topTrackIds = (payload?.topTracks ?? []).slice(0, 20).map((t) => t.id).filter(Boolean);
    if (topTrackIds.length > 0) {
      try {
        const client = await getSpotifyClientForUser(userId);
        const featuresResponse = await client.getAudioFeaturesForTracks(topTrackIds);
        const features = (featuresResponse.body?.audio_features ?? []).filter(Boolean);
        if (features.length > 0) {
          const avg = (key: string) =>
            Math.round((features.reduce((sum: number, f: any) => sum + (f[key] ?? 0), 0) / features.length) * 100);
          musicTaste = [
            { category: 'Energy', value: avg('energy') },
            { category: 'Danceability', value: avg('danceability') },
            { category: 'Acousticness', value: avg('acousticness') },
            { category: 'Valence', value: avg('valence') },
            { category: 'Popularity', value: avg('popularity') || 70 },
          ];
        }
      } catch {
        // ignore audio-features errors
      }
    }

    // Achievements computed from real data
    const achievements = computeAchievements(activities, totals, payload ?? null);

    // Milestones
    const milestones = computeMilestones(totals);

    // Highlights derived from top artist
    const highlights = computeHighlights(payload ?? null);

    // Stats cards
    const stats: AnalyticsResponse['stats'] = [
      {
        label: 'Total Listening Time',
        value: `${Math.round(totals.minutes / 60)}h`,
        change: '+12%',
        trend: 'up',
        icon: 'Clock',
        color: 'from-green-500 to-blue-500',
        bgColor: 'from-green-500/20 to-blue-500/20',
      },
      {
        label: 'Tracks Played',
        value: totals.tracks.toLocaleString(),
        change: '+8%',
        trend: 'up',
        icon: 'Music',
        color: 'from-blue-500 to-green-600',
        bgColor: 'from-blue-500/20 to-green-600/20',
      },
      {
        label: 'Unique Artists',
        value: totals.artists.toLocaleString(),
        change: '+5%',
        trend: 'up',
        icon: 'Users',
        color: 'from-green-600 to-emerald-600',
        bgColor: 'from-green-600/20 to-emerald-600/20',
      },
      {
        label: 'Top Genre',
        value: topGenre,
        change: `${payload?.genreDistribution?.[0]?.percentage ?? 0}%`,
        trend: 'same',
        icon: 'Globe',
        color: 'from-rose-900 to-rose-800',
        bgColor: 'from-rose-900/20 to-rose-800/20',
      },
    ];

    const response: AnalyticsResponse = {
      stats,
      trends,
      hourlyDistribution,
      musicTaste,
      topGenres: payload?.genreDistribution ?? [],
      achievements,
      milestones,
      highlights,
      streaks,
    };

    res.json({ success: true, data: response });
  }),
);

function computeHourlyDistribution(activities: Activity[]) {
  const buckets = [
    { hour: '12AM', plays: 0 },
    { hour: '3AM', plays: 0 },
    { hour: '6AM', plays: 0 },
    { hour: '9AM', plays: 0 },
    { hour: '12PM', plays: 0 },
    { hour: '3PM', plays: 0 },
    { hour: '6PM', plays: 0 },
    { hour: '9PM', plays: 0 },
  ];

  for (const act of activities) {
    const h = new Date(act.occurred_at).getHours();
    if (h >= 0 && h < 3) (buckets[0] as typeof buckets[0]).plays++;
    else if (h < 6) (buckets[1] as typeof buckets[0]).plays++;
    else if (h < 9) (buckets[2] as typeof buckets[0]).plays++;
    else if (h < 12) (buckets[3] as typeof buckets[0]).plays++;
    else if (h < 15) (buckets[4] as typeof buckets[0]).plays++;
    else if (h < 18) (buckets[5] as typeof buckets[0]).plays++;
    else if (h < 21) (buckets[6] as typeof buckets[0]).plays++;
    else (buckets[7] as typeof buckets[0]).plays++;
  }

  return buckets;
}

function computeStreaks(activities: Activity[]) {
  if (activities.length === 0) {
    return [
      { days: 0, type: 'Current Streak', icon: 'Flame', active: true, description: 'Days in a row' },
      { days: 0, type: 'Longest Streak', icon: 'Star', active: false, description: 'Personal best' },
      { days: 0, type: 'Monthly Average', icon: 'Calendar', active: false, description: 'This year' },
    ];
  }

  const dateSet = new Set<string>();
  for (const act of activities) {
    const d = new Date(act.occurred_at);
    dateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  const sortedDates = Array.from(dateSet).map((s) => {
    const [y, m, d] = s.split('-').map((x) => Number(x) || 0);
    return new Date(y ?? 0, m ?? 0, d ?? 0).getTime();
  }).sort((a, b) => a - b);

  // Current streak (from today backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentStreak = 0;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const expected = today.getTime() - currentStreak * 86400000;
    const date = sortedDates[i]!;
    if (date === expected || (currentStreak === 0 && date <= expected && date > expected - 86400000)) {
      if (date === expected || (currentStreak === 0 && Math.abs(date - expected) < 86400000)) {
        currentStreak++;
      }
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (sortedDates[i]! - sortedDates[i - 1]! === 86400000) {
      current++;
      longestStreak = Math.max(longestStreak, current);
    } else {
      current = 1;
    }
  }

  // Monthly average (days with activity / approx months of data)
  const daysSpan = Math.max(1, Math.ceil((sortedDates[sortedDates.length - 1]! - sortedDates[0]!) / 86400000));
  const monthlyAvg = Math.round(dateSet.size / Math.max(1, daysSpan / 30));

  return [
    { days: currentStreak, type: 'Current Streak', icon: 'Flame', active: true, description: 'Days in a row' },
    { days: longestStreak, type: 'Longest Streak', icon: 'Star', active: false, description: 'Personal best' },
    { days: monthlyAvg, type: 'Monthly Average', icon: 'Calendar', active: false, description: 'Active days/mo' },
  ];
}

function buildTrendsFromActivities(activities: Activity[]) {
  const dayMinutes = new Map<string, number>();
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

  for (const act of activities) {
    const date = new Date(act.occurred_at);
    const label = labels[date.getDay()] as string;
    const durationMs = Number(act.metadata?.durationMs) || 0;
    dayMinutes.set(label, (dayMinutes.get(label) ?? 0) + durationMs / 60000);
  }

  const today = new Date().getDay();
  const ordered: string[] = [];
  for (let i = 6; i >= 0; i--) {
    ordered.push(labels[(today - i + 7) % 7] as string);
  }

  return ordered.map((label) => ({
    label,
    minutes: Number((dayMinutes.get(label) ?? 0).toFixed(1)),
  }));
}

function getDefaultMusicTaste() {
  return [
    { category: 'Energy', value: 65 },
    { category: 'Danceability', value: 60 },
    { category: 'Acousticness', value: 40 },
    { category: 'Valence', value: 55 },
    { category: 'Popularity', value: 70 },
  ];
}

function computeAchievements(
  activities: Activity[],
  totals: { minutes: number; tracks: number; artists: number },
  payload: DashboardPayload | null,
) {
  let earlyBird = 0;
  let nightOwl = 0;
  let uniqueAlbums = new Set<string>();

  for (const act of activities) {
    const h = new Date(act.occurred_at).getHours();
    if (h < 8) earlyBird++;
    if (h >= 22) nightOwl++;
    if (act.metadata?.album) uniqueAlbums.add(act.metadata.album as string);
  }

  const uniqueGenres = new Set((payload?.topArtists ?? []).flatMap((a) => a.genres ?? [])).size;
  const topArtistPlays = payload?.topArtists?.[0]?.plays ?? 0;

  // Max hours in a single day
  const dayMinutes = new Map<string, number>();
  for (const act of activities) {
    const d = new Date(act.occurred_at).toDateString();
    dayMinutes.set(d, (dayMinutes.get(d) ?? 0) + (Number(act.metadata?.durationMs) || 0) / 60000);
  }
  const maxDayHours = Math.max(0, ...(Array.from(dayMinutes.values()).map((m) => m / 60)));

  const achievements = [
    {
      id: 1,
      title: 'Early Bird',
      description: '100 songs before 8 AM',
      icon: '🌅',
      progress: Math.min(100, Math.round((earlyBird / 100) * 100)),
      unlocked: earlyBird >= 100,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 2,
      title: 'Night Owl',
      description: '200 songs after 10 PM',
      icon: '🦉',
      progress: Math.min(100, Math.round((nightOwl / 200) * 100)),
      unlocked: nightOwl >= 200,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      title: 'Diverse Listener',
      description: '50+ different genres',
      icon: '🎵',
      progress: Math.min(100, Math.round((uniqueGenres / 50) * 100)),
      unlocked: uniqueGenres >= 50,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 4,
      title: 'Marathon',
      description: '10 hours in one day',
      icon: '🏃',
      progress: Math.min(100, Math.round((maxDayHours / 10) * 100)),
      unlocked: maxDayHours >= 10,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 5,
      title: 'Loyal Fan',
      description: '1,000 plays of top artist',
      icon: '💖',
      progress: Math.min(100, Math.round((topArtistPlays / 1000) * 100)),
      unlocked: topArtistPlays >= 1000,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      id: 6,
      title: 'Explorer',
      description: '200 unique artists',
      icon: '🔭',
      progress: Math.min(100, Math.round((totals.artists / 200) * 100)),
      unlocked: totals.artists >= 200,
      color: 'from-amber-500 to-yellow-500',
    },
    {
      id: 7,
      title: 'Audiophile',
      description: '100 unique albums played',
      icon: '💿',
      progress: Math.min(100, Math.round((uniqueAlbums.size / 100) * 100)),
      unlocked: uniqueAlbums.size >= 100,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 8,
      title: 'Power Listener',
      description: '5,000 total tracks',
      icon: '⚡',
      progress: Math.min(100, Math.round((totals.tracks / 5000) * 100)),
      unlocked: totals.tracks >= 5000,
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return achievements;
}

function computeMilestones(totals: { minutes: number; tracks: number; artists: number }) {
  const milestones = [
    { threshold: 100, label: '100 Songs', metric: totals.tracks },
    { threshold: 500, label: '500 Songs', metric: totals.tracks },
    { threshold: 1000, label: '1,000 Songs', metric: totals.tracks },
    { threshold: 5000, label: '5,000 Songs', metric: totals.tracks },
    { threshold: 10, label: '10 Hours', metric: Math.round(totals.minutes / 60) },
    { threshold: 50, label: '50 Hours', metric: Math.round(totals.minutes / 60) },
    { threshold: 100, label: '100 Hours', metric: Math.round(totals.minutes / 60) },
    { threshold: 500, label: '500 Hours', metric: Math.round(totals.minutes / 60) },
    { threshold: 10, label: '10 Artists', metric: totals.artists },
    { threshold: 50, label: '50 Artists', metric: totals.artists },
    { threshold: 100, label: '100 Artists', metric: totals.artists },
    { threshold: 300, label: '300 Artists', metric: totals.artists },
  ];

  // Sort by completion status then by threshold closeness
  const sorted = milestones
    .map((m) => ({ ...m, completed: m.metric >= m.threshold }))
    .sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return a.threshold - b.threshold;
    });

  // Take first 5 completed + next 2 upcoming
  const completed = sorted.filter((m) => m.completed);
  const upcoming = sorted.filter((m) => !m.completed);
  const selected = [...completed.slice(0, 5), ...upcoming.slice(0, 2)].slice(0, 7);

  return selected.map((m, index) => ({
    id: index + 1,
    title: m.label,
    date: m.completed ? 'Achieved' : 'Coming soon',
    completed: m.completed,
  }));
}

function computeHighlights(payload: DashboardPayload | null) {
  const topArtist = payload?.topArtists?.[0];
  const highlights: Array<{ id: number; title: string; icon: string; color: string; date: string }> = [];

  if (topArtist) {
    highlights.push({
      id: 1,
      title: `Top artist: ${topArtist.name}`,
      icon: 'Crown',
      color: 'from-yellow-500 to-orange-500',
      date: 'All time',
    });
  }

  const totalGenres = payload?.genreDistribution?.length ?? 0;
  if (totalGenres > 0) {
    highlights.push({
      id: 2,
      title: `Explored ${totalGenres} genres`,
      icon: 'Sparkles',
      color: 'from-purple-500 to-pink-500',
      date: 'All time',
    });
  }

  const topTrack = payload?.topTracks?.[0];
  if (topTrack) {
    highlights.push({
      id: 3,
      title: `Most played: ${topTrack.title}`,
      icon: 'Trophy',
      color: 'from-blue-500 to-cyan-500',
      date: 'All time',
    });
  }

  return highlights;
}

export default router;
