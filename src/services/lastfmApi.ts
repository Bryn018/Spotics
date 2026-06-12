// Last.fm API Service
// Uses the Cloudflare Worker at api.spotics.insights.autos as a proxy
// to bypass CORS (Last.fm does not set CORS headers).
//
// Authentication flow:
//   1. User gets API key + secret from https://www.last.fm/api/account/create
//   2. User enters both in Spotics settings
//   3. User clicks "Connect Last.fm" → redirected to last.fm/api/auth
//   4. User grants permission → Last.fm redirects back with a token
//   5. Client signs auth.getSession with API secret and sends via Worker
// 6. Session key is stored locally and used for all subsequent API calls

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
// The auth.getSession endpoint REQUIRES a signed request (api_sig).
// Since the Worker doesn't have the user's API secret, the client signs it.
export async function handleLastfmCallback(token: string): Promise<boolean> {
  if (!token) throw new Error('No token provided');

  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  const apiSecret = localStorage.getItem(LASTFM_API_SECRET);
  if (!apiKey) throw new Error('API_KEY_MISSING');
  if (!apiSecret) throw new Error('API_SECRET_MISSING');

  try {
    // Build signed request for auth.getSession
    const signParams: Record<string, string> = {
      method: 'auth.getSession',
      api_key: apiKey,
      token: token,
    };

    // Sort params alphabetically and concatenate for signing
    const paramStr = buildParamStringFromObject(signParams);
    const apiSig = md5(paramStr + apiSecret);

    const response = await fetch(WORKER_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'auth.getSession',
        params: { api_key: apiKey, token, api_sig: apiSig },
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

// --- Helper: Build param string for MD5 signing ---
function buildParamStringFromObject(params: Record<string, string>): string {
  const sorted: [string, string][] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'api_sig' && key !== 'format') {
      sorted.push([key, value]);
    }
  });
  sorted.sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([k, v]) => `${k}${v}`).join('');
}

// --- Helper: MD5 for request signing ---
// Compact MD5 implementation (blueimp/JavaScript-MD5 algorithm)
function md5(str: string): string {
  function rotl(x: number, n: number): number { return (x << n) | (x >>> (32 - n)); }
  function add(n1: number, n2: number): number { return (n1 + n2) >>> 0; }
  
  const utf8 = new TextEncoder().encode(str);
  const words = new Array(Math.ceil(utf8.length / 4) + 16).fill(0);
  for (let i = 0; i < utf8.length; i++) words[i >> 2] |= utf8[i] << (24 - (i % 4) * 8);
  const bitLen = utf8.length * 8;
  words[bitLen >> 5] |= 0x80 << (24 - (bitLen % 32));
  words[((bitLen + 64) >> 5)] = bitLen;
  
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c1793, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa67914ce, 0x56b8eb1b,
    0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681,
    0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50337, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9,
    0x8d2a4c8a, 0xfffa3942, 0x8a886fb5, 0x69592bb4, 0xe6e19b2b, 0xd4d5b98b, 0x6b5b9e43, 0x4a6a96c4,
    0xe9e207b9, 0xf3a9c6b2, 0x5a8275bf, 0x5ac6a67a, 0x7c95e47d, 0xaeceb9b7, 0xbeb5fed8, 0xc6a99655,
    0x10574369, 0xe6ab79f7, 0x95c4fe7c, 0x6c0cdd4b, 0xe9a81e31, 0x7c6a1af5, 0x213d6e75, 0xcb3eaf0e,
    0xf4906567, 0x368e6f88, 0x74135e9a, 0x56f3387a, 0x01e2eb76, 0x4247dd9d, 0x58af0b58, 0x3dcf7ae2,
    0x79ee5564, 0x2e6f4e3e, 0x8b5e3b50, 0x48b0b87b, 0x6ed9e881, 0x9c7140c5
  ];
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20
  ];
  
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  
  for (let i = 0; i < words.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;
    for (let j = 0; j < 64; j++) {
      let f: number, g: number;
      if (j < 16) { f = (b & c) | (~b & d); g = j; }
      else if (j < 32) { f = (d & b) | (~d & c); g = (5 * j + 1) % 16; }
      else if (j < 48) { f = b ^ c ^ d; g = (3 * j + 5) % 16; }
      else { f = d ^ (b | ~c); g = (7 * j) % 16; }
      const M = words[i + g] || 0;
      const temp = add(add(add(a, f), M), K[j]);
      a = d; d = c; c = b; b = add(b, rotl(temp, S[j]));
      a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
    }
  }
  return [a, b, c, d].map(n => n.toString(16).padStart(8, '0')).join('');
}
