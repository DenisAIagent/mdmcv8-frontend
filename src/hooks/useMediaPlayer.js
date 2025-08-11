// frontend/src/hooks/useMediaPlayer.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaPlayerService } from '../services/mediaPlayer.service';

/**
 * 🎧 Hook pour gérer l'intégration audio/vidéo
 * Prévisualisation Spotify, YouTube, MP3 avec contrôles
 */
export const useMediaPlayer = (platformLinks = [], options = {}) => {
  const {
    autoPreview = false,
    preferredPlatform = 'spotify',
    enableControls = true,
    containerId = 'media-preview-container'
  } = options;

  const [currentPreview, setCurrentPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerState, setPlayerState] = useState({
    currentTime: 0,
    duration: 0,
    volume: 0.7
  });

  const intervalRef = useRef(null);

  // 🎯 Trouver la meilleure URL pour la prévisualisation
  const findBestPreviewURL = useCallback(() => {
    if (!platformLinks || platformLinks.length === 0) return null;

    // Ordre de priorité pour la prévisualisation
    const priorityOrder = [
      preferredPlatform.toLowerCase(),
      'spotify',
      'youtube',
      'youtubemusic',
      'soundcloud',
      'audiomack'
    ];

    for (const platform of priorityOrder) {
      const link = platformLinks.find(p => 
        p.platform && p.platform.toLowerCase().includes(platform) && p.url
      );
      if (link) {
        console.log('🎧 Preview URL found:', platform, link.url);
        return { url: link.url, platform: link.platform };
      }
    }

    // Fallback vers le premier lien disponible
    const firstLink = platformLinks.find(p => p.url);
    if (firstLink) {
      console.log('🎧 Fallback preview URL:', firstLink.platform, firstLink.url);
      return { url: firstLink.url, platform: firstLink.platform };
    }

    return null;
  }, [platformLinks, preferredPlatform]);

  // 📊 Mettre à jour l'état du player
  const updatePlayerState = useCallback(() => {
    const state = mediaPlayerService.getPlayerState();
    setPlayerState(prevState => ({
      ...prevState,
      ...state
    }));
    setIsPlaying(state.isPlaying);
  }, []);

  // 🎧 Créer la prévisualisation
  const createPreview = useCallback(async (url, platform) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎧 Creating preview for:', platform, url);
      
      const player = await mediaPlayerService.createPreviewPlayer(url, containerId);
      
      if (player) {
        setCurrentPreview({ url, platform, player });
        
        // Configurer les listeners pour audio HTML5
        if (player instanceof HTMLAudioElement) {
          player.addEventListener('loadedmetadata', updatePlayerState);
          player.addEventListener('timeupdate', updatePlayerState);
          player.addEventListener('play', () => setIsPlaying(true));
          player.addEventListener('pause', () => setIsPlaying(false));
          player.addEventListener('ended', () => setIsPlaying(false));
          player.addEventListener('error', (e) => {
            console.error('Audio playback error:', e);
            setError('Playback error');
          });
        }
        
        return player;
      } else {
        throw new Error('No preview available for this platform');
      }
    } catch (err) {
      console.error('🎧 Preview creation failed:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [containerId, updatePlayerState]);

  // 🚀 Initialiser la prévisualisation automatique
  useEffect(() => {
    if (autoPreview && platformLinks.length > 0) {
      const bestPreview = findBestPreviewURL();
      if (bestPreview) {
        createPreview(bestPreview.url, bestPreview.platform);
      }
    }
  }, [autoPreview, platformLinks, findBestPreviewURL, createPreview]);

  // ⏱️ Intervalle pour mettre à jour l'état
  useEffect(() => {
    if (currentPreview && isPlaying) {
      intervalRef.current = setInterval(updatePlayerState, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentPreview, isPlaying, updatePlayerState]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      mediaPlayerService.cleanup();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 🎮 Contrôles du player
  const controls = {
    // ▶️ Jouer
    play: useCallback(() => {
      if (currentPreview) {
        mediaPlayerService.playPreview();
        setIsPlaying(true);
      }
    }, [currentPreview]),

    // ⏸️ Pause
    pause: useCallback(() => {
      if (currentPreview) {
        mediaPlayerService.pausePreview();
        setIsPlaying(false);
      }
    }, [currentPreview]),

    // ⏹️ Stop
    stop: useCallback(() => {
      mediaPlayerService.stopCurrentPreview();
      setIsPlaying(false);
      setCurrentPreview(null);
    }, []),

    // 🔊 Volume
    setVolume: useCallback((volume) => {
      mediaPlayerService.setVolume(volume);
      setPlayerState(prev => ({ ...prev, volume }));
    }, []),

    // 🎯 Basculer play/pause
    toggle: useCallback(() => {
      if (isPlaying) {
        controls.pause();
      } else {
        controls.play();
      }
    }, [isPlaying]),

    // 🎧 Changer de prévisualisation
    switchPreview: useCallback(async (platform) => {
      const link = platformLinks.find(p => 
        p.platform && p.platform.toLowerCase() === platform.toLowerCase()
      );
      
      if (link) {
        mediaPlayerService.stopCurrentPreview();
        await createPreview(link.url, link.platform);
      }
    }, [platformLinks, createPreview])
  };

  // 🎯 Obtenir les plateformes disponibles pour prévisualisation
  const getAvailablePreviews = useCallback(() => {
    return platformLinks
      .filter(link => {
        if (!link.url) return false;
        
        // Vérifier si la plateforme supporte la prévisualisation
        const platform = link.platform.toLowerCase();
        return platform.includes('spotify') || 
               platform.includes('youtube') || 
               platform.includes('soundcloud') ||
               platform.includes('audiomack') ||
               link.url.match(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i);
      })
      .map(link => ({
        platform: link.platform,
        url: link.url,
        supportsPreview: true
      }));
  }, [platformLinks]);

  // 🎨 Obtenir les métadonnées de prévisualisation
  const getPreviewMetadata = useCallback(() => {
    if (!currentPreview) return null;

    return {
      platform: currentPreview.platform,
      url: currentPreview.url,
      isPlaying,
      currentTime: playerState.currentTime,
      duration: playerState.duration,
      volume: playerState.volume,
      progress: playerState.duration > 0 ? 
        (playerState.currentTime / playerState.duration) * 100 : 0
    };
  }, [currentPreview, isPlaying, playerState]);

  return {
    // État
    currentPreview,
    isPlaying,
    isLoading,
    error,
    playerState,
    
    // Méthodes
    createPreview,
    controls,
    getAvailablePreviews,
    getPreviewMetadata,
    findBestPreviewURL,
    
    // Helpers
    hasPreview: !!currentPreview,
    canPreview: getAvailablePreviews().length > 0,
    availablePreviews: getAvailablePreviews()
  };
};

/**
 * 🎵 Hook simplifié pour une prévisualisation rapide
 */
export const useQuickPreview = (url, platform = 'auto') => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createQuickPreview = useCallback(async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const quickPlayer = await mediaPlayerService.createPreviewPlayer(url);
      setPlayer(quickPlayer);
      
      return quickPlayer;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    createQuickPreview();
    
    return () => {
      mediaPlayerService.stopCurrentPreview();
    };
  }, [createQuickPreview]);

  return {
    player,
    isLoading,
    error,
    createQuickPreview
  };
};

export default useMediaPlayer;