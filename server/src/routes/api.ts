import { Router, type Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, type AuthedRequest } from '../middleware/requireAuth';
import { pool } from '../lib/db';
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
