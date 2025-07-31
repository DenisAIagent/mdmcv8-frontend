// src/hooks/useAirtableDebug.js
import { useState, useEffect } from 'react';
import airtableService from '../services/airtableReviews.service';

export const useAirtableDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    connection: null,
    reviews: [],
    error: null,
    lastTest: null,
    isLoading: false
  });

  const testConnection = async () => {
    setDebugInfo(prev => ({ ...prev, isLoading: true }));
    
    try {
      const connectionResult = await airtableService.testConnection();
      const reviewsResult = await airtableService.getApprovedReviews();
      
      setDebugInfo({
        connection: connectionResult,
        reviews: reviewsResult,
        error: null,
        lastTest: new Date().toLocaleString(),
        isLoading: false
      });
      
      return { connectionResult, reviewsResult };
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        error: error.message,
        lastTest: new Date().toLocaleString(),
        isLoading: false
      }));
      
      return { error };
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    debugInfo,
    testConnection,
    isLoading: debugInfo.isLoading
  };
};

// src/components/debug/AirtableDebugPanel.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Info,
  Code,
  Storage,
  Api
} from '@mui/icons-material';
import { useAirtableDebug } from '../../hooks/useAirtableDebug';

const AirtableDebugPanel = () => {
  const { debugInfo, testConnection, isLoading } = useAirtableDebug();

  const getStatusIcon = (success) => {
    if (success === null) return <Info color="info" />;
    return success ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const getStatusColor = (success) => {
    if (success === null) return 'info';
    return success ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          🔧 Debug Airtable
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={testConnection}
          disabled={isLoading}
          size="small"
        >
          {isLoading ? 'Test en cours...' : 'Retester'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statut de connexion */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Api sx={{ mr: 1 }} />
                <Typography variant="h6">Connexion API</Typography>
              </Box>
              
              {debugInfo.connection && (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(debugInfo.connection.success)}
                    <Chip
                      label={debugInfo.connection.success ? 'Connecté' : 'Erreur'}
                      color={getStatusColor(debugInfo.connection.success)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Configuration: {debugInfo.connection.configured ? '✅' : '❌'}
                  </Typography>
                  
                  {debugInfo.connection.status && (
                    <Typography variant="body2" color="text.secondary">
                      Status HTTP: {debugInfo.connection.status}
                    </Typography>
                  )}
                  
                  {debugInfo.connection.error && (
                    <Alert severity="error" size="small">
                      {debugInfo.connection.error}
                    </Alert>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Données récupérées */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">Données</Typography>
              </Box>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {debugInfo.reviews.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    avis récupérés
                  </Typography>
                </Box>
                
                {debugInfo.reviews.length > 0 && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Avis vedettes: {debugInfo.reviews.filter(r => r.featured).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Note moyenne: {(debugInfo.reviews.reduce((sum, r) => sum + r.rating, 0) / debugInfo.reviews.length).toFixed(1)}
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Détails techniques */}
      <Box sx={{ mt: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code />
              <Typography>Détails techniques</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Variables d'environnement:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  <div>VITE_AIRTABLE_BASE_ID: {import.meta.env.VITE_AIRTABLE_BASE_ID ? '✅ Définie' : '❌ Manquante'}</div>
                  <div>VITE_AIRTABLE_API_KEY: {import.meta.env.VITE_AIRTABLE_API_KEY ? '✅ Définie' : '❌ Manquante'}</div>
                  <div>VITE_AIRTABLE_TABLE_NAME: {import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Reviews (défaut)'}</div>
                </Box>
              </Grid>
              
              {debugInfo.lastTest && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Dernier test:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {debugInfo.lastTest}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Exemple de données */}
      {debugInfo.reviews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Aperçu des données (3 premiers avis)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.8rem', 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                maxHeight: 400,
                overflow: 'auto'
              }}>
                <pre>
                  {JSON.stringify(debugInfo.reviews.slice(0, 3), null, 2)}
                </pre>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Erreurs */}
      {debugInfo.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Erreur détectée:</Typography>
          <Typography variant="body2">{debugInfo.error}</Typography>
        </Alert>
      )}

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 Pour résoudre les problèmes:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>Vérifiez que le fichier <code>.env.local</code> existe à la racine</li>
            <li>Vérifiez que les variables d'environnement sont correctes</li>
            <li>Vérifiez les permissions de votre API key Airtable</li>
            <li>Vérifiez que la table "Reviews" existe avec les bons champs</li>
            <li>Vérifiez qu'il y a des enregistrements avec Status="Approved"</li>
          </ol>
        </Typography>
      </Alert>
    </Box>
  );
};

export default AirtableDebugPanel;
