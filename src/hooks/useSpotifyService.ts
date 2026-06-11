// Spotify Service Hooks — WebSocket push + REST fallback for the SpotAPI service

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getServiceNowPlaying,
  getServiceRecentlyPlayed,
  getServicePlayerState,
  getServiceHealth,
  connectSocketIO,
  disconnectSocketIO,
  isSocketConnected,
  type ServiceNowPlaying,
  type ServiceRecentlyPlayed,
  type ServicePlayerState,
  type ServiceHealth,
} from '../services/spotifyService';

const REST_POLL_INTERVAL = 5000; // 5s REST poll as fallback when WS is connected
const FULL_POLL_INTERVAL = 3000; // 3s when only REST is available
const HEALTH_INTERVAL = 30000;    // 30s health check

// --- Generic hook with WebSocket push + REST polling ---
function useServiceData<T>(
  restFetcher: () => Promise<T>,
  wsEventType: 'now_playing_update' | 'recently_played_update',
  pollInterval: number = FULL_POLL_INTERVAL
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstFetch = useRef(true);

  const fetchData = useCallback(async () => {
    if (isFirstFetch.current) {
      setLoading(true);
      isFirstFetch.current = false;
    }
    try {
      const result = await restFetcher();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [restFetcher]);

  useEffect(() => {
    isFirstFetch.current = true;
    setLoading(true);
    fetchData();

    intervalRef.current = setInterval(fetchData, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, pollInterval]);

  return { data, loading, error, lastUpdated, refetch: fetchData, setData };
}

// --- Now Playing: WebSocket push + REST fallback ---
export function useServiceNowPlaying() {
  const { data, loading, error, lastUpdated, refetch, setData } = useServiceData(
    getServiceNowPlaying,
    'now_playing_update',
    REST_POLL_INTERVAL
  );

  useEffect(() => {
    connectSocketIO({
      onNowPlaying: (wsData) => {
        setData(wsData);
      },
      onTrackChanged: (wsData) => {
        setData(wsData);
      },
    });
    return () => {
      // Don't disconnect on unmount — other hooks may use it
    };
  }, [setData]);

  return {
    data,
    loading: loading && !data,
    error,
    lastUpdated,
    refetch,
    isRealtime: isSocketConnected(),
  };
}

// --- Recently Played: WebSocket push + REST fallback ---
export function useServiceRecentlyPlayed(limit: number = 20) {
  const { data, loading, error, lastUpdated, refetch, setData } = useServiceData(
    () => getServiceRecentlyPlayed(limit),
    'recently_played_update',
    REST_POLL_INTERVAL
  );

  useEffect(() => {
    connectSocketIO({
      onRecentlyPlayed: (wsData) => {
        setData(wsData);
      },
    });
  }, [setData]);

  return {
    data,
    loading: loading && !data,
    error,
    lastUpdated,
    refetch,
    isRealtime: isSocketConnected(),
  };
}

// --- Player State ---
export function useServicePlayerState() {
  const fetcher = useCallback(() => getServicePlayerState(), []);
  return useServiceData(fetcher, 'now_playing_update', FULL_POLL_INTERVAL);
}

// --- Service Health ---
export function useServiceHealth() {
  const fetcher = useCallback(() => getServiceHealth(), []);
  return useServiceData(fetcher, 'now_playing_update', HEALTH_INTERVAL);
}

// --- Check if SpotAPI service is available ---
export async function isSpotAPIServiceAvailable(): Promise<boolean> {
  try {
    const health = await getServiceHealth();
    return health.status === 'ok';
  } catch {
    return false;
  }
}
