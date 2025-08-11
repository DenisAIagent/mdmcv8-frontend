// src/dashboard/widgets/AnalyticsWidget.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  Group,
  Link as LinkIcon,
  Visibility,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { useSmartLinkMetrics } from '../hooks/useSmartLinkMetrics';

// Composant pour une métrique individuelle
const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color,
  loading = false 
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 120 }}>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Chargement...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 120,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color,
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 16px ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                mb: 1
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            
            {change && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {changeType === 'positive' ? (
                  <ArrowUpward sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                ) : (
                  <ArrowDownward sx={{ color: theme.palette.error.main, fontSize: 16 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: changeType === 'positive' 
                      ? theme.palette.success.main 
                      : theme.palette.error.main,
                    fontWeight: 600,
                  }}
                >
                  {change}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs mois dernier
                </Typography>
              </Stack>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: color,
              width: 40,
              height: 40,
              boxShadow: `0 4px 8px ${color}30`,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Widget principal d'analytics
const AnalyticsWidget = ({ 
  variant = 'overview',
  widgetId,
  isEditing = false,
  title = 'Analytics Overview'
}) => {
  const theme = useTheme();
  const { data, isLoading, error } = useSmartLinkMetrics();

  // Définir les métriques selon la variante
  const getMetrics = () => {
    if (!data) return [];

    const { stats } = data;
    
    const baseMetrics = [
      {
        title: 'Total SmartLinks',
        value: stats.totalSmartLinks.value,
        change: stats.totalSmartLinks.change,
        changeType: stats.totalSmartLinks.changeType,
        icon: <LinkIcon fontSize="small" />,
        color: theme.palette.primary.main,
      },
      {
        title: 'Artistes Actifs',
        value: stats.activeArtists.value,
        change: stats.activeArtists.change,
        changeType: stats.activeArtists.changeType,
        icon: <Group fontSize="small" />,
        color: theme.palette.secondary.main,
      },
      {
        title: 'Vues ce mois',
        value: stats.monthlyViews.value,
        change: stats.monthlyViews.change,
        changeType: stats.monthlyViews.changeType,
        icon: <Visibility fontSize="small" />,
        color: theme.palette.success.main,
      },
      {
        title: 'Clics totaux',
        value: stats.totalClicks.value,
        change: stats.totalClicks.change,
        changeType: stats.totalClicks.changeType,
        icon: <TrendingUp fontSize="small" />,
        color: theme.palette.warning.main,
      },
    ];

    return variant === 'compact' ? baseMetrics.slice(0, 2) : baseMetrics;
  };

  const metrics = getMetrics();

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', minHeight: 200 }}>
        <Typography color="error" variant="body2">
          Erreur de chargement des métriques
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        minHeight: variant === 'compact' ? 150 : 200,
        ...(isEditing && {
          cursor: 'move',
          '&:hover': { bgcolor: 'action.hover' }
        })
      }}
    >
      {/* Header du widget */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        {data?.enriched?.trends?.overallTrend && (
          <Chip
            label={
              data.enriched.trends.overallTrend === 'excellent' ? 'Excellent' :
              data.enriched.trends.overallTrend === 'good' ? 'Bon' :
              data.enriched.trends.overallTrend === 'stable' ? 'Stable' :
              'En baisse'
            }
            size="small"
            color={
              data.enriched.trends.overallTrend === 'excellent' ? 'success' :
              data.enriched.trends.overallTrend === 'good' ? 'primary' :
              data.enriched.trends.overallTrend === 'stable' ? 'default' :
              'error'
            }
            variant="outlined"
          />
        )}
      </Stack>

      {/* Grille des métriques */}
      <Grid container spacing={2}>
        {metrics.map((metric, index) => (
          <Grid 
            item 
            xs={variant === 'compact' ? 6 : 12}
            sm={variant === 'compact' ? 6 : 6}
            md={variant === 'compact' ? 6 : 6}
            lg={variant === 'compact' ? 6 : 3}
            key={metric.title}
          >
            <MetricCard 
              {...metric} 
              loading={isLoading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Informations supplémentaires pour variant overview */}
      {variant === 'overview' && data?.enriched && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">
              Performance Score: {data.enriched.performance.performanceScore}/100
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Taux de conversion: {data.enriched.performance.conversionRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Niveau: {
                data.enriched.performance.performanceLevel === 'excellent' ? 'Excellent' :
                data.enriched.performance.performanceLevel === 'good' ? 'Bon' :
                data.enriched.performance.performanceLevel === 'average' ? 'Moyen' :
                'Faible'
              }
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            bottom: 4, 
            right: 8, 
            opacity: 0.5 
          }}
        >
          {widgetId} | {variant}
        </Typography>
      )}
    </Paper>
  );
};

export default AnalyticsWidget;