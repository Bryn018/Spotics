// Spotify Data Hooks — Real-time polling for Spotify Web API data

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isSpotifyAuthenticated,
  getNowPlaying,
  getRecentlyPlayed,
  getTopArtists,
  getTopTracks,
  type NowPlayingResponse,
  type RecentlyPlayedResponse,
  type TopArtistsResponse,
  type TopTracksResponse,
} from '../services/spotifyApi';

const SPOTIFY_NOW_PLAYING_INTERVAL = 2000; // 2s for now playing
const SPOTIFY_RECENT_INTERVAL = 10000; // 10s for recently played (Spotify caches this)
const SPOTIFY_TOP_INTERVAL = 60000; // 60s for top artists/tracks (doesn't change often)

// --- Generic Spotify polling hook ---
function useSpotifyData<T>(
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
    if (!isSpotifyAuthenticated()) {
      setLoading(false);
      return;
    }

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

// --- Now Playing (2s) ---
export function useSpotifyNowPlaying() {
  const fetcher = useCallback(() => getNowPlaying(), []);
  return useSpotifyData(fetcher, SPOTIFY_NOW_PLAYING_INTERVAL);
}

// --- Recently Played (10s) ---
export function useSpotifyRecentlyPlayed(limit: number = 20) {
  const fetcher = useCallback(() => getRecentlyPlayed(limit), [limit]);
  return useSpotifyData(fetcher, SPOTIFY_RECENT_INTERVAL);
}

// --- Top Artists (60s) ---
export function useSpotifyTopArtists(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 10
) {
  const fetcher = useCallback(() => getTopArtists(timeRange, limit), [timeRange, limit]);
  return useSpotifyData(fetcher, SPOTIFY_TOP_INTERVAL);
}

// --- Top Tracks (60s) ---
export function useSpotifyTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 10
) {
  const fetcher = useCallback(() => getTopTracks(timeRange, limit), [timeRange, limit]);
  return useSpotifyData(fetcher, SPOTIFY_TOP_INTERVAL);
}
