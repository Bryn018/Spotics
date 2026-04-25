import { useQuery } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';
import type { ExportResponse } from '../types';

async function fetchExport(): Promise<ExportResponse> {
  const { data } = await api.get<{ success: boolean; data: ExportResponse }>(apiRoutes.export);
  return data.data;
}

export function useExport() {
  return useQuery({
    queryKey: ['export'],
    queryFn: fetchExport,
    staleTime: 5 * 60 * 1000,
  });
}
