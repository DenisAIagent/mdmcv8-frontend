/**
 * 🎛️ Gestionnaire d'ordre des plateformes avec drag & drop
 * Interface admin pour personnaliser l'ordre et tester les variantes A/B
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DragIndicator as DragIndicatorIcon,
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Analytics as AnalyticsIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import {
  SiSpotify,
  SiApplemusic,
  SiYoutubemusic,
  SiAmazonmusic,
  SiTidal,
  SiSoundcloud,
  SiYoutube,
  SiPandora
} from 'react-icons/si';
import { MdMusicNote } from 'react-icons/md';

import { usePlatformOrder, usePlatformOrderAnalytics } from '../../hooks/usePlatformOrder';
import platformOrderService from '../../services/platformOrder.service';

// Composant d'élément draggable
const SortableItem = ({ platform, isActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: platform.platform });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPlatformIcon = (platformName) => {
    const platform = platformName.toLowerCase().replace(/\s+/g, '');
    const iconMap = {
      'spotify': SiSpotify,
      'applemusic': SiApplemusic,
      'apple': SiApplemusic,
      'youtubemusic': SiYoutubemusic,
      'youtube': SiYoutube,
      'amazonmusic': SiAmazonmusic,
      'amazon': SiAmazonmusic,
      'tidal': SiTidal,
      'soundcloud': SiSoundcloud,
      'pandora': SiPandora,
    };
    return iconMap[platform] || MdMusicNote;
  };

  const IconComponent = getPlatformIcon(platform.platform);

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        bgcolor: isActive ? 'primary.light' : 'background.paper',
        border: 1,
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: 1,
        mb: 1,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <ListItemIcon>
        <DragIndicatorIcon color="action" />
      </ListItemIcon>
      <ListItemIcon>
        <IconComponent size={20} />
      </ListItemIcon>
      <ListItemText 
        primary={platform.platform}
        secondary={platform.url ? `${platform.url.substring(0, 40)}...` : 'No URL'}
      />
    </ListItem>
  );
};

const PlatformOrderManager = ({ platforms = [], onOrderChange }) => {
  const [selectedVariant, setSelectedVariant] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
    platforms: orderedPlatforms,
    reorderPlatforms,
    resetOrder,
    forceABTestVariant,
    isCustomized,
    orderSource,
    abTestVariant
  } = usePlatformOrder(platforms, {
    enableABTest: true,
    autoApply: true
  });

  const { analytics, getConversionMetrics } = usePlatformOrderAnalytics();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = orderedPlatforms.findIndex(item => item.platform === active.id);
      const newIndex = orderedPlatforms.findIndex(item => item.platform === over.id);

      const newOrder = arrayMove(orderedPlatforms, oldIndex, newIndex);
      reorderPlatforms(newOrder);
      
      if (onOrderChange) {
        onOrderChange(newOrder);
      }
    }
  };

  const handleVariantChange = (event) => {
    const variant = event.target.value;
    setSelectedVariant(variant);
    forceABTestVariant(variant);
    
    if (onOrderChange) {
      onOrderChange(orderedPlatforms);
    }
  };

  const handleReset = () => {
    resetOrder();
    setSelectedVariant('');
    
    if (onOrderChange) {
      onOrderChange(orderedPlatforms);
    }
  };

  const abTestVariants = {
    'control': 'Ordre par défaut',
    'streaming_first': 'Streaming en premier',
    'regional_optimized': 'Optimisé régional',
    'conversion_optimized': 'Optimisé conversions'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TuneIcon />
        Gestionnaire d'ordre des plateformes
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de contrôle */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Contrôles
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`Source: ${orderSource}`}
                color={isCustomized ? 'success' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              {abTestVariant && (
                <Chip 
                  label={`A/B: ${abTestVariant}`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Variante A/B Test</InputLabel>
              <Select
                value={selectedVariant}
                label="Variante A/B Test"
                onChange={handleVariantChange}
              >
                <MenuItem value="">
                  <em>Auto (utilisateur assigné)</em>
                </MenuItem>
                {Object.entries(abTestVariants).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{ mb: 1 }}
            >
              Remettre à zéro
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<AnalyticsIcon />}
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Masquer' : 'Voir'} Analytics
            </Button>
          </Paper>

          {/* Analytics */}
          {showAnalytics && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon />
                Métriques A/B Test
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Variante actuelle: <strong>{analytics.abTestVariant || 'Non assigné'}</strong>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Personnalisations: {isCustomized ? 'Oui' : 'Non'}
              </Typography>

              <Divider sx={{ my: 1 }} />
              
              <Typography variant="caption" color="text.secondary">
                Les métriques de conversion sont collectées en temps réel pour optimiser l'ordre automatiquement.
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Liste draggable des plateformes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ordre des plateformes ({orderedPlatforms.length})
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Glissez-déposez les plateformes pour personnaliser l'ordre d'affichage. 
              L'ordre influence directement les taux de conversion.
            </Alert>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={orderedPlatforms.map(p => p.platform)}
                strategy={verticalListSortingStrategy}
              >
                <List sx={{ bgcolor: 'background.default', borderRadius: 1, p: 1 }}>
                  {orderedPlatforms.map((platform, index) => (
                    <SortableItem
                      key={platform.platform}
                      platform={platform}
                      isActive={index < 3} // Highlight top 3
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              💡 Tip: Les 3 premières plateformes ont généralement 70% des clics
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformOrderManager;