import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import type { Campaign, ApiResponse, CampaignFilters, PaginationParams } from '@mdmc/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface UseCampaignsParams extends CampaignFilters, PaginationParams {
  clientId: string;
}

async function fetchCampaigns(params: UseCampaignsParams, token: string): Promise<ApiResponse<Campaign[]>> {
  const { clientId, ...queryParams } = params;
  const searchParams = new URLSearchParams();
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/campaigns?${searchParams}`,
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

async function fetchCampaignById(clientId: string, campaignId: string, token: string): Promise<ApiResponse<Campaign>> {
  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/campaigns/${campaignId}`,
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

async function syncMetaCampaigns(clientId: string, token: string): Promise<ApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/campaigns/sync/meta`,
    {
      method: 'POST',
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

export function useCampaigns(params: UseCampaignsParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token non disponible');
      return fetchCampaigns(params, token);
    },
    enabled: !!params.clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCampaign(clientId: string, campaignId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['campaign', clientId, campaignId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token non disponible');
      return fetchCampaignById(clientId, campaignId, token);
    },
    enabled: !!clientId && !!campaignId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useSyncMetaCampaigns() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token non disponible');
      return syncMetaCampaigns(clientId, token);
    },
    onSuccess: (data, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      
      toast.success(
        `Synchronisation réussie: ${data.data?.synced_campaigns || 0} campagnes mises à jour`
      );
    },
    onError: (error: any) => {
      console.error('Erreur synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des campagnes');
    },
  });
}