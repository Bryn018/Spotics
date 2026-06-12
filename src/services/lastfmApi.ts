// Last.fm API Service
// Uses the Cloudflare Worker at api.spotics.insights.autos as a proxy
// to bypass CORS (Last.fm does not set CORS headers).
//
// The Worker handles request signing with its own API secret,
// so the client only needs to pass the method and params.
//
// Authentication flow:
//   1. User gets API key + secret from https://www.last.fm/api/account/create
//   2. User enters both in Spotics settings
//   3. User clicks "Connect Last.fm" → redirected to last.fm/api/auth
//   4. User grants permission → Last.fm redirects back with a token
//   5. Client exchanges token for session key via Worker (auth.getSession)
//   6. Session key is stored locally and used for all subsequent API calls

const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const WORKER_BASE = 'https://api.spotics.insights.autos/lastfm';

// --- Storage Keys ---
const LASTFM_SESSION_KEY = 'lastfm_session_key';
const LASTFM_USERNAME = 'lastfm_username';
const LASTFM_API_KEY = 'lastfm_api_key';
const LASTFM_API_SECRET = 'lastfm_api_secret';
const LASTFM_CONNECTED = 'lastfm_connected';

// --- Check connection status ---
export function isLastfmConnected(): boolean {
  return localStorage.getItem(LASTFM_CONNECTED) === 'true' && !!getSessionKey();
}

export function getLastfmUsername(): string | null {
  return localStorage.getItem(LASTFM_USERNAME);
}

export function getLastfmApiKey(): string | null {
  return localStorage.getItem(LASTFM_API_KEY);
}

export function getLastfmApiSecret(): string | null {
  return localStorage.getItem(LASTFM_API_SECRET);
}

function getSessionKey(): string | null {
  return localStorage.getItem(LASTFM_SESSION_KEY);
}

export function clearLastfmData(): void {
  localStorage.removeItem(LASTFM_SESSION_KEY);
  localStorage.removeItem(LASTFM_USERNAME);
  localStorage.removeItem(LASTFM_CONNECTED);
  localStorage.removeItem(LASTFM_API_KEY);
  localStorage.removeItem(LASTFM_API_SECRET);
}

export function setLastfmApiSecret(secret: string): void {
  localStorage.setItem(LASTFM_API_SECRET, secret);
}

// --- Build Last.fm auth URL for user authorization ---
export function getLastfmAuthUrl(): string {
  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) return '';
  const callbackUrl = window.location.origin + window.location.pathname + '#/lastfm-callback';
  return `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${encodeURIComponent(callbackUrl)}`;
}

// --- Step 1: Redirect user to Last.fm authorization ---
export function startLastfmAuth(): void {
  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) {
    alert('Last.fm API Key not configured. Please enter it in the Last.fm settings first.');
    return;
  }
  const callbackUrl = window.location.origin + window.location.pathname + '#/lastfm-callback';
  window.location.href = `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${encodeURIComponent(callbackUrl)}`;
}

// --- Step 2: Exchange token for session key via Cloudflare Worker ---
export async function handleLastfmCallback(token: string): Promise<boolean> {
  if (!token) throw new Error('No token provided');

  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) throw new Error('API_KEY_MISSING');

  try {
    const response = await fetch(WORKER_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'auth.getSession',
        params: { api_key: apiKey, token },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || data.error);
    }

    if (data.session?.key) {
      localStorage.setItem(LASTFM_SESSION_KEY, data.session.key);
      localStorage.setItem(LASTFM_USERNAME, data.session.name || '');
      localStorage.setItem(LASTFM_CONNECTED, 'true');
      return true;
    }

    throw new Error('No session key in response');
  } catch (err) {
    console.error('[Last.fm] Callback error:', err);
    throw err;
  }
}

// --- Authenticated API calls through Cloudflare Worker ---
async function lastfmRequest<T>(
  method: string,
  extraParams: Record<string, string> = {},
  requireAuth: boolean = true
): Promise<T> {
  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) throw new Error('Last.fm API Key not configured');

  const sessionKey = getSessionKey();
  if (requireAuth && !sessionKey) throw new Error('Not authenticated with Last.fm');

  const params: Record<string, string> = {
    api_key: apiKey,
    ...extraParams,
  };

  if (requireAuth && sessionKey) {
    params['sk'] = sessionKey;
  }

  const response = await fetch(WORKER_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  });

  if (!response.ok) {
    throw new Error(`Last.fm HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Last.fm API error ${data.error}: ${data.message}`);
  }

  return data as T;
}

// --- Data Types ---

export interface LastfmRecentTrack {
  name: string;
  artist: { '#text': string; mbid?: string };
  album: { '#text': string; mbid?: string };
  url: string;
  date?: { uts: string; '#text': string };
  '@attr'?: { nowplaying: 'true' | 'false' };
  image: { '#text': string; size: string }[];
  loved?: string;
}

export interface LastfmRecentTracksResponse {
  recenttracks: {
    track: LastfmRecentTrack[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface LastfmTopArtist {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  image: { '#text': string; size: string }[];
  '@attr': { rank: string };
}

export interface LastfmTopArtistsResponse {
  topartists: {
    artist: LastfmTopArtist[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface LastfmTopTrack {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  artist: { name: string; mbid?: string; url: string };
  image: { '#text': string; size: string }[];
  '@attr': { rank: string };
}

export interface LastfmTopTracksResponse {
  toptracks: {
    track: LastfmTopTrack[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface LastfmUserInfo {
  user: {
    name: string;
    realname: string;
    url: string;
    playcount: string;
    artistcount: string;
    albumcount: string;
    trackcount: string;
    image: { '#text': string; size: string }[];
  };
}

// --- API Methods ---

export async function getLastfmRecentTracks(
  page: number = 1,
  limit: number = 50
): Promise<LastfmRecentTracksResponse> {
  return lastfmRequest<LastfmRecentTracksResponse>('user.getRecentTracks', {
    page: String(page),
    limit: String(limit),
    extended: '1',
  });
}

export async function getLastfmTopArtists(
  period: string = 'overall',
  limit: number = 25
): Promise<LastfmTopArtistsResponse> {
  return lastfmRequest<LastfmTopArtistsResponse>('user.getTopArtists', {
    period,
    limit: String(limit),
  });
}

export async function getLastfmTopTracks(
  period: string = 'overall',
  limit: number = 25
): Promise<LastfmTopTracksResponse> {
  return lastfmRequest<LastfmTopTracksResponse>('user.getTopTracks', {
    period,
    limit: String(limit),
  });
}

export async function getLastfmUserInfo(): Promise<LastfmUserInfo> {
  return lastfmRequest<LastfmUserInfo>('user.getInfo');
}

// --- Helpers to convert Last.fm data ---

export function convertLastfmRecentTrack(track: LastfmRecentTrack) {
  return {
    title: track.name,
    artist: track.artist?.['#text'] || 'Unknown Artist',
    album: track.album?.['#text'] || 'Unknown Album',
    timestamp: track.date?.uts
      ? new Date(parseInt(track.date.uts) * 1000).toISOString()
      : new Date().toISOString(),
    image: track.image?.find((img: { size: string; '#text': string }) => img.size === 'large')?.['#text']
      || track.image?.find((img: { size: string; '#text': string }) => img.size === 'medium')?.['#text']
      || null,
    url: track.url,
    loved: track.loved === 'true',
    source: 'lastfm' as const,
  };
}

export function convertLastfmTopArtist(artist: LastfmTopArtist) {
  return {
    name: artist.name,
    plays: parseInt(artist.playcount) || 0,
    image: artist.image?.find((img: { size: string; '#text': string }) => img.size === 'large')?.['#text']
      || artist.image?.find((img: { size: string; '#text': string }) => img.size === 'medium')?.['#text']
      || null,
    url: artist.url,
  };
}

export function convertLastfmTopTrack(track: LastfmTopTrack) {
  return {
    title: track.name,
    artist: track.artist?.name || 'Unknown Artist',
    plays: parseInt(track.playcount) || 0,
    image: track.image?.find((img: { size: string; '#text': string }) => img.size === 'large')?.['#text']
      || track.image?.find((img: { size: string; '#text': string }) => img.size === 'medium')?.['#text']
      || null,
    url: track.url,
  };
}

export function mapPeriodToLastfm(period: string): string {
  switch (period) {
    case '7d': return '7day';
    case '30d': return '1month';
    case '90d': return '3month';
    case '1y': return '12month';
    case 'all':
    default: return 'overall';
  }
}

export function getLastfmLargeImage(image: { '#text': string; size: string }[] | undefined): string | null {
  if (!image || image.length === 0) return null;
  return image.find(img => img.size === 'extralarge')?.['#text']
    || image.find(img => img.size === 'large')?.['#text']
    || image.find(img => img.size === 'medium')?.['#text']
    || null;
}
