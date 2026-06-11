// Spotify Service Hooks — polling hooks for the local SpotAPI service

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getServiceNowPlaying,
  getServiceRecentlyPlayed,
  getServiceTopArtists,
  getServiceTopTracks,
  getServicePlayerState,
  getServiceHealth,
  type ServiceNowPlaying,
  type ServiceRecentlyPlayed,
  type ServiceTopItems,
  type ServiceArtist,
  type ServiceTrack,
  type ServicePlayerState,
  type ServiceHealth,
} from '../services/spotifyService';

const NOW_PLAYING_INTERVAL = 2000; // 2s
const RECENT_INTERVAL = 8000;      // 8s
const TOP_INTERVAL = 60000;        // 60s
const PLAYER_STATE_INTERVAL = 3000; // 3s
const HEALTH_INTERVAL = 30000;     // 30s

function useServiceData<T>(
  fetcher: () => Promise<T>,
  interval: number,
  enabled: boolean = true
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
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    isFirstFetch.current = true;
    setLoading(true);
    fetchData();
    intervalRef.current = setInterval(fetchData, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, interval, enabled]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}

export function useServiceNowPlaying() {
  const fetcher = useCallback(() => getServiceNowPlaying(), []);
  return useServiceData(fetcher, NOW_PLAYING_INTERVAL);
}

export function useServiceRecentlyPlayed(limit: number = 20) {
  const fetcher = useCallback(() => getServiceRecentlyPlayed(limit), [limit]);
  return useServiceData(fetcher, RECENT_INTERVAL);
}

export function useServiceTopArtists(
  timeRange: string = 'medium_term',
  limit: number = 10
) {
  const fetcher = useCallback(() => getServiceTopArtists(timeRange, limit), [timeRange, limit]);
  return useServiceData(fetcher, TOP_INTERVAL);
}

export function useServiceTopTracks(
  timeRange: string = 'medium_term',
  limit: number = 10
) {
  const fetcher = useCallback(() => getServiceTopTracks(timeRange, limit), [timeRange, limit]);
  return useServiceData(fetcher, TOP_INTERVAL);
}

export function useServicePlayerState() {
  const fetcher = useCallback(() => getServicePlayerState(), []);
  return useServiceData(fetcher, PLAYER_STATE_INTERVAL);
}

export function useServiceHealth() {
  const fetcher = useCallback(() => getServiceHealth(), []);
  return useServiceData(fetcher, HEALTH_INTERVAL);
}
