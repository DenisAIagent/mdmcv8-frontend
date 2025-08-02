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

      // Utiliser SmartLinks comme ShortLinks (ils ont déjà des shortId)
      if (smartLinksRes.success && smartLinksRes.data) {
        // Debug: voir la structure des SmartLinks
        console.log('🔍 Structure SmartLink exemple:', smartLinksRes.data[0]);
        
        const smartLinksWithShortCodes = smartLinksRes.data
          .filter(smartlink => smartlink.shortId) // Seulement ceux avec shortId
          
        console.log('📊 SmartLinks disponibles:', smartLinksRes.data.length);
        console.log('📊 SmartLinks avec shortId:', smartLinksWithShortCodes.length);
        console.log('📊 SmartLinks sans shortId:', smartLinksRes.data.length - smartLinksWithShortCodes.length);
        
        const finalMappedLinks = smartLinksWithShortCodes
          .map(smartlink => {
            // Gérer les deux formats de SmartLinks
            const trackTitle = smartlink.trackTitle || smartlink.title || 'Titre inconnu';
            const artistName = smartlink.artistId?.name || smartlink.artist || 'Artiste inconnu';
            const totalClicks = smartlink.totalClicks || smartlink.totalViews || smartlink.platformClickCount || 0;
            
            console.log('🔍 Mapping SmartLink:', {
              id: smartlink._id,
              trackTitle,
              artistName,
              shortId: smartlink.shortId,
              totalClicks,
              isPublished: smartlink.isPublished
            });
            
            return {
              _id: smartlink._id,
              shortCode: smartlink.shortId,
              smartLinkId: {
                trackTitle,
                artistId: { name: artistName }
              },
              // Données directement accessibles pour l'affichage
              trackTitle,
              artistName,
              clickCount: totalClicks,
              isActive: smartlink.isPublished || smartlink.status === 'published',
              createdAt: smartlink.createdAt,
              lastAccessedAt: smartlink.lastViewedAt || smartlink.updatedAt
            };
          });
        
        console.log('✅ ShortLinks convertis depuis SmartLinks:', finalMappedLinks.length);
        console.log('🔍 Exemple ShortLink converti:', finalMappedLinks[0]);
        setShortLinks(finalMappedLinks);
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

    // Vérifier si le SmartLink sélectionné a déjà un shortId
    const selectedSmart = smartLinks.find(sl => sl._id === selectedSmartLink);
    if (selectedSmart?.shortId) {
      setSuccess(`ShortLink existant trouvé: ${selectedSmart.shortId}`);
      setSelectedSmartLink('');
      loadData();
      return;
    }

    try {
      setCreating(true);
      // Essayer de créer via l'endpoint SmartLinks
      const response = await apiService.smartlinks.getById(selectedSmartLink);
      
      if (response.success && response.data?.shortId) {
        setSuccess(`ShortLink récupéré: ${response.data.shortId}`);
        setSelectedSmartLink('');
        loadData();
      } else {
        setError('Ce SmartLink n\'a pas de code court associé');
      }
    } catch (error) {
      console.error('Erreur récupération ShortLink:', error);
      setError('Impossible de récupérer le code court - SmartLink peut-être incomplet');
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
      // Trouver le SmartLink correspondant
      const correspondingSmartLink = smartLinks.find(sl => sl.shortId === shortCode);
      if (!correspondingSmartLink) {
        setError('SmartLink correspondant introuvable');
        return;
      }

      // Utiliser l'API SmartLinks pour toggle
      const updatedData = { isPublished: !isActive };
      const response = await apiService.smartlinks.update(correspondingSmartLink._id, updatedData);
      
      if (response.success) {
        setSuccess(`SmartLink ${shortCode} ${!isActive ? 'activé' : 'désactivé'}`);
        loadData();
      }
    } catch (error) {
      console.error('Erreur toggle SmartLink:', error);
      setError('Erreur lors de la modification du SmartLink');
    }
  };

  const viewStats = async (shortCode) => {
    try {
      // Trouver le SmartLink correspondant
      const correspondingSmartLink = smartLinks.find(sl => sl.shortId === shortCode);
      if (!correspondingSmartLink) {
        setError('SmartLink correspondant introuvable');
        return;
      }

      // Utiliser les stats du SmartLink directement
      const statsData = {
        shortCode: shortCode,
        smartLink: {
          artist: correspondingSmartLink.artistId?.name || 'Inconnu',
          title: correspondingSmartLink.trackTitle || 'Titre inconnu'
        },
        totalClicks: correspondingSmartLink.totalClicks || correspondingSmartLink.platformClickCount || 0,
        accessStats: {
          uniqueVisitors: correspondingSmartLink.viewCount || 0,
          topCountries: {} // À implémenter si nécessaire
        },
        lastAccessedAt: correspondingSmartLink.lastViewedAt || correspondingSmartLink.updatedAt
      };

      setStatsDialog({ open: true, data: statsData });
    } catch (error) {
      console.error('Erreur stats:', error);
      setError('Erreur lors du chargement des statistiques');
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
                  {smartLink.shortId ? ` (${smartLink.shortId})` : ' (pas de code)'}
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
                      {shortLink.trackTitle || shortLink.smartLinkId?.trackTitle || 'N/A'}
                    </TableCell>
                    
                    <TableCell>
                      {shortLink.artistName || shortLink.smartLinkId?.artistId?.name || 'N/A'}
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