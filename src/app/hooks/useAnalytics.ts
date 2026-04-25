import { useQuery } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';
import type { AnalyticsResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AnalyticsResponse>>(apiRoutes.analytics);
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
