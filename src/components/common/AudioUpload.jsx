/**
 * 🎵 Composant d'upload audio pour preview SmartLink
 * Upload MP3 30 secondes max pour le bouton play
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  Pause,
  Delete,
  VolumeUp
} from '@mui/icons-material';
import API_CONFIG from '../../config/api.config';

const AudioUpload = ({ value, onChange, error, helperText }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioInfo, setAudioInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (audioInfo?.url) {
        URL.revokeObjectURL(audioInfo.url);
      }
    };
  }, [audioInfo?.url]);

  // Validation du fichier audio
  const validateAudioFile = (file) => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav'];
    const maxSize = 10 * 1024 * 1024; // 10MB max
    const maxDuration = 35; // 35 secondes max pour être sûr

    if (!validTypes.includes(file.type)) {
      throw new Error('Format non supporté. Utilisez MP3 ou WAV.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Maximum 10MB.');
    }

    return true;
  };

  // Obtenir les infos du fichier audio
  const getAudioInfo = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        const info = {
          name: file.name,
          size: file.size,
          duration: audio.duration,
          url: url
        };
        
        if (audio.duration > 35) {
          reject(new Error('L\'audio ne doit pas dépasser 30 secondes.'));
        } else {
          resolve(info);
        }
      };
      
      audio.onerror = () => {
        reject(new Error('Impossible de lire le fichier audio.'));
      };
      
      audio.src = url;
    });
  };

  // Upload vers le serveur
  const uploadToServer = async (file) => {
    const formData = new FormData();
    formData.append('audio', file);

    // Gestion de l'authentification comme dans api.service.js
    const headers = {};
    
    // Gestion de l'authentification
    const token = localStorage.getItem('token');
    const bypassAuthVar = import.meta.env.VITE_BYPASS_AUTH;
    const bypassAuth = bypassAuthVar === 'true' || bypassAuthVar === true || bypassAuthVar === '"true"';
    
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Upload Audio: Utilisation token utilisateur');
    } else if (bypassAuth) {
      headers['Authorization'] = 'Bearer dev-bypass-token';
      console.log('✅ Upload Audio: Utilisation bypass auth');
    } else {
      console.log('❌ Upload Audio: Configuration d\'authentification manquante');
      throw new Error('Configuration d\'authentification manquante. Contactez l\'administrateur.');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/upload/audio`, {
      method: 'POST',
      headers,
      body: formData
    });

    console.log('📥 Upload Audio Response Status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Impossible de parser la réponse d\'erreur:', e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Upload Audio Success:', result);
    return result.data;
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('🎵 AudioUpload: Début upload fichier:', file.name);

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Validation
      validateAudioFile(file);

      // Simulation de progression pour l'UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload réel vers le serveur
      const uploadResult = await uploadToServer(file);
      
      // Compléter la progression
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Obtenir les infos audio locales pour l'affichage
      try {
        const info = await getAudioInfo(file);
        setAudioInfo({
          ...info,
          serverUrl: uploadResult.audioUrl,
          duration: uploadResult.duration || info.duration,
          format: uploadResult.format
        });
      } catch (audioError) {
        console.log('⚠️ Impossible de lire localement, utilisation URL serveur uniquement');
        // Fallback : utiliser directement l'URL du serveur
        setAudioInfo({
          name: file.name,
          size: file.size,
          duration: uploadResult.duration || 30,
          url: uploadResult.audioUrl, // Utiliser directement l'URL serveur
          serverUrl: uploadResult.audioUrl,
          format: uploadResult.format
        });
      }

      // Passer l'URL du serveur au parent
      onChange(uploadResult.audioUrl);
      
    } catch (error) {
      console.error('❌ Erreur upload audio complète:', error);
      console.error('❌ Stack trace:', error.stack);
      // Afficher l'erreur à l'utilisateur
      setUploadError(error.message);
      setAudioInfo(null);
      onChange(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Lecture/pause de l'audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioInfo) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Supprimer l'audio
  const handleRemove = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (audioInfo?.url) {
      URL.revokeObjectURL(audioInfo.url);
    }
    
    setAudioInfo(null);
    onChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format de la durée
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        🎵 Extrait Audio (Preview)
      </Typography>
      
      
      {/* Zone d'upload */}
      {!audioInfo && !isUploading && (
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ 
              py: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': {
                borderStyle: 'dashed',
                borderWidth: 2,
              }
            }}
          >
            <Box textAlign="center">
              <Typography variant="body1">
                Cliquez pour ajouter un extrait audio
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MP3 ou WAV • Max 30 secondes • Max 10MB
              </Typography>
            </Box>
          </Button>
        </Box>
      )}

      {/* Progression d'upload */}
      {isUploading && (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" gutterBottom>
            Upload en cours...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Lecteur audio */}
      {audioInfo && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={togglePlayback}
                color="primary"
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  {audioInfo.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(audioInfo.duration)} • {(audioInfo.size / 1024 / 1024).toFixed(1)} MB
                </Typography>
              </Box>
              
              <IconButton onClick={handleRemove} color="error">
                <Delete />
              </IconButton>
            </Box>
            
            {/* Élément audio caché */}
            <audio
              ref={audioRef}
              src={audioInfo.serverUrl || audioInfo.url}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
              crossOrigin="anonymous"
            />
          </CardContent>
        </Card>
      )}

      {/* Message d'aide */}
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Erreur */}
      {(error || uploadError) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError || error}
        </Alert>
      )}
    </Box>
  );
};

export default AudioUpload;