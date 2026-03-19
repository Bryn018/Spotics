import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useDashboard, useSyncDashboard } from '../hooks/useDashboard';
import type { DashboardResponse, TimeRange } from '../types';

interface DashboardContextValue {
  timeframe: TimeRange;
  setTimeframe: (range: TimeRange) => void;
  data?: DashboardResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  syncing: boolean;
  sync: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

interface DashboardProviderProps extends PropsWithChildren {
  initialTimeframe?: TimeRange;
}

export function DashboardProvider({ children, initialTimeframe = 'medium_term' }: DashboardProviderProps) {
  const [timeframe, setTimeframe] = useState<TimeRange>(initialTimeframe);
  const dashboardQuery = useDashboard(timeframe);
  const syncMutation = useSyncDashboard();

  const sync = async () => {
    await syncMutation.mutateAsync();
  };

  const value = useMemo<DashboardContextValue>(() => ({
    timeframe,
    setTimeframe,
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
    syncing: syncMutation.isPending,
    sync,
  }), [timeframe, dashboardQuery.data, dashboardQuery.isLoading, dashboardQuery.isError, dashboardQuery.error, dashboardQuery.refetch, syncMutation.isPending, sync]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardProvider');
  }
  return context;
}
