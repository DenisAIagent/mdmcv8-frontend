// src/dashboard/hooks/useDashboardLayout.js
import { useState, useEffect, useCallback } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

// Configuration par défaut des widgets
const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'stats-overview', x: 0, y: 0, w: 12, h: 2 },
    { i: 'performance-chart', x: 0, y: 2, w: 8, h: 4 },
    { i: 'recent-activity', x: 8, y: 2, w: 4, h: 4 },
    { i: 'top-smartlinks', x: 0, y: 6, w: 6, h: 3 },
    { i: 'artist-breakdown', x: 6, y: 6, w: 6, h: 3 }
  ],
  md: [
    { i: 'stats-overview', x: 0, y: 0, w: 10, h: 2 },
    { i: 'performance-chart', x: 0, y: 2, w: 10, h: 4 },
    { i: 'recent-activity', x: 0, y: 6, w: 5, h: 4 },
    { i: 'top-smartlinks', x: 5, y: 6, w: 5, h: 4 },
    { i: 'artist-breakdown', x: 0, y: 10, w: 10, h: 3 }
  ],
  sm: [
    { i: 'stats-overview', x: 0, y: 0, w: 6, h: 2 },
    { i: 'performance-chart', x: 0, y: 2, w: 6, h: 4 },
    { i: 'recent-activity', x: 0, y: 6, w: 6, h: 4 },
    { i: 'top-smartlinks', x: 0, y: 10, w: 6, h: 3 },
    { i: 'artist-breakdown', x: 0, y: 13, w: 6, h: 3 }
  ],
  xs: [
    { i: 'stats-overview', x: 0, y: 0, w: 4, h: 2 },
    { i: 'performance-chart', x: 0, y: 2, w: 4, h: 4 },
    { i: 'recent-activity', x: 0, y: 6, w: 4, h: 4 },
    { i: 'top-smartlinks', x: 0, y: 10, w: 4, h: 3 },
    { i: 'artist-breakdown', x: 0, y: 13, w: 4, h: 3 }
  ]
};

const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480
};

const COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4
};

// Hook principal pour gérer le layout du dashboard
export const useDashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // État des layouts
  const [layouts, setLayouts] = useState(() => {
    // Essayer de récupérer depuis localStorage
    const savedLayouts = localStorage.getItem('mdmc-dashboard-layouts');
    if (savedLayouts) {
      try {
        return JSON.parse(savedLayouts);
      } catch (error) {
        console.warn('Erreur parsing layouts sauvegardés:', error);
      }
    }
    return DEFAULT_LAYOUTS;
  });

  // État des widgets visibles/cachés
  const [widgetVisibility, setWidgetVisibility] = useState(() => {
    const savedVisibility = localStorage.getItem('mdmc-dashboard-widget-visibility');
    if (savedVisibility) {
      try {
        return JSON.parse(savedVisibility);
      } catch (error) {
        console.warn('Erreur parsing visibilité widgets:', error);
      }
    }
    return {
      'stats-overview': true,
      'performance-chart': true,
      'recent-activity': true,
      'top-smartlinks': true,
      'artist-breakdown': true
    };
  });

  // État du mode édition
  const [isEditing, setIsEditing] = useState(false);

  // Sauvegarder dans localStorage quand les layouts changent
  useEffect(() => {
    localStorage.setItem('mdmc-dashboard-layouts', JSON.stringify(layouts));
  }, [layouts]);

  // Sauvegarder la visibilité des widgets
  useEffect(() => {
    localStorage.setItem('mdmc-dashboard-widget-visibility', JSON.stringify(widgetVisibility));
  }, [widgetVisibility]);

  // Callback pour mettre à jour les layouts
  const handleLayoutChange = useCallback((layout, allLayouts) => {
    console.log('📐 Layout changé:', { layout, allLayouts });
    setLayouts(allLayouts);
  }, []);

  // Toggle visibilité d'un widget
  const toggleWidget = useCallback((widgetId) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  }, []);

  // Réinitialiser aux layouts par défaut
  const resetLayouts = useCallback(() => {
    console.log('🔄 Réinitialisation layouts par défaut');
    setLayouts(DEFAULT_LAYOUTS);
    setWidgetVisibility({
      'stats-overview': true,
      'performance-chart': true,
      'recent-activity': true,
      'top-smartlinks': true,
      'artist-breakdown': true
    });
  }, []);

  // Obtenir les widgets visibles pour le breakpoint actuel
  const getVisibleWidgets = useCallback((breakpoint = 'lg') => {
    const currentLayout = layouts[breakpoint] || layouts.lg;
    return currentLayout.filter(item => widgetVisibility[item.i]);
  }, [layouts, widgetVisibility]);

  // Optimisation pour mobile: réduire le nombre de widgets
  const getMobileOptimizedLayout = useCallback(() => {
    if (isMobile) {
      return [
        { i: 'stats-overview', x: 0, y: 0, w: 4, h: 2 },
        { i: 'performance-chart', x: 0, y: 2, w: 4, h: 4 },
        { i: 'top-smartlinks', x: 0, y: 6, w: 4, h: 3 }
      ].filter(item => widgetVisibility[item.i]);
    }
    return getVisibleWidgets();
  }, [isMobile, getVisibleWidgets, widgetVisibility]);

  // Configuration responsive des propriétés React Grid Layout
  const gridProps = {
    className: "layout",
    layouts,
    breakpoints: BREAKPOINTS,
    cols: COLS,
    rowHeight: 60,
    margin: [16, 16],
    containerPadding: [16, 16],
    isDraggable: isEditing && !isMobile,
    isResizable: isEditing && !isMobile,
    compactType: 'vertical',
    preventCollision: false,
    onLayoutChange: handleLayoutChange,
    // Désactiver les interactions tactiles sur mobile pour éviter les conflits
    isBounded: true,
    allowOverlap: false
  };

  return {
    // État
    layouts,
    widgetVisibility,
    isEditing,
    isMobile,
    isTablet,
    
    // Actions
    setIsEditing,
    toggleWidget,
    resetLayouts,
    handleLayoutChange,
    
    // Helpers
    getVisibleWidgets,
    getMobileOptimizedLayout,
    gridProps,
    
    // Configuration
    breakpoints: BREAKPOINTS,
    cols: COLS,
    defaultLayouts: DEFAULT_LAYOUTS
  };
};

// Hook pour gérer l'état d'un widget individuel
export const useWidget = (widgetId, initialState = {}) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
    ...initialState
  });

  const setLoading = useCallback((loading) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setData = useCallback((data) => {
    setState(prev => ({ ...prev, data, error: null, loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null, ...initialState });
  }, [initialState]);

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset
  };
};