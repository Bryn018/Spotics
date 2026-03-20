import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';
import type { WrapPayloadMap, WrapReport, WrapTimeframe } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useWrap<T extends WrapTimeframe>(timeframe: T, enabled = true) {
  return useQuery({
    queryKey: ['wrap', timeframe],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WrapReport<WrapPayloadMap[T]> | null>>(apiRoutes.wraps, {
        params: { timeframe },
      });
      return data.data;
    },
    enabled,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useSyncWraps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post(apiRoutes.wrapSync);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wrap'] });
    },
  });
}
