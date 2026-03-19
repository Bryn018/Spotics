import { useQuery } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';
import type { SpoticsUser } from '../types';

interface SessionResponse {
  authenticated: boolean;
  user?: SpoticsUser | null;
}

export function useSessionQuery() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await api.get<SessionResponse>(apiRoutes.session);
      return data;
    },
  });
}
