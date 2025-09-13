import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import type { DashboardMetrics, PlatformMetrics, ApiResponse } from '@mdmc/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface DashboardData {
  overview: DashboardMetrics;
  platform_breakdown: PlatformMetrics[];
}

interface UseDashboardParams {
  clientId: string;
  date_from?: string;
  date_to?: string;
}

async function fetchDashboardMetrics(params: UseDashboardParams, token: string): Promise<ApiResponse<DashboardData>> {
  const { clientId, ...queryParams } = params;
  const searchParams = new URLSearchParams();
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/dashboard/metrics?${searchParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}

export function useDashboard(params: UseDashboardParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['dashboard-metrics', params],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token non disponible');
      return fetchDashboardMetrics(params, token);
    },
    enabled: !!params.clientId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}