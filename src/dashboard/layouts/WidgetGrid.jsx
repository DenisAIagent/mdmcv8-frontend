// src/dashboard/layouts/WidgetGrid.jsx
import React, { lazy, Suspense } from 'react';
import { Box, Paper, Skeleton, Typography, Alert } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy loading des widgets pour optimiser les performances
const AnalyticsWidget = lazy(() => import('../widgets/AnalyticsWidget'));
const SmartLinkWidget = lazy(() => import('../widgets/SmartLinkWidget'));
const ArtistStatsWidget = lazy(() => import('../widgets/ArtistStatsWidget'));
const PerformanceWidget = lazy(() => import('../widgets/PerformanceWidget'));
const RecentActivityWidget = lazy(() => import('../widgets/RecentActivityWidget'));

// Composant de fallback pour le loading
const WidgetSkeleton = ({ height = 200, title = 'Chargement...' }) => (
  <Paper sx={{ p: 2, height }}>
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={height - 80} sx={{ borderRadius: 1 }} />
  </Paper>
);

// Composant d'erreur pour les widgets
const WidgetErrorFallback = ({ error, resetErrorBoundary }) => (
  <Paper sx={{ p: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Alert 
      severity="error" 
      action={
        <button onClick={resetErrorBoundary} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          Réessayer
        </button>
      }
    >
      <Typography variant="body2">
        Erreur de chargement du widget
      </Typography>
    </Alert>
  </Paper>
);

// Configuration des widgets disponibles
const WIDGET_CONFIGS = {
  'stats-overview': {
    component: AnalyticsWidget,
    title: 'Vue d\'ensemble',
    props: { variant: 'overview' },
    fallbackHeight: 120
  },
  'performance-chart': {
    component: PerformanceWidget,
    title: 'Performance',
    props: { showChart: true, timeRange: '7d' },
    fallbackHeight: 300
  },
  'recent-activity': {
    component: RecentActivityWidget,
    title: 'Activité récente',
    props: { limit: 5 },
    fallbackHeight: 280
  },
  'top-smartlinks': {
    component: SmartLinkWidget,
    title: 'Top SmartLinks',
    props: { variant: 'top', limit: 10 },
    fallbackHeight: 250
  },
  'artist-breakdown': {
    component: ArtistStatsWidget,
    title: 'Répartition artistes',
    props: { variant: 'breakdown', showChart: true },
    fallbackHeight: 250
  }
};

// Wrapper pour chaque widget individuel
const WidgetWrapper = ({ 
  widgetId, 
  isVisible = true, 
  isEditing = false,
  ...gridItemProps 
}) => {
  const config = WIDGET_CONFIGS[widgetId];
  
  if (!config) {
    console.warn(`Widget non trouvé: ${widgetId}`);
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const { component: WidgetComponent, title, props: widgetProps, fallbackHeight } = config;

  return (
    <Box
      key={widgetId}
      {...gridItemProps}
      sx={{
        // Styles pour React Grid Layout
        '& .widget-content': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        },
        // Indicateur mode édition
        ...(isEditing && {
          '&:hover': {
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px dashed #1976d2',
              borderRadius: 1,
              pointerEvents: 'none',
              zIndex: 1
            }
          }
        })
      }}
    >
      <ErrorBoundary
        FallbackComponent={WidgetErrorFallback}
        onError={(error, errorInfo) => {
          console.error(`Erreur widget ${widgetId}:`, error, errorInfo);
        }}
      >
        <Suspense fallback={<WidgetSkeleton height={fallbackHeight} title={title} />}>
          <div className="widget-content">
            <WidgetComponent 
              {...widgetProps}
              widgetId={widgetId}
              isEditing={isEditing}
              title={title}
            />
          </div>
        </Suspense>
      </ErrorBoundary>
    </Box>
  );
};

// Composant principal de la grille de widgets
const WidgetGrid = ({ 
  layout = null, 
  isEditing = false, 
  widgetVisibility = {},
  onWidgetError = null 
}) => {
  
  // Si un layout spécifique est fourni (mode mobile)
  if (layout) {
    return (
      <>
        {layout.map((item) => (
          <WidgetWrapper
            key={item.i}
            widgetId={item.i}
            isVisible={widgetVisibility[item.i]}
            isEditing={isEditing}
          />
        ))}
      </>
    );
  }

  // Mode desktop avec React Grid Layout
  return (
    <>
      {Object.keys(WIDGET_CONFIGS).map((widgetId) => (
        <WidgetWrapper
          key={widgetId}
          widgetId={widgetId}
          isVisible={widgetVisibility[widgetId]}
          isEditing={isEditing}
        />
      ))}
    </>
  );
};

export default WidgetGrid;