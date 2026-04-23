import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api, apiRoutes } from '../lib/api';
import type { DashboardResponse, TimeRange } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboard(timeframe: TimeRange) {
  return useQuery({
    queryKey: ['dashboard', timeframe],
    queryFn: async () => {
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
