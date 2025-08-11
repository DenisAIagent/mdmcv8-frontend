// frontend/src/components/common/MediaPreview.jsx

import React, { useState, useEffect } from 'react';
import { useMediaPlayer } from '../../hooks/useMediaPlayer';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaVolumeUp, 
  FaVolumeDown,
  FaVolumeMute,
  FaSpinner,
  FaMusic,
  FaYoutube,
  FaSpotify
} from 'react-icons/fa';
import { SiSoundcloud, SiApplemusic } from 'react-icons/si';
import './MediaPreview.css';

/**
 * 🎧 Composant de prévisualisation média
 * Affiche les contrôles et le player pour Spotify, YouTube, MP3
 */
const MediaPreview = ({ 
  platformLinks = [], 
  smartLinkData = null,
  className = '',
  autoStart = false,
  showControls = true,
  compact = false,
  preferredPlatform = 'spotify'
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const {
    currentPreview,
    isPlaying,
    isLoading,
    error,
    playerState,
    controls,
    getAvailablePreviews,
    getPreviewMetadata,
    canPreview,
    hasPreview
  } = useMediaPlayer(platformLinks, {
    autoPreview: autoStart,
    preferredPlatform,
    enableControls: showControls
  });

  const availablePreviews = getAvailablePreviews();
  const metadata = getPreviewMetadata();

  // 🎯 Sélectionner automatiquement la première prévisualisation disponible
  useEffect(() => {
    if (availablePreviews.length > 0 && !selectedPlatform) {
      const preferred = availablePreviews.find(p => 
        p.platform.toLowerCase().includes(preferredPlatform.toLowerCase())
      );
      setSelectedPlatform(preferred || availablePreviews[0]);
    }
  }, [availablePreviews, selectedPlatform, preferredPlatform]);

  // 🎨 Obtenir l'icône de la plateforme
  const getPlatformIcon = (platform) => {
    const platformLower = platform.toLowerCase();
    
    if (platformLower.includes('spotify')) return FaSpotify;
    if (platformLower.includes('youtube')) return FaYoutube;
    if (platformLower.includes('soundcloud')) return SiSoundcloud;
    if (platformLower.includes('apple')) return SiApplemusic;
    
    return FaMusic;
  };

  // 🎨 Formater le temps
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎮 Gérer le changement de plateforme
  const handlePlatformChange = async (preview) => {
    setSelectedPlatform(preview);
    await controls.switchPreview(preview.platform);
  };

  // 🔊 Gérer le changement de volume
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    controls.setVolume(volume);
  };

  // 🎨 Affichage des erreurs
  if (error) {
    return (
      <div className={`media-preview error ${className}`}>
        <div className="preview-error">
          <FaMusic className="error-icon" />
          <span>Preview unavailable</span>
        </div>
      </div>
    );
  }

  // 🎨 Pas de prévisualisation disponible
  if (!canPreview) {
    return (
      <div className={`media-preview no-preview ${className}`}>
        <div className="no-preview-message">
          <FaMusic className="no-preview-icon" />
          <span>No preview available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`media-preview ${compact ? 'compact' : ''} ${className}`}>
      {/* 🎯 Sélecteur de plateforme (si plusieurs disponibles) */}
      {availablePreviews.length > 1 && !compact && (
        <div className="platform-selector">
          <label>Preview from:</label>
          <div className="platform-options">
            {availablePreviews.map((preview, index) => {
              const IconComponent = getPlatformIcon(preview.platform);
              const isSelected = selectedPlatform?.platform === preview.platform;
              
              return (
                <button
                  key={index}
                  className={`platform-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePlatformChange(preview)}
                  disabled={isLoading}
                >
                  <IconComponent className="platform-icon" />
                  <span>{preview.platform}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎧 Container pour le player */}
      <div id="media-preview-container" className="player-container">
        {/* Le player sera injecté ici par le service */}
      </div>

      {/* 🎮 Contrôles de lecture */}
      {showControls && hasPreview && (
        <div className="player-controls">
          {/* Contrôles principaux */}
          <div className="main-controls">
            <button
              className="control-btn play-pause"
              onClick={controls.toggle}
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner className="spinner" />
              ) : isPlaying ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </button>

            <button
              className="control-btn stop"
              onClick={controls.stop}
              disabled={!hasPreview}
            >
              <FaStop />
            </button>

            {/* Informations de lecture */}
            <div className="time-info">
              <span className="current-time">
                {formatTime(playerState.currentTime)}
              </span>
              {playerState.duration > 0 && (
                <>
                  <span className="separator">/</span>
                  <span className="total-time">
                    {formatTime(playerState.duration)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          {playerState.duration > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(playerState.currentTime / playerState.duration) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Contrôles de volume */}
          <div className="volume-controls">
            <button
              className="control-btn volume-btn"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            >
              {playerState.volume === 0 ? (
                <FaVolumeMute />
              ) : playerState.volume < 0.5 ? (
                <FaVolumeDown />
              ) : (
                <FaVolumeUp />
              )}
            </button>

            {showVolumeSlider && (
              <div className="volume-slider-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={playerState.volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎨 Métadonnées de prévisualisation */}
      {metadata && !compact && (
        <div className="preview-metadata">
          <div className="preview-platform">
            <span>Playing from {metadata.platform}</span>
          </div>
          {smartLinkData && (
            <div className="track-info">
              <span className="track-title">
                {smartLinkData.smartLink?.trackTitle}
              </span>
              <span className="artist-name">
                {smartLinkData.artist?.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 🎯 Message de chargement */}
      {isLoading && (
        <div className="loading-overlay">
          <FaSpinner className="spinner" />
          <span>Loading preview...</span>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;