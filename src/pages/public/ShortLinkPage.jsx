// src/pages/public/ShortLinkPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import apiService from "../../services/api.service";

const ShortLinkPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const resolveShortLink = async () => {
      try {
        console.log('Résolution ShortLink:', shortCode);
        
        // Appel API pour résoudre le code court
        const response = await apiService.shortlinks.resolve(shortCode);
        
        if (response.success && response.data) {
          const { smartLink, artist } = response.data;
          
          // Redirection vers la page SmartLink complète
          const fullSmartLinkUrl = `/#/smartlinks/${artist.slug}/${smartLink.slug}`;
          
          console.log('Redirection vers:', fullSmartLinkUrl);
          
          // Redirection immédiate pour conserver le tracking
          window.location.href = fullSmartLinkUrl;
          
        } else {
          throw new Error('ShortLink non valide');
        }
        
      } catch (err) {
        console.error('Erreur résolution ShortLink:', err);
        setError('ShortLink non trouvé ou expiré');
        setLoading(false);
      }
    };

    if (shortCode) {
      resolveShortLink();
    } else {
      setError('Code court manquant');
      setLoading(false);
    }
  }, [shortCode, navigate]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#181818',
        color: 'white',
        textAlign: 'center',
        p: 3
      }}>
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255,0,0,0.15)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Lien introuvable
          </Typography>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Ce lien court n'existe pas ou a expiré.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#181818',
      color: 'white'
    }}>
      <CircularProgress size={60} sx={{ color: '#E50914', mb: 3 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Redirection en cours...
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
        Vous allez être redirigé vers votre contenu
      </Typography>
    </Box>
  );
};

export default ShortLinkPage;