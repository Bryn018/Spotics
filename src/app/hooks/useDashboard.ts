import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
