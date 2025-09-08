// src/pages/public/SmartLinkPageV2.jsx
// Version améliorée avec design exact Linkfire

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  PlayArrow,
  Pause
} from '@mui/icons-material';

import apiService from "../../services/api.service";

// --- CONFIGURATION PLATEFORMES ---
const platformConfig = {
  spotify: { 
    color: '#1DB954', 
    name: 'Spotify',
    logo: 'https://services.linkfire.com/logo_spotify_onlight.svg'
  },
  applemusic: { 
    color: '#FA233B', 
    name: 'Apple Music',
    logo: 'https://services.linkfire.com/logo_applemusic_onlight.svg'
  },
  'apple music': { 
    color: '#FA233B', 
    name: 'Apple Music',
    logo: 'https://services.linkfire.com/logo_applemusic_onlight.svg'
  },
  deezer: { 
    color: '#EF5466', 
    name: 'Deezer',
    logo: 'https://services.linkfire.com/logo_deezer_onlight.svg'
  },
  youtube: { 
    color: '#FF0000', 
    name: 'YouTube',
    logo: 'https://services.linkfire.com/logo_youtube_onlight.svg'
  },
  youtubemusic: { 
    color: '#FF0000', 
    name: 'YouTube Music',
    logo: 'https://services.linkfire.com/logo_youtubemusic_onlight.svg'
  },
  'youtube music': { 
    color: '#FF0000', 
    name: 'YouTube Music',
    logo: 'https://services.linkfire.com/logo_youtubemusic_onlight.svg'
  },
  amazonmusic: { 
    color: '#00A8CC', 
    name: 'Amazon Music',
    logo: 'https://services.linkfire.com/logo_amazonmusic_onlight.svg'
  },
  'amazon music': { 
    color: '#00A8CC', 
    name: 'Amazon Music',
    logo: 'https://services.linkfire.com/logo_amazonmusic_onlight.svg'
  },
  tidal: { 
    color: '#000000', 
    name: 'Tidal',
    logo: 'https://services.linkfire.com/logo_tidal_onlight.svg'
  },
  soundcloud: { 
    color: '#FF5500', 
    name: 'SoundCloud',
    logo: 'https://services.linkfire.com/logo_soundcloud_onlight.svg'
  },
  qobuz: {
    color: '#000000',
    name: 'Qobuz',
    logo: 'https://via.placeholder.com/40x40/000000/ffffff?text=Q'
  },
  itunes: {
    color: '#A855F7',
    name: 'iTunes',
    logo: 'https://services.linkfire.com/logo_applemusic_onlight.svg'
  }
};

const getPlatformConfig = (platform) => {
  const key = platform?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  return platformConfig[key] || { 
    color: '#666666', 
    name: platform || 'Plateforme',
    logo: 'https://via.placeholder.com/40x40/666666/ffffff?text=?'
  };
};

// --- ANIMATIONS ---
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// --- STYLED COMPONENTS ---
const SmartLinkContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E91 50%, #FFB6C1 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  position: 'relative',
  overflow: 'auto'
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '400px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '340px',
    margin: '0 16px',
    gap: '20px'
  }
}));

const ArtworkContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '280px',
  height: '280px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    width: '240px',
    height: '240px'
  }
}));

const ArtworkImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const PlayOverlay = styled(Box)(({ theme, isplaying }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '64px',
  height: '64px',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 1)',
    transform: 'translate(-50%, -50%) scale(1.1)'
  }
}));

const PlayIcon = styled(Box)({
  width: '24px',
  height: '24px',
  marginLeft: '4px', // Décalage optique pour play
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#333'
});

const PlatformBadge = styled(Box)(({ platformcolor }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '40px',
  height: '40px',
  background: platformcolor || '#FA233B',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  '& img': {
    width: '20px',
    height: '20px',
    filter: 'brightness(0) invert(1)' // Logo blanc
  }
}));

const Metadata = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  color: '#2D1B69',
  marginTop: '16px'
}));

const TrackTitle = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 700,
  margin: '0 0 4px 0',
  letterSpacing: '-0.5px',
  color: '#2D1B69',
  [theme.breakpoints.down('sm')]: {
    fontSize: '24px'
  }
}));

const Subtitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: 400,
  margin: 0,
  opacity: 0.8,
  color: '#2D1B69'
});

const PlatformsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '380px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '8px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '340px'
  }
}));

const PlatformItem = styled(Box)(({ theme, delay }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderRadius: '12px',
  marginBottom: '4px',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  width: '100%',
  animation: `${fadeInUp} 0.4s ease`,
  animationDelay: `${delay * 0.1}s`,
  animationFillMode: 'both',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-1px)'
  },
  '&:active': {
    transform: 'translateY(0)',
    background: 'rgba(0, 0, 0, 0.06)'
  },
  '&:last-child': {
    marginBottom: 0
  },
  [theme.breakpoints.down('sm')]: {
    padding: '14px 16px'
  }
}));

const PlatformBrand = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
});

const PlatformLogo = styled('img')({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  objectFit: 'contain'
});

const PlatformName = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#1A1A1A',
  letterSpacing: '-0.2px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '16px'
  }
}));

const CTAButton = styled(Box)(({ theme, platformcolor }) => ({
  padding: '10px 24px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  minWidth: '80px',
  background: platformcolor,
  color: 'white',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '8px 20px',
    fontSize: '13px',
    minWidth: '70px'
  }
}));

const CookieNotice = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#666',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  maxWidth: 'calc(100vw - 40px)',
  textAlign: 'center',
  '& a': {
    color: '#007AFF',
    textDecoration: 'none',
    fontWeight: 500
  }
}));

// --- COMPOSANT PRINCIPAL ---
const SmartLinkPageV2 = () => {
  const { artistSlug, trackSlug } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // États
  const [smartLinkData, setSmartLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ref pour audio
  const audioRef = useRef(null);

  // Récupération des données
  useEffect(() => {
    const fetchSmartLink = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Vérification de sécurité pour apiService
        if (!apiService || !apiService.smartlinks || typeof apiService.smartlinks.getBySlugs !== 'function') {
          throw new Error('Service SmartLinks non initialisé');
        }

        const response = await apiService.smartlinks.getBySlugs(artistSlug, trackSlug);
        
        if (response?.success && response?.data) {
          setSmartLinkData(response.data);
          
          // Injection des scripts de tracking
          if (response.data.smartLink?.trackingIds) {
            // injectTrackingScripts(response.data.smartLink.trackingIds);
          }
        } else {
          throw new Error("SmartLink non trouvé");
        }
      } catch (err) {
        console.error("Erreur SmartLink:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (artistSlug && trackSlug) {
      fetchSmartLink();
    }
  }, [artistSlug, trackSlug]);

  // Gestion du player audio
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Gestion du clic plateforme avec tracking
  const handlePlatformClick = async (platform, url, smartlinkId) => {
    console.log(`Clic sur ${platform.name}`);
    
    // Tracking événements ici
    if (smartLinkData?.smartLink?.trackingIds) {
      const trackingIds = smartLinkData.smartLink.trackingIds;
      
      // GA4
      if (trackingIds.ga4Id && window.gtag) {
        window.gtag('event', 'select_content', {
          content_type: 'music_platform_click',
          item_id: platform.name,
          value: 100,
          currency: 'EUR'
        });
      }
      
      // Meta Pixel
      if (trackingIds.metaPixelId && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: 100,
          currency: 'EUR',
          content_name: platform.name,
          content_category: 'MusicPlatformClick'
        });
      }
      
      // TikTok Pixel
      if (trackingIds.tiktokPixelId && window.ttq) {
        window.ttq.track('CompletePayment', {
          content_id: `${smartlinkId}_${platform.name}`,
          value: 100,
          currency: 'EUR'
        });
      }
    }
    
    // Redirection avec délai pour tracking
    setTimeout(() => {
      window.open(url, '_blank');
    }, 200);
  };

  // --- RENDU ---
  if (loading) {
    return (
      <SmartLinkContainer>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Chargement...
          </Typography>
        </Box>
      </SmartLinkContainer>
    );
  }

  if (error) {
    return (
      <SmartLinkContainer>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6">Erreur</Typography>
          {error}
        </Alert>
      </SmartLinkContainer>
    );
  }

  if (!smartLinkData) {
    return (
      <SmartLinkContainer>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          SmartLink non disponible
        </Alert>
      </SmartLinkContainer>
    );
  }

  const { smartLink, artist } = smartLinkData;
  const coverImage = smartLink.coverImageUrl;
  const previewUrl = smartLink.previewUrl; // URL preview 30s si disponible
  
  // Détecter la plateforme principale pour le badge (première plateforme)
  const primaryPlatform = smartLink.platformLinks?.[0] ? 
    getPlatformConfig(smartLink.platformLinks[0].platform) : null;

  return (
    <HelmetProvider>
      <SmartLinkContainer>
        <Helmet>
          <title>{smartLink.trackTitle} - {artist.name}</title>
          <meta name="description" content={`Écoutez ${smartLink.trackTitle} par ${artist.name} sur votre plateforme préférée.`} />
          <meta property="og:title" content={`${smartLink.trackTitle} - ${artist.name}`} />
          <meta property="og:description" content={`Écoutez ${smartLink.trackTitle} par ${artist.name} sur votre plateforme préférée.`} />
          <meta property="og:image" content={coverImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:type" content="music.song" />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${smartLink.trackTitle} - ${artist.name}`} />
          <meta name="twitter:description" content={`Écoutez ${smartLink.trackTitle} par ${artist.name} sur votre plateforme préférée.`} />
          <meta name="twitter:image" content={coverImage} />
        </Helmet>

        <ContentWrapper>
          {/* Hero Section - Artwork + Player */}
          <ArtworkContainer>
            {coverImage ? (
              <ArtworkImage src={coverImage} alt={smartLink.trackTitle} />
            ) : (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            )}
            
            {/* Badge plateforme principale */}
            {primaryPlatform && (
              <PlatformBadge platformcolor={primaryPlatform.color}>
                <img src={primaryPlatform.logo} alt={primaryPlatform.name} />
              </PlatformBadge>
            )}
            
            {/* Play button avec preview */}
            {previewUrl && (
              <>
                <audio ref={audioRef} src={previewUrl} />
                <PlayOverlay onClick={handlePlayPause}>
                  <PlayIcon>
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </PlayIcon>
                </PlayOverlay>
              </>
            )}
          </ArtworkContainer>

          {/* Métadonnées */}
          <Metadata>
            <TrackTitle variant="h1">
              {smartLink.trackTitle}
            </TrackTitle>
            <Subtitle>
              Choisir ma plateforme
            </Subtitle>
          </Metadata>

          {/* Liste des plateformes */}
          <PlatformsContainer>
            {smartLink.platformLinks?.map((link, index) => {
              const config = getPlatformConfig(link.platform);
              return (
                <PlatformItem
                  key={index}
                  delay={index + 1}
                  onClick={() => handlePlatformClick(config, link.url, smartLink._id)}
                >
                  <PlatformBrand>
                    <PlatformLogo src={config.logo} alt={config.name} />
                    <PlatformName>{config.name}</PlatformName>
                  </PlatformBrand>
                  <CTAButton platformcolor={config.color}>
                    Écouter
                  </CTAButton>
                </PlatformItem>
              );
            })}
          </PlatformsContainer>
        </ContentWrapper>

        {/* Cookie Notice */}
        <CookieNotice>
          You have accepted the use of cookies for this service.{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Click here to
          </a>
        </CookieNotice>
      </SmartLinkContainer>
    </HelmetProvider>
  );
};

export default SmartLinkPageV2;