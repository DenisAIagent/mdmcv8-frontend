// frontend/src/components/admin/MediaPlayerTest.jsx

import React, { useState } from 'react';
import MediaPreview from '../common/MediaPreview';
import MediaPlayerToggle from '../common/MediaPlayerToggle';
import { useMediaPlayer, useQuickPreview } from '../../hooks/useMediaPlayer';

/**
 * 🧪 Composant de test pour les fonctionnalités audio/vidéo
 * Interface de test et de démonstration
 */
const MediaPlayerTest = () => {
  const [testMode, setTestMode] = useState('toggle');
  const [testUrl, setTestUrl] = useState('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC');

  // 🎯 Données de test simulées
  const testPlatformLinks = [
    {
      platform: 'Spotify',
      url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'
    },
    {
      platform: 'YouTube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      platform: 'YouTube Music',
      url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      platform: 'SoundCloud',
      url: 'https://soundcloud.com/rick-astley-official/never-gonna-give-you-up-4'
    },
    {
      platform: 'Apple Music',
      url: 'https://music.apple.com/album/whenever-you-need-somebody/1558533900?i=1558534004'
    }
  ];

  const testSmartLinkData = {
    smartLink: {
      trackTitle: 'Never Gonna Give You Up',
      coverImageUrl: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=🎵'
    },
    artist: {
      name: 'Rick Astley'
    }
  };

  // 🎧 Hook de test pour prévisualisation rapide
  const { player: quickPlayer, isLoading: quickLoading, error: quickError } = useQuickPreview(testUrl);

  const predefinedUrls = [
    {
      name: 'Spotify Track',
      url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'
    },
    {
      name: 'YouTube Video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      name: 'MP3 Direct',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'
    },
    {
      name: 'SoundCloud',
      url: 'https://soundcloud.com/rick-astley-official/never-gonna-give-you-up-4'
    }
  ];

  return (
    <div className="media-player-test" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎧 Test des Fonctionnalités Audio/Vidéo</h1>
      
      {/* 🎯 Sélecteur de mode de test */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Mode de test:</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setTestMode('toggle')}
            style={{ 
              padding: '10px 20px', 
              background: testMode === 'toggle' ? '#007bff' : '#f8f9fa',
              color: testMode === 'toggle' ? 'white' : '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🎮 Toggle Player
          </button>
          
          <button 
            onClick={() => setTestMode('full')}
            style={{ 
              padding: '10px 20px', 
              background: testMode === 'full' ? '#007bff' : '#f8f9fa',
              color: testMode === 'full' ? 'white' : '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🎧 Full Player
          </button>
          
          <button 
            onClick={() => setTestMode('quick')}
            style={{ 
              padding: '10px 20px', 
              background: testMode === 'quick' ? '#007bff' : '#f8f9fa',
              color: testMode === 'quick' ? 'white' : '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ⚡ Quick Preview
          </button>
        </div>
      </div>

      {/* 🎯 Test Toggle Player */}
      {testMode === 'toggle' && (
        <div style={{ marginBottom: '40px' }}>
          <h3>🎮 MediaPlayerToggle Test</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #dee2e6'
          }}>
            <MediaPlayerToggle 
              platformLinks={testPlatformLinks}
              smartLinkData={testSmartLinkData}
              preferredPlatform="spotify"
              buttonText="🎧 Test Preview"
              compact={true}
            />
          </div>
        </div>
      )}

      {/* 🎯 Test Full Player */}
      {testMode === 'full' && (
        <div style={{ marginBottom: '40px' }}>
          <h3>🎧 MediaPreview Test</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #dee2e6'
          }}>
            <MediaPreview 
              platformLinks={testPlatformLinks}
              smartLinkData={testSmartLinkData}
              autoStart={false}
              showControls={true}
              compact={false}
              preferredPlatform="spotify"
            />
          </div>
        </div>
      )}

      {/* 🎯 Test Quick Preview */}
      {testMode === 'quick' && (
        <div style={{ marginBottom: '40px' }}>
          <h3>⚡ Quick Preview Test</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Test URL:
            </label>
            <input 
              type="url" 
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '6px',
                marginBottom: '10px'
              }}
              placeholder="Entrez une URL Spotify, YouTube ou MP3..."
            />
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {predefinedUrls.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setTestUrl(preset.url)}
                  style={{
                    padding: '6px 12px',
                    background: '#e9ecef',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #dee2e6'
          }}>
            {quickLoading && <p>🔄 Chargement de la prévisualisation...</p>}
            {quickError && <p style={{ color: 'red' }}>❌ Erreur: {quickError}</p>}
            {quickPlayer && (
              <div>
                <p style={{ color: 'green' }}>✅ Player créé avec succès!</p>
                <div id="quick-preview-container" style={{ marginTop: '10px' }}>
                  {/* Le player sera injecté ici */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📊 Informations de debug */}
      <div style={{ 
        background: '#e9ecef', 
        padding: '20px', 
        borderRadius: '12px',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        <h4>🔍 Debug Info</h4>
        <p><strong>Mode actuel:</strong> {testMode}</p>
        <p><strong>Plateformes de test:</strong> {testPlatformLinks.length}</p>
        <p><strong>URL de test:</strong> {testUrl}</p>
        <p><strong>APIs disponibles:</strong></p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Spotify SDK: {typeof window.Spotify !== 'undefined' ? '✅' : '❌'}</li>
          <li>YouTube API: {typeof window.YT !== 'undefined' ? '✅' : '❌'}</li>
          <li>HTML5 Audio: {typeof window.Audio !== 'undefined' ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaPlayerTest;