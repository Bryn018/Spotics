import { useQuery } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';
import type { SpoticsUser } from '../types';
import { isDevPreviewEnabled, mockUser } from '../lib/devPreview';

interface SessionResponse {
  authenticated: boolean;
  user?: SpoticsUser | null;
}

export function useSessionQuery() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      if (isDevPreviewEnabled()) {
        return { authenticated: true, user: mockUser };
      }
      const { data } = await api.get<SessionResponse>(apiRoutes.session);
      return data;
    },
  });
}
