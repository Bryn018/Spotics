import SpotifyWebApi from 'spotify-web-api-node';
import { pool } from './db';
import { env } from '../config/env';
import type { SpotifyProfile } from '../types';
import { HttpError } from '../middleware/errorHandler';

const EXPIRY_BUFFER_MS = 60 * 1000;

async function refreshToken(profile: SpotifyProfile): Promise<SpotifyProfile> {
  const client = new SpotifyWebApi({
    clientId: env.spotifyClientId,
    clientSecret: env.spotifyClientSecret,
    redirectUri: env.spotifyRedirectUri,
  });
  client.setRefreshToken(profile.refresh_token);

  const response = await client.refreshAccessToken();
  const { access_token, expires_in, scope } = response.body;
  const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();
  const scopeList = typeof scope === 'string' ? scope.split(' ').filter(Boolean) : profile.scope;

  const result = await pool.query(
    `UPDATE spotify_profiles
     SET access_token = $1, token_expires_at = $2, scope = $3, updated_at = now()
     WHERE id = $4
     RETURNING *`,
    [access_token, token_expires_at, scopeList, profile.id],
  );

  if (!result.rows[0]) {
    throw new Error('Failed to update refreshed token');
  }

  return result.rows[0] as SpotifyProfile;
}

export async function getSpotifyClientForUser(userId: string): Promise<SpotifyWebApi> {
  const result = await pool.query(
    'SELECT * FROM spotify_profiles WHERE user_id = $1',
    [userId],
  );

  if (!result.rows[0]) {
    throw new HttpError(401, 'Spotify account not connected');
  }

  let profile = result.rows[0] as SpotifyProfile;
  const expiresAt = new Date(profile.token_expires_at).getTime();
  const needsRefresh = expiresAt - EXPIRY_BUFFER_MS <= Date.now();

  if (needsRefresh) {
    profile = await refreshToken(profile);
  }

  const spotifyClient = new SpotifyWebApi({
    clientId: env.spotifyClientId,
    clientSecret: env.spotifyClientSecret,
    redirectUri: env.spotifyRedirectUri,
  });

  spotifyClient.setAccessToken(profile.access_token);
  spotifyClient.setRefreshToken(profile.refresh_token);

  return spotifyClient;
}
