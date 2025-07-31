 /**
   * 🎨 SmartLink Page - Design épuré avec carte centrale
   * Design moderne, style Apple Music/Spotify avec carte blanche centrée
   */

  import React, { useEffect, useState } from "react";
  import { useParams } from "react-router-dom";
  import { Helmet, HelmetProvider } from "react-helmet-async";
  import apiService from "../../services/api.service";
  import { useTerritorialFilter } from "../../hooks/useGeolocation";
  import { usePlatformOrder, usePlatformOrderAnalytics } from "../../hooks/usePlatformOrder";
  import { useURLGeneration, useClickTracking, useUTMParams, useSocialMetadata } from
  "../../hooks/useURLGeneration";
  import "./SmartLinkPageClean.css";

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

  const SmartLinkPageClean = () => {
    console.log("🎨 SmartLinkPageClean - Design épuré chargé!");

    const { artistSlug, trackSlug } = useParams();
    const [smartLinkData, setSmartLinkData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🎨 Solution A : React State pour background image
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef(null);

    // 🌍 Filtrage territorial des plateformes
    const platformLinks = smartLinkData?.smartLink?.platformLinks || [];
    const {
      filtered: territorialPlatforms,
      isLoading: geoLoading,
      location,
      total,
      kept
    } = useTerritorialFilter(platformLinks, {
      autoDetect: true,
      enableCache: true
    });

    // 🎛️ Ordre personnalisé avec A/B testing
    const {
      platforms: availablePlatforms,
      orderSource,
      abTestVariant
    } = usePlatformOrder(territorialPlatforms, {
      enableABTest: true,
      userCountry: location?.countryCode,
      autoApply: true
    });

    // 📊 Analytics pour l'ordre des plateformes
    const { trackPlatformClick } = usePlatformOrderAnalytics();

    // 🔗 Génération d'URLs propres et tracking
    const { urls, socialMetadata, trackClick } = useURLGeneration(smartLinkData, {
      format: 'artist',
      enableMultiChannel: true
    });

    // 📊 Tracking avancé des clics
    const { trackClick: trackSmartLinkClick } = useClickTracking(smartLinkData);

    // 🏷️ Paramètres UTM dans l'URL actuelle
    const { utmParams, hasUTM, source: utmSource } = useUTMParams();

    // 🌐 Métadonnées sociales
    const { updateMetaTags } = useSocialMetadata(smartLinkData);

    // 🎨 Gestion de la classe body pour retirer la couleur de fond
    useEffect(() => {
      document.body.classList.add('smartlink-page');
      return () => {
        document.body.classList.remove('smartlink-page');
      };
    }, []);

    // 🎨 Chargement de l'image de background depuis coverImageUrl
    useEffect(() => {
      if (smartLinkData?.smartLink?.coverImageUrl) {
        const imageUrl = smartLinkData.smartLink.coverImageUrl;
        console.log("🎨 Chargement image background:", imageUrl);
        
        const img = new Image();
        img.onload = () => {
          console.log("✅ Image background chargée");
          setBackgroundImage(imageUrl);
          setBackgroundLoaded(true);
        };
        img.onerror = (error) => {
          console.warn("❌ Erreur chargement image background:", error);
          setBackgroundLoaded(false);
        };
        img.src = imageUrl;
      }
    }, [smartLinkData?.smartLink?.coverImageUrl]);

    useEffect(() => {
      console.log("🎯 SmartLinkPageClean mounted with params:", { artistSlug, trackSlug });

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

            // 🎨 DEBUG - Logs obligatoires pour diagnostic
            console.log("🎨 DEBUG - SmartLink data:", response.data);
            console.log("🎨 DEBUG - Cover URL:", response.data.smartLink?.artwork);
            console.log("🎨 DEBUG - Cover URL type:", typeof response.data.smartLink?.artwork);

            setSmartLinkData(response.data);

            // 🌐 Mettre à jour les métadonnées sociales
            setTimeout(() => {
              updateMetaTags();
            }, 100);

            // 🎨 BACKGROUND ARTWORK selon vos spécifications exactes
            const artworkUrl = response.data.smartLink?.artwork;
            console.log("🎨 Artwork URL found:", artworkUrl);

            // 🧪 Test 1 : URL Validity
            const validateImageUrl = (url) => {
              if (!url) return false;
              if (typeof url !== 'string') return false;
              if (!url.startsWith('http')) return false;
              return true;
            };

            // 🎨 Solution A : React State (RECOMMANDÉE)
            if (validateImageUrl(artworkUrl)) {
              console.log("🎨 DEBUG - Attempting to load:", artworkUrl);
              console.log("🎨 DEBUG - URL validation passed");

              const img = new Image();
              img.onload = () => {
                console.log("✅ DEBUG - Image loaded successfully");
                setBackgroundImage(artworkUrl);
                setBackgroundLoaded(true);
                console.log("🎨 DEBUG - React state updated with background image");
              };

              img.onerror = (error) => {
                console.error("❌ DEBUG - Image load failed:", artworkUrl, error);
                console.error("Image load failed, using fallback");
                setBackgroundLoaded(true); // Affiche le fallback
              };

              img.src = artworkUrl;
            } else {
              console.warn("❌ DEBUG - Invalid image URL:", artworkUrl);
              console.warn("🎨 No artwork URL found in SmartLink data");
              setBackgroundLoaded(true); // Affiche le fallback
            }
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

      // 🎨 Cleanup automatique avec React State (plus besoin de manipulation DOM)
    }, [artistSlug, trackSlug]);

    // 🎵 Gestion de la lecture audio
    // 📊 Fonction pour tracker les clics dans la base de données
    const trackPlatformClickToDatabase = async (smartLinkId, platformName) => {
      try {
        console.log(`📊 Envoi tracking clic: ${platformName} pour SmartLink ${smartLinkId}`);

        // Validation des paramètres
        if (!smartLinkId || !platformName) {
          console.warn('⚠️ Paramètres manquants pour le tracking:', { smartLinkId, platformName
  });
          return;
        }

        const response = await
  fetch(`https://api.mdmcmusicads.com/api/v1/smartlinks/${smartLinkId}/log-platform-click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platformName: platformName
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Clic ${platformName} enregistré:`, result.data);
          console.log(`📊 Total clics: ${result.data.totalClicks}, Clics ${platformName}:
  ${result.data.platformClicks}`);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
          console.warn(`⚠️ Échec tracking ${platformName} (${response.status}):`,
  errorData.error);

          // Log détaillé pour debug
          if (response.status === 404) {
            console.warn(`🔍 SmartLink ID ${smartLinkId} introuvable - vérifiez que le SmartLink
  existe`);
          } else if (response.status === 401) {
            console.warn('🔐 Erreur d\'authentification - vérifiez la configuration API');
          }
        }
      } catch (error) {
        console.error(`❌ Erreur réseau tracking ${platformName}:`, error);
        // Ne pas interrompre l'expérience utilisateur pour une erreur de tracking
      }
    };

    const handlePlayAudio = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      console.log('🎵 Play button clicked!');
      console.log('🎵 Audio ref:', audioRef.current);
      console.log('🎵 Audio URL:', smartLinkData?.smartLink?.previewAudioUrl);
      console.log('🎵 Is playing:', isPlaying);

      const audioUrl = smartLinkData?.smartLink?.previewAudioUrl;

      if (!audioUrl) {
        console.log('❌ Pas d\'URL audio disponible');
        return;
      }

      // Initialiser l'audio element si pas encore fait
      if (!audioRef.current) {
        console.log('🎵 Initialisation audio element');
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onpause = () => setIsPlaying(false);
        audioRef.current.onplay = () => setIsPlaying(true);
      }

      try {
        if (isPlaying) {
          console.log('⏸️ Pausing audio');
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          console.log('▶️ Playing audio from:', audioUrl);

          // S'assurer que la source est correcte
          if (audioRef.current.src !== audioUrl) {
            audioRef.current.src = audioUrl;
          }

          await audioRef.current.play();
          setIsPlaying(true);
          console.log('✅ Audio started playing');
        }
      } catch (error) {
        console.error('❌ Erreur lecture audio:', error);
        setIsPlaying(false);

        // Essayer de créer un nouvel élément audio
        try {
          audioRef.current = new Audio(audioUrl);
          await audioRef.current.play();
          setIsPlaying(true);
          console.log('✅ Audio started playing (retry)');
        } catch (retryError) {
          console.error('❌ Erreur même en retry:', retryError);
        }
      }
    };

    const handlePlatformClick = (platform, url) => {
      console.log(`🔗 Clicked on ${platform.platform}:`, url);

      // 📊 Tracking de l'ordre des plateformes
      const platformPosition = availablePlatforms.findIndex(p => p.platform ===
  platform.platform) + 1;
      trackPlatformClick(platform.platform, platformPosition);

      // 🔗 Tracking avancé avec URLs et UTM
      const currentUrl = window.location.href;
      trackSmartLinkClick(currentUrl, platform.platform, {
        position: platformPosition,
        orderSource,
        abTestVariant,
        utmSource,
        hasUTM,
        destinationUrl: url
      });

      // 📊 Tracking avec service URLs
      trackClick(url, {
        platform: platform.platform,
        position: platformPosition,
        source: utmSource || 'direct'
      });

      // 📊 Enregistrer le clic dans la base de données
      if (smartLinkData?.smartLink?._id) {
        console.log("📊 Tracking platform click:", {
          platform: platform.platform,
          position: platformPosition,
          orderSource,
          abTestVariant,
          utmParams
        });

        // Appel API pour tracker le clic
        trackPlatformClickToDatabase(smartLinkData.smartLink._id, platform.platform);
      }

      // Redirect to platform
      setTimeout(() => {
        window.open(url, '_blank');
      }, 150);
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
        'deezer': MdMusicNote,
        'tidal': SiTidal,
        'soundcloud': SiSoundcloud,
        'pandora': SiPandora,
        'itunes': SiApplemusic,
        'napster': MdLibraryMusic,
        'audiomack': MdQueueMusic,
        'anghami': MdMusicNote,
        'qobuz': MdMusicNote
      };

      return iconMap[platform] || MdMusicNote;
    };

    const getPlatformCTA = (platformName) => {
      const platform = platformName.toLowerCase();
      if (platform.includes('itunes') || platform.includes('amazon')) return 'Download';
      return 'Play';
    };

    const getPlatformSubtext = (platformName) => {
      const subtexts = {
        'Spotify': 'Music for everyone',
        'Apple Music': 'Music everywhere',
        'YouTube Music': 'Music videos & more',
        'Amazon Music': 'Prime music',
        'Deezer': 'High quality music',
        'Tidal': 'High fidelity',
        'SoundCloud': 'Music & audio',
        'YouTube': 'Watch & listen',
        'Pandora': 'Radio & podcasts',
        'iTunes': 'Download music',
        'Napster': 'Music streaming',
        'Audiomack': 'Hip-hop & more'
      };
      return subtexts[platformName] || 'Music streaming';
    };

    if (loading) {
      return (
        <div className="smartlink-clean">
          <div className="background-artwork"></div>
          <div className="main-card">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="smartlink-clean">
          <div className="background-artwork"></div>
          <div className="main-card">
            <div className="error-container">
              <h2>😕 Not Found</h2>
              <p>{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!smartLinkData?.smartLink || !smartLinkData?.artist) {
      return (
        <div className="smartlink-clean">
          <div className="background-artwork"></div>
          <div className="main-card">
            <div className="error-container">
              <h2>😕 Missing Data</h2>
              <p>Unable to load SmartLink data</p>
            </div>
          </div>
        </div>
      );
    }

    const { smartLink, artist } = smartLinkData;
    const title = `${smartLink.trackTitle} - ${artist.name}`;
    const coverImage = smartLink.coverImageUrl || null;

    return (
      <HelmetProvider>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={`Listen to ${smartLink.trackTitle} by ${artist.name} on your favorite platform.`} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={`Listen to ${smartLink.trackTitle} by ${artist.name} on your favorite platform.`} />
          <meta property="og:image" content={coverImage} />
          <meta property="og:type" content="music.song" />
        </Helmet>

        <div className="smartlink-clean">
          {/* 🎨 Background artwork avec React State (Solution A) */}
          <div
            className={`background-artwork ${backgroundLoaded ? 'loaded' : ''}`}
            style={{
              backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none'
            }}
          ></div>

          {/* 🎨 Carte centrale selon vos spécifications */}
          <div className="main-card">
            {/* Pochette de l'album avec bouton play intégré */}
            <div
              className={`album-cover-container ${!smartLinkData?.smartLink?.previewAudioUrl ?
  'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                console.log('🖱️ Container clicked!', e);
                console.log('🎵 Preview audio URL:', smartLinkData?.smartLink?.previewAudioUrl);
                if (smartLinkData?.smartLink?.previewAudioUrl) {
                  handlePlayAudio();
                }
              }}
            >
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={`${smartLink.trackTitle} - ${artist.name}`}
                  className="album-cover"
                />
              ) : (
                <div className="album-cover-placeholder">
                  <span className="placeholder-text">🎵</span>
                </div>
              )}
              {/* Afficher le bouton play seulement si on a une URL audio */}
              {smartLinkData?.smartLink?.previewAudioUrl && (
                <div
                  className="play-overlay-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🖱️ Play button clicked directly!');
                    handlePlayAudio(e);
                  }}
                >
                  <div className={`play-triangle ${isPlaying ? 'playing' : ''}`}></div>
                </div>
              )}
            </div>

            {/* Titre de l'album centré */}
            <h1 className="album-title">{smartLink.title}</h1>

            {/* Nom de l'artiste */}
            <p className="artist-name">{artist.name}</p>

            {/* Sous-titre */}
            <div className="subtitle">
              {smartLink.useDescriptionAsSubtitle && smartLink.description
                ? smartLink.description
                : smartLink.customSubtitle || "Choose music service"
              }
            </div>

            {/* Liste verticale des plateformes */}
            <div className="platform-list">
              {availablePlatforms?.filter(link => link.url && link.platform).map((platform,
  index) => {
                const IconComponent = getPlatformIcon(platform.platform);
                return (
                  <div
                    key={`${platform.platform}-${index}`}
                    className="platform-row"
                    onClick={() => handlePlatformClick(platform, platform.url)}
                  >
                    {/* Logo + Nom à gauche */}
                    <div className="platform-left">
                      <IconComponent className="platform-logo" />
                      <div className="platform-info">
                        <span className="platform-name">{platform.platform}</span>
                        <span
  className="platform-subtext">{getPlatformSubtext(platform.platform)}</span>
                      </div>
                    </div>

                    {/* Bouton à droite */}
                    <button className="platform-btn">
                      {getPlatformCTA(platform.platform)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </HelmetProvider>
    );
  };

  export default SmartLinkPageClean;
