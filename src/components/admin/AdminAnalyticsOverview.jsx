import React, { useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Card } from '@mui/material';
import GoogleAnalyticsAuth from './GoogleAnalyticsAuth';
import GoogleAnalyticsStats from './GoogleAnalyticsStats';

const PLATFORMS = [
  { value: 'googleAnalytics', label: 'Google Analytics' },
  { value: 'meta', label: 'Meta (Facebook Pixel)' },
  { value: 'tiktok', label: 'TikTok Pixel' },
  { value: 'gtm', label: 'Google Tag Manager' },
];

// Exemple de données artistes (à remplacer par vos données réelles ou props)
const ARTISTS = [
  {
    _id: 'artiste1',
    name: 'Artiste 1',
    integrations: {
      googleAnalytics: '123456789',
      meta: 'META-PIXEL-1',
      tiktok: 'TIKTOK-PIXEL-1',
      gtm: 'GTM-XXXX',
    },
  },
  {
    _id: 'artiste2',
    name: 'Artiste 2',
    integrations: {
      googleAnalytics: '987654321',
      meta: 'META-PIXEL-2',
      tiktok: 'TIKTOK-PIXEL-2',
      gtm: 'GTM-YYYY',
    },
  },
];

const AdminAnalyticsOverview = () => {
  const [selectedArtist, setSelectedArtist] = useState(ARTISTS[0]._id);
  const [selectedPlatform, setSelectedPlatform] = useState('googleAnalytics');
  const [gaToken, setGaToken] = useState(null);

  const artist = ARTISTS.find((a) => a._id === selectedArtist);
  const integrationId = artist?.integrations[selectedPlatform];

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Analytics & Tracking</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Artiste</InputLabel>
          <Select
            value={selectedArtist}
            label="Artiste"
            onChange={(e) => setSelectedArtist(e.target.value)}
          >
            {ARTISTS.map((artist) => (
              <MenuItem key={artist._id} value={artist._id}>{artist.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Plateforme</InputLabel>
          <Select
            value={selectedPlatform}
            label="Plateforme"
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedPlatform === 'googleAnalytics' ? (
        <>
          <GoogleAnalyticsAuth onToken={setGaToken} />
          {gaToken && integrationId && (
            <GoogleAnalyticsStats propertyId={integrationId} accessToken={gaToken} />
          )}
        </>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">ID/Script de tracking :</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
            {integrationId || 'Aucun ID/script renseigné pour cette plateforme.'}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default AdminAnalyticsOverview;
