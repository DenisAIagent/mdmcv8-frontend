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
  CircularProgress,
  Checkbox,
  Toolbar
} from '@mui/material';
import {
  ContentCopy,
  Visibility,
  VisibilityOff,
  Analytics,
  Delete,
  Add,
  DeleteSweep
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
  // États pour la sélection multiple
  const [selectedShortLinks, setSelectedShortLinks] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, count: 0 });

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
        
        // Debug: chercher spécifiquement le SmartLink qui vient d'être mis à jour
        const updatedSmartLink = smartLinksRes.data.find(sl => sl._id === '688deca050f718914244f35e');
        if (updatedSmartLink) {
          console.log('🎯 SmartLink mis à jour trouvé:', {
            id: updatedSmartLink._id,
            title: updatedSmartLink.trackTitle,
            shortId: updatedSmartLink.shortId,
            hasShortId: !!updatedSmartLink.shortId
          });
        }
        
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

  // Fonction pour générer un code court aléatoire
  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
      
      // Auto-générer un code court si manquant
      const newShortCode = generateShortCode();
      console.log('🔧 Génération nouveau code court:', newShortCode);
      
      // Mettre à jour seulement le shortId (éviter erreur artistId)
      const updateData = {
        shortId: newShortCode
      };
      
      const response = await apiService.smartlinks.update(selectedSmartLink, updateData);
      
      if (response.success) {
        setSuccess(`ShortLink créé avec succès: ${newShortCode}`);
        setSelectedSmartLink('');
        loadData(); // Recharger pour afficher le nouveau code
      } else {
        setError('Erreur lors de la création du code court');
      }
    } catch (error) {
      console.error('Erreur création ShortLink:', error);
      setError('Erreur lors de la génération du code court - Réessayez');
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

  // Fonctions de gestion de la sélection multiple
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedShortLinks(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(shortLinks.map(link => link._id));
      setSelectedShortLinks(allIds);
      setIsAllSelected(true);
    }
  };

  const handleSelectOne = (shortLinkId) => {
    const newSelection = new Set(selectedShortLinks);
    if (newSelection.has(shortLinkId)) {
      newSelection.delete(shortLinkId);
    } else {
      newSelection.add(shortLinkId);
    }
    
    setSelectedShortLinks(newSelection);
    setIsAllSelected(newSelection.size === shortLinks.length && shortLinks.length > 0);
  };

  const clearSelection = () => {
    setSelectedShortLinks(new Set());
    setIsAllSelected(false);
  };

  const handleDeleteSelected = () => {
    setDeleteDialog({ open: true, count: selectedShortLinks.size });
  };

  const confirmDeleteSelected = async () => {
    try {
      setDeleteDialog({ open: false, count: 0 });
      
      // Trouver les SmartLinks correspondants aux ShortLinks sélectionnés
      const selectedShortLinksList = shortLinks.filter(link => selectedShortLinks.has(link._id));
      
      let successCount = 0;
      let errorCount = 0;
      
      // Supprimer en série pour éviter la surcharge
      for (const shortLink of selectedShortLinksList) {
        try {
          // Trouver le SmartLink correspondant
          const correspondingSmartLink = smartLinks.find(sl => sl.shortId === shortLink.shortCode);
          
          if (correspondingSmartLink) {
            // Supprimer le shortId du SmartLink (ou le SmartLink entier selon les besoins)
            const response = await apiService.smartlinks.update(correspondingSmartLink._id, {
              shortId: null // Supprimer le code court
            });
            
            if (response.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Erreur suppression ShortLink:', shortLink.shortCode, error);
          errorCount++;
        }
      }
      
      // Afficher le résultat
      if (successCount > 0) {
        setSuccess(`${successCount} ShortLink(s) supprimé(s) avec succès`);
      }
      if (errorCount > 0) {
        setError(`Erreur lors de la suppression de ${errorCount} ShortLink(s)`);
      }
      
      // Nettoyer la sélection et recharger
      clearSelection();
      loadData();
      
    } catch (error) {
      console.error('Erreur suppression multiple:', error);
      setError('Erreur lors de la suppression multiple');
    }
  };

  // Mettre à jour la sélection quand les données changent
  useEffect(() => {
    // Nettoyer les sélections qui n'existent plus
    const existingIds = new Set(shortLinks.map(link => link._id));
    const filteredSelection = new Set([...selectedShortLinks].filter(id => existingIds.has(id)));
    
    if (filteredSelection.size !== selectedShortLinks.size) {
      setSelectedShortLinks(filteredSelection);
      setIsAllSelected(filteredSelection.size === shortLinks.length && shortLinks.length > 0);
    }
  }, [shortLinks]);

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
            Créer/Récupérer un ShortLink
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
              {creating ? 'Génération...' : 'Créer/Récupérer ShortLink'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Liste des ShortLinks */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              ShortLinks existants ({shortLinks.length})
            </Typography>
            
            {/* Barre d'actions pour sélection multiple */}
            {selectedShortLinks.size > 0 && (
              <Toolbar
                sx={{
                  bgcolor: 'action.selected',
                  borderRadius: 1,
                  minHeight: '48px !important',
                  px: 2
                }}
              >
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {selectedShortLinks.size} élément(s) sélectionné(s)
                </Typography>
                
                <Button
                  startIcon={<DeleteSweep />}
                  color="error"
                  onClick={handleDeleteSelected}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Supprimer sélectionnés
                </Button>
                
                <Button
                  onClick={clearSelection}
                  size="small"
                  variant="outlined"
                >
                  Annuler sélection
                </Button>
              </Toolbar>
            )}
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedShortLinks.size > 0 && selectedShortLinks.size < shortLinks.length}
                      checked={isAllSelected && shortLinks.length > 0}
                      onChange={handleSelectAll}
                      disabled={shortLinks.length === 0}
                      inputProps={{
                        'aria-label': 'Sélectionner tous les ShortLinks'
                      }}
                    />
                  </TableCell>
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
                {shortLinks.map((shortLink) => {
                  const isSelected = selectedShortLinks.has(shortLink._id);
                  
                  return (
                  <TableRow 
                    key={shortLink._id}
                    selected={isSelected}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(shortLink._id)}
                        inputProps={{
                          'aria-label': `Sélectionner ShortLink ${shortLink.shortCode}`
                        }}
                      />
                    </TableCell>
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
                  );
                })}
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
      
      {/* Dialog de confirmation suppression multiple */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, count: 0 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {deleteDialog.count} ShortLink(s) sélectionné(s) ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Cette action supprimera uniquement les codes courts. Les SmartLinks associés resteront intacts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, count: 0 })}>
            Annuler
          </Button>
          <Button 
            onClick={confirmDeleteSelected}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Supprimer {deleteDialog.count} ShortLink(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShortLinkManager;