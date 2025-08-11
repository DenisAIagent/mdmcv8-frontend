import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { styled } from '@mui/material/styles';

// Composant stylisé pour le smartphone
const SmartphonePreview = styled(Paper)(({ theme, primaryColor }) => ({
  width: 300,
  height: 600,
  margin: '0 auto',
  borderRadius: 20,
  overflow: 'hidden',
  border: '10px solid #333',
  position: 'relative',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  backgroundColor: '#fff',
}));

// Composant pour la barre de statut
const StatusBar = styled(Box)(({ theme }) => ({
  height: 30,
  backgroundColor: '#333',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 10px',
  color: 'white',
  fontSize: '12px',
}));

// Composant pour le contenu du SmartLink avec fond flouté
const SmartLinkContent = styled(Box)(({ theme, primaryColor, backgroundImage }) => ({
  height: 'calc(100% - 30px)',
  overflow: 'auto',
  backgroundColor: '#f5f5f5',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(20px)',
    opacity: 0.3,
    zIndex: 0,
  }
}));

// Composant pour l'icône de plateforme (logo uniquement, sans texte)
const PlatformIcon = styled(Box)(({ theme, primaryColor }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '16px',
  margin: '10px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderRadius: '50%',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
}));

// Logos des plateformes
const platformLogos = {
  spotify: 'https://services.linkfire.com/logo_spotify_onlight.svg',
  deezer: 'https://services.linkfire.com/logo_deezer_onlight.svg',
  appleMusic: 'https://services.linkfire.com/logo_applemusic_onlight.svg',
  youtube: 'https://services.linkfire.com/logo_youtube_onlight.svg',
  youtubeMusic: 'https://services.linkfire.com/logo_youtubemusic_onlight.svg',
  amazonMusic: 'https://services.linkfire.com/logo_amazonmusic_onlight.svg',
  tidal: 'https://services.linkfire.com/logo_tidal_onlight.svg',
  soundcloud: 'https://services.linkfire.com/logo_soundcloud_onlight.svg',
};

// Fonction pour obtenir le logo d'une plateforme
const getPlatformLogo = (platform) => {
  const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, '');
  
  // Correspondances spécifiques
  const mappings = {
    'spotify': 'spotify',
    'deezer': 'deezer',
    'applemusic': 'appleMusic',
    'apple music': 'appleMusic',
    'youtube': 'youtube',
    'youtubemusic': 'youtubeMusic',
    'youtube music': 'youtubeMusic',
    'amazonmusic': 'amazonMusic',
    'amazon music': 'amazonMusic',
    'tidal': 'tidal',
    'soundcloud': 'soundcloud',
  };
  
  const key = mappings[normalizedPlatform] || normalizedPlatform;
  if (platformLogos[key]) {
    return platformLogos[key];
  }
  
  // Créer un placeholder SVG local
  const fallbackText = platform.substring(0, 2).toUpperCase();
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#6B7280" rx="8"/>
      <text x="20" y="25" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${fallbackText}</text>
    </svg>
  `)}`;
};

const PreviewSection = ({ metadata, platformLinks, formValues }) => {
  const primaryColor = formValues.primaryColor || '#FF0000';
  const artworkUrl = metadata.artwork || `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#E5E7EB"/>
      <rect x="120" y="120" width="60" height="60" fill="#9CA3AF" rx="8"/>
      <text x="150" y="210" font-family="Arial" font-size="16" fill="#6B7280" text-anchor="middle">Pochette</text>
      <text x="150" y="230" font-family="Arial" font-size="14" fill="#6B7280" text-anchor="middle">non disponible</text>
    </svg>
  `)}`;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Prévisualisation
      </Typography>
      
      <SmartphonePreview primaryColor={primaryColor}>
        <StatusBar>
          <Typography variant="caption">18:19</Typography>
        </StatusBar>
        <SmartLinkContent primaryColor={primaryColor} backgroundImage={artworkUrl}>
          {/* Header avec pochette et infos */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <CardMedia
              component="img"
              image={artworkUrl}
              alt={metadata.title}
              sx={{ height: 200, objectFit: 'cover' }}
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                p: 2
              }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {formValues.title || metadata.title || 'Titre du morceau'}
              </Typography>
              <Typography variant="subtitle1" component="div">
                {formValues.artist || metadata.artist || 'Nom de l\'artiste'}
              </Typography>
            </Box>
          </Box>
          
          {/* Contenu principal */}
          <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
              Choisissez votre plateforme préférée
            </Typography>
            
            {/* Logos des plateformes (sans texte, plus grands) */}
            <Box sx={{ my: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {platformLinks.filter(link => link.enabled).map((link, index) => (
                <PlatformIcon key={index}>
                  <Box 
                    component="img" 
                    src={getPlatformLogo(link.platform)} 
                    alt={link.platform}
                    sx={{ width: 60, height: 60 }}
                  />
                </PlatformIcon>
              ))}
            </Box>
            
            {/* Informations supplémentaires */}
            <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informations
                </Typography>
                <List dense>
                  {metadata.isrc && (
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MusicNoteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ISRC" 
                        secondary={metadata.isrc} 
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  {metadata.label && (
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MusicNoteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Label" 
                        secondary={metadata.label} 
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  {metadata.releaseDate && (
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MusicNoteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date de sortie" 
                        secondary={metadata.releaseDate} 
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
            
            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                Propulsé par MDM Music Ads
              </Typography>
            </Box>
          </Box>
        </SmartLinkContent>
      </SmartphonePreview>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Cette prévisualisation montre l'apparence approximative de votre SmartLink sur mobile.
      </Typography>
    </Box>
  );
};

export default PreviewSection;
