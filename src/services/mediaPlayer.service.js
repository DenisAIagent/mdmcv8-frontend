// frontend/src/services/mediaPlayer.service.js

/**
 * 🎧 Service d'intégration audio/vidéo
 * Gère les players Spotify, YouTube et MP3 pour la prévisualisation
 */

export class MediaPlayerService {
  constructor() {
    this.spotifyPlayerReady = false;
    this.youtubePlayerReady = false;
    this.currentPlayer = null;
    this.currentPreview = null;
    this.spotifySDK = null;
    this.youtubePlayer = null;
  }

  // 🎵 Initialiser le SDK Spotify Web Playback
  async initializeSpotifyPlayer() {
    return new Promise((resolve, reject) => {
      // Vérifier si le SDK est déjà chargé
      if (window.Spotify && this.spotifyPlayerReady) {
        resolve(true);
        return;
      }

      // Charger le SDK Spotify
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.head.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        this.spotifyPlayerReady = true;
        resolve(true);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Spotify SDK'));
      };
    });
  }

  // 🎬 Initialiser l'API YouTube
  async initializeYouTubePlayer() {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        this.youtubePlayerReady = true;
        resolve(true);
        return;
      }

      // Charger l'API YouTube
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        this.youtubePlayerReady = true;
        resolve(true);
      };

      script.onerror = () => {
        reject(new Error('Failed to load YouTube API'));
      };
    });
  }

  // 🎵 Extraire l'ID de track Spotify depuis l'URL
  extractSpotifyTrackId(url) {
    const regex = /spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]{22})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // 🎬 Extraire l'ID vidéo YouTube depuis l'URL
  extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // 🎵 Récupérer les métadonnées de track Spotify
  async getSpotifyTrackPreview(trackId) {
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_SPOTIFY_CLIENT_ID}`
        }
      });

      if (response.ok) {
        const track = await response.json();
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name,
          preview_url: track.preview_url,
          duration: track.duration_ms,
          image: track.album.images[0]?.url
        };
      }
    } catch (error) {
      console.warn('Spotify API not available, using fallback');
    }
    return null;
  }

  // 🎬 Récupérer les métadonnées vidéo YouTube
  async getYouTubeVideoInfo(videoId) {
    try {
      // Utiliser l'API YouTube Data (nécessite clé API)
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      if (!apiKey) return null;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
      );

      if (response.ok) {
        const data = await response.json();
        const video = data.items[0];
        
        if (video) {
          return {
            id: video.id,
            title: video.snippet.title,
            channel: video.snippet.channelTitle,
            thumbnail: video.snippet.thumbnails.medium?.url,
            duration: video.contentDetails.duration
          };
        }
      }
    } catch (error) {
      console.warn('YouTube API not available');
    }
    return null;
  }

  // 🎵 Créer un player audio HTML5 pour prévisualisation
  createAudioPreview(previewUrl, metadata = {}) {
    // Nettoyer le player précédent
    this.stopCurrentPreview();

    const audioElement = document.createElement('audio');
    audioElement.src = previewUrl;
    audioElement.controls = true;
    audioElement.preload = 'metadata';
    audioElement.volume = 0.7;

    // Ajouter les métadonnées
    if (metadata.title) {
      audioElement.title = metadata.title;
    }

    this.currentPlayer = audioElement;
    this.currentPreview = {
      type: 'audio',
      url: previewUrl,
      metadata
    };

    return audioElement;
  }

  // 🎬 Créer un player YouTube embarqué
  createYouTubePreview(videoId, containerId) {
    if (!this.youtubePlayerReady) {
      console.warn('YouTube player not ready');
      return null;
    }

    // Nettoyer le player précédent
    this.stopCurrentPreview();

    const player = new window.YT.Player(containerId, {
      height: '200',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        start: 30 // Commencer à 30 secondes
      },
      events: {
        onReady: (event) => {
          console.log('YouTube player ready');
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            console.log('YouTube preview playing');
          }
        }
      }
    });

    this.youtubePlayer = player;
    this.currentPlayer = player;
    this.currentPreview = {
      type: 'youtube',
      videoId,
      player
    };

    return player;
  }

  // 🎵 Créer un player Spotify Web Playback (nécessite Premium)
  async createSpotifyPreview(trackId, containerId) {
    if (!this.spotifyPlayerReady) {
      await this.initializeSpotifyPlayer();
    }

    // Note: Le Web Playback SDK nécessite Spotify Premium
    // Pour l'instant, on utilise l'URL de prévisualisation
    const trackInfo = await this.getSpotifyTrackPreview(trackId);
    
    if (trackInfo?.preview_url) {
      return this.createAudioPreview(trackInfo.preview_url, {
        title: `${trackInfo.name} - ${trackInfo.artist}`,
        platform: 'Spotify',
        duration: trackInfo.duration
      });
    }

    return null;
  }

  // 🎧 Détecter et créer le player approprié selon l'URL
  async createPreviewPlayer(url, containerId = 'media-preview-container') {
    console.log('🎧 Creating preview player for:', url);

    // Détection Spotify
    const spotifyTrackId = this.extractSpotifyTrackId(url);
    if (spotifyTrackId) {
      return await this.createSpotifyPreview(spotifyTrackId, containerId);
    }

    // Détection YouTube
    const youtubeVideoId = this.extractYouTubeVideoId(url);
    if (youtubeVideoId) {
      if (!this.youtubePlayerReady) {
        await this.initializeYouTubePlayer();
      }
      return this.createYouTubePreview(youtubeVideoId, containerId);
    }

    // Détection MP3/Audio direct
    if (url.match(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i)) {
      return this.createAudioPreview(url, {
        title: 'Audio Preview',
        platform: 'Direct'
      });
    }

    console.warn('🎧 No preview available for URL:', url);
    return null;
  }

  // ⏹️ Arrêter la lecture en cours
  stopCurrentPreview() {
    if (this.currentPlayer) {
      if (this.currentPreview?.type === 'audio') {
        this.currentPlayer.pause();
        this.currentPlayer.currentTime = 0;
      } else if (this.currentPreview?.type === 'youtube') {
        this.currentPlayer.stopVideo();
      }
    }

    this.currentPlayer = null;
    this.currentPreview = null;
  }

  // ▶️ Jouer la prévisualisation
  playPreview() {
    if (this.currentPlayer) {
      if (this.currentPreview?.type === 'audio') {
        this.currentPlayer.play();
      } else if (this.currentPreview?.type === 'youtube') {
        this.currentPlayer.playVideo();
      }
    }
  }

  // ⏸️ Mettre en pause
  pausePreview() {
    if (this.currentPlayer) {
      if (this.currentPreview?.type === 'audio') {
        this.currentPlayer.pause();
      } else if (this.currentPreview?.type === 'youtube') {
        this.currentPlayer.pauseVideo();
      }
    }
  }

  // 🔊 Contrôler le volume
  setVolume(volume) {
    if (this.currentPlayer) {
      if (this.currentPreview?.type === 'audio') {
        this.currentPlayer.volume = Math.max(0, Math.min(1, volume));
      } else if (this.currentPreview?.type === 'youtube') {
        this.currentPlayer.setVolume(Math.max(0, Math.min(100, volume * 100)));
      }
    }
  }

  // 📊 Obtenir l'état actuel du player
  getPlayerState() {
    if (!this.currentPlayer || !this.currentPreview) {
      return { isPlaying: false, currentTime: 0, duration: 0 };
    }

    if (this.currentPreview.type === 'audio') {
      return {
        isPlaying: !this.currentPlayer.paused,
        currentTime: this.currentPlayer.currentTime,
        duration: this.currentPlayer.duration,
        volume: this.currentPlayer.volume
      };
    } else if (this.currentPreview.type === 'youtube') {
      return {
        isPlaying: this.currentPlayer.getPlayerState() === window.YT.PlayerState.PLAYING,
        currentTime: this.currentPlayer.getCurrentTime(),
        duration: this.currentPlayer.getDuration(),
        volume: this.currentPlayer.getVolume() / 100
      };
    }

    return { isPlaying: false, currentTime: 0, duration: 0 };
  }

  // 🧹 Nettoyer les ressources
  cleanup() {
    this.stopCurrentPreview();
    
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy();
      this.youtubePlayer = null;
    }
  }
}

// Instance singleton
export const mediaPlayerService = new MediaPlayerService();
export default mediaPlayerService;