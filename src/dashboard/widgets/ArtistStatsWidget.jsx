// src/dashboard/widgets/ArtistStatsWidget.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Chip,
  IconButton,
  useTheme,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton
} from '@mui/material';
import {
  Group,
  Person,
  TrendingUp,
  ViewList,
  PieChart,
  MusicNote,
  Album
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useSmartLinkMetrics } from '../hooks/useSmartLinkMetrics';

// Composant de tooltip personnalisé pour le graphique
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Paper sx={{ p: 1, boxShadow: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.payload.name}
        </Typography>
        <Typography variant="body2" color={data.payload.color}>
          {data.value}% ({data.payload.realValue} artistes)
        </Typography>
      </Paper>
    );
  }
  return null;
};

// Composant pour un artiste individuel dans la liste
const ArtistItem = ({ artist, index, total }) => {
  const theme = useTheme();
  const percentage = ((artist.value / total) * 100).toFixed(1);

  return (
    <ListItem
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateX(2px)',
        }
      }}
    >
      <ListItemAvatar>
        <Avatar 
          sx={{ 
            bgcolor: artist.color,
            width: 36,
            height: 36
          }}
        >
          <MusicNote fontSize="small" />
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {artist.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {artist.value} artistes
              </Typography>
              <Chip 
                label={`${percentage}%`}
                size="small"
                sx={{ 
                  bgcolor: artist.color + '20',
                  color: artist.color,
                  fontWeight: 600
                }}
              />
            </Stack>
          </Stack>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={parseFloat(percentage)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: artist.color
                }
              }}
            />
          </Box>
        }
      />
    </ListItem>
  );
};

// Données mockées détaillées d'artistes
const generateDetailedArtistData = () => {
  const genres = [
    { name: 'Electronic', value: 45, color: '#6366f1', artists: ['David Guetta', 'Calvin Harris', 'Tiësto', 'Martin Garrix'] },
    { name: 'Rock', value: 25, color: '#8b5cf6', artists: ['Coldplay', 'Imagine Dragons', 'OneRepublic'] },
    { name: 'Pop', value: 20, color: '#06b6d4', artists: ['Dua Lipa', 'The Weeknd', 'Billie Eilish'] },
    { name: 'Hip-Hop', value: 10, color: '#10b981', artists: ['Drake', 'Post Malone'] }
  ];

  return genres.map(genre => ({
    ...genre,
    realValue: genre.artists.length,
    // Ajouter des métriques détaillées
    totalClicks: Math.floor(Math.random() * 5000) + 1000,
    totalViews: Math.floor(Math.random() * 20000) + 5000,
    avgConversion: (Math.random() * 5 + 1).toFixed(2)
  }));
};

// Composant de loading
const ArtistStatsSkeleton = ({ variant }) => {
  if (variant === 'chart') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Skeleton variant="circular" width={180} height={180} />
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {[1, 2, 3, 4].map(i => (
        <Box key={i} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={6} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="rectangular" width={50} height={20} />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

// Widget principal des statistiques d'artistes
const ArtistStatsWidget = ({
  variant = 'breakdown',
  showChart = true,
  widgetId,
  isEditing = false,
  title = 'Répartition artistes'
}) => {
  const theme = useTheme();
  const { data, isLoading, error } = useSmartLinkMetrics();
  
  const [viewMode, setViewMode] = useState(showChart ? 'chart' : 'list');

  // Générer des données détaillées
  const artistData = React.useMemo(() => {
    return generateDetailedArtistData();
  }, []);

  const totalArtists = artistData.reduce((sum, item) => sum + item.realValue, 0);

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', minHeight: 250 }}>
        <Typography color="error" variant="body2">
          Erreur de chargement des statistiques d'artistes
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        minHeight: 250,
        display: 'flex',
        flexDirection: 'column',
        ...(isEditing && {
          cursor: 'move',
          '&:hover': { bgcolor: 'action.hover' }
        })
      }}
    >
      {/* Header */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Group color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>
        
        {showChart && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="chart">
              <Tooltip title="Vue graphique">
                <PieChart fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list">
              <Tooltip title="Vue liste">
                <ViewList fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      {/* Contenu principal */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <ArtistStatsSkeleton variant={viewMode} />
        ) : (
          <>
            {viewMode === 'chart' ? (
              /* Vue graphique avec PieChart */
              <Box sx={{ height: 200, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <RechartsPieChart.Pie
                      data={artistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {artistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart.Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>{value}</span>
                      )}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              /* Vue liste détaillée */
              <List sx={{ p: 0 }}>
                {artistData.map((artist, index) => (
                  <ArtistItem
                    key={artist.name}
                    artist={artist}
                    index={index}
                    total={totalArtists}
                  />
                ))}
              </List>
            )}
          </>
        )}
      </Box>

      {/* Footer avec statistiques globales */}
      <Box sx={{ 
        mt: 2, 
        pt: 2, 
        borderTop: 1, 
        borderColor: 'divider' 
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Total: {totalArtists} artistes
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.secondary">
              Genres: {artistData.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Clics: {artistData.reduce((sum, a) => sum + a.totalClicks, 0).toLocaleString()}
            </Typography>
          </Stack>
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
          {widgetId} | {variant} | {viewMode}
        </Typography>
      )}
    </Paper>
  );
};

export default ArtistStatsWidget;