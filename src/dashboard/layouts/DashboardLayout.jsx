// src/dashboard/layouts/DashboardLayout.jsx
import React, { Suspense } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  Chip,
  Stack,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Dashboard,
  Refresh,
  Settings,
  Fullscreen,
  FullscreenExit,
  Edit,
  Save
} from '@mui/icons-material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { useRealTimeUpdates, useBackgroundSync } from '../hooks/useRealTimeUpdates';
import { useDashboardCache } from '../hooks/useSmartLinkMetrics';
import WidgetGrid from './WidgetGrid';

// Import CSS pour React Grid Layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Composant de loading pour les widgets
const WidgetSkeleton = ({ height = 200 }) => (
  <Paper sx={{ p: 2, height }}>
    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={height - 80} />
  </Paper>
);

// Header du dashboard avec contrôles
const DashboardHeader = ({ 
  isEditing, 
  setIsEditing, 
  onRefresh, 
  isRefreshing,
  onResetLayout,
  lastUpdate 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ mb: 4 }}>
      <Stack 
        direction={isMobile ? 'column' : 'row'} 
        justifyContent="space-between" 
        alignItems={isMobile ? 'stretch' : 'center'}
        spacing={2}
      >
        {/* Titre et statut */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Dashboard sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Analytics Dashboard
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip 
              label="Temps réel" 
              size="small" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              label={`Mis à jour: ${lastUpdate}`}
              size="small" 
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Contrôles */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualiser les données">
            <IconButton 
              onClick={onRefresh}
              disabled={isRefreshing}
              color="primary"
            >
              <Refresh sx={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isEditing ? "Sauvegarder la disposition" : "Modifier la disposition"}>
            <Button
              variant={isEditing ? "contained" : "outlined"}
              startIcon={isEditing ? <Save /> : <Edit />}
              onClick={() => setIsEditing(!isEditing)}
              size="small"
            >
              {isEditing ? 'Sauvegarder' : 'Modifier'}
            </Button>
          </Tooltip>

          {isEditing && (
            <Button
              variant="outlined"
              onClick={onResetLayout}
              size="small"
            >
              Réinitialiser
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

// Composant principal du layout dashboard
const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Hooks personnalisés
  const {
    layouts,
    widgetVisibility,
    isEditing,
    setIsEditing,
    resetLayouts,
    gridProps,
    getMobileOptimizedLayout
  } = useDashboardLayout();

  const { refreshDashboard } = useDashboardCache();
  const { prefetchData } = useBackgroundSync();
  
  // État local
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(
    new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  );

  // Mises à jour en temps réel
  useRealTimeUpdates({
    enabled: !isEditing, // Pause pendant l'édition
    interval: 60000, // 1 minute
    onUpdate: () => {
      setLastUpdate(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }
  });

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
      await prefetchData();
      setLastUpdate(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetLayout = () => {
    resetLayouts();
    setIsEditing(false);
  };

  // Optimisation mobile: layout simplifié
  const currentLayout = isMobile ? getMobileOptimizedLayout() : null;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
          <DashboardHeader
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onResetLayout={handleResetLayout}
            lastUpdate={lastUpdate}
          />

          {/* Message mode édition */}
          {isEditing && (
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
              }
            >
              Mode édition activé. Glissez et redimensionnez les widgets, puis sauvegardez.
            </Alert>
          )}

          {/* Grille responsive des widgets */}
          <Box sx={{ 
            '& .react-grid-item': {
              transition: 'all 0.2s ease',
            },
            '& .react-grid-item.react-grid-placeholder': {
              background: theme.palette.primary.main + '20',
              borderRadius: 2,
              border: `2px dashed ${theme.palette.primary.main}`,
            },
            '& .react-grid-item > .react-resizable-handle': {
              display: isEditing ? 'block' : 'none',
            }
          }}>
            <Suspense fallback={
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                {[1, 2, 3, 4].map(i => <WidgetSkeleton key={i} />)}
              </Box>
            }>
              {isMobile ? (
                // Layout mobile simplifié sans drag & drop
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <WidgetGrid 
                    layout={currentLayout}
                    isEditing={false}
                    widgetVisibility={widgetVisibility}
                  />
                </Box>
              ) : (
                // Layout desktop avec React Grid Layout
                <ResponsiveGridLayout
                  {...gridProps}
                  style={{ minHeight: '600px' }}
                >
                  <WidgetGrid 
                    key="widget-grid"
                    isEditing={isEditing}
                    widgetVisibility={widgetVisibility}
                  />
                </ResponsiveGridLayout>
              )}
            </Suspense>
          </Box>

          {/* Debug info en développement */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                Mode: {isEditing ? 'Édition' : 'Vue'} | 
                Mobile: {isMobile ? 'Oui' : 'Non'} | 
                Widgets visibles: {Object.values(widgetVisibility).filter(Boolean).length}
              </Typography>
            </Box>
          )}

          {/* Contenu supplémentaire */}
          {children}
        </Box>
      </Fade>
    </Container>
  );
};

export default DashboardLayout;