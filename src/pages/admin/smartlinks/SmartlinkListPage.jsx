import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Box, Container, Grid, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';

function SmartlinkListPage() {
  const navigate = useNavigate();
  const [smartlinks, setSmartlinks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null); // { type: 'single'|'multiple', id?, ids?, title? }

  const fetchSmartlinks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.smartlinks.getAll(); 
      
      const smartlinksWithId = (response.data || []).map((sl, index) => {
        try {
          return {
            // Propriétés essentielles pour DataGrid
            id: sl._id || sl.id || `temp-${Date.now()}-${index}`,
            
            // Propriétés d'affichage
            trackTitle: String(sl.trackTitle || 'Titre inconnu'),
            artistName: String(sl.artistId?.name || 'Artiste inconnu'),
            viewCount: Number(sl.viewCount || 0),
            platformClickCount: Number(sl.platformClickCount || 0),
            isPublished: Boolean(sl.isPublished || false),
            
            // Propriétés de métadonnées
            slug: String(sl.slug || ''),
            createdAt: sl.createdAt || new Date().toISOString(),
            coverImageUrl: sl.coverImageUrl || null,
            
            // Propriétés d'objet sécurisées
            artistId: sl.artistId ? {
              name: String(sl.artistId.name || 'Artiste inconnu'),
              slug: String(sl.artistId.slug || '')
            } : { name: 'Artiste inconnu', slug: '' }
          };
        } catch (error) {
          console.error('Error processing SmartLink:', error, sl);
          return {
            id: `error-${Date.now()}-${index}`,
            trackTitle: 'Erreur de données',
            artistName: 'Inconnu',
            viewCount: 0,
            platformClickCount: 0,
            isPublished: false,
            slug: '',
            createdAt: new Date().toISOString(),
            coverImageUrl: null,
            artistId: { name: 'Inconnu', slug: '' }
          };
        }
      });
      console.log('SmartLinks loaded:', smartlinksWithId);
      console.log('First SmartLink sample:', smartlinksWithId[0]);
      console.log('SmartLinks keys:', smartlinksWithId.map(sl => Object.keys(sl)));
      
      // Vérification supplémentaire pour éviter les erreurs
      const validSmartlinks = smartlinksWithId.filter(sl => sl && sl.id);
      console.log('Valid SmartLinks count:', validSmartlinks.length);
      
      setSmartlinks(validSmartlinks);
    } catch (err) {
      console.error("SmartlinkListPage - Failed to fetch SmartLinks:", err);
      
      // Gestion spécifique de l'erreur d'authentification
      if (err.message?.includes('401') || err.message?.includes('Non autorisé')) {
        const errorMsg = 'Authentification requise. Veuillez vous connecter en tant qu\'administrateur.';
        setError(errorMsg);
        toast.error(errorMsg);
        // Redirection vers login après un délai
        setTimeout(() => {
          window.location.href = '/#/admin/login';
        }, 2000);
      } else {
        const errorMsg = err.message || err.data?.error || 'Erreur serveur lors du chargement des SmartLinks.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
      setSmartlinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSmartlinks();
  }, [fetchSmartlinks]);

  const handleEditClick = (id) => {
    navigate(`/admin/smartlinks/edit/${id}`);
  };

  const handleCreateClick = () => {
    navigate('/admin/smartlinks/new');
  };

  const handleViewPublicLink = (artistSlug, trackSlug) => {
    if (!artistSlug || !trackSlug) {
      toast.error("Slugs manquants, impossible d'ouvrir le lien.");
      return;
    }
    const publicUrl = `/#/smartlinks/${artistSlug}/${trackSlug}`; 
    window.open(publicUrl, '_blank');
  };

  const handleDelete = (id, title) => {
    setDeleteTarget({ type: 'single', id, title });
    setConfirmDeleteOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning('Aucun SmartLink sélectionné');
      return;
    }
    setDeleteTarget({ type: 'multiple', ids: selectedIds });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setConfirmDeleteOpen(false);
      
      if (deleteTarget.type === 'single') {
        await apiService.smartlinks.deleteById(deleteTarget.id);
        toast.success(`SmartLink "${deleteTarget.title}" supprimé avec succès.`);
      } else {
        // Suppression multiple
        const deletePromises = deleteTarget.ids.map(id => apiService.smartlinks.deleteById(id));
        await Promise.all(deletePromises);
        toast.success(`${deleteTarget.ids.length} SmartLink(s) supprimé(s) avec succès.`);
        setSelectedIds([]); // Réinitialiser la sélection
      }
      
      fetchSmartlinks();
    } catch (err) {
      console.error("SmartlinkListPage - Failed to delete SmartLink(s):", err);
      const errorMsg = err.message || err.data?.error || 'Erreur lors de la suppression.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleAnalyticsClick = (id) => {
    navigate(`/admin/smartlinks/analytics/${id}`);
  };

  const handleTestDoubleTracking = (slug) => {
    // Ouvre le SmartLink avec le nouveau système de tracking double-moteur dans un nouvel onglet
    const testUrl = `/smartlink-test/${slug}`;
    window.open(testUrl, '_blank');
    console.log(`[ADMIN] Test de tracking lance pour SmartLink: ${slug}`);
  };
  
  const columns = React.useMemo(() => [
    {
      field: 'coverImageUrl', 
      headerName: 'Pochette', 
      width: 80,
      renderCell: (params) => params.value ? 
        (<img src={params.value} alt={params.row.trackTitle} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />) : 
        <Box sx={{width: 40, height: 40, backgroundColor: 'grey.200', borderRadius: 1}} />,
      sortable: false, 
      filterable: false,
    },
    { field: 'trackTitle', headerName: 'Titre', flex: 1, minWidth: 150 },
    { field: 'artistName', headerName: 'Artiste', flex: 0.8, minWidth: 120 },
    {
      field: 'isPublished', 
      headerName: 'Statut', 
      width: 120,
      renderCell: (params) => (
        <div style={{ 
          backgroundColor: params.value ? '#4caf50' : '#9e9e9e', 
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem'
        }}>
          {params.value ? 'Publié' : 'Brouillon'}
        </div>
      ),
    },
    { field: 'viewCount', headerName: 'Vues', type: 'number', width: 100, align: 'center', headerAlign: 'center' },
    { field: 'platformClickCount', headerName: 'Clics', type: 'number', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'createdAt', 
      headerName: 'Créé le', 
      width: 120,
      valueGetter: (params) => params.value && new Date(params.value),
      renderCell: (params) => params.value && new Date(params.value).toLocaleDateString('fr-FR'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 380,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleViewPublicLink(params.row.artistId?.slug, params.row.slug)}
            disabled={!params.row.isPublished || !params.row.artistId?.slug || !params.row.slug}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Voir
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            size="small" 
            onClick={() => handleTestDoubleTracking(params.row.slug)}
            disabled={!params.row.isPublished || !params.row.slug}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Test Tracking
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small" 
            onClick={() => handleEditClick(params.row.id)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Éditer
          </Button>
          <Button 
            variant="outlined" 
            color="info" 
            size="small" 
            onClick={() => handleAnalyticsClick(params.row.id)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Analytics
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={() => handleDelete(params.row.id, params.row.trackTitle)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Suppr.
          </Button>
        </Box>
      ),
    },
  ], []);  // Dépendances vides car les fonctions handlers sont stables

  // Protection ultime : ne rendre le DataGrid que si les colonnes sont définies
  if (!columns || columns.length === 0) {
    return <div>Configuration des colonnes en cours...</div>;
  }

  if (loading && smartlinks.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 5, minHeight: 400 }}>
        <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
        <Typography sx={{ mt: 2 }} variant="h6">Chargement des SmartLinks...</Typography>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
        <title>Gestion SmartLinks - Admin MDMC</title>
      </Helmet>
      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', overflow: 'hidden', borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      {error && !loading && (
        <div style={{ 
          backgroundColor: '#f44336', 
          color: 'white', 
          padding: '12px 16px', 
          marginBottom: '16px',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setError(null)}>×</span>
        </div>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}> 
          Gestion des SmartLinks
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              sx={{ fontWeight: 'bold' }}
            >
              Supprimer ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{ 
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
              }
            }}
          >
            Nouveau SmartLink
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ height: 600, width: '100%' }}>
        {Array.isArray(smartlinks) && smartlinks.length > 0 ? (
          <DataGrid
            rows={smartlinks}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
            }}
            density="standard"
            autoHeight={false}
            checkboxSelection
            // CORRECTION DÉFINITIVE: On retire rowSelectionModel pour éviter race condition
            // DataGrid gère son état de sélection en interne avec Set/Map
            onRowSelectionModelChange={(newSelection) => {
              console.log('Selection changed:', newSelection);
              setSelectedIds(newSelection);
            }}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary">
              {loading ? 'Chargement...' : 'Aucun SmartLink trouvé'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.type === 'single' ? (
              `Êtes-vous sûr de vouloir supprimer le SmartLink "${deleteTarget.title}" ? Cette action est irréversible.`
            ) : (
              `Êtes-vous sûr de vouloir supprimer les ${deleteTarget?.ids?.length || 0} SmartLink(s) sélectionné(s) ? Cette action est irréversible.`
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </>
  );
}

export default SmartlinkListPage;
