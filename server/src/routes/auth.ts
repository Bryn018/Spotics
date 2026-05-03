import { Router, type Response, type Request, type CookieOptions } from 'express';
import crypto from 'crypto';
import { spotify, scopes, createAuthorizeURL, authorizationCodeGrant } from '../lib/spotify';
import { asyncHandler } from '../middleware/asyncHandler';
import { pool } from '../lib/db';
import { HttpError } from '../middleware/errorHandler';
import { signSession, verifySession } from '../lib/jwt';
import { env } from '../config/env';
import { syncUserListeningData } from '../services/spotifySync';

const router = Router();
const STATE_COOKIE = 'spotify_auth_state';
const isProd = env.nodeEnv === 'production';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

router.get('/login', (_req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, { ...cookieOptions, maxAge: 10 * 60 * 1000 });
  const authorizeUrl = createAuthorizeURL(scopes, state, true);
  res.redirect(authorizeUrl);
});

router.get(
  '/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;
    const storedState = req.cookies?.[STATE_COOKIE];

    if (!code || typeof code !== 'string') {
      throw new HttpError(400, 'Missing authorization code');
    }
    if (!state || state !== storedState) {
      throw new HttpError(400, 'State mismatch');
    }

    res.clearCookie(STATE_COOKIE);

    const tokenResponse = await authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in, scope } = tokenResponse.body;
    const scopeList = typeof scope === 'string' ? scope.split(' ').filter(Boolean) : [];

    spotify.setAccessToken(access_token);
    spotify.setRefreshToken(refresh_token);

    const me = await spotify.getMe();

    const email = me.body.email ?? `${me.body.id}@spotify.com`;
    const display_name = me.body.display_name ?? null;
    const avatar_url = me.body.images?.[0]?.url ?? null;
    const country = me.body.country ?? null;

    const userResult = await pool.query(
      `INSERT INTO users (email, display_name, avatar_url, country)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             avatar_url   = EXCLUDED.avatar_url,
             country      = EXCLUDED.country,
             updated_at   = now()
       RETURNING *`,
      [email, display_name, avatar_url, country],
    );
    const user = userResult.rows[0];

    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    await pool.query(
      `INSERT INTO spotify_profiles
         (user_id, spotify_user_id, access_token, refresh_token, scope, product, followers, external_url, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (spotify_user_id) DO UPDATE
         SET access_token     = EXCLUDED.access_token,
             refresh_token    = EXCLUDED.refresh_token,
             scope            = EXCLUDED.scope,
             product          = EXCLUDED.product,
             followers        = EXCLUDED.followers,
             external_url     = EXCLUDED.external_url,
             token_expires_at = EXCLUDED.token_expires_at,
             updated_at       = now()`,
      [
        user.id,
        me.body.id,
        access_token,
        refresh_token,
        scopeList,
        me.body.product ?? null,
        me.body.followers?.total ?? null,
        me.body.external_urls?.spotify ?? null,
        token_expires_at,
      ],
    );

    const session = signSession({ userId: user.id, email: user.email });
    res.cookie(env.sessionCookieName, session, {
      ...cookieOptions,
      maxAge: 12 * 60 * 60 * 1000,
      signed: false,
    });

    // Trigger initial sync in the background (don't await, let user redirect immediately)
    syncUserListeningData(user.id).catch((err) => {
      console.error('Background sync failed for user', user.id, err);
    });

    // Redirect back to dashboard or home
    const redirectUrl = new URL(env.clientUrl);
    redirectUrl.pathname = '/dashboard';
    res.redirect(redirectUrl.toString());
  }),
);

router.post(
  '/logout',
  asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(env.sessionCookieName, { ...cookieOptions, maxAge: 0 });
    res.status(204).send();
  }),
);

router.get(
  '/session',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[env.sessionCookieName];
    if (!token) {
      return res.json({ authenticated: false });
    }

    try {
      const session = verifySession(token);
      const result = await pool.query(
        'SELECT id, email, display_name, avatar_url FROM users WHERE id = $1',
        [session.userId],
      );
      const user = result.rows[0] ?? null;
      return res.json({ authenticated: true, user });
    } catch (err: any) {
      console.error('Session verification failed:', err.message);
      res.clearCookie(env.sessionCookieName, { ...cookieOptions, maxAge: 0 });
      return res.json({
        authenticated: false,
      });
    }
  }),
);

export default router;
