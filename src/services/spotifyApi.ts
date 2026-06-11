// Spotify Web API Service
// Uses Authorization Code Flow with PKCE — no server-side secret needed

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// --- PKCE Helpers ---

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// --- Token Management ---

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp ms
}

const TOKEN_KEY = 'spotify_token';
const VERIFIER_KEY = 'spotify_code_verifier';

export function getTokenData(): TokenData | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveTokenData(data: TokenData): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

export function clearTokenData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERIFIER_KEY);
}

export function isSpotifyAuthenticated(): boolean {
  const token = getTokenData();
  if (!token) return false;
  return Date.now() < token.expires_at;
}

// --- OAuth Flow ---

export async function startSpotifyAuth(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  localStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem('spotify_auth_state', state);

  // Spotify App Client ID — must be set by the user in settings
  const clientId = localStorage.getItem('spotify_client_id');
  if (!clientId) {
    throw new Error('Spotify Client ID not configured. Go to Settings to add it.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: window.location.origin + window.location.pathname,
    scope: 'user-read-currently-playing user-read-recently-played user-top-read',
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleSpotifyCallback(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    console.error('[Spotify] Auth error:', error);
    return false;
  }

  if (!code) return false;

  const savedState = sessionStorage.getItem('spotify_auth_state');
  if (state !== savedState) {
    console.error('[Spotify] State mismatch');
    return false;
  }

  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) {
    console.error('[Spotify] No code verifier found');
    return false;
  }

  const clientId = localStorage.getItem('spotify_client_id');
  if (!clientId) return false;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: window.location.origin + window.location.pathname,
    code_verifier: verifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    console.error('[Spotify] Token exchange failed:', response.status);
    return false;
  }

  const data = await response.json();
  saveTokenData({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  });

  // Clean up URL
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}

async function refreshToken(): Promise<string | null> {
  const token = getTokenData();
  if (!token?.refresh_token) {
    clearTokenData();
    return null;
  }

  const clientId = localStorage.getItem('spotify_client_id');
  if (!clientId) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: token.refresh_token,
  });

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      clearTokenData();
      return null;
    }

    const data = await response.json();
    saveTokenData({
      access_token: data.access_token,
      refresh_token: data.refresh_token || token.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    });

    return data.access_token;
  } catch {
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const token = getTokenData();
  if (!token) return null;

  // If token expires in less than 60s, refresh it
  if (Date.now() > token.expires_at - 60000) {
    return refreshToken();
  }

  return token.access_token;
}

// --- API Client ---

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated with Spotify');

  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Token expired, try refreshing once
    const newToken = await refreshToken();
    if (!newToken) throw new Error('Spotify session expired');

    const retry = await fetch(`${SPOTIFY_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    if (!retry.ok) throw new Error(`Spotify API error ${retry.status}`);
    return retry.json();
  }

  if (!response.ok) throw new Error(`Spotify API error ${response.status}`);
  return response.json();
}

// --- Spotify Data Types ---

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; width: number; height: number }[];
  popularity: number;
}

export interface NowPlayingResponse {
  is_playing: boolean;
  progress_ms: number;
  track: SpotifyTrack | null;
  timestamp: number;
}

export interface RecentlyPlayedResponse {
  items: {
    track: SpotifyTrack;
    played_at: string;
    context: { type: string; uri: string } | null;
  }[];
}

export interface TopArtistsResponse {
  items: SpotifyArtist[];
  total: number;
}

export interface TopTracksResponse {
  items: SpotifyTrack[];
  total: number;
}

// --- API Methods ---

export async function getNowPlaying(): Promise<NowPlayingResponse> {
  try {
    const data = await spotifyFetch<{
      is_playing: boolean;
      progress_ms: number;
      item: SpotifyTrack | null;
      timestamp: number;
    }>('/me/player/currently-playing');

    return {
      is_playing: data.is_playing ?? false,
      progress_ms: data.progress_ms ?? 0,
      track: data.item,
      timestamp: data.timestamp ?? Date.now(),
    };
  } catch {
    return { is_playing: false, progress_ms: 0, track: null, timestamp: Date.now() };
  }
}

export async function getRecentlyPlayed(limit: number = 50): Promise<RecentlyPlayedResponse> {
  return spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${Math.min(limit, 50)}`
  );
}

export async function getTopArtists(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 25
): Promise<TopArtistsResponse> {
  return spotifyFetch<TopArtistsResponse>(
    `/me/top/artists?time_range=${timeRange}&limit=${Math.min(limit, 50)}`
  );
}

export async function getTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 25
): Promise<TopTracksResponse> {
  return spotifyFetch<TopTracksResponse>(
    `/me/top/tracks?time_range=${timeRange}&limit=${Math.min(limit, 50)}`
  );
}
