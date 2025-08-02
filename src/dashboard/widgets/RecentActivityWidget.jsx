// src/dashboard/widgets/RecentActivityWidget.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  Chip,
  IconButton,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Skeleton,
  Divider
} from '@mui/material';
import {
  Notifications,
  Link as LinkIcon,
  Person,
  TrendingUp,
  Add,
  Edit,
  Share,
  MoreVert,
  Refresh,
  FilterList,
  MusicNote,
  Analytics,
  Campaign
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMockMetrics } from '../hooks/useSmartLinkMetrics';

// Types d'activités avec leur configuration
const ACTIVITY_TYPES = {
  smartlink_created: {
    icon: <Add />,
    color: '#10b981',
    label: 'SmartLink créé'
  },
  traffic_spike: {
    icon: <TrendingUp />,
    color: '#f59e0b',
    label: 'Pic de trafic'
  },
  artist_added: {
    icon: <Person />,
    color: '#6366f1',
    label: 'Artiste ajouté'
  },
  campaign_launched: {
    icon: <Campaign />,
    color: '#8b5cf6',
    label: 'Campagne lancée'
  },
  milestone_reached: {
    icon: <Analytics />,
    color: '#06b6d4',
    label: 'Objectif atteint'
  }
};

// Générateur d'activités mockées
const generateMockActivities = (count = 10) => {
  const activities = [];
  const types = Object.keys(ACTIVITY_TYPES);
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const hours = Math.floor(Math.random() * 24 * 7); // Dernière semaine
    
    let activity = {
      id: `activity_${i}`,
      type,
      timestamp: new Date(Date.now() - hours * 60 * 60 * 1000),
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    };

    // Générer du contenu spécifique selon le type
    switch (type) {
      case 'smartlink_created':
        activity = {
          ...activity,
          title: 'Nouveau SmartLink créé',
          subtitle: `${['Purple Disco Machine', 'Lost Frequencies', 'David Guetta', 'Calvin Harris'][Math.floor(Math.random() * 4)]} - "${['Hypnotized', 'Reality', 'Titanium', 'Summer'][Math.floor(Math.random() * 4)]}"`,
          metadata: {
            artist: 'Purple Disco Machine',
            track: 'Hypnotized',
            platforms: 12
          }
        };
        break;
        
      case 'traffic_spike':
        const spikes = ['+234%', '+156%', '+89%', '+345%'];
        activity = {
          ...activity,
          title: 'Pic de trafic détecté',
          subtitle: `${(Math.random() * 2000 + 500).toFixed(0)} vues en 1h (${spikes[Math.floor(Math.random() * spikes.length)]})`,
          metadata: {
            increase: spikes[Math.floor(Math.random() * spikes.length)],
            views: Math.floor(Math.random() * 2000 + 500)
          }
        };
        break;
        
      case 'artist_added':
        const artists = ['The Weeknd', 'Dua Lipa', 'Billie Eilish', 'Post Malone'];
        activity = {
          ...activity,
          title: 'Nouvel artiste ajouté',
          subtitle: `${artists[Math.floor(Math.random() * artists.length)]} ajouté au portfolio`,
          metadata: {
            artist: artists[Math.floor(Math.random() * artists.length)],
            genre: 'Pop'
          }
        };
        break;
        
      case 'campaign_launched':
        activity = {
          ...activity,
          title: 'Campagne publicitaire lancée',
          subtitle: `Budget ${Math.floor(Math.random() * 500 + 100)}€ sur Meta Ads`,
          metadata: {
            budget: Math.floor(Math.random() * 500 + 100),
            platform: 'Meta Ads'
          }
        };
        break;
        
      case 'milestone_reached':
        const milestones = ['10k clics', '50k vues', '100 SmartLinks', '25 artistes'];
        activity = {
          ...activity,
          title: 'Objectif atteint',
          subtitle: `Félicitations ! ${milestones[Math.floor(Math.random() * milestones.length)]} atteint`,
          metadata: {
            milestone: milestones[Math.floor(Math.random() * milestones.length)]
          }
        };
        break;
    }
    
    activities.push(activity);
  }
  
  return activities.sort((a, b) => b.timestamp - a.timestamp);
};

// Composant pour une activité individuelle
const ActivityItem = ({ 
  activity, 
  showActions = true,
  compact = false 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const activityConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.smartlink_created;
  
  const handleMenuOpen = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    console.log(`Action ${action} sur activité:`, activity.id);
    handleMenuClose();
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(timestamp, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch {
      return 'Il y a quelques instants';
    }
  };

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
        },
        ...(activity.priority === 'high' && {
          borderLeftColor: theme.palette.error.main,
          borderLeftWidth: 4
        })
      }}
    >
      {/* Avatar avec icône du type d'activité */}
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: activityConfig.color,
            width: compact ? 32 : 40,
            height: compact ? 32 : 40
          }}
        >
          {activityConfig.icon}
        </Avatar>
      </ListItemAvatar>

      {/* Contenu principal */}
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography 
              variant={compact ? "body2" : "subtitle2"} 
              sx={{ fontWeight: 600 }}
            >
              {activity.title}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={1}>
              {activity.priority === 'high' && (
                <Chip 
                  label="Important" 
                  size="small" 
                  color="error" 
                  variant="outlined" 
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {formatTime(activity.timestamp)}
              </Typography>
            </Stack>
          </Stack>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: compact ? 0 : 1 }}
            >
              {activity.subtitle}
            </Typography>
            
            {!compact && activity.metadata && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip 
                  label={activityConfig.label}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    bgcolor: activityConfig.color + '10',
                    borderColor: activityConfig.color + '30'
                  }}
                />
              </Stack>
            )}
          </Box>
        }
      />

      {/* Actions */}
      {showActions && !compact && (
        <Box sx={{ ml: 1 }}>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleAction('view')}>
              Voir détails
            </MenuItem>
            <MenuItem onClick={() => handleAction('share')}>
              Partager
            </MenuItem>
            {activity.type === 'smartlink_created' && (
              <MenuItem onClick={() => handleAction('edit')}>
                Modifier SmartLink
              </MenuItem>
            )}
          </Menu>
        </Box>
      )}
    </ListItem>
  );
};

// Composant de loading
const ActivitySkeleton = ({ count = 5, compact = false }) => (
  <Stack spacing={1}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={compact ? 32 : 40} height={compact ? 32 : 40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={compact ? 16 : 20} />
            <Skeleton variant="text" width="60%" height={compact ? 14 : 16} />
            {!compact && <Skeleton variant="rectangular" width={80} height={20} sx={{ mt: 1 }} />}
          </Box>
          <Skeleton variant="text" width={60} height={16} />
        </Stack>
      </Box>
    ))}
  </Stack>
);

// Widget principal d'activité récente
const RecentActivityWidget = ({
  limit = 5,
  compact = false,
  widgetId,
  isEditing = false,
  title = 'Activité récente'
}) => {
  const theme = useTheme();
  const { data, isLoading, error } = useMockMetrics();
  
  const [filter, setFilter] = useState('all'); // 'all', 'high', 'smartlinks'
  const [activities] = useState(() => generateMockActivities(20));

  // Filtrer les activités
  const filteredActivities = React.useMemo(() => {
    let filtered = activities;
    
    if (filter === 'high') {
      filtered = activities.filter(a => a.priority === 'high');
    } else if (filter === 'smartlinks') {
      filtered = activities.filter(a => a.type === 'smartlink_created');
    }
    
    return filtered.slice(0, limit);
  }, [activities, filter, limit]);

  const handleRefresh = () => {
    console.log('Rafraîchissement activités...');
    // TODO: Recharger les vraies données
  };

  const handleViewAll = () => {
    console.log('Navigation vers toutes les activités');
    // TODO: Navigation vers page détaillée
  };

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', minHeight: compact ? 200 : 280 }}>
        <Typography color="error" variant="body2">
          Erreur de chargement des activités
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        minHeight: compact ? 200 : 280,
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
          <Notifications color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Filtrer">
            <IconButton size="small">
              <FilterList fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Actualiser">
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filtres rapides */}
      {!compact && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip 
            label="Tout"
            size="small"
            color={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
            clickable
          />
          <Chip 
            label="Important"
            size="small"
            color={filter === 'high' ? 'error' : 'default'}
            onClick={() => setFilter('high')}
            clickable
          />
          <Chip 
            label="SmartLinks"
            size="small"
            color={filter === 'smartlinks' ? 'secondary' : 'default'}
            onClick={() => setFilter('smartlinks')}
            clickable
          />
        </Stack>
      )}

      {/* Liste des activités */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <ActivitySkeleton count={limit} compact={compact} />
        ) : filteredActivities.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: compact ? 100 : 150,
            color: 'text.secondary'
          }}>
            <Notifications sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Aucune activité récente
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                showActions={!isEditing && !compact}
                compact={compact}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        mt: 2, 
        pt: 2, 
        borderTop: 1, 
        borderColor: 'divider' 
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {filteredActivities.length} activités
          </Typography>
          
          <Button 
            size="small" 
            onClick={handleViewAll}
            disabled={filteredActivities.length === 0}
          >
            Voir tout
          </Button>
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
          {widgetId} | {filter} | {limit}
        </Typography>
      )}
    </Paper>
  );
};

export default RecentActivityWidget;