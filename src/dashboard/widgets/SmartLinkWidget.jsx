// src/dashboard/widgets/SmartLinkWidget.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Stack,
  Chip,
  Button,
  Skeleton,
  LinearProgress,
  useTheme,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Link as LinkIcon,
  TrendingUp,
  MoreVert,
  OpenInNew,
  Edit,
  Share,
  Analytics,
  MusicNote
} from '@mui/icons-material';
import { useMockMetrics } from '../hooks/useSmartLinkMetrics';

// Composant pour un SmartLink individuel dans la liste
const SmartLinkItem = ({ 
  smartLink, 
  index, 
  showRank = true,
  showActions = true 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    console.log(`Action ${action} sur SmartLink:`, smartLink.id);
    handleMenuClose();
    // TODO: Implémenter les actions réelles
  };

  // Calcul du pourcentage pour la barre de progression
  const maxClicks = 1500; // Valeur max pour normaliser
  const progressValue = Math.min((smartLink.clicks / maxClicks) * 100, 100);

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
          transform: 'translateX(4px)',
          boxShadow: 2
        }
      }}
    >
      {/* Ranking et Avatar */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
        {showRank && (
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: index < 3 ? theme.palette.primary.main : theme.palette.grey[400],
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}
          >
            #{index + 1}
          </Avatar>
        )}
        
        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
          <MusicNote />
        </Avatar>
      </Stack>

      {/* Contenu principal */}
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {smartLink.title}
            </Typography>
            <Chip 
              label={smartLink.artist} 
              size="small" 
              variant="outlined"
              color="primary"
            />
          </Stack>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {smartLink.clicks.toLocaleString()} clics
              </Typography>
              <Typography variant="body2" color="success.main">
                +{Math.floor(Math.random() * 50 + 10)}% cette semaine
              </Typography>
            </Stack>
            
            {/* Barre de progression */}
            <LinearProgress 
              variant="determinate" 
              value={progressValue}
              sx={{ 
                height: 4, 
                borderRadius: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  bgcolor: index < 3 ? theme.palette.primary.main : theme.palette.secondary.main
                }
              }}
            />
          </Box>
        }
      />

      {/* Actions */}
      {showActions && (
        <ListItemSecondaryAction>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Voir les analytics">
              <IconButton size="small" onClick={() => handleAction('analytics')}>
                <Analytics fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Plus d'options">
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Menu contextuel */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleAction('open')}>
              <OpenInNew fontSize="small" sx={{ mr: 1 }} />
              Ouvrir le lien
            </MenuItem>
            <MenuItem onClick={() => handleAction('edit')}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Modifier
            </MenuItem>
            <MenuItem onClick={() => handleAction('share')}>
              <Share fontSize="small" sx={{ mr: 1 }} />
              Partager
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

// Composant de loading pour la liste
const SmartLinkSkeleton = ({ count = 5 }) => (
  <Stack spacing={1}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={4} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="circular" width={24} height={24} />
        </Stack>
      </Box>
    ))}
  </Stack>
);

// Widget principal SmartLink
const SmartLinkWidget = ({
  variant = 'top',
  limit = 10,
  widgetId,
  isEditing = false,
  title = 'Top SmartLinks'
}) => {
  const theme = useTheme();
  const { data, isLoading, error } = useMockMetrics();
  
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'

  // Obtenir les données selon la variante
  const getSmartLinksData = () => {
    if (!data) return [];

    const { topSmartLinks } = data;
    
    if (variant === 'recent') {
      // Simuler des SmartLinks récents avec des dates
      return topSmartLinks?.slice(0, limit).map(link => ({
        ...link,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      })) || [];
    }

    return topSmartLinks?.slice(0, limit) || [];
  };

  const smartLinksData = getSmartLinksData();

  const handleViewAll = () => {
    console.log('Navigation vers liste complète SmartLinks');
    // TODO: Navigation vers /admin/smartlinks
  };

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', minHeight: 250 }}>
        <Typography color="error" variant="body2">
          Erreur de chargement des SmartLinks
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
          <LinkIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>
        
        <Button 
          size="small" 
          endIcon={<TrendingUp />}
          onClick={handleViewAll}
        >
          Voir tout
        </Button>
      </Stack>

      {/* Contenu principal */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <SmartLinkSkeleton count={Math.min(limit, 5)} />
        ) : smartLinksData.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 150,
            color: 'text.secondary'
          }}>
            <LinkIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Aucun SmartLink disponible
            </Typography>
            <Button size="small" sx={{ mt: 1 }}>
              Créer le premier SmartLink
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {smartLinksData.map((smartLink, index) => (
              <SmartLinkItem
                key={smartLink.id}
                smartLink={smartLink}
                index={index}
                showRank={variant === 'top'}
                showActions={!isEditing}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Footer avec statistiques */}
      {smartLinksData.length > 0 && (
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: 1, 
          borderColor: 'divider' 
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {smartLinksData.length} SmartLinks affichés
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              Total clics: {smartLinksData.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
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
          {widgetId} | {variant} | {limit}
        </Typography>
      )}
    </Paper>
  );
};

export default SmartLinkWidget;