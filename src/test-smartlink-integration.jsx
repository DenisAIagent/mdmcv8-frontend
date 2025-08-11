// Test SmartLink Integration - Composant de test temporaire
import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Link
} from '@mui/material';
import musicPlatformService from './services/musicPlatform.service';

const TestSmartLinkIntegration = () => {
  const [sourceUrl, setSourceUrl] = useState('https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Test integration frontend avec:', sourceUrl);
      const response = await musicPlatformService.fetchLinksFromSourceUrl(sourceUrl, 'FR');
      
      if (response.success) {
        setResult(response.data);
        console.log('✅ Test réussi:', response.data);
      } else {
        setError(response.error);
        console.error('❌ Test échoué:', response.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur test:', err);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Test Intégration SmartLink + Odesli
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="URL Spotify, Apple Music, ISRC..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="https://open.spotify.com/track/..."
          />
          
          <Button 
            variant="contained" 
            onClick={handleTest}
            disabled={loading || !sourceUrl.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Test en cours...' : 'Tester l\'intégration'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Erreur</Typography>
          {error}
        </Alert>
      )}

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom color="success.main">
              ✅ Intégration réussie !
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Métadonnées détectées:</Typography>
              <Typography><strong>Titre:</strong> {result.title}</Typography>
              <Typography><strong>Artiste:</strong> {result.artist}</Typography>
              <Typography><strong>Album:</strong> {result.album}</Typography>
              <Typography><strong>ISRC:</strong> {result.isrc || 'N/A'}</Typography>
              {result.artwork && (
                <Box sx={{ mt: 1 }}>
                  <img 
                    src={result.artwork} 
                    alt="Artwork" 
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                </Box>
              )}
            </Box>

            <Typography variant="h6" gutterBottom>
              Plateformes détectées ({Object.keys(result.linksByPlatform || {}).length}):
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {Object.keys(result.linksByPlatform || {}).map((platform) => (
                <Chip 
                  key={platform} 
                  label={platform} 
                  color="primary" 
                  variant="outlined"
                />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>Liens de test:</Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {Object.entries(result.linksByPlatform || {}).map(([platform, url]) => (
                <Box key={platform} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{platform}:</strong>{' '}
                    <Link href={url} target="_blank" rel="noopener">
                      {url.substring(0, 50)}...
                    </Link>
                  </Typography>
                </Box>
              ))}
            </Box>

            {result.alternativeArtworks && result.alternativeArtworks.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Artworks alternatifs ({result.alternativeArtworks.length}):</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {result.alternativeArtworks.slice(0, 5).map((artwork, index) => (
                    <img 
                      key={index}
                      src={artwork.url} 
                      alt={`Artwork ${index + 1}`}
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default TestSmartLinkIntegration;