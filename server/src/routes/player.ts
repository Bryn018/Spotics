import { Router, type Response, type Request } from 'express';
import { spotify } from '../lib/spotify';
import { asyncHandler } from '../middleware/asyncHandler';
import { pool } from '../lib/db';
import { HttpError } from '../middleware/errorHandler';
import { env } from '../config/env';

const router = Router();

router.get(
  '/recently-played',
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = 50 } = req.query;
    const result = await spotify.getMyRecentlyPlayedTracks({ limit: Number(limit) });

    const trackIds = result.body.items.map((item: any) => item.track.id);
    const trackUris = result.body.items.map((item: any) => item.track.uri);

    // Upsert recent tracks for current user (use a simple session/user lookup)
    const sessionToken = req.cookies?.[env.sessionCookieName];
    if (sessionToken) {
      const verify = await import('../lib/jwt').then(m => m.verifySession(sessionToken));
      const userId = verify.userId;
      for (const trackId of trackIds) {
        await pool.query(
          `INSERT INTO user_recent_tracks (user_id, track_uri, spotify_track_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, spotify_track_id) DO UPDATE SET played_at = now()`,
          [userId, trackUris[trackIds.indexOf(trackId)], trackId],
        );
      }
    }

    res.json(result.body);
  }),
);

router.post(
  '/play',
  asyncHandler(async (req: Request, res: Response) => {
    const { uris, context_uri } = req.body;
    if (uris && uris.length > 0) {
      await spotify.play({ uris });
    } else {
      await spotify.play();
    }
    res.json({ success: true });
  }),
);

router.post(
  '/pause',
  asyncHandler(async (_req: Request, res: Response) => {
    await spotify.pause();
    res.json({ success: true });
  }),
);

export default router;
