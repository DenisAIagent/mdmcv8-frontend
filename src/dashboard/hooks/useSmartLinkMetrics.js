// src/dashboard/hooks/useSmartLinkMetrics.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api.service';

// Hook principal pour récupérer les métriques SmartLinks
export const useSmartLinkMetrics = (options = {}) => {
  const { 
    enabled = true,
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 useSmartLinkMetrics: Récupération données dashboard...');
      const response = await apiService.analytics.getDashboardStats();
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur récupération données');
      }
      
      return response.data;
    },
    enabled,
    refetchInterval,
    staleTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions
  });
};

// Hook pour les statistiques globales avec filtres personnalisés
export const useGlobalStats = (filters = {}, options = {}) => {
  const { 
    enabled = true,
    refetchInterval = 10 * 60 * 1000, // 10 minutes
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['global-stats', filters],
    queryFn: async () => {
      console.log('🔄 useGlobalStats: Récupération stats globales...', filters);
      const response = await apiService.analytics.getGlobalStats(filters);
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur récupération stats globales');
      }
      
      return response.data;
    },
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...queryOptions
  });
};

// Hook pour les statistiques d'un SmartLink spécifique
export const useSmartLinkStats = (smartLinkId, filters = {}, options = {}) => {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['smartlink-stats', smartLinkId, filters],
    queryFn: async () => {
      console.log('🔄 useSmartLinkStats: Stats SmartLink...', smartLinkId);
      const response = await apiService.analytics.getSmartLinkStats(smartLinkId, filters);
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur stats SmartLink');
      }
      
      return response.data;
    },
    enabled: enabled && !!smartLinkId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    ...queryOptions
  });
};

// Hook pour les statistiques d'un artiste
export const useArtistStats = (artistId, filters = {}, options = {}) => {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['artist-stats', artistId, filters],
    queryFn: async () => {
      console.log('🔄 useArtistStats: Stats artiste...', artistId);
      const response = await apiService.analytics.getArtistStats(artistId, filters);
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur stats artiste');
      }
      
      return response.data;
    },
    enabled: enabled && !!artistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...queryOptions
  });
};

// Hook pour invalidation manuelle du cache
export const useDashboardCache = () => {
  const queryClient = useQueryClient();

  const refreshDashboard = () => {
    console.log('🔄 Rafraîchissement manuel du dashboard...');
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const refreshGlobalStats = () => {
    console.log('🔄 Rafraîchissement stats globales...');
    queryClient.invalidateQueries({ queryKey: ['global-stats'] });
  };

  const refreshSmartLinkStats = (smartLinkId) => {
    console.log('🔄 Rafraîchissement stats SmartLink...', smartLinkId);
    queryClient.invalidateQueries({ queryKey: ['smartlink-stats', smartLinkId] });
  };

  const clearCache = () => {
    console.log('🗑️ Nettoyage cache dashboard...');
    queryClient.clear();
  };

  return {
    refreshDashboard,
    refreshGlobalStats,
    refreshSmartLinkStats,
    clearCache
  };
};

// Hook pour les données mockées (développement)
export const useMockMetrics = () => {
  return useQuery({
    queryKey: ['mock-dashboard-stats'],
    queryFn: async () => {
      // Simuler un délai API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        stats: {
          totalSmartLinks: { value: 45, change: '+12%', changeType: 'positive' },
          activeArtists: { value: 18, change: '+3%', changeType: 'positive' },
          monthlyViews: { value: 12847, change: '+28%', changeType: 'positive' },
          totalClicks: { value: 8453, change: '+15%', changeType: 'positive' }
        },
        weeklyPerformance: {
          newClicks: 1247,
          conversionRate: '3.2%'
        },
        recentActivities: [
          {
            title: 'Nouveau SmartLink créé',
            subtitle: 'Artiste: Lost Frequencies - "Reality"',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
          },
          {
            title: 'Pic de trafic détecté',
            subtitle: '1.2k vues en 30 minutes sur "Midnight City"',
            time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
          },
          {
            title: 'Nouvel artiste ajouté',
            subtitle: 'The Weeknd ajouté au portfolio',
            time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
          }
        ],
        chartData: {
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
          clicks: [245, 312, 189, 467, 523, 398, 445],
          views: [1234, 1567, 945, 2234, 2567, 1890, 2145]
        },
        topSmartLinks: [
          { id: 1, title: 'Reality - Lost Frequencies', clicks: 1247, artist: 'Lost Frequencies' },
          { id: 2, title: 'Midnight City - M83', clicks: 1089, artist: 'M83' },
          { id: 3, title: 'Strobe - Deadmau5', clicks: 892, artist: 'Deadmau5' },
          { id: 4, title: 'One More Time - Daft Punk', clicks: 756, artist: 'Daft Punk' }
        ],
        artistBreakdown: [
          { name: 'Electronic', value: 45, color: '#6366f1' },
          { name: 'Rock', value: 25, color: '#8b5cf6' },
          { name: 'Pop', value: 20, color: '#06b6d4' },
          { name: 'Hip-Hop', value: 10, color: '#10b981' }
        ]
      };
    },
    staleTime: Infinity, // Les données mockées ne changent pas
    retry: false
  });
};