// src/pages/admin/artists/ArtistListPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import corrigé avec alias
import apiService from '../../../services/api.service';

// Import MUI Components
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Paper
    // IconButton // Décommentez si vous en avez besoin ailleurs
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
// Optionnel: Importer une lib de notifications comme react-toastify
// import { toast } from 'react-toastify';

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
            const response = await apiService.getAllArtists(); // Appel API
            console.log("API response for artists:", response);
            if (response.success) {
                // DataGrid a besoin d'un champ 'id'. On le crée à partir de '_id'.
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
            } else if (err.response?.status === 403) {
                 setError("Erreur d'autorisation. Vous n'avez pas les droits nécessaires.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les artistes au montage
    useEffect(() => {
        fetchArtists();
    }, []);

    // --- Gestionnaires d'actions ---
    const handleEdit = (slug) => {
        console.log("Edit artist with slug:", slug);
        navigate(`/admin/artists/edit/${slug}`);
    };

    const handleDelete = async (slug, name) => {
        console.log("Delete artist with slug:", slug);
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'artiste "${name}" ?`)) {
            try {
                // Utilise la méthode de api.service.js qui prend le slug
                await apiService.deleteArtist(slug);
                 console.log(`Artiste "${name}" supprimé avec succès.`);
                // toast.success(`Artiste "${name}" supprimé.`); // Si vous utilisez toastify
                fetchArtists(); // Recharger
            } catch (err) {
                console.error("Failed to delete artist:", err);
                const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la suppression';
                setError(errorMsg);
                // toast.error(`Erreur: ${errorMsg}`); // Si vous utilisez toastify
            }
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
           sortable: false,
           filterable: false,
         },
        { field: 'name', headerName: 'Nom', width: 300, flex: 1 },
        { field: 'slug', headerName: 'Slug', width: 300, flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            cellClassName: 'actions',
            getActions: ({ row }) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Modifier"
                    onClick={() => handleEdit(row.slug)}
                    color="primary"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Supprimer"
                    onClick={() => handleDelete(row.slug, row.name)}
                    color="error"
                />,
            ],
        },
    ];

    // --- Rendu Conditionnel (Chargement) ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Chargement des artistes...</Typography>
            </Box>
        );
    }

    // --- Affichage Principal ---
    return (
        <Paper sx={{ p: 2, width: '100%', overflow: 'hidden' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Gestion des Artistes
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/artists/new')}
                >
                    Nouvel Artiste
                </Button>
            </Box>

            {/* Conteneur DataGrid */}
            {/* Ajustez la hauteur selon vos besoins */}
            <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
                <DataGrid
                    rows={artists}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                         },
                     }}
                />
            </Box>
        </Paper>
    );
}

export default ArtistListPage;
