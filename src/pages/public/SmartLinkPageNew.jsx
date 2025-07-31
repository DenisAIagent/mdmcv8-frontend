import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import apiService from "../../services/api.service";
import { useColorExtractor, useDynamicStyles } from "../../hooks/useColorExtractor";
import { useTerritorialFilter } from "../../hooks/useGeolocation";
import "./SmartLinkPageNew.css";

// Import des icônes des plateformes
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
import { MdMusicNote, MdLibraryMusic, MdQueueMusic } from 'react-icons/md';

const SmartLinkPageNew = () => {
  console.log("🚀 SmartLinkPageNew component loaded!");
  
  const { artistSlug, trackSlug } = useParams();
  const [smartLinkData, setSmartLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🎨 Hook pour extraction de couleur dominante
  const coverImageUrl = smartLinkData?.smartLink?.coverImageUrl;
  const {
    colors,
    isLoading: colorLoading,
    gradientBackground,
    backgroundColor,
    textColor,
    isLightTheme
  } = useColorExtractor(coverImageUrl, {
    autoExtract: true,
    quality: 5, // Plus rapide pour l'expérience utilisateur
    enableCache: true
  });

  // 🎨 Styles dynamiques basés sur la couleur dominante
  const { styles: dynamicStyles } = useDynamicStyles(coverImageUrl, {
    backgroundOpacity: 0.4,
    blurAmount: '25px',
    gradientType: 'blur',
    enableTransition: true
  });

  // 🌍 Filtrage territorial des plateformes
  const platformLinks = smartLinkData?.smartLink?.platformLinks || [];
  const {
    filtered: availablePlatforms,
    isLoading: geoLoading,
    location,
    total,
    kept,
    removedCount,
    country
  } = useTerritorialFilter(platformLinks, {
    autoDetect: true,
    enableCache: true
  });

  useEffect(() => {
    console.log("🎯 SmartLinkPageNew mounted with params:", { artistSlug, trackSlug });
    console.log("🎯 Current URL:", window.location.href);
    console.log("🎯 Current hash:", window.location.hash);
    console.log("🎯 Current pathname:", window.location.pathname);
    
    const fetchSmartLink = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔗 Chargement SmartLink:", { artistSlug, trackSlug });
        
        // Vérification de sécurité pour apiService
        if (!apiService || !apiService.smartlinks || typeof apiService.smartlinks.getBySlugs !== 'function') {
          throw new Error('Service SmartLinks non initialisé');
        }

        const response = await apiService.smartlinks.getBySlugs(artistSlug, trackSlug);
        
        if (response && response.success && response.data) {
          console.log("✅ SmartLink chargé:", response.data);
          setSmartLinkData(response.data);
          
          // 🎨 EXTRACTION COULEURS COMME DEMANDÉ avec Color Thief CDN
          const artworkUrl = response.data.smartLink?.coverImageUrl;
          if (artworkUrl && window.ColorThief) {
            const colorThief = new window.ColorThief();
            const artworkImage = new Image();
            artworkImage.crossOrigin = 'anonymous';
            
            artworkImage.onload = () => {
              try {
                // Extraire 5 couleurs dominantes comme demandé
                const palette = colorThief.getPalette(artworkImage, 5);
                const [r1, g1, b1] = palette[0];
                const [r2, g2, b2] = palette[1] || palette[0];
                
                console.log('🎨 Palette extraite:', palette);
                
                // Appliquer gradient au body comme demandé
                document.body.style.background = 
                  `linear-gradient(135deg, rgb(${r1},${g1},${b1}), rgb(${r2},${g2},${b2}))`;
                
                // Background cover comme demandé
                const backgroundArtwork = document.getElementById('backgroundArtwork');
                if (backgroundArtwork) {
                  backgroundArtwork.style.backgroundImage = `url(${artworkUrl})`;
                  backgroundArtwork.style.opacity = '0.3';
                }
                
              } catch (error) {
                console.warn('⚠️ Erreur extraction couleur:', error);
              }
            };
            
            artworkImage.src = artworkUrl;
          }
          
          // 🌍 Log de géolocalisation pour le débogage
          console.log('🌍 Géolocalisation:', { location, total, kept, removedCount, availablePlatforms: availablePlatforms?.length });
        } else {
          throw new Error(response?.error || "SmartLink non trouvé");
        }
      } catch (err) {
        console.error("❌ Erreur SmartLink:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (artistSlug && trackSlug) {
      fetchSmartLink();
    } else {
      setError("Paramètres manquants");
      setLoading(false);
    }

    // 🎨 Cleanup pour restaurer l'état original du body
    return () => {
      document.body.style.background = '';
      const backgroundArtwork = document.getElementById('backgroundArtwork');
      if (backgroundArtwork) {
        backgroundArtwork.style.backgroundImage = '';
        backgroundArtwork.style.opacity = '0';
      }
    };
  }, [artistSlug, trackSlug]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? "⏸️ Paused preview..." : "🎵 Playing preview...");
  };

  const handlePlatformClick = (platform, url) => {
    console.log(`🔗 Clicked on ${platform.platform}:`, url);
    
    // Tracking logic here
    if (smartLinkData?.smartLink?._id) {
      // Add tracking call
      console.log("📊 Tracking platform click:", platform.platform);
    }
    
    // Redirect to platform
    setTimeout(() => {
      window.open(url, '_blank');
    }, 150);
  };

  const getPlatformIcon = (platformName) => {
    const platform = platformName.toLowerCase().replace(/\s+/g, '');
    
    // Mapping des plateformes vers leurs icônes
    const iconMap = {
      'spotify': SiSpotify,
      'applemusic': SiApplemusic,
      'apple': SiApplemusic,
      'youtubemusic': SiYoutubemusic,
      'youtube': SiYoutube,
      'amazonmusic': SiAmazonmusic,
      'amazon': SiAmazonmusic,
      'deezer': MdMusicNote, // Deezer n'a pas d'icône officielle, on utilise une icône générique
      'tidal': SiTidal,
      'soundcloud': SiSoundcloud,
      'pandora': SiPandora,
      'itunes': SiApplemusic, // iTunes utilise l'icône Apple Music
      'napster': MdLibraryMusic,
      'audiomack': MdQueueMusic,
      'anghami': MdMusicNote,
      'qobuz': MdMusicNote
    };

    return iconMap[platform] || MdMusicNote;
  };

  const getPlatformCTA = (platformName) => {
    const platform = platformName.toLowerCase();
    if (platform.includes('itunes') || platform.includes('amazon')) return 'Télécharger';
    return 'Écouter';
  };

  if (loading) {
    return (
      <div className="smartlink-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du SmartLink...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smartlink-page">
        <div className="error-container">
          <h2>😕 SmartLink non trouvé</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!smartLinkData?.smartLink || !smartLinkData?.artist) {
    return (
      <div className="smartlink-page">
        <div className="error-container">
          <h2>😕 Données manquantes</h2>
          <p>Impossible de charger les données du SmartLink</p>
        </div>
      </div>
    );
  }

  const { smartLink, artist } = smartLinkData;
  const title = `${smartLink.trackTitle} - ${artist.name}`;
  const coverImage = smartLink.coverImageUrl || "https://via.placeholder.com/280x280/FF6B35/FFFFFF?text=🎵+No+Artwork";

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Écoutez ${smartLink.trackTitle} par ${artist.name} sur votre plateforme préférée.`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Écoutez ${smartLink.trackTitle} par ${artist.name} sur votre plateforme préférée.`} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:type" content="music.song" />
      </Helmet>
      
      <div 
        className="smartlink-page"
        style={{
          background: colors ? gradientBackground : undefined,
          transition: 'background 0.8s ease-in-out'
        }}
      >
        {/* 🎨 Background artwork immersif comme demandé */}
        <div className="background-artwork" id="backgroundArtwork"></div>
        
        <div className="container">
          {/* Hero Section */}
          <div className="artwork-container" onClick={togglePlay}>
            {/* 🎨 Indicateur d'extraction de couleur */}
            {colorLoading && (
              <div 
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div 
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #ff6b35, #ff8e53)',
                    animation: 'pulse 1s infinite'
                  }}
                ></div>
                Couleurs...
              </div>
            )}
            <img 
              src={coverImage}
              alt={`${smartLink.trackTitle} - ${artist.name}`} 
              className="artwork-image"
            />
            <div className="play-overlay">
              <div className={`play-icon ${isPlaying ? 'playing' : ''}`}></div>
            </div>
            <div className="platform-badge"></div>
          </div>
          
          <div className="metadata">
            <h1 
              className="track-title"
              style={{
                color: colors ? textColor : undefined,
                textShadow: colors ? '0 2px 4px rgba(0,0,0,0.3)' : undefined,
                transition: 'color 0.8s ease-in-out'
              }}
            >
              {smartLink.trackTitle}
            </h1>
            <p 
              className="subtitle"
              style={{
                color: colors ? (isLightTheme ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)') : undefined,
                transition: 'color 0.8s ease-in-out'
              }}
            >
              {artist.name} • Choisir ma plateforme
            </p>
            
            {/* 🌍 Indicateur de géolocalisation */}
            {location && !geoLoading && (
              <div 
                style={{
                  fontSize: '12px',
                  opacity: 0.8,
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: colors ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: colors ? (isLightTheme ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)') : undefined,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.8s ease-in-out'
                }}
              >
                🌍 {location.city}, {location.country}
                {removedCount > 0 && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '11px',
                    color: colors ? (isLightTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)') : undefined
                  }}>
                    • {kept}/{total} services
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Platforms List */}
          <div 
            className="platforms-container"
            style={{
              backgroundColor: colors ? (isLightTheme ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.7)') : undefined,
              backdropFilter: 'blur(15px)',
              boxShadow: colors ? `0 8px 32px ${colors.background.dark}` : undefined,
              transition: 'all 0.8s ease-in-out'
            }}
          >
            {availablePlatforms?.filter(link => link.url && link.platform).map((platform, index) => (
              <div 
                key={`${platform.platform}-${index}`}
                className="platform-item platform-fade-in" 
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                onClick={() => handlePlatformClick(platform, platform.url)}
              >
                <div className="platform-brand">
                  <div className="platform-logo">
                    {React.createElement(getPlatformIcon(platform.platform), { 
                      size: 24,
                      'data-platform': platform.platform.toLowerCase().replace(/\s+/g, '')
                    })}
                  </div>
                  <span className="platform-name">{platform.platform}</span>
                </div>
                <div className={`cta-button ${platform.platform.toLowerCase().replace(/\s+/g, '-')}`}>
                  {getPlatformCTA(platform.platform)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="cookie-notice">
          Propulsé par MDMC Music Ads SmartLinks
        </div>
      </div>
    </HelmetProvider>
  );
};

export default SmartLinkPageNew;