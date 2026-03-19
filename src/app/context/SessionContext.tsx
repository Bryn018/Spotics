import { createContext, useContext } from 'react';
import type { SpoticsUser } from '../types';

export interface SessionState {
  authenticated: boolean;
  user: SpoticsUser | null;
}

export const SessionContext = createContext<SessionState>({
  authenticated: false,
  user: null,
});

export function useSession() {
  return useContext(SessionContext);
}
