import { useEffect, useRef } from 'react';
import { useDashboardData } from '../context/DashboardContext';

export function AutoSync() {
  const { data, syncing, sync, isLoading } = useDashboardData();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Auto-sync when: loaded, not currently syncing, no data yet, haven't synced before
    if (!isLoading && !syncing && !hasSynced.current && data && !data.summary) {
      hasSynced.current = true;
      sync();
    }
  }, [isLoading, syncing, data]);

  return null;
}
