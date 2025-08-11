/**
 * 🎛️ Hook React pour la gestion de l'ordre des plateformes
 * Intègre drag & drop, A/B testing et personnalisation
 */

import { useState, useEffect, useCallback } from 'react';
import platformOrderService from '../services/platformOrder.service';

/**
 * Hook principal pour l'ordre des plateformes
 */
export const usePlatformOrder = (initialPlatforms = [], options = {}) => {
  const [platforms, setPlatforms] = useState([]);
  const [isCustomized, setIsCustomized] = useState(false);
  const [orderSource, setOrderSource] = useState('default');
  const [abTestVariant, setAbTestVariant] = useState(null);

  const {
    enableABTest = true,
    userCountry = null,
    autoApply = true
  } = options;

  // Appliquer l'ordre personnalisé/A/B test lors du chargement
  useEffect(() => {
    if (initialPlatforms.length > 0 && autoApply) {
      const result = platformOrderService.applyCustomOrder(initialPlatforms, {
        enableABTest,
        userCountry
      });
      
      setPlatforms(result.platforms);
      setOrderSource(result.source);
      setIsCustomized(result.source === 'custom');
      
      if (enableABTest) {
        setAbTestVariant(platformOrderService.getABTestVariant());
      }
    } else {
      setPlatforms(initialPlatforms);
    }
  }, [initialPlatforms, enableABTest, userCountry, autoApply]);

  // Fonction pour réorganiser les plateformes (drag & drop)
  const reorderPlatforms = useCallback((reorderedPlatforms) => {
    setPlatforms(reorderedPlatforms);
    setIsCustomized(true);
    setOrderSource('custom');
    
    // Sauvegarder l'ordre personnalisé
    platformOrderService.saveUserCustomOrder(reorderedPlatforms);
  }, []);

  // Fonction pour remettre à zéro l'ordre
  const resetOrder = useCallback(() => {
    platformOrderService.resetToDefault();
    
    const result = platformOrderService.applyCustomOrder(initialPlatforms, {
      enableABTest,
      userCountry
    });
    
    setPlatforms(result.platforms);
    setOrderSource(result.source);
    setIsCustomized(false);
  }, [initialPlatforms, enableABTest, userCountry]);

  // Fonction pour forcer une variante d'A/B test
  const forceABTestVariant = useCallback((variantName) => {
    if (platformOrderService.forceABTestVariant(variantName)) {
      const result = platformOrderService.applyCustomOrder(initialPlatforms, {
        enableABTest: true,
        userCountry,
        forceVariant: variantName
      });
      
      setPlatforms(result.platforms);
      setOrderSource('ab_test');
      setAbTestVariant(variantName);
      setIsCustomized(false);
    }
  }, [initialPlatforms, userCountry]);

  return {
    platforms,
    reorderPlatforms,
    resetOrder,
    forceABTestVariant,
    isCustomized,
    orderSource,
    abTestVariant,
    // Méthodes utilitaires
    isPlatformFirst: (platformName) => platforms[0]?.platform === platformName,
    getPlatformPosition: (platformName) => platforms.findIndex(p => p.platform === platformName) + 1,
    getTotalPlatforms: () => platforms.length
  };
};

/**
 * Hook pour le drag & drop avec @dnd-kit
 */
export const useDragAndDrop = (platforms, onReorder) => {
  const [activeId, setActiveId] = useState(null);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = platforms.findIndex(platform => platform.platform === active.id);
      const newIndex = platforms.findIndex(platform => platform.platform === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newPlatforms = [...platforms];
        const [reorderedItem] = newPlatforms.splice(oldIndex, 1);
        newPlatforms.splice(newIndex, 0, reorderedItem);
        
        onReorder(newPlatforms);
      }
    }
    
    setActiveId(null);
  }, [platforms, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel
  };
};

/**
 * Hook pour les métriques et analytics de l'ordre des plateformes
 */
export const usePlatformOrderAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    abTestVariant: null,
    orderChanges: 0,
    conversionOptimization: null
  });

  useEffect(() => {
    const abTestStats = platformOrderService.getABTestStats();
    if (abTestStats) {
      setAnalytics(prev => ({
        ...prev,
        abTestVariant: abTestStats.variant
      }));
    }
  }, []);

  const trackPlatformClick = useCallback((platformName, position) => {
    // Tracking des clics pour optimiser l'ordre
    const trackingData = {
      platform: platformName,
      position: position,
      timestamp: new Date().toISOString(),
      abTestVariant: analytics.abTestVariant
    };

    // Platform click tracked for analytics
    
    // Envoyer à votre service d'analytics
    if (window.gtag) {
      window.gtag('event', 'platform_click', {
        'platform_name': platformName,
        'platform_position': position,
        'ab_test_variant': analytics.abTestVariant
      });
    }
  }, [analytics.abTestVariant]);

  const getConversionMetrics = useCallback(() => {
    // Calcul des métriques de conversion par position
    return {
      topThreeClickRate: 'Données en cours de collecte...',
      variantPerformance: analytics.abTestVariant,
      recommendedOrder: 'Analyse en cours...'
    };
  }, [analytics.abTestVariant]);

  return {
    analytics,
    trackPlatformClick,
    getConversionMetrics
  };
};