// Spotify Service Client — talks to the local Python SpotAPI service
// Uses WebSocket for instant push updates, REST API as fallback

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

export interface ServiceHealth {
  status: string;
  spotify_connected: boolean;
  service: string;
  timestamp: string;
}

// --- REST API fallback ---

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

export async function getServicePlayerState(): Promise<ServicePlayerState> {
  return serviceFetch<ServicePlayerState>('/player-state');
}

// --- WebSocket connection for instant updates ---

type SocketIOEventType = 'now_playing_update' | 'recently_played_update' | 'track_changed';

interface SocketCallbacks {
  onNowPlaying?: (data: ServiceNowPlaying) => void;
  onRecentlyPlayed?: (data: ServiceRecentlyPlayed) => void;
  onTrackChanged?: (data: ServiceNowPlaying) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

let socketIO: any = null;
let socketConnected = false;

export function connectSocketIO(callbacks: SocketCallbacks): Promise<boolean> {
  return new Promise((resolve) => {
    // Dynamically load socket.io client from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    script.onload = () => {
      try {
        const io = (window as any).io;
        if (!io) {
          console.error('[SpotifyService] Socket.IO not available');
          resolve(false);
          return;
        }

        socketIO = io(SERVICE_BASE, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 10,
        });

        socketIO.on('connect', () => {
          console.log('[SpotifyService] WebSocket connected');
          socketConnected = true;
          callbacks.onConnect?.();
        });

        socketIO.on('disconnect', () => {
          console.log('[SpotifyService] WebSocket disconnected');
          socketConnected = false;
          callbacks.onDisconnect?.();
        });

        socketIO.on('now_playing_update', (data: ServiceNowPlaying) => {
          callbacks.onNowPlaying?.(data);
        });

        socketIO.on('recently_played_update', (data: ServiceRecentlyPlayed) => {
          callbacks.onRecentlyPlayed?.(data);
        });

        socketIO.on('track_changed', (data: ServiceNowPlaying) => {
          callbacks.onTrackChanged?.(data);
        });

        resolve(true);
      } catch (err) {
        console.error('[SpotifyService] Socket.IO connection failed:', err);
        resolve(false);
      }
    };
    script.onerror = () => {
      console.error('[SpotifyService] Failed to load Socket.IO client');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

export function disconnectSocketIO() {
  if (socketIO) {
    socketIO.disconnect();
    socketIO = null;
    socketConnected = false;
  }
}

export function isSocketConnected(): boolean {
  return socketConnected;
}
