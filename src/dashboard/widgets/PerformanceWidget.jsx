// src/dashboard/widgets/PerformanceWidget.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Card,
  CardContent,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  ShowChart,
  CalendarToday,
  Speed
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useSmartLinkMetrics } from '../hooks/useSmartLinkMetrics';

// Composant de tooltip personnalisé pour les graphiques
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1, boxShadow: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography 
            key={index}
            variant="body2" 
            sx={{ color: entry.color }}
          >
            {entry.dataKey === 'clicks' ? 'Clics' : 
             entry.dataKey === 'views' ? 'Vues' : 
             entry.dataKey === 'conversions' ? 'Conversions' : entry.dataKey}: 
            {' '}{entry.value?.toLocaleString()}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

// Composant pour les métriques de performance rapides
const QuickMetrics = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" width={100} height={60} />
        ))}
      </Stack>
    );
  }

  const metrics = [
    {
      label: 'Nouveaux clics',
      value: data?.weeklyPerformance?.newClicks || 0,
      icon: <TrendingUp fontSize="small" />,
      color: theme.palette.primary.main
    },
    {
      label: 'Taux conversion',
      value: data?.weeklyPerformance?.conversionRate || '0%',
      icon: <Speed fontSize="small" />,
      color: theme.palette.success.main
    },
    {
      label: 'Performance',
      value: `${data?.enriched?.performance?.performanceScore || 0}/100`,
      icon: <ShowChart fontSize="small" />,
      color: theme.palette.warning.main
    }
  ];

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      {metrics.map((metric, index) => (
        <Card key={index} sx={{ flex: 1, minWidth: 0 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ color: metric.color }}>
                {metric.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {metric.label}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

// Générateur de données pour différentes périodes
const generateChartData = (timeRange) => {
  const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simuler des données avec tendance croissante
    const baseClicks = 150 + (days - i) * 5;
    const baseViews = 800 + (days - i) * 25;
    
    data.push({
      date: timeRange === '1d' ? 
        date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) :
        date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      clicks: Math.floor(baseClicks + Math.random() * 100),
      views: Math.floor(baseViews + Math.random() * 400),
      conversions: Math.floor((baseClicks * 0.15) + Math.random() * 20)
    });
  }
  
  return data;
};

// Widget principal de performance
const PerformanceWidget = ({
  showChart = true,
  timeRange: initialTimeRange = '7d',
  widgetId,
  isEditing = false,
  title = 'Performance'
}) => {
  const theme = useTheme();
  const { data, isLoading, error } = useSmartLinkMetrics();
  
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [chartType, setChartType] = useState('area'); // 'line' ou 'area'

  // Générer les données du graphique
  const chartData = React.useMemo(() => {
    return generateChartData(timeRange);
  }, [timeRange]);

  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', minHeight: 300 }}>
        <Typography color="error" variant="body2">
          Erreur de chargement des données de performance
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        minHeight: 300,
        ...(isEditing && {
          cursor: 'move',
          '&:hover': { bgcolor: 'action.hover' }
        })
      }}
    >
      {/* Header avec contrôles */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        spacing={1}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          {/* Sélecteur de période */}
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
          >
            <ToggleButton value="1d">24h</ToggleButton>
            <ToggleButton value="7d">7j</ToggleButton>
            <ToggleButton value="30d">30j</ToggleButton>
          </ToggleButtonGroup>

          {/* Sélecteur de type de graphique */}
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
          >
            <ToggleButton value="line">
              <ShowChart fontSize="small" />
            </ToggleButton>
            <ToggleButton value="area">
              <TrendingUp fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Métriques rapides */}
      <QuickMetrics data={data} loading={isLoading} />

      {/* Graphique principal */}
      {showChart && (
        <Box sx={{ height: 200, width: '100%' }}>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stackId="2"
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </Box>
      )}

      {/* Informations sur la période */}
      <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Période: {
              timeRange === '1d' ? 'Dernières 24 heures' :
              timeRange === '7d' ? '7 derniers jours' :
              '30 derniers jours'
            }
          </Typography>
          
          {data?.enriched?.trends && (
            <Typography variant="caption" color="text.secondary">
              Tendance: {
                data.enriched.trends.overallTrend === 'excellent' ? 'Excellente' :
                data.enriched.trends.overallTrend === 'good' ? 'Bonne' :
                data.enriched.trends.overallTrend === 'stable' ? 'Stable' :
                'En baisse'
              }
            </Typography>
          )}
        </Stack>
      </Box>

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
          {widgetId} | {timeRange} | {chartType}
        </Typography>
      )}
    </Paper>
  );
};

export default PerformanceWidget;