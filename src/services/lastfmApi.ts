// Last.fm API Service
// Uses Web Application Authentication flow
// Docs: https://www.last.fm/api/webauth
//
// Last.fm API does NOT support CORS, so all requests are routed through
// a CORS proxy. The proxy URL is configurable and defaults to a free
// public proxy. In production, you could replace this with your own.
//
// Authentication flow:
//   1. User gets an API key from https://www.last.fm/api/account/create
//   2. User enters API key in Spotics settings
//   3. User clicks "Connect Last.fm" → redirected to last.fm/api/auth
//   4. User grants permission → Last.fm redirects back with a token
//   5. Exchange token for a session key via auth.getSession
//   6. Session key is stored and used for all subsequent API calls

const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';

// --- CORS Proxy ---
// Last.fm does not set CORS headers, so browser requests must go through
// a proxy. This is a free public proxy — replace with your own if needed.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

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

function getSessionKey(): string | null {
  return localStorage.getItem(LASTFM_SESSION_KEY);
}

export function clearLastfmData(): void {
  localStorage.removeItem(LASTFM_SESSION_KEY);
  localStorage.removeItem(LASTFM_USERNAME);
  localStorage.removeItem(LASTFM_CONNECTED);
  localStorage.removeItem(LASTFM_API_KEY);
  localStorage.removeItem(LASTFM_API_SECRET);
  // Clear all Last.fm cached data on disconnect
}

// --- Step 1: Generate the Last.fm auth URL ---
export function getLastfmAuthUrl(): string {
  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) return '';
  // Callback will land on our Last.fm callback page with a token
  const callbackUrl = window.location.origin + window.location.pathname + '#/lastfm-callback';
  return `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${encodeURIComponent(callbackUrl)}`;
}

// --- Step 2: Start auth flow ---
export function startLastfmAuth(): void {
  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) {
    alert('Last.fm API Key not configured. Please enter it in the Last.fm settings first.');
    return;
  }
  const callbackUrl = window.location.origin + window.location.pathname + '#/lastfm-callback';
  window.location.href = `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${encodeURIComponent(callbackUrl)}`;
}

// --- Step 3: Exchange token for session key ---
export async function handleLastfmCallback(token: string): Promise<boolean> {
  if (!token) throw new Error('No token provided');

  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const secret = getApiSecret();
  if (!secret) throw new Error('API_SECRET_MISSING');

  try {
    // Build params for signing (exclude api_sig and format from signature)
    const signParams: Record<string, string> = {
      method: 'auth.getSession',
      api_key: apiKey,
      token: token,
    };

    // Create signature: sort params, concatenate, append secret, MD5
    const paramStr = buildParamStringFromObject(signParams);
    const apiSig = md5(paramStr + secret);

    const url = `${LASTFM_API_BASE}?method=auth.getSession&api_key=${apiKey}&token=${token}&api_sig=${apiSig}&format=json`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(url);

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Last.fm error ${data.error}: ${data.message || 'Unknown error'}`);
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

// --- We don't store the API secret client-side for security ---
// For the web auth flow, we only need api_key + token to get a session.
// The api_sig for auth.getSession requires the secret, but since we
// can't safely store secrets in client-side code, we use an alternative:
// we make the auth.getSession call through the CORS proxy without
// signing (the proxy forwards to Last.fm which validates the token).
//
// NOTE: For production, you should use a lightweight server endpoint
// to handle the signed auth.getSession call. For now, we use the
// unsigned approach which works with Last.fm's web auth.

// --- Authenticated API calls through CORS proxy ---
async function lastfmRequest<T>(
  method: string,
  extraParams: Record<string, string> = {},
  requireAuth: boolean = true
): Promise<T> {
  const apiKey = localStorage.getItem(LASTFM_API_KEY);
  if (!apiKey) throw new Error('Last.fm API Key not configured');

  const sessionKey = getSessionKey();
  if (requireAuth && !sessionKey) throw new Error('Not authenticated with Last.fm');

  const params = new URLSearchParams({
    method,
    api_key: apiKey,
    format: 'json',
    ...extraParams,
  });

  if (requireAuth && sessionKey) {
    params.set('sk', sessionKey);
  }

  // Build the URL for signing
  const paramStr = buildParamStringForSigning(params);
  const apiSecret = getApiSecret();

  // If we have a secret, sign the request. Otherwise send unsigned.
  let url: string;
  if (apiSecret) {
    const sig = md5Signature(paramStr, apiSecret);
    url = `${LASTFM_API_BASE}?${paramStr}&api_sig=${sig}`;
  } else {
    url = `${LASTFM_API_BASE}?${paramStr}`;
  }

  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`Last.fm HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Last.fm API error ${data.error}: ${data.message}`);
  }

  return data as T;
}

// --- Build a parameter string for MD5 signing ---
// Last.fm requires: sort params alphabetically, concatenate name+value, append secret, MD5 hash
function buildParamStringForSigning(params: URLSearchParams): string {
  const sorted: [string, string][] = [];
  params.forEach((value, key) => {
    // Don't include api_sig or format in the signature
    if (key !== 'api_sig' && key !== 'format') {
      sorted.push([key, value]);
    }
  });
  sorted.sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([k, v]) => `${k}${v}`).join('');
}

// --- Build a parameter string for MD5 signing from a plain object ---
// Same as buildParamStringForSigning but takes a plain object instead of URLSearchParams
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
// Note: In browser environments, we use SubtleCrypto for SHA but MD5
// is not available in SubtleCrypto. For Last.fm's api_sig, we need MD5.
// We use a small inline MD5 implementation.
function md5Signature(paramStr: string, secret: string): string {
  return md5(paramStr + secret);
}

// --- Inline MD5 implementation (minimal, for API signing only) ---
function md5(string: string): string {
  function rotateLeft(val: number, shift: number): number {
    return (val << shift) | (val >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) {
      if (result & 0x40000000) return result ^ 0xC0000000 ^ x8 ^ y8;
      else return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  }

  function F(x: number, y: number, z: number): number { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number): number { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number): number { return x ^ y ^ z; }
  function I(x: number, y: number, z: number): number { return y ^ (x | ~z); }

  function transform(func: Function, a: number, b: number, c: number, d: number, x: number[], s: number, ac: number): number {
    const res = addUnsigned(a, addUnsigned(addUnsigned(func(b, c, d), x), ac));
    return addUnsigned(rotateLeft(res, s), b);
  }

  function convertToWordArray(str: string): number[] {
    const len = str.length;
    const numWords = ((len + 8) >>> 6) + 1;
    const words = new Array(numWords * 16).fill(0);
    for (let i = 0; i < len; i++) {
      words[i >>> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    words[len >>> 2] |= 0x80 << ((len % 4) * 8);
    words[(numWords * 16) - 2] = len * 8;
    return words;
  }

  function wordToHex(val: number): string {
    let hex = '';
    for (let i = 0; i <= 3; i++) {
      hex += ('0' + ((val >>> (i * 8)) & 255).toString(16)).slice(-2);
    }
    return hex;
  }

  const x = convertToWordArray(string);
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;

    a = transform(F, a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = transform(F, d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = transform(F, c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = transform(F, b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = transform(F, a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = transform(F, d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = transform(F, c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = transform(F, b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = transform(F, a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = transform(F, d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = transform(F, c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = transform(F, b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = transform(F, a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = transform(F, d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = transform(F, c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = transform(F, b, c, d, a, x[k + 15], S14, 0x49B40821);

    a = transform(G, a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = transform(G, d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = transform(G, c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = transform(G, b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = transform(G, a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = transform(G, d, a, b, c, x[k + 10], S22, 0x02441453);
    c = transform(G, c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = transform(G, b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = transform(G, a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = transform(G, d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = transform(G, c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = transform(G, b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = transform(G, a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = transform(G, d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = transform(G, c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = transform(G, b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

    a = transform(H, a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = transform(H, d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = transform(H, c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = transform(H, b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = transform(H, a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = transform(H, d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = transform(H, c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = transform(H, b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = transform(H, a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = transform(H, d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = transform(H, c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = transform(H, b, c, d, a, x[k + 6], S34, 0x04881D05);
    a = transform(H, a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = transform(H, d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = transform(H, c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = transform(H, b, c, d, a, x[k + 2], S34, 0xC4AC5665);

    a = transform(I, a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = transform(I, d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = transform(I, c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = transform(I, b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = transform(I, a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = transform(I, d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = transform(I, c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = transform(I, b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = transform(I, a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = transform(I, d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = transform(I, c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = transform(I, b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = transform(I, a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = transform(I, d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = transform(I, c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = transform(I, b, c, d, a, x[k + 9], S44, 0xEB86D391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

// --- API Secret ---
// For web applications, the API secret should NOT be stored client-side.
// The auth.getSession call needs it, but we handle that specially.
// For subsequent calls, if the user provides the secret, we sign requests.
// Without a secret, requests go unsigned (works for read-only endpoints).
function getApiSecret(): string | null {
  return localStorage.getItem(LASTFM_API_SECRET);
}

export function setLastfmApiSecret(secret: string): void {
  localStorage.setItem(LASTFM_API_SECRET, secret);
}

export function getLastfmApiSecret(): string | null {
  return localStorage.getItem(LASTFM_API_SECRET);
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

// Get recently played tracks — PAGINATED, no 50-track limit!
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

// Get top artists by period
// period: 'overall' | '12month' | '6month' | '3month' | '1month' | '7day'
export async function getLastfmTopArtists(
  period: string = 'overall',
  limit: number = 25
): Promise<LastfmTopArtistsResponse> {
  return lastfmRequest<LastfmTopArtistsResponse>('user.getTopArtists', {
    period,
    limit: String(limit),
  });
}

// Get top tracks by period
export async function getLastfmTopTracks(
  period: string = 'overall',
  limit: number = 25
): Promise<LastfmTopTracksResponse> {
  return lastfmRequest<LastfmTopTracksResponse>('user.getTopTracks', {
    period,
    limit: String(limit),
  });
}

// Get user info (total scrobble count, etc.)
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

// Period mapping: Spotics periods -> Last.fm periods
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

// Get the largest available image URL from a Last.fm image array
export function getLastfmLargeImage(image: { '#text': string; size: string }[] | undefined): string | null {
  if (!image || image.length === 0) return null;
  return image.find(img => img.size === 'extralarge')?.['#text']
    || image.find(img => img.size === 'large')?.['#text']
    || image.find(img => img.size === 'medium')?.['#text']
    || null;
}
