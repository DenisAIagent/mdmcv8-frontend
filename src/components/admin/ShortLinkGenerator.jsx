// src/components/admin/ShortLinkGenerator.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  IconButton,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  ContentCopy, 
  Link as LinkIcon, 
  Check,
  Analytics 
} from '@mui/icons-material';
import apiService from '../../services/api.service';

const ShortLinkGenerator = ({ smartLink, onShortLinkCreated }) => {
  const [loading, setLoading] = useState(false);
  const [shortLinkData, setShortLinkData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateShortLink = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.shortlinks.create(smartLink._id);
      
      if (response.success) {
        setShortLinkData(response);
        if (onShortLinkCreated) {
          onShortLinkCreated(response);
        }
      } else {
        throw new Error(response.error || 'Erreur génération ShortLink');
      }

    } catch (err) {
      console.error('Erreur ShortLink:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const shortUrl = shortLinkData?.shortUrl;
  const shortCode = shortLinkData?.shortCode;

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LinkIcon sx={{ mr: 1, color: '#E50914' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ShortLink Generator
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Créez un lien court professionnel pour ce SmartLink : <strong>{smartLink.trackTitle}</strong>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!shortLinkData && (
        <Button
          variant="contained"
          onClick={generateShortLink}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
          sx={{
            backgroundColor: '#E50914',
            '&:hover': { backgroundColor: '#c40812' }
          }}
        >
          {loading ? 'Génération...' : 'Générer ShortLink'}
        </Button>
      )}

      {shortLinkData && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            ShortLink créé avec succès !
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* URL courte */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Lien court :
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={shortUrl}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      backgroundColor: 'white',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }
                  }}
                />
                <IconButton
                  onClick={() => copyToClipboard(shortUrl)}
                  color="primary"
                  sx={{ 
                    backgroundColor: copied ? '#4caf50' : '#E50914',
                    color: 'white',
                    '&:hover': { 
                      backgroundColor: copied ? '#45a049' : '#c40812' 
                    }
                  }}
                >
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Box>
            </Box>

            {/* Informations supplémentaires */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<LinkIcon />}
                label={`Code: ${shortCode}`} 
                variant="outlined" 
                size="small"
              />
              <Chip 
                icon={<Analytics />}
                label="Tracking conservé" 
                color="success" 
                variant="outlined"
                size="small"
              />
            </Box>

            {/* Actions supplémentaires */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => window.open(shortUrl, '_blank')}
              >
                Tester le lien
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => copyToClipboard(shortUrl)}
              >
                Copier
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Lien copié dans le presse-papiers"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default ShortLinkGenerator;