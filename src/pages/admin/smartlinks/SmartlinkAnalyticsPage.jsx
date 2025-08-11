import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  TouchApp,
  TrendingUp,
  MusicNote,
  Share,
  Analytics as AnalyticsIcon,
  DateRange
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';

const PlatformIcon = ({ platform }) => {
  const icons = {
    spotify: '🎵',
    deezer: '🎶',
    appleMusic: '🍎',
    youtubeMusic: '📺',
    soundcloud: '☁️',
    tidal: '🌊',
    amazonMusic: '📦',
    boomplay: '💥'
  };
  return icons[platform] || '🎵';
};

function SmartlinkAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [smartlink, setSmartlink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSmartlinkAnalytics();
  }, [id]);

  const loadSmartlinkAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les détails du SmartLink
      const smartlinkResponse = await apiService.smartlinks.getById(id);
      setSmartlink(smartlinkResponse.data);

      // Charger les statistiques
      const analyticsResponse = await apiService.analytics.getSmartLinkStats(id);
      setAnalytics(analyticsResponse.data);
      
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/smartlinks');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography variant="h6">Chargement des statistiques...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !smartlink) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Retour aux SmartLinks
        </Button>
        <Alert severity="error">
          {error || 'SmartLink non trouvé'}
        </Alert>
      </Container>
    );
  }

  const totalClicks = analytics?.platformStats?.reduce((sum, stat) => sum + stat.clicks, 0) || 0;
  const totalViews = analytics?.totalViews || smartlink.viewCount || 0;
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
        <title>Analytics SmartLink - Admin MDMC</title>
      </Helmet>
      <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          variant="outlined"
        >
          Retour
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Analytics - {smartlink.trackTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            par {smartlink.artistId?.name || 'Artiste inconnu'}
          </Typography>
        </Box>
        <Chip 
          label={smartlink.isPublished ? 'Publié' : 'Brouillon'}
          color={smartlink.isPublished ? 'success' : 'default'}
          variant="outlined"
        />
      </Box>

      {/* SmartLink Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {smartlink.coverImageUrl && (
            <img 
              src={smartlink.coverImageUrl} 
              alt={smartlink.trackTitle}
              style={{ 
                width: 100, 
                height: 100, 
                objectFit: 'cover', 
                borderRadius: 8 
              }}
            />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {smartlink.trackTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {smartlink.artistId?.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<DateRange />}
                label={`Créé le ${new Date(smartlink.createdAt).toLocaleDateString('fr-FR')}`}
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<Share />}
                label={`URL: /${smartlink.artistId?.slug}/${smartlink.slug}`}
                variant="outlined"
                size="small"
                onClick={() => {
                  const url = `${window.location.origin}/#/smartlinks/${smartlink.artistId?.slug}/${smartlink.slug}`;
                  window.open(url, '_blank');
                }}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Visibility />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {totalViews.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">Vues totales</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TouchApp />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {totalClicks.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">Clics totaux</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {conversionRate}%
                  </Typography>
                  <Typography color="text.secondary">Taux de conversion</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <MusicNote />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics?.platformStats?.length || 0}
                  </Typography>
                  <Typography color="text.secondary">Plateformes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistiques par plateforme */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AnalyticsIcon />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Clics par plateforme
            </Typography>
          </Box>
          {analytics?.trackingSources && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {analytics.trackingSources.modern > 0 && (
                <Chip 
                  label={`Nouveau: ${analytics.totalClicksModern || 0}`} 
                  color="success" 
                  size="small"
                  variant="outlined"
                />
              )}
              {analytics.trackingSources.legacy > 0 && (
                <Chip 
                  label={`Ancien: ${analytics.totalClicksLegacy || 0}`} 
                  color="info" 
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        {analytics?.platformStats && analytics.platformStats.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plateforme</TableCell>
                  <TableCell align="right">Clics</TableCell>
                  <TableCell align="right">Pourcentage</TableCell>
                  <TableCell align="center">Source</TableCell>
                  <TableCell align="right">Progression</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.platformStats
                  .sort((a, b) => b.clicks - a.clicks)
                  .map((stat, index) => {
                    const percentage = totalClicks > 0 ? ((stat.clicks / totalClicks) * 100).toFixed(1) : 0;
                    return (
                      <TableRow key={stat.platform}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: '1.5em' }}>
                              <PlatformIcon platform={stat.platform} />
                            </span>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {stat.platformName || stat.platform}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {stat.platform}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {stat.clicks.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">
                            {percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={stat.source === 'modern' ? 'Nouveau' : stat.source === 'legacy' ? 'Ancien' : 'Combiné'}
                            color={stat.source === 'modern' ? 'success' : stat.source === 'legacy' ? 'info' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ width: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={parseFloat(percentage)} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucune statistique de plateforme disponible pour le moment.
            Les données apparaîtront dès que des utilisateurs cliqueront sur les liens.
          </Alert>
        )}

        {totalClicks === 0 && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Aucun clic enregistré</Typography>
            <Typography>
              Ce SmartLink n'a pas encore reçu de clics. Partagez-le pour commencer à collecter des statistiques !
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
    </>
  );
}

export default SmartlinkAnalyticsPage;