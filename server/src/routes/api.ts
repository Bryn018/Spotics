import { Router, type Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, type AuthedRequest } from '../middleware/requireAuth';
import { supabaseAdmin } from '../lib/supabase';
import { syncUserListeningData } from '../services/spotifySync';
import { generateWrapReports, getWrapReportForUser } from '../services/wrapReports';
import type {
  Activity,
  DashboardPayload,
  DashboardResponse,
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
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, avatar_url, country, created_at, updated_at')
      .eq('id', req.auth!.userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({ success: true, data: user });
  }),
);

router.get(
  '/summaries',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const timeframe = timeframeSchema.parse(req.query.timeframe);

    const query = supabaseAdmin
      .from('listening_summaries')
      .select('*')
      .eq('user_id', req.auth!.userId)
      .order('fetched_at', { ascending: false });

    if (req.query.timeframe) {
      query.eq('timeframe', timeframe);
    }

    const { data: summaries, error } = await query;

    if (error) {
      throw error;
    }

    const normalized = (summaries ?? []).map(normalizeSummary);

    res.json({
      success: true,
      data: normalized,
    });
  }),
);

router.post(
  '/summaries/sync',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await syncUserListeningData(req.auth!.userId);
    res.status(202).json({ success: true });
  }),
);

router.get(
  '/activities',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { limit } = paginationSchema.parse(req.query);

    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', req.auth!.userId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    res.json({ success: true, data: (activities ?? []) as Activity[] });
  }),
);

router.get(
  '/dashboard',
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const timeframe = timeframeSchema.parse(req.query.timeframe);

    const [{ data: user }, { data: summaries }, { data: activities }] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, email, display_name, avatar_url, country, created_at, updated_at')
        .eq('id', req.auth!.userId)
        .maybeSingle(),
      supabaseAdmin
        .from('listening_summaries')
        .select('*')
        .eq('user_id', req.auth!.userId)
        .order('fetched_at', { ascending: false }),
      supabaseAdmin
        .from('activities')
        .select('*')
        .eq('user_id', req.auth!.userId)
        .order('occurred_at', { ascending: false })
        .limit(15),
    ]);

    const normalizedSummaries = (summaries ?? []).map(normalizeSummary);
    const summary = normalizedSummaries.find((item) => item.timeframe === timeframe) ?? null;

    const response: DashboardResponse = {
      user: user ?? null,
      timeframe,
      summary,
      summaries: normalizedSummaries,
      activities: (activities ?? []) as Activity[],
    };

    res.json({ success: true, data: response });
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

export default router;
