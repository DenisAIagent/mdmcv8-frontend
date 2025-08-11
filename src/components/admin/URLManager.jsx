/**
 * 🔗 Gestionnaire d'URLs et Analytics
 * Interface admin pour gérer les URLs propres, UTM params et analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tab,
  Tabs,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Analytics as AnalyticsIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { useURLGeneration, useQRCode } from '../../hooks/useURLGeneration';

// Exemple de données SmartLink pour la démo
const exampleSmartLink = {
  smartLink: {
    _id: '123456789',
    trackTitle: 'Example Track',
    slug: 'example-track',
    coverImageUrl: 'https://via.placeholder.com/300x300'
  },
  artist: {
    _id: '987654321',
    name: 'Example Artist',
    slug: 'example-artist'
  }
};

const URLManager = ({ smartLinkData = exampleSmartLink }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [customUTMParams, setCustomUTMParams] = useState({
    source: '',
    medium: 'smartlink',
    campaign: '',
    term: '',
    content: ''
  });
  const [selectedFormat, setSelectedFormat] = useState('artist');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');

  // Hook pour génération d'URLs
  const {
    urls,
    socialMetadata,
    generateCustomURL,
    trackClick
  } = useURLGeneration(smartLinkData, {
    format: selectedFormat,
    enableMultiChannel: true
  });

  // Hook pour QR code
  const {
    qrCodeUrl,
    generateQRCode,
    downloadQRCode
  } = useQRCode(urls.main?.url);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCopyToClipboard = async (url, label = '') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
      
      // Tracking
      trackClick(url, { action: 'copy', source: 'admin' });
    } catch (error) {
      console.error('Erreur copie clipboard:', error);
    }
  };

  const generateCustomURLWithParams = () => {
    return generateCustomURL({
      format: selectedFormat,
      utm: customUTMParams
    });
  };

  const formatURLs = [
    { value: 'artist', label: 'Artiste/Track (/smartlinks/artist/track)' },
    { value: 'clean', label: 'URL courte (/s/track)' },
    { value: 'short', label: 'Ultra-courte (/abc123)' },
    { value: 'branded', label: 'Avec marque (/mdmc/abc123)' }
  ];

  const socialChannels = [
    { key: 'facebook', name: 'Facebook', color: '#1877F2' },
    { key: 'instagram', name: 'Instagram', color: '#E4405F' },
    { key: 'twitter', name: 'Twitter', color: '#1DA1F2' },
    { key: 'tiktok', name: 'TikTok', color: '#000000' },
    { key: 'email', name: 'Email', color: '#34495E' },
    { key: 'qr', name: 'QR Code', color: '#95A5A6' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon />
        Gestionnaire d'URLs et Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration des URLs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuration des URLs
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format d'URL</InputLabel>
              <Select
                value={selectedFormat}
                label="Format d'URL"
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                {formatURLs.map(format => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Paramètres UTM personnalisés
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="UTM Source"
                  value={customUTMParams.source}
                  onChange={(e) => setCustomUTMParams(prev => ({ ...prev, source: e.target.value }))}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="UTM Medium"
                  value={customUTMParams.medium}
                  onChange={(e) => setCustomUTMParams(prev => ({ ...prev, medium: e.target.value }))}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="UTM Campaign"
                  value={customUTMParams.campaign}
                  onChange={(e) => setCustomUTMParams(prev => ({ ...prev, campaign: e.target.value }))}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* URLs générées */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              URLs générées
            </Typography>

            {urls.main && (
              <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    URL principale
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                    {urls.main.url}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyToClipboard(urls.main.url, 'principale')}
                      sx={{ color: 'inherit' }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setQrDialogOpen(true)}
                      sx={{ color: 'inherit' }}
                    >
                      <QrCodeIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {copiedUrl === urls.main.url && (
                    <Chip label="Copié !" color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            )}

            {urls.main?.shortUrl && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    URL courte
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                    {urls.main.shortUrl}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyToClipboard(urls.main.shortUrl, 'courte')}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                  {copiedUrl === urls.main.shortUrl && (
                    <Chip label="Copié !" color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        {/* Onglets pour différentes vues */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="URLs Multi-Canaux" />
              <Tab label="Métadonnées Sociales" />
              <Tab label="Analytics" />
            </Tabs>

            {/* URLs Multi-Canaux */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  URLs optimisées par canal
                </Typography>
                
                <List>
                  {socialChannels.map(channel => {
                    const channelUrl = urls.channels?.[channel.key]?.url;
                    if (!channelUrl) return null;
                    
                    return (
                      <React.Fragment key={channel.key}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={channel.name} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: channel.color, 
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }} 
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {channelUrl}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              onClick={() => handleCopyToClipboard(channelUrl, channel.name)}
                              size="small"
                            >
                              <CopyIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* Métadonnées Sociales */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Métadonnées pour le partage social
                </Typography>
                
                {socialMetadata && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Open Graph (Facebook, LinkedIn)
                          </Typography>
                          <Typography variant="body2"><strong>Titre:</strong> {socialMetadata.og.title}</Typography>
                          <Typography variant="body2"><strong>Description:</strong> {socialMetadata.og.description}</Typography>
                          <Typography variant="body2"><strong>Image:</strong> {socialMetadata.og.image}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Twitter Cards
                          </Typography>
                          <Typography variant="body2"><strong>Titre:</strong> {socialMetadata.twitter.title}</Typography>
                          <Typography variant="body2"><strong>Description:</strong> {socialMetadata.twitter.description}</Typography>
                          <Typography variant="body2"><strong>Type:</strong> {socialMetadata.twitter.card}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}

            {/* Analytics */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analytics et Tracking
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Les analytics détaillées sont disponibles dans le tableau de bord principal.
                  Ici vous pouvez voir les informations de base sur les URLs générées.
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {Object.keys(urls.channels || {}).length}
                        </Typography>
                        <Typography variant="body2">
                          URLs générées
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          Active
                        </Typography>
                        <Typography variant="body2">
                          Tracking UTM
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          Ready
                        </Typography>
                        <Typography variant="body2">
                          QR Code
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog QR Code */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrCodeUrl && (
            <Box>
              <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
              <Typography variant="body2" sx={{ mt: 2, wordBreak: 'break-all' }}>
                {urls.main?.url}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => downloadQRCode('smartlink-qr')}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default URLManager;