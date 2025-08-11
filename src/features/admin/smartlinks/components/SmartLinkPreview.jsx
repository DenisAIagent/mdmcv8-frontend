import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Grid, Button } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';

// Composant de prévisualisation pour le SmartLink
const SmartLinkPreview = ({ formData, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Prévisualisation du template Music
  const MusicPreview = () => (
    <Box sx={{ p: 2 }}>
      {formData.coverImageUrl && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <img 
            src={formData.coverImageUrl} 
            alt={formData.trackTitle || "Couverture"} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      )}
      
      <Typography variant="h5" align="center" gutterBottom>
        {formData.trackTitle || "Titre de la musique"}
      </Typography>
      
      {formData.artistId && (
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          {/* Idéalement, on afficherait le nom de l'artiste ici, pas l'ID */}
          Artiste
        </Typography>
      )}
      
      {formData.description && (
        <Typography variant="body2" align="center" sx={{ mt: 2, mb: 3 }}>
          {formData.description}
        </Typography>
      )}
      
      <Typography variant="subtitle2" align="center" sx={{ mb: 2 }}>
        Écoutez sur :
      </Typography>
      
      <Grid container spacing={2} justifyContent="center">
        {formData.platformLinks && formData.platformLinks.map((link, index) => (
          link.platform && link.url ? (
            <Grid item key={index}>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none'
                }}
              >
                {link.platform}
              </Button>
            </Grid>
          ) : null
        ))}
      </Grid>
    </Box>
  );
  
  // Prévisualisation du template Landing Page
  const LandingPagePreview = () => (
    <Box sx={{ p: 2 }}>
      {formData.coverImageUrl && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img 
            src={formData.coverImageUrl} 
            alt={formData.trackTitle || "Image de couverture"} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      )}
      
      <Typography variant="h4" align="center" gutterBottom>
        {formData.trackTitle || "Titre de la page"}
      </Typography>
      
      {formData.description && (
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {formData.description}
        </Typography>
      )}
      
      {formData.pageContent && (
        <Typography variant="body1" align="left" sx={{ mt: 3, mb: 4 }}>
          {formData.pageContent}
        </Typography>
      )}
      
      {formData.callToActionLabel && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            sx={{ 
              borderRadius: '4px',
              textTransform: 'none',
              px: 4,
              py: 1.5
            }}
          >
            {formData.callToActionLabel}
          </Button>
        </Box>
      )}
      
      {formData.platformLinks && formData.platformLinks.some(link => link.platform && link.url) && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="subtitle2" align="center" sx={{ mb: 2 }}>
            Liens externes :
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {formData.platformLinks.map((link, index) => (
              link.platform && link.url ? (
                <Grid item key={index}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    size="small"
                    sx={{ 
                      borderRadius: '4px',
                      textTransform: 'none'
                    }}
                  >
                    {link.platform}
                  </Button>
                </Grid>
              ) : null
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );

  // Prévisualisation mobile
  const MobilePreview = () => (
    <Box 
      sx={{ 
        width: '320px', 
        height: '568px', 
        border: '12px solid #333', 
        borderRadius: '36px',
        mx: 'auto',
        overflow: 'auto',
        bgcolor: '#fff'
      }}
    >
      {formData.templateType === 'music' ? <MusicPreview /> : <LandingPagePreview />}
    </Box>
  );

  // Prévisualisation desktop
  const DesktopPreview = () => (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: '800px', 
        height: '500px', 
        border: '16px solid #333', 
        borderRadius: '8px',
        mx: 'auto',
        overflow: 'auto',
        bgcolor: '#fff'
      }}
    >
      {formData.templateType === 'music' ? <MusicPreview /> : <LandingPagePreview />}
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: '900px', mx: 'auto', my: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Prévisualisation du SmartLink
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          Fermer
        </Button>
      </Box>
      
      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Mobile" />
        <Tab label="Desktop" />
      </Tabs>
      
      <Box sx={{ p: 2 }}>
        {activeTab === 0 ? <MobilePreview /> : <DesktopPreview />}
      </Box>
      
      <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 2 }}>
        Ceci est une prévisualisation approximative. L'apparence finale peut varier légèrement.
      </Typography>
    </Paper>
  );
};

export default SmartLinkPreview;
