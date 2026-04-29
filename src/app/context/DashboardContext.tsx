import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useDashboard, useSyncDashboard, useRealtimeSync } from '../hooks/useDashboard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useExport } from '../hooks/useExport';
import { useSession } from '../context/SessionContext';
import type { DashboardResponse, TimeRange, AnalyticsResponse, ExportResponse } from '../types';

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
  // Analytics
  analytics?: AnalyticsResponse;
  isLoadingAnalytics: boolean;
  isErrorAnalytics: boolean;
  errorAnalytics: unknown;
  refetchAnalytics: () => void;
  // Export
  exportData?: ExportResponse;
  isLoadingExport: boolean;
  isErrorExport: boolean;
  errorExport: unknown;
  refetchExport: () => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

interface DashboardProviderProps extends PropsWithChildren {
  initialTimeframe?: TimeRange;
}

export function DashboardProvider({ children, initialTimeframe = 'medium_term' }: DashboardProviderProps) {
  const [timeframe, setTimeframe] = useState<TimeRange>(initialTimeframe);
  const { authenticated } = useSession();
  const dashboardQuery = useDashboard(timeframe);
  const analyticsQuery = useAnalytics();
  const exportQuery = useExport();
  const syncMutation = useSyncDashboard();

  // Real-time sync: poll every 30s when authenticated
  useRealtimeSync(authenticated);

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
    // Analytics
    analytics: analyticsQuery.data,
    isLoadingAnalytics: analyticsQuery.isLoading,
    isErrorAnalytics: analyticsQuery.isError,
    errorAnalytics: analyticsQuery.error,
    refetchAnalytics: analyticsQuery.refetch,
    // Export
    exportData: exportQuery.data,
    isLoadingExport: exportQuery.isLoading,
    isErrorExport: exportQuery.isError,
    errorExport: exportQuery.error,
    refetchExport: exportQuery.refetch,
  }), [
    timeframe,
    dashboardQuery.data, dashboardQuery.isLoading, dashboardQuery.isError, dashboardQuery.error, dashboardQuery.refetch,
    analyticsQuery.data, analyticsQuery.isLoading, analyticsQuery.isError, analyticsQuery.error, analyticsQuery.refetch,
    exportQuery.data, exportQuery.isLoading, exportQuery.isError, exportQuery.error, exportQuery.refetch,
    syncMutation.isPending, sync,
  ]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardProvider');
  }
  return context;
}

export function useAnalyticsData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useAnalyticsData must be used within a DashboardProvider');
  }
  return {
    data: context.analytics,
    isLoading: context.isLoadingAnalytics,
    isError: context.isErrorAnalytics,
    error: context.errorAnalytics,
    refetch: context.refetchAnalytics,
  };
}

export function useExportData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useExportData must be used within a DashboardProvider');
  }
  return {
    data: context.exportData,
    isLoading: context.isLoadingExport,
    isError: context.isErrorExport,
    error: context.errorExport,
    refetch: context.refetchExport,
  };
}
