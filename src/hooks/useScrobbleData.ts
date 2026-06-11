// Spotics Scrobble Hooks — Real-time polling versions

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  hasApiKey,
  getStats,
  getTopArtists,
  getTopTracks,
  getListeningStats,
  getHeatmap,
  getNowPlaying,
  getScrobbles,
  type StatsResponse,
  type TopArtistsResponse,
  type TopTracksResponse,
  type ListeningStatsResponse,
  type HeatmapResponse,
  type NowPlayingResponse,
  type ScrobblesListResponse,
} from '../services/scrobbleApi';

const POLL_INTERVAL = 8000; // 8 seconds for main data
const NOW_PLAYING_INTERVAL = 3000; // 3 seconds for now playing

// --- Generic real-time hook ---
function useRealtimeData<T>(
  fetcher: () => Promise<T>,
  interval: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
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
    if (!enabled) return;
    fetchData(); // immediate first fetch
    intervalRef.current = setInterval(fetchData, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, interval, enabled]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}

// --- Stats ---
export function useScrobbleStats(period: string = 'all') {
  const fetcher = useCallback(() => getStats(period), [period]);
  return useRealtimeData(fetcher, POLL_INTERVAL);
}

// --- Top Artists ---
export function useTopArtists(period: string = 'all', limit: number = 25) {
  const fetcher = useCallback(() => getTopArtists(period, limit), [period, limit]);
  return useRealtimeData(fetcher, POLL_INTERVAL);
}

// --- Top Tracks ---
export function useTopTracks(period: string = 'all', limit: number = 25) {
  const fetcher = useCallback(() => getTopTracks(period, limit), [period, limit]);
  return useRealtimeData(fetcher, POLL_INTERVAL);
}

// --- Listening Stats ---
export function useListeningStats(period: string = '30d') {
  const fetcher = useCallback(() => getListeningStats(period), [period]);
  return useRealtimeData(fetcher, POLL_INTERVAL);
}

// --- Heatmap ---
export function useHeatmap(period: string = '30d') {
  const fetcher = useCallback(() => getHeatmap(period), [period]);
  return useRealtimeData(fetcher, POLL_INTERVAL);
}

// --- Now Playing (faster poll) ---
export function useNowPlaying(refreshInterval: number = NOW_PLAYING_INTERVAL) {
  const fetcher = useCallback(() => getNowPlaying(), []);
  return useRealtimeData(fetcher, refreshInterval);
}

// --- Recent Scrobbles ---
export function useRecentScrobbles(limit: number = 50) {
  const fetcher = useCallback(() => getScrobbles({ limit }), [limit]);
  return useRealtimeData(fetcher, POLL_INTERVAL);
}

// --- Connection Status ---
export function useScrobbleConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(hasApiKey());
  }, []);

  const connect = useCallback((apiKey: string) => {
    localStorage.setItem('spotics_api_key', apiKey);
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('spotics_api_key');
    setIsConnected(false);
  }, []);

  return { isConnected, connect, disconnect };
}
