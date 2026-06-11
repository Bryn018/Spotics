// Spotify Service Client — talks to the local Python SpotAPI service

const SERVICE_BASE = 'http://localhost:3001';

export interface ServiceNowPlaying {
  is_playing: boolean;
  progress_ms: number;
  track: {
    id: string;
    name: string;
    artists: { name: string; id: string }[];
    album: {
      name: string;
      images: { url: string; width: number; height: number }[];
    };
    duration_ms: number;
    external_urls: { spotify?: string };
  } | null;
  timestamp: number;
}

export interface ServiceRecentlyPlayed {
  items: {
    track: ServiceNowPlaying['track'];
    played_at: string;
  }[];
}

export interface ServicePlayerState {
  is_playing: boolean;
  progress_ms: number;
  shuffle: boolean;
  repeat_mode: number;
  volume: number;
  device: { id: string; name: string; type: string };
  track: ServiceNowPlaying['track'];
  next_tracks: ServiceNowPlaying['track'][];
  prev_tracks: ServiceNowPlaying['track'][];
}

export interface ServiceTopItems<T> {
  items: T[];
  total: number;
}

export interface ServiceArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; width: number; height: number }[];
  popularity: number;
}

export interface ServiceTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  external_urls: { spotify?: string };
}

export interface ServiceUserInfo {
  profile: Record<string, unknown>;
  plan: Record<string, unknown>;
  has_premium: boolean;
  username: string;
}

export interface ServiceHealth {
  status: string;
  spotify_connected: boolean;
  timestamp: string;
}

async function serviceFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${SERVICE_BASE}${path}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Service error ${response.status}`);
  }
  return response.json();
}

export async function getServiceHealth(): Promise<ServiceHealth> {
  return serviceFetch<ServiceHealth>('/health');
}

export async function getServiceNowPlaying(): Promise<ServiceNowPlaying> {
  return serviceFetch<ServiceNowPlaying>('/now-playing');
}

export async function getServiceRecentlyPlayed(limit: number = 20): Promise<ServiceRecentlyPlayed> {
  return serviceFetch<ServiceRecentlyPlayed>(`/recently-played?limit=${limit}`);
}

export async function getServiceTopArtists(
  timeRange: string = 'medium_term',
  limit: number = 25
): Promise<ServiceTopItems<ServiceArtist>> {
  return serviceFetch<ServiceTopItems<ServiceArtist>>(`/top-artists?time_range=${timeRange}&limit=${limit}`);
}

export async function getServiceTopTracks(
  timeRange: string = 'medium_term',
  limit: number = 25
): Promise<ServiceTopItems<ServiceTrack>> {
  return serviceFetch<ServiceTopItems<ServiceTrack>>(`/top-tracks?time_range=${timeRange}&limit=${limit}`);
}

export async function getServicePlayerState(): Promise<ServicePlayerState> {
  return serviceFetch<ServicePlayerState>('/player-state');
}

export async function getServiceUserInfo(): Promise<ServiceUserInfo> {
  return serviceFetch<ServiceUserInfo>('/user');
}

export async function searchSpotify(
  query: string,
  type: string = 'track',
  limit: number = 10
): Promise<{ results: unknown[] }> {
  return serviceFetch<{ results: unknown[] }>(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
}
