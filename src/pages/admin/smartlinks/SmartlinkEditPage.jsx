// src/pages/admin/smartlinks/SmartlinkEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, Container, CircularProgress, Alert, Box } from '@mui/material';
import { toast } from 'react-toastify';

// Import du composant formulaire SmartLink (version complète admin)
import SmartLinkForm from '@/features/admin/smartlinks/components/SmartLinkForm';
import apiService from '@/services/api.service'; // Pour récupérer les données du SmartLink

function SmartlinkEditPage() {
  const { smartlinkId } = useParams(); // Supposons que l'ID du SmartLink est dans l'URL
  const navigate = useNavigate();

  const [smartlinkData, setSmartlinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSmartlinkData = async () => {
      if (!smartlinkId) {
        setError("L'identifiant du SmartLink est manquant dans l'URL.");
        setLoading(false);
        toast.error("Identifiant SmartLink manquant.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Méthode à créer dans apiService pour récupérer un SmartLink par son ID
        // par exemple: apiService.smartlinks.getById(smartlinkId)
        // ou si vous utilisez getBySlugs, vous devrez adapter la récupération des paramètres d'URL
        const response = await apiService.smartlinks.getById(smartlinkId);
        
        if (response.data) { // Adaptez selon la structure de votre réponse API
          setSmartlinkData(response.data);
        } else {
          throw new Error(response.error || 'SmartLink non trouvé ou erreur API.');
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données du SmartLink:", err);
        const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des données.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSmartlinkData();
  }, [smartlinkId]); // Se ré-exécute si smartlinkId change

  // Callback exécuté après la mise à jour réussie du SmartLink
  const handleUpdateSuccess = (updatedSmartlink) => {
    // La notification de succès est déjà gérée dans SmartLinkForm.
    // toast.success(`SmartLink "${updatedSmartlink.trackTitle}" mis à jour avec succès ! Redirection...`);
    
    // Rediriger vers la liste des SmartLinks après un court délai
    setTimeout(() => {
      navigate('/admin/smartlinks'); // Ajustez si votre route pour la liste est différente
    }, 1500);
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 5, py: 5 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des données du SmartLink...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ p: 2 }}>
          <Typography variant="h6">Erreur</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!smartlinkData) {
    // Ce cas pourrait être couvert par l'erreur, mais une vérification explicite est possible.
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Aucune donnée de SmartLink à afficher.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          Modifier le SmartLink
        </Typography>
        
        {/* Le formulaire SmartLink est responsable de la logique de mise à jour */}
        <SmartLinkForm
          smartLinkData={smartlinkData} // Passer les données existantes au formulaire
          onFormSubmitSuccess={handleUpdateSuccess}
        />
      </Paper>
    </Container>
  );
}

export default SmartlinkEditPage;
