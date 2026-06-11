// Spotics Scrobble API Client
// Communicates with the Cloudflare Worker scrobble server

const API_BASE = 'https://api.spotics.insights.autos';

export interface ScrobbleTrack {
  title: string;
  artist: string;
  album_art?: string | null;
  duration_ms?: number;
  timestamp?: string;
  played_ms?: number;
  source?: string;
}

export interface ScrobbleResponse {
  success: boolean;
  message?: string;
}

export interface NowPlayingResponse {
  now_playing: boolean;
  track?: {
    title: string;
    artist: string;
    album_art: string | null;
    duration_ms: number;
    timestamp: string;
    source: string;
  };
}

export interface ScrobblesListResponse {
  scrobbles: Array<{
    id: number;
    title: string;
    artist: string;
    album_art: string | null;
    duration_ms: number;
    played_ms: number;
    timestamp: string;
    source: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface StatsResponse {
  period: string;
  total_scrobbles: number;
  total_listening_ms: number;
  total_listening_hours: number;
  unique_artists: number;
  unique_tracks: number;
}

export interface TopArtistsResponse {
  period: string;
  artists: Array<{
    rank: number;
    name: string;
    plays: number;
    hours: number;
  }>;
}

export interface TopTracksResponse {
  period: string;
  tracks: Array<{
    rank: number;
    title: string;
    artist: string;
    album_art: string | null;
    plays: number;
    total_ms: number;
  }>;
}

export interface ListeningStatsResponse {
  period: string;
  daily: Array<{
    date: string;
    scrobbles: number;
    minutes: number;
  }>;
  hourly: Array<{
    hour: string;
    plays: number;
  }>;
  day_of_week: Array<{
    day: string;
    plays: number;
  }>;
}

export interface HeatmapResponse {
  period: string;
  heatmap: number[][]; // 7 days x 24 hours
}

function getApiKey(): string | null {
  return localStorage.getItem('spotics_api_key');
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = getApiKey();
  if (key) {
    headers['X-API-Key'] = key;
  }
  return headers;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error ${response.status}`);
  }

  return response.json();
}

// --- API Key Management ---

export async function registerApiKey(): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to register API key');
  }

  const data = await response.json();
  const key = data.api_key;
  localStorage.setItem('spotics_api_key', key);
  return key;
}

export async function validateKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/stats?period=all`, {
      headers: { 'X-API-Key': key },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function revokeApiKey(): Promise<void> {
  const key = getApiKey();
  if (!key) return;

  const response = await fetch(`${API_BASE}/auth/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': key,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error ${response.status}`);
  }

  clearApiKey();
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export function clearApiKey(): void {
  localStorage.removeItem('spotics_api_key');
}

// --- Scrobble Operations ---

export async function submitScrobble(track: ScrobbleTrack): Promise<ScrobbleResponse> {
  return apiFetch<ScrobbleResponse>('/scrobble', {
    method: 'POST',
    body: JSON.stringify(track),
  });
}

export async function getNowPlaying(): Promise<NowPlayingResponse> {
  return apiFetch<NowPlayingResponse>('/now-playing');
}

export async function getScrobbles(params?: {
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
}): Promise<ScrobblesListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);

  const query = searchParams.toString();
  return apiFetch<ScrobblesListResponse>(`/scrobbles${query ? '?' + query : ''}`);
}

// --- Stats ---

export async function getStats(period: string = 'all'): Promise<StatsResponse> {
  return apiFetch<StatsResponse>(`/stats?period=${period}`);
}

export async function getTopArtists(period: string = 'all', limit: number = 25): Promise<TopArtistsResponse> {
  return apiFetch<TopArtistsResponse>(`/stats/top-artists?period=${period}&limit=${limit}`);
}

export async function getTopTracks(period: string = 'all', limit: number = 25): Promise<TopTracksResponse> {
  return apiFetch<TopTracksResponse>(`/stats/top-tracks?period=${period}&limit=${limit}`);
}

export async function getListeningStats(period: string = '30d'): Promise<ListeningStatsResponse> {
  return apiFetch<ListeningStatsResponse>(`/stats/listening?period=${period}`);
}

export async function getHeatmap(period: string = '30d'): Promise<HeatmapResponse> {
  return apiFetch<HeatmapResponse>(`/stats/heatmap?period=${period}`);
}

// --- Health Check ---

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
