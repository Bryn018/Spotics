// Spotics Scrobble Hooks
// React hooks for fetching and managing scrobble data

import { useState, useEffect, useCallback } from 'react';
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

// --- Stats ---

export function useScrobbleStats(period: string = 'all') {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStats(period);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// --- Top Artists ---

export function useTopArtists(period: string = 'all', limit: number = 25) {
  const [data, setData] = useState<TopArtistsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getTopArtists(period, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top artists');
    } finally {
      setLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// --- Top Tracks ---

export function useTopTracks(period: string = 'all', limit: number = 25) {
  const [data, setData] = useState<TopTracksResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getTopTracks(period, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top tracks');
    } finally {
      setLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// --- Listening Stats ---

export function useListeningStats(period: string = '30d') {
  const [data, setData] = useState<ListeningStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getListeningStats(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listening stats');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// --- Heatmap ---

export function useHeatmap(period: string = '30d') {
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getHeatmap(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch heatmap');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// --- Now Playing (with auto-refresh) ---

export function useNowPlaying(refreshInterval: number = 10000) {
  const [data, setData] = useState<NowPlayingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    try {
      const result = await getNowPlaying();
      setData(result);
    } catch {
      // Now playing is non-critical
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, refetch: fetchData };
}

// --- Recent Scrobbles ---

export function useRecentScrobbles(limit: number = 50) {
  const [data, setData] = useState<ScrobblesListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getScrobbles({ limit });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scrobbles');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
