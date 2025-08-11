// frontend/src/components/common/MediaPlayerToggle.jsx

import React, { useState } from 'react';
import { FaPlay, FaStop, FaMusic, FaHeadphones } from 'react-icons/fa';
import MediaPreview from './MediaPreview';
import './MediaPlayerToggle.css';

/**
 * 🎧 Composant toggle pour afficher/masquer le player média
 * Version compacte avec bouton d'activation
 */
const MediaPlayerToggle = ({ 
  platformLinks = [], 
  smartLinkData = null,
  preferredPlatform = 'spotify',
  className = '',
  buttonText = 'Preview',
  compact = true
}) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [hasTriedPreview, setHasTriedPreview] = useState(false);

  // 🎯 Vérifier si des prévisualisations sont disponibles
  const hasPreviewablePlatforms = platformLinks.some(link => {
    if (!link.url) return false;
    
    const platform = link.platform.toLowerCase();
    return platform.includes('spotify') || 
           platform.includes('youtube') || 
           platform.includes('soundcloud') ||
           platform.includes('audiomack') ||
           link.url.match(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i);
  });

  const handleTogglePlayer = () => {
    if (!hasTriedPreview) {
      setHasTriedPreview(true);
    }
    setShowPlayer(!showPlayer);
  };

  // 🚫 Pas de prévisualisation disponible
  if (!hasPreviewablePlatforms) {
    return null;
  }

  return (
    <div className={`media-player-toggle ${className}`}>
      {/* 🎵 Bouton d'activation de la prévisualisation */}
      <button 
        className={`preview-toggle-btn ${showPlayer ? 'active' : ''}`}
        onClick={handleTogglePlayer}
        title={showPlayer ? 'Hide preview' : 'Show preview'}
      >
        <div className="btn-content">
          {showPlayer ? (
            <>
              <FaStop className="btn-icon" />
              <span>Hide Preview</span>
            </>
          ) : (
            <>
              <FaHeadphones className="btn-icon" />
              <span>{buttonText}</span>
            </>
          )}
        </div>
      </button>

      {/* 🎧 Player média (conditionnel) */}
      {showPlayer && (
        <div className="media-player-container">
          <MediaPreview 
            platformLinks={platformLinks}
            smartLinkData={smartLinkData}
            autoStart={false}
            showControls={true}
            compact={compact}
            preferredPlatform={preferredPlatform}
            className="toggle-preview"
          />
        </div>
      )}
    </div>
  );
};

export default MediaPlayerToggle;