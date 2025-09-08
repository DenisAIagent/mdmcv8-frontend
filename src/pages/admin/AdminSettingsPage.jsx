import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Security,
  AccountCircle,
  Settings,
  Notifications
} from '@mui/icons-material';
import PasswordSettings from '../../components/admin/PasswordSettings';

// Composant pour les onglets
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const AdminSettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gérez vos paramètres de compte et préférences
      </Typography>

      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab 
              icon={<Security />} 
              label="Sécurité" 
              {...a11yProps(0)}
              iconPosition="start"
            />
            <Tab 
              icon={<AccountCircle />} 
              label="Profil" 
              {...a11yProps(1)}
              iconPosition="start"
              disabled
            />
            <Tab 
              icon={<Notifications />} 
              label="Notifications" 
              {...a11yProps(2)}
              iconPosition="start"
              disabled
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <PasswordSettings />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Paramètres du profil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cette section sera disponible prochainement.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Préférences de notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cette section sera disponible prochainement.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminSettingsPage;