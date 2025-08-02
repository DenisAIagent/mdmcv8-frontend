// src/dashboard/hooks/useRealTimeUpdates.js
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hook pour les mises à jour en temps réel du dashboard
export const useRealTimeUpdates = (options = {}) => {
  const {
    enabled = true,
    interval = 30000, // 30 secondes par défaut
    onUpdate = null,
    queryKeys = ['dashboard-stats', 'global-stats']
  } = options;

  const queryClient = useQueryClient();
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  // Fonction de mise à jour
  const performUpdate = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      console.log('🔄 useRealTimeUpdates: Mise à jour automatique...');
      
      // Invalider les queries spécifiées
      for (const queryKey of queryKeys) {
        await queryClient.invalidateQueries({ 
          queryKey: Array.isArray(queryKey) ? queryKey : [queryKey]
        });
      }

      // Callback optionnel
      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error('❌ useRealTimeUpdates: Erreur mise à jour:', error);
    }
  }, [queryClient, queryKeys, onUpdate]);

  // Démarrer les mises à jour
  const startUpdates = useCallback(() => {
    if (!enabled) return;

    console.log('▶️ useRealTimeUpdates: Démarrage mises à jour automatiques');
    isActiveRef.current = true;
    
    intervalRef.current = setInterval(performUpdate, interval);
  }, [enabled, interval, performUpdate]);

  // Arrêter les mises à jour
  const stopUpdates = useCallback(() => {
    console.log('⏹️ useRealTimeUpdates: Arrêt mises à jour automatiques');
    isActiveRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Redémarrer avec un nouvel intervalle
  const restartUpdates = useCallback((newInterval = interval) => {
    stopUpdates();
    setTimeout(() => startUpdates(), 100);
  }, [interval, stopUpdates, startUpdates]);

  // Effet principal
  useEffect(() => {
    startUpdates();
    return stopUpdates;
  }, [startUpdates, stopUpdates]);

  // Pause/reprise basée sur la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page cachée: Pause mises à jour');
        stopUpdates();
      } else {
        console.log('📱 Page visible: Reprise mises à jour');
        startUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startUpdates, stopUpdates]);

  return {
    startUpdates,
    stopUpdates,
    restartUpdates,
    performUpdate,
    isActive: isActiveRef.current
  };
};

// Hook pour les notifications push de changements critiques
export const useCriticalUpdates = (onCriticalUpdate) => {
  const queryClient = useQueryClient();

  const checkCriticalUpdates = useCallback(async () => {
    try {
      // Récupérer les dernières données sans cache
      const freshData = await queryClient.fetchQuery({
        queryKey: ['dashboard-stats'],
        staleTime: 0
      });

      // Exemples de conditions critiques
      const criticalConditions = [
        // Pic de trafic soudain (>500% d'augmentation)
        freshData?.stats?.monthlyViews?.value > 50000,
        // Erreur système
        freshData?.systemStatus === 'error',
        // Nouveau SmartLink viral
        freshData?.topSmartLinks?.[0]?.clicks > 10000
      ];

      if (criticalConditions.some(condition => condition)) {
        console.log('🚨 Mise à jour critique détectée');
        onCriticalUpdate?.(freshData);
      }

    } catch (error) {
      console.error('❌ Erreur vérification mises à jour critiques:', error);
    }
  }, [queryClient, onCriticalUpdate]);

  useEffect(() => {
    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkCriticalUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkCriticalUpdates]);

  return { checkCriticalUpdates };
};

// Hook pour optimiser les requêtes en arrière-plan
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();

  const prefetchData = useCallback(async () => {
    try {
      console.log('🔄 Préchargement données en arrière-plan...');
      
      // Précharger les données probablement consultées
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['global-stats', { period: '7d' }],
          staleTime: 5 * 60 * 1000 // 5 minutes
        }),
        queryClient.prefetchQuery({
          queryKey: ['smartlinks'],
          staleTime: 10 * 60 * 1000 // 10 minutes
        })
      ]);

    } catch (error) {
      console.warn('⚠️ Erreur préchargement:', error);
    }
  }, [queryClient]);

  // Précharger quand l'utilisateur devient inactif
  useEffect(() => {
    let timeoutId;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(prefetchData, 30000); // 30s d'inactivité
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    resetTimeout(); // Initial timeout

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [prefetchData]);

  return { prefetchData };
};