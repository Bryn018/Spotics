import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api, apiRoutes } from '../lib/api';
import type { DashboardResponse, TimeRange, NowPlayingResponse } from '../types';
import { isDevPreviewEnabled, getMockDashboardPayload, mockNowPlaying } from '../lib/devPreview';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboard(timeframe: TimeRange) {
  return useQuery({
    queryKey: ['dashboard', timeframe],
    queryFn: async () => {
      if (isDevPreviewEnabled()) {
        return {
          user: { id: 'dev-user-001', email: 'dev@spotics.local', display_name: 'Dev User', avatar_url: 'https://i.pravatar.cc/300?u=dev-spotics', country: 'US', created_at: '2024-01-15T10:30:00Z', updated_at: '2026-05-06T20:45:00Z' },
          timeframe,
          summary: {
            id: 'summary-1',
            timeframe,
            totals: { minutes: 8540, tracks: 1247, artists: 89 },
            payload: getMockDashboardPayload(timeframe),
            fetchedAt: new Date().toISOString(),
          },
          summaries: [],
          activities: [],
        } as DashboardResponse;
      }
      const { data } = await api.get<ApiResponse<DashboardResponse>>(apiRoutes.dashboard, {
        params: { timeframe },
      });
      return data.data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useSyncDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isDevPreviewEnabled()) return; // no-op in dev preview
      await api.post(apiRoutes.sync);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
    },
  });
}

// Poll for real-time listening activity every 30 seconds
export function useRealtimeSync(enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['activities-sync'],
    queryFn: async () => {
      await api.post(apiRoutes.activitiesSync);
      return true;
    },
    enabled,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 0,
    retry: 1,
  });

  // Invalidate dashboard queries after each successful sync
  useEffect(() => {
    if (query.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
    }
  }, [query.isSuccess, query.dataUpdatedAt, queryClient]);

  return query;
}

// Poll for currently playing track every 10 seconds
export function useNowPlaying(enabled: boolean) {
  return useQuery({
    queryKey: ['now-playing'],
    queryFn: async () => {
      if (isDevPreviewEnabled()) {
        return mockNowPlaying;
      }
      const { data } = await api.get<ApiResponse<NowPlayingResponse>>(apiRoutes.nowPlaying);
      return data.data;
    },
    enabled: enabled && !isDevPreviewEnabled(), // disable polling in dev preview
    refetchInterval: isDevPreviewEnabled() ? false : 10 * 1000, // 10 seconds
    staleTime: 0,
    retry: 1,
  });
}
