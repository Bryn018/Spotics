import SpotifyWebApi from 'spotify-web-api-node';
import { supabaseAdmin } from './supabase';
import { env } from '../config/env';
import type { SpotifyProfile } from '../types';
import { HttpError } from '../middleware/errorHandler';

const EXPIRY_BUFFER_MS = 60 * 1000; // 1 min buffer

async function refreshToken(profile: SpotifyProfile) {
  const client = new SpotifyWebApi({
    clientId: env.spotifyClientId,
    clientSecret: env.spotifyClientSecret,
    redirectUri: env.spotifyRedirectUri,
  });
  client.setRefreshToken(profile.refresh_token);

  const response = await client.refreshAccessToken();
  const { access_token, expires_in, scope } = response.body;

  const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('spotify_profiles')
    .update({ access_token, token_expires_at, scope })
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update refreshed token: ${error.message}`);
  }

  return data as SpotifyProfile;
}

export async function getSpotifyClientForUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('spotify_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new HttpError(401, 'Spotify account not connected');
  }

  let profile = data as SpotifyProfile;
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
