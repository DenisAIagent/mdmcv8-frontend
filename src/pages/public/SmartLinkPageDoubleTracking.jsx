// src/pages/public/SmartLinkPageDoubleTracking.jsx
// Version avec système de tracking double-moteur Next.js intégré

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

// Configuration des plateformes (reprise de SmartLinkPageV2)
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

// Styles inspirés de Linkfire (repris de SmartLinkPageV2)
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

const StyledContainer = styled(Container)(({ theme }) => ({
  height: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1
  }
}));

const SmartLinkCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  animation: `${fadeInUp} 0.8s ease-out`,
  border: '1px solid rgba(255, 255, 255, 0.2)'
}));

const ArtworkContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '200px',
  height: '200px',
  margin: '0 auto 24px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const PlatformButton = styled(Box)(({ theme, platformcolor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: '50px',
  background: platformcolor || '#666666',
  color: 'white',
  fontWeight: 600,
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  border: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${platformcolor}40`,
    filter: 'brightness(1.1)'
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
  }
}));

const PlatformLogo = styled('img')({
  width: '24px',
  height: '24px',
  marginRight: '12px',
  filter: 'brightness(0) invert(1)'
});

// Composant principal avec tracking double-moteur
const SmartLinkPageDoubleTracking = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // États
  const [smartlinkData, setSmartlinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userGeoData, setUserGeoData] = useState(null);
  const visitLoggedRef = useRef(false);

  // Effet principal de chargement et premier tracking
  useEffect(() => {
    const loadSmartLinkAndTrack = async () => {
      try {
        console.log(`[CLIENT] Chargement du SmartLink: ${slug}`);
        
        // 1. Récupération des données du SmartLink
        const response = await apiService.get(`/smartlinks/public/${slug}`);
        const data = response.data;
        
        if (!data) {
          throw new Error('SmartLink non trouvé');
        }

        setSmartlinkData(data);
        console.log(`[CLIENT] SmartLink chargé: ${data.trackTitle} - ${data.artistName}`);

        // 2. Géolocalisation de l'utilisateur
        const geoResponse = await fetch('https://ipapi.co/json/').catch(() => null);
        const geoData = geoResponse ? await geoResponse.json() : {
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown',
          country_code: 'XX',
          timezone: 'UTC'
        };
        
        setUserGeoData(geoData);
        console.log(`[CLIENT] Géolocalisation: ${geoData.country}, ${geoData.region}`);

        // 3. PREMIER TRACKING - Visit (côté client, simulation du SSR)
        if (!visitLoggedRef.current) {
          try {
            await apiService.post('/analytics/track-visit', {
              smartlinkId: data._id,
              userAgent: navigator.userAgent,
              referrer: document.referrer || 'Direct',
              geoData: {
                country: geoData.country || 'Unknown',
                region: geoData.region || 'Unknown',
                city: geoData.city || 'Unknown',
                countryCode: geoData.country_code || 'XX',
                timezone: geoData.timezone || 'UTC'
              }
            });
            
            visitLoggedRef.current = true;
            console.log(`[CLIENT] Visit loggée pour SmartLink: ${data._id}`);
          } catch (visitError) {
            console.warn('[CLIENT] Erreur lors du logging de la visite:', visitError);
          }
        }

        // 4. ÉVÉNEMENT GTM - Page view
        const pageViewEvent = {
          event: 'smartlink_page_view',
          smartlink_id: data._id,
          track_title: data.trackTitle,
          artist_name: data.artistName,
          user_country: geoData.country || 'Unknown',
          user_region: geoData.region || 'Unknown',
          page_path: window.location.pathname,
          timestamp: new Date().toISOString(),
          platforms_count: data.platforms?.length || 0,
          is_mobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
          referrer: document.referrer || 'Direct'
        };

        // Push vers le dataLayer global (GTM SmartLinks)
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push(pageViewEvent);
          console.log('[CLIENT] Page view event envoyé vers GTM SmartLinks:', pageViewEvent);
        }

        // Événement GA4 SmartLinks direct
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-098G18MJ7M', {
            page_title: `${data.trackTitle} - ${data.artistName}`,
            page_location: window.location.href,
            custom_map: {
              'custom_parameter_1': 'smartlink_id',
              'custom_parameter_2': 'track_title',
              'custom_parameter_3': 'artist_name'
            }
          });
          
          window.gtag('event', 'smartlink_page_view', {
            smartlink_id: data._id,
            track_title: data.trackTitle,
            artist_name: data.artistName,
            user_country: geoData.country || 'Unknown',
            platforms_count: data.platforms?.length || 0
          });
          
          console.log('[CLIENT] GA4 SmartLinks direct event envoyé');
        }

        // 5. Meta Pixel tracking
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'ViewContent', {
            content_name: data.trackTitle,
            content_category: 'Music',
            content_ids: [data._id],
            artist_name: data.artistName
          });
          console.log('[CLIENT] Meta Pixel ViewContent tracked');
        }

      } catch (err) {
        console.error('[CLIENT] Erreur lors du chargement:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadSmartLinkAndTrack();
    }
  }, [slug]);

  // Fonction de gestion des clics avec tracking double-moteur
  const handleServiceClick = async (platform) => {
    if (isTracking) {
      console.log('[CLIENT] Clic ignoré - tracking en cours');
      return;
    }

    setIsTracking(true);
    console.log(`[CLIENT] Clic sur ${platform.displayName || platform.name} détecté`);

    try {
      // 1. ÉVÉNEMENT GTM IMMÉDIAT - Service click
      const clickEvent = {
        event: 'service_click',
        smartlink_id: smartlinkData._id,
        service_name: platform.platform || platform.name.toLowerCase(),
        service_display_name: platform.displayName || platform.name,
        track_title: smartlinkData.trackTitle,
        artist_name: smartlinkData.artistName,
        user_country: userGeoData?.country || 'Unknown',
        timestamp: new Date().toISOString()
      };

      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push(clickEvent);
        console.log('[CLIENT] Service click event envoyé vers GTM SmartLinks:', clickEvent);
      }

      // Événement GA4 SmartLinks direct pour les clics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'service_click', {
          smartlink_id: smartlinkData._id,
          service_name: platform.platform || platform.name.toLowerCase(),
          service_display_name: platform.displayName || platform.name,
          track_title: smartlinkData.trackTitle,
          artist_name: smartlinkData.artistName,
          user_country: userGeoData?.country || 'Unknown'
        });
        console.log('[CLIENT] GA4 SmartLinks service click event envoyé');
      }

      // 2. Meta Pixel - AddToCart (engagement)
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_name: smartlinkData.trackTitle,
          content_category: 'Music',
          content_ids: [smartlinkData._id],
          service_name: platform.displayName || platform.name
        });
        console.log('[CLIENT] Meta Pixel AddToCart tracked');
      }

      // 3. TRACKING SERVEUR - API call sécurisé
      const trackingResponse = await apiService.post('/analytics/track-click', {
        smartlinkId: smartlinkData._id,
        serviceName: platform.platform || platform.name.toLowerCase(),
        serviceDisplayName: platform.displayName || platform.name,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      console.log('[CLIENT] Click tracking response:', trackingResponse.data);

      // 4. Délai pour assurer le tracking puis redirection
      setTimeout(() => {
        const destinationUrl = platform.url || trackingResponse.data?.destinationUrl;
        if (destinationUrl) {
          console.log(`[CLIENT] Redirection vers: ${destinationUrl}`);
          window.location.assign(destinationUrl);
        } else {
          console.error('[CLIENT] Aucune URL de destination trouvée');
          setIsTracking(false);
        }
      }, 150); // 150ms pour assurer le tracking

    } catch (error) {
      console.error('[CLIENT] Erreur lors du tracking du clic:', error);
      setIsTracking(false);
      
      // Redirection de fallback vers l'URL originale
      if (platform.url) {
        setTimeout(() => {
          window.location.assign(platform.url);
        }, 100);
      }
    }
  };

  // Rendu de chargement
  if (loading) {
    return (
      <StyledContainer maxWidth={false}>
        <SmartLinkCard>
          <Skeleton variant="rectangular" width={200} height={200} sx={{ mx: 'auto', mb: 3, borderRadius: '16px' }} />
          <Skeleton width="80%" height={40} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton width="60%" height={30} sx={{ mx: 'auto', mb: 3 }} />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={60} sx={{ mb: 1.5, borderRadius: '50px' }} />
          ))}
        </SmartLinkCard>
      </StyledContainer>
    );
  }

  // Rendu d'erreur
  if (error || !smartlinkData) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>SmartLink non trouvé - MDMC Music Ads</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <StyledContainer maxWidth={false}>
          <SmartLinkCard>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'SmartLink non trouvé'}
            </Alert>
            <Typography variant="h6" gutterBottom>
              Ce lien musical n'existe pas ou n'est plus disponible.
            </Typography>
          </SmartLinkCard>
        </StyledContainer>
      </HelmetProvider>
    );
  }

  // Rendu principal
  return (
    <HelmetProvider>
      <Helmet>
        <title>{`${smartlinkData.trackTitle} - ${smartlinkData.artistName} | MDMC SmartLink`}</title>
        <meta name="description" content={`Écouter "${smartlinkData.trackTitle}" de ${smartlinkData.artistName} sur toutes les plateformes de streaming musical.`} />
        
        {/* GTM SmartLinks spécifique */}
        <script>
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-572GXWPP');`}
        </script>
        
        {/* GA4 SmartLinks spécifique */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-098G18MJ7M"></script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-098G18MJ7M');`}
        </script>
        
        {/* Open Graph */}
        <meta property="og:title" content={`${smartlinkData.trackTitle} - ${smartlinkData.artistName}`} />
        <meta property="og:description" content={`Écouter sur toutes les plateformes de streaming`} />
        <meta property="og:image" content={smartlinkData.artworkUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:type" content="music.song" />
        <meta property="music:musician" content={smartlinkData.artistName} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${smartlinkData.trackTitle} - ${smartlinkData.artistName}`} />
        <meta name="twitter:description" content="Écouter sur toutes les plateformes de streaming" />
        <meta name="twitter:image" content={smartlinkData.artworkUrl} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicRecording",
            "name": smartlinkData.trackTitle,
            "byArtist": {
              "@type": "MusicGroup",
              "name": smartlinkData.artistName
            },
            "image": smartlinkData.artworkUrl,
            "url": window.location.href
          })}
        </script>
        
        {/* GTM SmartLinks noscript */}
        <noscript>
          {`<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-572GXWPP"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>`}
        </noscript>
      </Helmet>

      <StyledContainer maxWidth={false}>
        <SmartLinkCard>
          {/* Artwork */}
          <ArtworkContainer>
            {smartlinkData.artworkUrl ? (
              <img 
                src={smartlinkData.artworkUrl} 
                alt={`${smartlinkData.trackTitle} artwork`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div style="color: #666; font-size: 48px;">♪</div>';
                }}
              />
            ) : (
              <Typography variant="h2" color="textSecondary">♪</Typography>
            )}
          </ArtworkContainer>

          {/* Track Info */}
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontSize: isMobile ? '1.5rem' : '2rem',
              color: '#1a1a1a',
              mb: 1
            }}
          >
            {smartlinkData.trackTitle}
          </Typography>
          
          <Typography 
            variant="h6" 
            color="textSecondary" 
            gutterBottom
            sx={{ 
              fontSize: isMobile ? '1rem' : '1.25rem',
              mb: 4
            }}
          >
            {smartlinkData.artistName}
          </Typography>

          {/* Platform Buttons */}
          <Box sx={{ width: '100%' }}>
            {smartlinkData.platforms && smartlinkData.platforms.length > 0 ? (
              smartlinkData.platforms.map((platform, index) => {
                const config = getPlatformConfig(platform.platform || platform.name);
                return (
                  <PlatformButton
                    key={index}
                    component="button"
                    platformcolor={config.color}
                    onClick={() => handleServiceClick(platform)}
                    disabled={isTracking}
                  >
                    <PlatformLogo 
                      src={config.logo} 
                      alt={`${config.name} logo`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {isTracking ? (
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    ) : null}
                    Écouter sur {config.name}
                  </PlatformButton>
                );
              })
            ) : (
              <Alert severity="info">
                Aucune plateforme de streaming disponible pour ce titre.
              </Alert>
            )}
          </Box>

          {/* Footer */}
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ 
              mt: 3, 
              display: 'block',
              opacity: 0.7
            }}
          >
            Powered by MDMC Music Ads
          </Typography>
        </SmartLinkCard>
      </StyledContainer>
    </HelmetProvider>
  );
};

export default SmartLinkPageDoubleTracking;