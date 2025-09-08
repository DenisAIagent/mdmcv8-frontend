import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import SmartLinkWizard from '../../../features/admin/smartlinks/components/SmartLinkWizard';

const SmartlinkCreatePage = () => {
  // Ajout d'un useEffect pour le débogage
  useEffect(() => {
    console.log("SmartlinkCreatePage monté");
    return () => {
      console.log("SmartlinkCreatePage démonté");
    };
  }, []);

  // Rendu simplifié pour tester l'affichage
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Créer un Nouveau SmartLink
          </Typography>
          <SmartLinkWizard />
        </Paper>
      </Box>
    </Container>
  );
};

export default SmartlinkCreatePage;
