import { createContext, useContext, type ReactNode } from 'react';
import type { SpoticsUser } from '../types';
import { useSessionQuery } from '../hooks/useSessionQuery';

export interface SessionState {
  authenticated: boolean;
  user: SpoticsUser | null;
  isLoading: boolean;
}

export const SessionContext = createContext<SessionState>({
  authenticated: false,
  user: null,
  isLoading: true,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useSessionQuery();

  const value: SessionState = {
    authenticated: data?.authenticated ?? false,
    user: (data?.user as SpoticsUser) ?? null,
    isLoading,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
