// src/pages/public/SmartLinkPage.jsx
// (ou src/pages/SmartLinkPage.jsx selon votre structure)

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  // ListItemIcon, // Optionnel si vous avez des icônes spécifiques par plateforme
  // ListItemText, // Remplacé par le contenu du bouton
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // Icône générique, à remplacer idéalement
import { SiSpotify, SiApplemusic, SiYoutube, SiAmazonmusic, SiTidal } from 'react-icons/si';

import apiService from "../../services/api.service"; // Chemin d'origine de l'utilisateur

// Délai avant redirection après clic sur plateforme (pour laisser le temps aux scripts de tracking)
const PLATFORM_REDIRECT_DELAY_MS = 300; // 300 millisecondes

// --- Fonction d'injection des scripts de tracking (PageView initial) ---
// (Version basée sur votre code, avec légères adaptations)
const injectTrackingScripts = (trackingIds, smartlinkDataForTracking) => {
  const head = document.head;
  const activeScripts = []; // Pour garder une trace des scripts ajoutés

  const addScriptElement = (innerHTML, src, async = false, id) => {
    const script = document.createElement("script");
    if (id) script.id = id; // Utile pour un nettoyage plus ciblé si nécessaire
    if (src) {
      script.src = src;
      if (async) script.async = true;
    }
    if (innerHTML) {
      script.innerHTML = innerHTML;
    }
    head.appendChild(script);
    activeScripts.push(script);
  };

  // GA4
  if (trackingIds.ga4Id) {
    addScriptElement(null, `https://www.googletagmanager.com/gtag/js?id=${trackingIds.ga4Id}`, true, 'ga4-lib');
    addScriptElement(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingIds.ga4Id}');
    `, null, false, 'ga4-init');
    console.log("GA4 PageView script configured for", trackingIds.ga4Id);
  }

  // Meta Pixel
  if (trackingIds.metaPixelId) {
    addScriptElement(`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${trackingIds.metaPixelId}');
      fbq('track', 'PageView');
    `, null, false, 'meta-pixel-init');
    console.log("Meta Pixel PageView script configured for", trackingIds.metaPixelId);
  }

  // Google Tag Manager (GTM)
  if (trackingIds.gtmId) {
    const gtmInitialData = {
      'event': 'smartlink_view', // Événement personnalisé pour GTM
      'smartlink_id': smartlinkDataForTracking.id,
      'smartlink_title': smartlinkDataForTracking.title,
      'smartlink_artist': smartlinkDataForTracking.artistName,
      // Ajoutez d'autres données si utiles pour GTM
    };
    addScriptElement(`
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(${JSON.stringify(gtmInitialData)});
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${trackingIds.gtmId}');
    `, null, false, 'gtm-init');
    console.log("GTM PageView script configured for", trackingIds.gtmId);
  }

  // TikTok Pixel
  if (trackingIds.tiktokPixelId) {
    addScriptElement(`
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._loadTimestamp=Date.now(),ttq._i[e].pixelId=e;var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      
        ttq.load('${trackingIds.tiktokPixelId}');
        ttq.page(); // Déclenche l'événement PageView pour TikTok
      }(window, document, 'ttq');
    `, null, false, 'tiktok-pixel-init');
    console.log("TikTok Pixel PageView script configured for", trackingIds.tiktokPixelId);
  }

  // Nettoyage : supprimer les scripts si le composant est démonté
  return () => {
    activeScripts.forEach(script => {
      if (script && script.parentNode === head) { // Vérifier si le parent est bien head
        head.removeChild(script);
      }
    });
    console.log("Tracking scripts (PageView) cleaned up.");
  };
};


// --- Styled Components (Optionnel, pour l'esthétique) ---
const BackgroundImage = styled('div')(({ imageUrl }) => ({
  position: 'fixed', left: 0, right: 0, zIndex: -1, display: 'block',
  backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
  width: '100vw', height: '100vh', filter: 'blur(15px) brightness(0.6)', transform: 'scale(1.15)',
}));

const ContentWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2, 4, 2), // Ajusté pour un meilleur espacement
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: 'rgba(25, 25, 25, 0.85)', // Fond sombre semi-transparent
  backdropFilter: 'blur(10px)', // Effet de flou plus prononcé
  borderRadius: theme.shape.borderRadius * 2.5, // Bords plus arrondis
  maxWidth: 500,
  width: '90%', // Pour les petits écrans
  marginLeft: 'auto',
  marginRight: 'auto',
  color: theme.palette.common.white,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
}));

const CoverArt = styled('img')({
  width: '70%', maxWidth: 220, height: 'auto', borderRadius: 12, margin: '0 auto 20px auto',
  boxShadow: '0 5px 25px rgba(0,0,0,0.6)', display: 'block',
});

const PlatformButton = styled(Button)(({ theme, platformcolor }) => ({ // platformcolor pour des couleurs dynamiques
  margin: theme.spacing(1, 0), padding: theme.spacing(1.5, 2.5), justifyContent: 'center',
  textTransform: 'none', fontWeight: 'bold', borderRadius: '50px',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  backgroundColor: platformcolor || theme.palette.primary.main, // Couleur par défaut ou spécifique
  color: theme.palette.getContrastText(platformcolor || theme.palette.primary.main),
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 20px ${platformcolor || theme.palette.primary.main}`,
    backgroundColor: platformcolor ? theme.palette.augmentColor({color: {main: platformcolor}}).dark : theme.palette.primary.dark,
  }
}));
// Exemple de mapping de couleurs par plateforme (à enrichir)
const platformColors = {
  spotify: '#1DB954',
  applemusic: '#FA233E', // Couleur approximative Apple Music
  deezer: '#EF5466',    // Couleur approximative Deezer
  youtube: '#FF0000',
  // Ajoutez d'autres plateformes et leurs couleurs
};

// Mapping plateforme -> icône simple-icons
const platformIconMap = {
  spotify: SiSpotify,
  applemusic: SiApplemusic,
  youtube: SiYoutube,
  amazonmusic: SiAmazonmusic,
  tidal: SiTidal,
  deezer: MusicNoteIcon, // Fallback générique car SiDeezer n'existe pas
};

const getPlatformIcon = (platform) => {
  const key = platform?.toLowerCase().replace(/\s/g, '');
  return platformIconMap[key] || MusicNoteIcon;
};

const SmartLinkPage = () => {
  const { artistSlug, trackSlug } = useParams();
  const [smartLinkData, setSmartLinkData] = useState(null); // Structure: { smartLink: {...}, artist: {...} }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données du SmartLink
  useEffect(() => {
    let cleanupScriptsFunction = () => {}; // Initialiser avec une fonction vide

    const fetchSmartLink = async () => {
      try {
        setLoading(true);
        setError(null);
        // Vérification de sécurité pour apiService
        if (!apiService || !apiService.smartlinks || typeof apiService.smartlinks.getBySlugs !== 'function') {
          throw new Error('Service SmartLinks non initialisé');
        }

        const response = await apiService.smartlinks.getBySlugs(artistSlug, trackSlug);

        if (response && response.success && response.data && response.data.smartLink && response.data.artist) {
          setSmartLinkData(response.data);
          if (response.data.smartLink.trackingIds) {
            const smartlinkInfoForTracking = {
                id: response.data.smartLink._id,
                title: response.data.smartLink.trackTitle,
                artistName: response.data.artist.name
            };
            cleanupScriptsFunction = injectTrackingScripts(response.data.smartLink.trackingIds, smartlinkInfoForTracking);
          }
        } else {
          throw new Error(response.error || "Données SmartLink non valides ou non trouvées.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du SmartLink:", err);
        const errorMessage = err.response?.data?.message || err.message || "Erreur lors de la récupération des données.";
        setError(errorMessage);
        if (err.response?.status === 404) {
          setError(`SmartLink non trouvé pour ${artistSlug}/${trackSlug}.`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (artistSlug && trackSlug) {
      fetchSmartLink();
    } else {
      setError("Paramètres d'URL manquants pour charger le SmartLink.");
      setLoading(false);
    }
    // Fonction de nettoyage appelée au démontage du composant
    return () => {
      cleanupScriptsFunction();
    };
  }, [artistSlug, trackSlug]);


  // Gestion du clic sur un lien de plateforme
  const handlePlatformLinkClick = async (platformName, platformUrl, smartlinkId) => {
    console.log(`Clic sur ${platformName}, redirection vers ${platformUrl}`);
    const trackingIds = smartLinkData?.smartLink?.trackingIds;
    const eventValue = 100; // Votre valeur de conversion
    const eventCurrency = 'EUR'; // Votre devise

    if (trackingIds) {
      // GA4 - Événement 'select_content' ou un événement personnalisé
      if (trackingIds.ga4Id && window.gtag) {
        window.gtag('event', 'select_content', {
          content_type: 'music_platform_click', // Catégorie plus spécifique
          item_id: platformName, // Nom de la plateforme
          value: eventValue, // Valeur de conversion
          currency: eventCurrency, // Devise
        });
         // Événement personnalisé plus spécifique si besoin
        window.gtag('event', `conversion_platform_${platformName.toLowerCase().replace(/\s+/g, '_')}`, {
            event_category: 'SmartLink Conversion',
            event_label: `Clicked ${platformName} for ${smartLinkData?.smartLink?.trackTitle}`,
            value: eventValue,
            currency: eventCurrency,
        });
        console.log(`GA4 event: conversion_platform_${platformName}`);
      }

      // Meta Pixel - Événement 'Lead' ou 'Purchase' (si valeur monétaire) ou Custom
      if (trackingIds.metaPixelId && window.fbq) {
        // L'événement 'Purchase' est souvent utilisé si une valeur monétaire est associée
        window.fbq('track', 'Purchase', { 
            value: eventValue, 
            currency: eventCurrency, 
            content_name: platformName, 
            content_category: 'MusicPlatformClick',
            content_ids: [`${smartlinkId}_${platformName}`], // ID unique pour ce clic
            content_type: 'product' // Pour les événements de valeur, 'product' est souvent attendu
        });
        // Ou un événement custom spécifique "NomPlateforme-conv"
        // window.fbq('trackCustom', `${platformName.replace(/\s+/g, '')}Conv`, { value: eventValue, currency: eventCurrency });
        console.log(`Meta Pixel event: Purchase (conversion) - ${platformName}`);
      }
      
      // Google Tag Manager (GTM)
      if (trackingIds.gtmId && window.dataLayer) {
        window.dataLayer.push({
            'event': `smartlink_conversion_click`, // Événement spécifique pour la conversion
            'event_category': 'SmartLink Conversion',
            'event_action': `Clicked ${platformName}`,
            'event_label': smartLinkData?.smartLink?.trackTitle,
            'smartlink_id': smartlinkId,
            'platform_name': platformName,
            'value': eventValue, // Valeur de la conversion
            'currency': eventCurrency, // Devise
        });
        console.log(`GTM event: smartlink_conversion_click - ${platformName}`);
      }

      // TikTok Pixel
      if (trackingIds.tiktokPixelId && window.ttq) {
        // 'CompletePayment' ou 'Purchase' sont des événements standards pour les conversions avec valeur.
        // Vous pouvez aussi utiliser 'ClickButton' avec des paramètres de valeur.
        window.ttq.track('CompletePayment', { // Ou 'Purchase', selon la sémantique de TikTok pour la valeur
          content_id: `${smartlinkId}_${platformName.toLowerCase().replace(/\s+/g, '_')}`,
          content_type: 'music_platform_conversion', // Catégorie plus spécifique
          content_name: `Clicked ${platformName} for ${smartLinkData?.smartLink?.trackTitle}`,
          quantity: 1,
          price: eventValue, // Le prix unitaire est la valeur de la conversion
          value: eventValue, // Valeur totale
          currency: eventCurrency,
        });
        console.log(`TikTok Pixel event: CompletePayment (conversion) - ${platformName}`);
      }
    }

    // OPTIONNEL: Logguer le clic dans votre base de données interne (backend)
    /*
    if (smartlinkId) {
      try {
        // Créez cette méthode dans votre apiService et le endpoint backend correspondant
        // await apiService.smartlinks.logPlatformClick(smartlinkId, { platform: platformName });
        console.log(`Clic sur ${platformName} loggué dans la base de données interne (appel API optionnel).`);
      } catch (dbError) {
        console.error(`Erreur lors du log du clic interne pour ${platformName}:`, dbError);
        // Non bloquant pour l'utilisateur, on redirige quand même
      }
    }
    */

    // Rediriger l'utilisateur après un court délai
    setTimeout(() => {
      window.location.href = platformUrl;
    }, PLATFORM_REDIRECT_DELAY_MS);
  };

  // --- Rendu ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#181818' }}>
        <CircularProgress size={50} sx={{color: 'primary.light'}} />
        <Typography variant="h6" sx={{ mt: 2, color: 'common.white' }}>Chargement du SmartLink...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{backgroundColor: 'rgba(255,0,0,0.15)', color: 'error.light'}}>
          <Typography variant="h5" sx={{fontWeight: 'bold'}}>Erreur de chargement</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!smartLinkData || !smartLinkData.smartLink || !smartLinkData.artist) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="warning">SmartLink non disponible ou données corrompues.</Alert>
      </Container>
    );
  }

  const { smartLink, artist } = smartLinkData;
  const pageTitle = `${smartLink.trackTitle} - ${artist.name}`;
  const pageDescription = smartLink.description || `Écoutez ${smartLink.trackTitle} par ${artist.name} sur votre plateforme préférée.`;
  const pageUrl = window.location.href;
  const coverImageForDisplay = smartLink.coverImageUrl; // URL directe de l'image
  const ogImage = smartLink.coverImageUrl || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"; // Image pour OG, avec fallback


  return (
    <HelmetProvider>
      <Box>
        {coverImageForDisplay && <BackgroundImage imageUrl={coverImageForDisplay} />}
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:type" content="music.song" />
          <meta property="og:url" content={pageUrl} />
          {artist.name && <meta property="music:musician" content={artist.name} />}
          {smartLink.releaseDate && <meta property="music:release_date" content={new Date(smartLink.releaseDate + "T00:00:00").toISOString().split('T')[0]} />}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={ogImage} />
          {/* Les scripts PageView sont injectés par injectTrackingScripts via useEffect */}
        </Helmet>

        <Container component="main" sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', py: {xs: 2, md: 4} }}>
          <ContentWrapper elevation={12}>
            {artist.artistImageUrl && (
              <Avatar
                src={artist.artistImageUrl}
                alt={artist.name}
                sx={{ width: 80, height: 80, margin: '0 auto 16px auto', border: '3px solid rgba(255,255,255,0.7)' }}
              />
            )}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', wordBreak: 'break-word', lineHeight: 1.2, mb: 0.5 }}>
              {smartLink.trackTitle}
            </Typography>
            <Typography variant="h6" component="p" sx={{ color: 'rgba(255,255,255,0.75)', mb: 2.5 }}>
              {artist.name}
            </Typography>

            {coverImageForDisplay && (
                <CoverArt src={coverImageForDisplay} alt={`Pochette de ${smartLink.trackTitle}`} />
            )}
            
            {smartLink.description && (
              <Typography variant="body1" sx={{ my: 2.5, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
                {smartLink.description}
              </Typography>
            )}

            {smartLink.platformLinks && smartLink.platformLinks.filter(link => link.url && link.platform).length > 0 ? (
              <>
                <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.25)' }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', fontSize: '1.1rem' }}>
                  Écoutez maintenant sur :
                </Typography>
                <List sx={{width: '100%', p:0}}>
                  {smartLink.platformLinks.filter(link => link.url && link.platform).map((link, index) => {
                    const Icon = getPlatformIcon(link.platform);
                    const color = platformColors[link.platform?.toLowerCase()] || '#fff';
                    return (
                      <ListItem key={link.platform + index} disablePadding sx={{mb: 1.5}}>
                        <PlatformButton
                          platformcolor={color}
                          fullWidth
                          startIcon={<Icon size={28} />}
                          onClick={() => handlePlatformLinkClick(link.platform, link.url, smartLink._id)}
                          sx={{
                            background: '#fff',
                            color: '#0d0d0d',
                            borderRadius: 99,
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            mb: 2,
                            '&:hover': {
                              background: color,
                              color: '#fff',
                            },
                          }}
                        >
                          Écouter sur {link.platform}
                        </PlatformButton>
                      </ListItem>
                    );
                  })}
                </List>
              </>
            ) : (
              <Typography sx={{my: 3, color: 'warning.light'}}>Aucune plateforme de streaming configurée pour ce titre.</Typography>
            )}
          </ContentWrapper>
          <Typography variant="caption" sx={{mt: 3, color: 'rgba(255,255,255,0.5)', textAlign: 'center'}}>
            Propulsé par MDMC Music Ads SmartLinks
          </Typography>
        </Container>
      </Box>
    </HelmetProvider>
  );
};

export default SmartLinkPage;
