// src/components/admin/ShortLinkManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  ContentCopy,
  Visibility,
  VisibilityOff,
  Analytics,
  Delete,
  Add
} from '@mui/icons-material';
import apiService from '../../services/api.service';

const ShortLinkManager = () => {
  const [shortLinks, setShortLinks] = useState([]);
  const [smartLinks, setSmartLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedSmartLink, setSelectedSmartLink] = useState('');
  const [statsDialog, setStatsDialog] = useState({ open: false, data: null });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger SmartLinks et ShortLinks séparément
      let shortLinksRes = { success: false, data: [] };
      let smartLinksRes = { success: false, data: [] };

      // Charger SmartLinks (fonctionne)
      try {
        smartLinksRes = await apiService.smartlinks.getAll();
        console.log('✅ SmartLinks chargés:', smartLinksRes.data?.length || 0);
        if (smartLinksRes.success) {
          setSmartLinks(smartLinksRes.data);
        }
      } catch (smartError) {
        console.warn('❌ SmartLinks indisponibles:', smartError);
      }

      // Charger ShortLinks (peut échouer)
      try {
        shortLinksRes = await apiService.shortlinks.getAll();
        console.log('✅ ShortLinks chargés:', shortLinksRes.data?.length || 0);
        if (shortLinksRes.success) {
          setShortLinks(shortLinksRes.data);
        }
      } catch (shortError) {
        console.warn('❌ ShortLinks indisponibles (endpoint manquant):', shortError);
        setShortLinks([]); // Liste vide mais pas d'erreur
      }

      // Erreur uniquement si AUCUN des deux ne fonctionne
      if (!smartLinksRes.success && !shortLinksRes.success) {
        setError('Le nombre de données est manquant pour s\'afficher - Backend indisponible');
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Le nombre de données est manquant pour s\'afficher - Backend indisponible');
    } finally {
      setLoading(false);
    }
  };

  const createShortLink = async () => {
    if (!selectedSmartLink) {
      setError('Veuillez sélectionner un SmartLink');
      return;
    }

    try {
      setCreating(true);
      const response = await apiService.shortlinks.create(selectedSmartLink);
      
      if (response.success) {
        setSuccess(`ShortLink créé: ${response.data.shortCode}`);
        setSelectedSmartLink('');
        loadData(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur création ShortLink:', error);
      setError('Endpoint ShortLinks manquant côté backend - Contactez le développeur');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (shortCode) => {
    const shortUrl = `${window.location.origin}/s/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    setSuccess(`URL copiée: ${shortUrl}`);
  };

  const toggleShortLink = async (shortCode, isActive) => {
    try {
      if (isActive) {
        await apiService.shortlinks.deactivate(shortCode);
        setSuccess(`ShortLink ${shortCode} désactivé`);
      } else {
        await apiService.shortlinks.activate(shortCode);
        setSuccess(`ShortLink ${shortCode} activé`);
      }
      loadData();
    } catch (error) {
      console.error('Erreur toggle ShortLink:', error);
      setError('Le nombre de données est manquant pour s\'afficher - Backend indisponible');
    }
  };

  const viewStats = async (shortCode) => {
    try {
      const response = await apiService.shortlinks.getStats(shortCode);
      if (response.success) {
        setStatsDialog({ open: true, data: response.data });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
      setError('Le nombre de données est manquant pour s\'afficher - Backend indisponible');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Création ShortLink */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Créer un nouveau ShortLink
          </Typography>
          
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              select
              label="SmartLink"
              value={selectedSmartLink}
              onChange={(e) => setSelectedSmartLink(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 300 }}
            >
              <option value="">-- Sélectionner un SmartLink --</option>
              {smartLinks.map((smartLink) => (
                <option key={smartLink._id} value={smartLink._id}>
                  {smartLink.artistId?.name} - {smartLink.trackTitle}
                </option>
              ))}
            </TextField>
            
            <Button
              variant="contained"
              startIcon={creating ? <CircularProgress size={20} /> : <Add />}
              onClick={createShortLink}
              disabled={creating || !selectedSmartLink}
            >
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Liste des ShortLinks */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ShortLinks existants ({shortLinks.length})
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code Court</TableCell>
                  <TableCell>SmartLink</TableCell>
                  <TableCell>Artiste</TableCell>
                  <TableCell>Clics</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Créé</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortLinks.map((shortLink) => (
                  <TableRow key={shortLink._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="monospace" fontWeight="bold">
                          {shortLink.shortCode}
                        </Typography>
                        <Tooltip title="Copier l'URL">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(shortLink.shortCode)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      {shortLink.smartLinkId?.trackTitle || 'N/A'}
                    </TableCell>
                    
                    <TableCell>
                      {shortLink.smartLinkId?.artistId?.name || 'N/A'}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {shortLink.clickCount || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={shortLink.isActive ? 'Actif' : 'Inactif'}
                        color={shortLink.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      {new Date(shortLink.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Statistiques">
                          <IconButton
                            size="small"
                            onClick={() => viewStats(shortLink.shortCode)}
                          >
                            <Analytics fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={shortLink.isActive ? 'Désactiver' : 'Activer'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleShortLink(shortLink.shortCode, shortLink.isActive)}
                          >
                            {shortLink.isActive ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog Statistiques */}
      <Dialog
        open={statsDialog.open}
        onClose={() => setStatsDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Statistiques ShortLink: {statsDialog.data?.shortCode}
        </DialogTitle>
        <DialogContent>
          {statsDialog.data && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {statsDialog.data.smartLink.artist} - {statsDialog.data.smartLink.title}
              </Typography>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mt={2}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Clics
                    </Typography>
                    <Typography variant="h4">
                      {statsDialog.data.totalClicks}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Visiteurs Uniques
                    </Typography>
                    <Typography variant="h4">
                      {statsDialog.data.accessStats.uniqueVisitors}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Dernier Accès
                    </Typography>
                    <Typography variant="body1">
                      {statsDialog.data.lastAccessedAt 
                        ? new Date(statsDialog.data.lastAccessedAt).toLocaleString('fr-FR')
                        : 'Jamais'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              {/* Top Pays */}
              {Object.keys(statsDialog.data.accessStats.topCountries).length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Top Pays
                  </Typography>
                  {Object.entries(statsDialog.data.accessStats.topCountries)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <Box key={country} display="flex" justifyContent="space-between" py={0.5}>
                        <Typography>{country}</Typography>
                        <Typography fontWeight="bold">{count}</Typography>
                      </Box>
                    ))
                  }
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialog({ open: false, data: null })}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShortLinkManager;