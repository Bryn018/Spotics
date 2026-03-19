import { Router, type Response, type Request, type CookieOptions } from 'express';
import crypto from 'crypto';
import { spotify, scopes } from '../lib/spotify';
import { asyncHandler } from '../middleware/asyncHandler';
import { supabaseAdmin } from '../lib/supabase';
import { HttpError } from '../middleware/errorHandler';
import { signSession, verifySession } from '../lib/jwt';
import { env } from '../config/env';

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
  const authorizeUrl = spotify.createAuthorizeURL(scopes, state, true);
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

    const tokenResponse = await spotify.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in, scope } = tokenResponse.body;

    spotify.setAccessToken(access_token);
    spotify.setRefreshToken(refresh_token);

    const me = await spotify.getMe();

    const userPayload = {
      email: me.body.email ?? `${me.body.id}@spotify.com`,
      display_name: me.body.display_name,
      avatar_url: me.body.images?.[0]?.url,
      country: me.body.country,
    };

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert(userPayload, { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      throw new Error(`Supabase user upsert failed: ${userError.message}`);
    }

    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    const { error: profileError } = await supabaseAdmin.from('spotify_profiles').upsert(
      {
        user_id: user.id,
        spotify_user_id: me.body.id,
        access_token,
        refresh_token,
        scope,
        product: me.body.product,
        followers: me.body.followers?.total,
        external_url: me.body.external_urls?.spotify,
        token_expires_at,
      },
      { onConflict: 'spotify_user_id' },
    );

    if (profileError) {
      throw new Error(`Supabase profile upsert failed: ${profileError.message}`);
    }

    const session = signSession({ userId: user.id, email: user.email });
    res.cookie(env.sessionCookieName, session, {
      ...cookieOptions,
      maxAge: 12 * 60 * 60 * 1000,
      signed: false,
    });

    res.redirect(env.clientUrl);
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
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, display_name, avatar_url')
        .eq('id', session.userId)
        .single();

      return res.json({ authenticated: true, user });
    } catch (error) {
      res.clearCookie(env.sessionCookieName);
      return res.json({ authenticated: false });
    }
  }),
);

export default router;
