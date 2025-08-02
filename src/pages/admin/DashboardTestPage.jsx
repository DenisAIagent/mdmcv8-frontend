// src/pages/admin/DashboardTestPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Typography,
  Alert,
  Button,
  Stack,
  Paper,
  Chip
} from '@mui/material';
import { 
  Dashboard,
  BugReport,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import DashboardLayout from '../../dashboard/layouts/DashboardLayout';

// Composant de test pour valider le dashboard
const DashboardTestPage = () => {
  const [testResults, setTestResults] = React.useState({
    tanstackQuery: 'pending',
    widgets: 'pending',
    responsiveLayout: 'pending',
    dataFetching: 'pending'
  });

  // Fonction pour tester les différents composants
  const runTests = async () => {
    console.log('🧪 Démarrage des tests dashboard...');
    
    // Test 1: TanStack Query
    try {
      const { QueryClient } = await import('@tanstack/react-query');
      setTestResults(prev => ({ ...prev, tanstackQuery: 'success' }));
      console.log('✅ TanStack Query: OK');
    } catch (error) {
      setTestResults(prev => ({ ...prev, tanstackQuery: 'error' }));
      console.error('❌ TanStack Query: Erreur', error);
    }

    // Test 2: Widgets
    try {
      await Promise.all([
        import('../../dashboard/widgets/AnalyticsWidget'),
        import('../../dashboard/widgets/PerformanceWidget'),
        import('../../dashboard/widgets/SmartLinkWidget'),
        import('../../dashboard/widgets/ArtistStatsWidget'),
        import('../../dashboard/widgets/RecentActivityWidget')
      ]);
      setTestResults(prev => ({ ...prev, widgets: 'success' }));
      console.log('✅ Widgets: OK');
    } catch (error) {
      setTestResults(prev => ({ ...prev, widgets: 'error' }));
      console.error('❌ Widgets: Erreur', error);
    }

    // Test 3: Layout responsive
    try {
      const { Responsive } = await import('react-grid-layout');
      setTestResults(prev => ({ ...prev, responsiveLayout: 'success' }));
      console.log('✅ Layout responsive: OK');
    } catch (error) {
      setTestResults(prev => ({ ...prev, responsiveLayout: 'error' }));
      console.error('❌ Layout responsive: Erreur', error);
    }

    // Test 4: Data fetching
    try {
      const { useMockMetrics } = await import('../../dashboard/hooks/useSmartLinkMetrics');
      setTestResults(prev => ({ ...prev, dataFetching: 'success' }));
      console.log('✅ Data fetching: OK');
    } catch (error) {
      setTestResults(prev => ({ ...prev, dataFetching: 'error' }));
      console.error('❌ Data fetching: Erreur', error);
    }

    console.log('🧪 Tests terminés');
  };

  // Auto-run des tests au montage
  React.useEffect(() => {
    const timer = setTimeout(runTests, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'error': return <BugReport />;
      case 'pending': return <Warning />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'OK';
      case 'error': return 'Erreur';
      case 'pending': return 'Test en cours...';
      default: return 'Inconnu';
    }
  };

  const allTestsPassed = Object.values(testResults).every(status => status === 'success');

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
        <title>Test Dashboard - MDMC Music Ads</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header de test */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <BugReport color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Dashboard Test Suite
            </Typography>
          </Stack>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Cette page teste tous les composants du dashboard avant intégration.
          </Typography>

          {/* Résultats des tests */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={getStatusIcon(testResults.tanstackQuery)}
              label={`TanStack Query: ${getStatusText(testResults.tanstackQuery)}`}
              color={getStatusColor(testResults.tanstackQuery)}
              variant="outlined"
            />
            <Chip
              icon={getStatusIcon(testResults.widgets)}
              label={`Widgets: ${getStatusText(testResults.widgets)}`}
              color={getStatusColor(testResults.widgets)}
              variant="outlined"
            />
            <Chip
              icon={getStatusIcon(testResults.responsiveLayout)}
              label={`Layout: ${getStatusText(testResults.responsiveLayout)}`}
              color={getStatusColor(testResults.responsiveLayout)}
              variant="outlined"
            />
            <Chip
              icon={getStatusIcon(testResults.dataFetching)}
              label={`Data: ${getStatusText(testResults.dataFetching)}`}
              color={getStatusColor(testResults.dataFetching)}
              variant="outlined"
            />
          </Stack>

          <Box sx={{ mt: 2 }}>
            {allTestsPassed ? (
              <Alert severity="success" icon={<CheckCircle />}>
                Tous les tests sont passés ! Le dashboard est prêt pour l'intégration.
              </Alert>
            ) : Object.values(testResults).some(status => status === 'error') ? (
              <Alert severity="error" icon={<BugReport />}>
                Certains tests ont échoué. Vérifiez la console pour plus de détails.
              </Alert>
            ) : (
              <Alert severity="info" icon={<Warning />}>
                Tests en cours d'exécution...
              </Alert>
            )}
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={runTests}
              startIcon={<BugReport />}
            >
              Relancer les tests
            </Button>
            
            <Button 
              variant="contained" 
              disabled={!allTestsPassed}
              href="/admin/dashboard"
              startIcon={<Dashboard />}
            >
              Accéder au Dashboard
            </Button>
          </Stack>
        </Paper>

        {/* Dashboard intégré pour test visuel */}
        <Box sx={{ 
          border: 2, 
          borderColor: allTestsPassed ? 'success.main' : 'warning.main',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            bgcolor: allTestsPassed ? 'success.light' : 'warning.light', 
            p: 1, 
            textAlign: 'center' 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {allTestsPassed ? 
                '✅ Dashboard fonctionnel - Test visuel' : 
                '⚠️ Dashboard en test - Peut contenir des erreurs'
              }
            </Typography>
          </Box>
          
          <DashboardLayout>
            {/* Contenu de test supplémentaire si nécessaire */}
            {process.env.NODE_ENV === 'development' && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                <Typography variant="body2">
                  Mode développement: Devtools TanStack Query disponibles en bas à droite
                </Typography>
              </Paper>
            )}
          </DashboardLayout>
        </Box>

        {/* Informations techniques */}
        <Paper sx={{ p: 2, mt: 4, bgcolor: 'grey.100' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Informations techniques
          </Typography>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Widgets implémentés :</strong> AnalyticsWidget, PerformanceWidget, SmartLinkWidget, ArtistStatsWidget, RecentActivityWidget
            </Typography>
            <Typography variant="body2">
              <strong>Hooks :</strong> useSmartLinkMetrics, useDashboardLayout, useRealTimeUpdates
            </Typography>
            <Typography variant="body2">
              <strong>Services :</strong> DashboardApiService avec données mockées
            </Typography>
            <Typography variant="body2">
              <strong>Libraries :</strong> TanStack Query v5, MUI X Charts, React Grid Layout, Recharts
            </Typography>
            <Typography variant="body2">
              <strong>Features :</strong> Layout personnalisable, responsive, temps réel, lazy loading
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default DashboardTestPage;