// Exemple d'emplacement: src/pages/admin/artists/ArtistListPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Adaptez ce chemin vers votre fichier api.js
import apiService from '../../../services/api';

// Import MUI Components (nécessite @mui/material et @mui/x-data-grid)
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Paper,
    IconButton
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
// Optionnel: import { toast } from 'react-toastify'; // Pour les notifications

function ArtistListPage() {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fonction pour récupérer les artistes
    const fetchArtists = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching artists from API...");
            const response = await apiService.getAllArtists(); // Appel API réel
            console.log("API response for artists:", response);
            if (response.success) {
                // DataGrid préfère un champ 'id'. On le crée à partir de '_id'.
                const artistsWithId = (response.data || []).map(artist => ({ ...artist, id: artist._id }));
                setArtists(artistsWithId);
            } else {
                setError(response.error || 'Erreur inconnue lors du chargement.');
                setArtists([]);
            }
        } catch (err) {
            console.error("Failed to fetch artists:", err);
            const errorMsg = err.response?.data?.error || err.message || 'Erreur serveur';
            setError(errorMsg);
            setArtists([]);
            if (err.response?.status === 401) {
                setError("Erreur d'authentification. Veuillez vous reconnecter.");
                // Optionnel: rediriger vers login
                // setTimeout(() => navigate('/admin/login'), 1500);
            } else if (err.response?.status === 403) {
                 setError("Erreur d'autorisation. Vous n'avez pas les droits nécessaires.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les artistes au montage du composant
    useEffect(() => {
        fetchArtists();
    }, []); // Exécute une seule fois

    // --- Gestionnaires d'actions ---
    const handleEdit = (slug) => {
        navigate(`/admin/artists/edit/${slug}`); // Navigue vers la page d'édition
    };

    const handleDelete = async (slug, name) => {
        // Confirmation utilisateur
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'artiste "${name}" ?`)) {
            try {
                setLoading(true); // Indiquer un chargement pendant la suppression
                await apiService.deleteArtist(slug); // Utilise le SLUG (vérifiez que votre API backend attend bien le slug)
                // toast.success(`Artiste "${name}" supprimé.`); // Notification Succès
                console.log(`Artiste "${name}" supprimé.`);
                 // Rafraîchir la liste après suppression
                 fetchArtists(); // Appel fetchArtists pour mettre à jour la liste
            } catch (err) {
                console.error("Failed to delete artist:", err);
                const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la suppression';
                setError(errorMsg); // Afficher l'erreur
                // toast.error(`Erreur: ${errorMsg}`); // Notification Erreur
                setLoading(false); // Assurer que loading est remis à false en cas d'erreur avant fetch
            }
            // Note: le finally de fetchArtists remettra loading à false après le rafraîchissement
        }
    };

    // --- Définition des colonnes pour le DataGrid ---
    const columns = [
         {
           field: 'artistImageUrl',
           headerName: 'Image',
           width: 80,
           renderCell: (params) => (
             params.value ? <img src={params.value} alt={params.row.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} /> : null
           ),
           sortable: false, filterable: false,
         },
        { field: 'name', headerName: 'Nom', minWidth: 200, flex: 1 }, // Utilise flex pour l'espace restant
        { field: 'slug', headerName: 'Slug', minWidth: 200, flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            cellClassName: 'actions',
            getActions: ({ row }) => { // row contient toutes les données de l'artiste
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Modifier"
                        onClick={() => handleEdit(row.slug)} // Passe le slug
                        color="primary"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Supprimer"
                        onClick={() => handleDelete(row.slug, row.name)} // Passe le slug et le nom
                        color="error"
                    />,
                ];
            },
        },
    ];

    // --- Rendu du Composant ---
    return (
        <Paper sx={{ p: 2, width: '100%', overflow: 'hidden' }}>
             {/* Affiche l'erreur en haut si elle existe */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Gestion des Artistes
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/artists/new')} // Va vers la page de création
                >
                    Nouvel Artiste
                </Button>
            </Box>

            {/* Conteneur DataGrid avec hauteur */}
            <Box sx={{ height: 'calc(75vh)', width: '100%' }}> {/* Ajustez la hauteur */}
                <DataGrid
                    rows={artists}
                    columns={columns}
                    loading={loading} // Indicateur de chargement intégré
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                         },
                         // Optionnel: tri par défaut
                         // sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
                     }}
                />
            </Box>
        </Paper>
    );
}

export default ArtistListPage;
