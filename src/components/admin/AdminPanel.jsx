import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  useTheme,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  IconButton,
  Chip,
  Container,
  Fade,
  Zoom,
  Slide,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  Group,
  Link as LinkIcon,
  Visibility,
  PlayArrow,
  Add,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Analytics,
  MusicNote,
  Campaign,
  Download,
  Dashboard,
  Settings,
  Notifications,
  Share,
  Speed,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';

// Composant pour les cartes de statistiques
const StatsCard = ({ title, value, change, changeType, icon, color, delay = 0 }) => {
  const theme = useTheme();
  const [animatedValue, setAnimatedValue] = useState(0);
  const timerRef = useRef(null);
  const counterRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      counterRef.current = setInterval(() => {
        current += increment;
        if (current >= value) {
          if (isMountedRef.current) {
            setAnimatedValue(value);
          }
          clearInterval(counterRef.current);
        } else {
          if (isMountedRef.current) {
            setAnimatedValue(Math.floor(current));
          }
        }
      }, duration / steps);
    }, delay);

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (counterRef.current) clearInterval(counterRef.current);
    };
  }, [value, delay]);

  return (
    <Zoom in={true} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: `1px solid ${color}20`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 10px 20px ${color}20`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mt: 1 }}>
                {typeof animatedValue === 'number' ? animatedValue.toLocaleString() : animatedValue}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                boxShadow: `0 4px 8px ${color}30`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {changeType === 'positive' ? (
              <ArrowUpward sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
            ) : (
              <ArrowDownward sx={{ color: theme.palette.error.main, fontSize: 16, mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: changeType === 'positive' ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
                mr: 1,
              }}
            >
              {change}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs mois dernier
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

// Composant pour les actions rapides
const QuickActionCard = ({ title, description, icon, color, onClick, delay = 0 }) => (
  <Slide in={true} direction="up" timeout={600} style={{ transitionDelay: `${delay}ms` }}>
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: `0 15px 25px ${color}20`,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2,
            boxShadow: `0 6px 12px ${color}30`,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  </Slide>
);

// Composant pour les activités récentes
const RecentActivityItem = ({ title, subtitle, time, avatar, color }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      p: 2,
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: 'rgba(99, 102, 241, 0.04)',
        transform: 'translateX(4px)',
      },
    }}
  >
    <Avatar sx={{ bgcolor: color, mr: 2 }}>{avatar}</Avatar>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      {time}
    </Typography>
  </Box>
);

const AdminPanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper pour navigation sécurisée avec validation routes
  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error(`Navigation failed to ${path}:`, error);
      // Fallback vers dashboard si route échoue
      navigate('/admin/dashboard');
    }
  };

  const [statsData, setStatsData] = useState([
    {
      title: 'Total SmartLinks',
      value: 0,
      change: '+0%',
      changeType: 'positive',
      icon: <LinkIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Artistes Actifs',
      value: 0,
      change: '+0%',
      changeType: 'positive',
      icon: <Group />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Vues ce mois',
      value: 0,
      change: '+0%',
      changeType: 'positive',
      icon: <Visibility />,
      color: theme.palette.success.main,
    },
    {
      title: 'Clics totaux',
      value: 0,
      change: '+0%',
      changeType: 'positive',
      icon: <TrendingUp />,
      color: theme.palette.warning.main,
    },
  ]);

  const quickActions = [
    {
      title: 'Nouvel Artiste',
      description: 'Ajouter un artiste à votre portfolio',
      icon: <Add />,
      color: theme.palette.primary.main,
      onClick: () => safeNavigate('/admin/artists/new'),
    },
    {
      title: 'Créer SmartLink',
      description: 'Générer un nouveau lien intelligent',
      icon: <LinkIcon />,
      color: theme.palette.secondary.main,
      onClick: () => safeNavigate('/admin/smartlinks/new'),
    },
    {
      title: 'Analytics',
      description: 'Consulter les statistiques détaillées',
      icon: <Analytics />,
      color: theme.palette.info.main,
      onClick: () => safeNavigate('/admin/stats'),
    },
    {
      title: 'Landing Pages',
      description: 'Créer des pages personnalisées',
      icon: <Campaign />,
      color: theme.palette.success.main,
      onClick: () => safeNavigate('/admin/landing-pages'),
    },
  ];

  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyPerformance, setWeeklyPerformance] = useState({
    newClicks: 0,
    conversionRate: '0%'
  });
  const [loading, setLoading] = useState(true);

  // Charger les vraies données depuis le backend
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Chargement des données dashboard...');
      
      const response = await apiService.analytics.getDashboardStats();
      
      if (response.success && response.data) {
        const { stats, weeklyPerformance, recentActivities } = response.data;
        
        // Mettre à jour les statistiques
        setStatsData([
          {
            title: 'Total SmartLinks',
            value: stats.totalSmartLinks.value,
            change: stats.totalSmartLinks.change,
            changeType: stats.totalSmartLinks.changeType,
            icon: <LinkIcon />,
            color: theme.palette.primary.main,
          },
          {
            title: 'Artistes Actifs',
            value: stats.activeArtists.value,
            change: stats.activeArtists.change,
            changeType: stats.activeArtists.changeType,
            icon: <Group />,
            color: theme.palette.secondary.main,
          },
          {
            title: 'Vues ce mois',
            value: stats.monthlyViews.value,
            change: stats.monthlyViews.change,
            changeType: stats.monthlyViews.changeType,
            icon: <Visibility />,
            color: theme.palette.success.main,
          },
          {
            title: 'Clics totaux',
            value: stats.totalClicks.value,
            change: stats.totalClicks.change,
            changeType: stats.totalClicks.changeType,
            icon: <TrendingUp />,
            color: theme.palette.warning.main,
          },
        ]);

        // Mettre à jour les performances de la semaine
        setWeeklyPerformance(weeklyPerformance);

        // Mettre à jour les activités récentes
        const formattedActivities = recentActivities.map(activity => ({
          title: activity.title,
          subtitle: activity.subtitle,
          time: new Date(activity.time).toLocaleString('fr-FR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          avatar: <MusicNote />,
          color: theme.palette.primary.main,
        }));
        
        setRecentActivities(formattedActivities);
        
        console.log('✅ Données dashboard chargées avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
      // Garder les données de base en cas d'erreur
      setRecentActivities([
        {
          title: 'Aucune activité récente',
          subtitle: 'Les données seront disponibles une fois que vous aurez créé des SmartLinks',
          time: 'Maintenant',
          avatar: <MusicNote />,
          color: theme.palette.primary.main,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (mounted) {
      loadDashboardData();
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
        <title>Admin Dashboard - MDMC Music Ads</title>
      </Helmet>
      <Container maxWidth="xl">
        <Fade in={mounted} timeout={800}>
        <Box sx={{ py: 4 }}>
          {/* Header avec animation */}
          <Slide in={mounted} direction="down" timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Tableau de Bord
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Bienvenue Denis ! Voici un aperçu de vos performances
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="🎵 12 nouveaux morceaux cette semaine"
                  variant="outlined"
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Chip
                  label="📈 +24% de vues ce mois"
                  variant="outlined"
                  color="success"
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Chip
                  label="🚀 3 campagnes actives"
                  variant="outlined"
                  color="primary"
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Box>
            </Box>
          </Slide>

          {/* Cartes de statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsData.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                <StatsCard {...stat} delay={index * 100} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4}>
            {/* Actions rapides */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Actions Rapides
                </Typography>
                <Grid container spacing={3}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={3} key={action.title}>
                      <QuickActionCard {...action} delay={index * 150} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Graphique de performance */}
              <Fade in={mounted} timeout={1000} style={{ transitionDelay: '800ms' }}>
                <Paper
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 200,
                      height: 200,
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                      transform: 'translate(50%, -50%)',
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Performance de la Semaine
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {weeklyPerformance.newClicks?.toLocaleString() || 0}
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>Nouveaux clics</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {weeklyPerformance.conversionRate || '0%'}
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>Taux de conversion</Typography>
                    </Grid>
                  </Grid>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{
                      mt: 3,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Paper>
              </Fade>
            </Grid>

            {/* Activités récentes */}
            <Grid item xs={12} lg={4}>
              <Slide in={mounted} direction="left" timeout={800} style={{ transitionDelay: '600ms' }}>
                <Paper sx={{ p: 3, height: 'fit-content' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Activité Récente
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Stack spacing={1}>
                    {recentActivities.map((activity, index) => (
                      <Fade
                        key={activity.title}
                        in={mounted}
                        timeout={600}
                        style={{ transitionDelay: `${1000 + index * 200}ms` }}
                      >
                        <div>
                          <RecentActivityItem {...activity} />
                        </div>
                      </Fade>
                    ))}
                  </Stack>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 3 }}
                    onClick={() => {
                      // Route temporairement indisponible, redirection vers dashboard
                      console.info('Activités détaillées bientôt disponibles');
                      // navigate('/admin/activities'); // TODO: Implémenter cette route
                    }}
                    disabled
                  >
                    Voir toutes les activités (Bientôt)
                  </Button>
                </Paper>
              </Slide>
            </Grid>
          </Grid>

          {/* Section des liens rapides en bas */}
          <Fade in={mounted} timeout={800} style={{ transitionDelay: '1200ms' }}>
            <Paper
              sx={{
                mt: 4,
                p: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Liens Rapides
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<Group />}
                    onClick={() => safeNavigate('/admin/artists')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Gérer les Artistes
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<LinkIcon />}
                    onClick={() => safeNavigate('/admin/smartlinks')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    SmartLinks
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<Analytics />}
                    onClick={() => safeNavigate('/admin/reviews')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Avis Clients
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<Download />}
                    onClick={() => safeNavigate('/admin/wordpress')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    WordPress
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        </Box>
      </Fade>
    </Container>
    </>
  );
};

export default AdminPanel;
