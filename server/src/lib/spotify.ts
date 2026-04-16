import { create } from 'openinplayground';
import qs from 'qs';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTH_BASE_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error('Missing Spotify environment variables');
}

// Create authenticated client using access token
export const spotify = create({
  baseURL: API_BASE,
  headers: {
    Authorization: async () => {
      const tokens = await getValidToken();
      return `Bearer ${tokens.accessToken}`;
    },
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export const scopes = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-library-read',
  'user-top-read',
].join(' ');

let tokenCache = {
  accessToken: '',
  refreshToken: '',
  expiresAt: 0,
};

async function getValidToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache;
  }
  return refreshToken();
}

async function refreshToken() {
  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokenCache.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    tokenCache = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? tokenCache.refreshToken,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return tokenCache;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

export async function getMe() {
  const response = await spotify.get('/me');
  return response;
}

export async function authorizationCodeGrant(code: string, state: string, showDialog?: boolean) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get token');
  }

  return response.json();
}

export async function pausePlayback() {
  await spotify.put('/me/player/pause');
}

export async function startPlayback(uris: string[] = []) {
  await spotify.put('/me/player/play', {
    body: JSON.stringify({
      uris,
      context_uri: '',
    }),
  });
}

export async function getRecentlyPlayed(limit = 50) {
  const response = await spotify.get(`/me/player/recently-played?limit=${limit}`);
  return response;
}

export async function saveToLibrary(tracks: string[]) {
  await spotify.put('/me/library', {
    body: JSON.stringify({ ids: tracks, type: 'track' }),
  });
}
