import React, { useState, useEffect } from 'react';
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
  Container,
  Fade,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  Group,
  Link as LinkIcon,
  Visibility,
  Add,
  ArrowUpward,
  ArrowDownward,
  Analytics,
  MusicNote,
  StarRate,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';

// Composant pour les cartes de métriques core
const MetricCard = ({ title, value, change, changeType, icon, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 16px ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
  );
};

// Composant pour les actions rapides
const QuickActionCard = ({ title, icon, color, onClick }) => (
  <Card
    sx={{
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 20px ${color}20`,
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 2, textAlign: 'center' }}>
      <Avatar
        sx={{
          bgcolor: color,
          width: 48,
          height: 48,
          mx: 'auto',
          mb: 1.5,
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

// Composant pour les Top SmartLinks
const TopSmartLinkItem = ({ rank, title, artist, clicks, platform, onClick }) => {
  const theme = useTheme();
  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return theme.palette.warning.main; // Gold
      case 2: return '#C0C0C0'; // Silver  
      case 3: return '#CD7F32'; // Bronze
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'rgba(99, 102, 241, 0.04)',
          transform: 'translateX(4px)',
        },
      }}
      onClick={onClick}
    >
      <Avatar 
        sx={{ 
          bgcolor: getRankColor(rank), 
          mr: 2, 
          width: 32, 
          height: 32,
          fontSize: '0.875rem',
          fontWeight: 700 
        }}
      >
        {rank}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {artist} • {platform}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
        {clicks.toLocaleString()} clics
      </Typography>
    </Box>
  );
};

const AdminPanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 6 MÉTRIQUES CORE selon architecture définie
  const [coreMetrics, setCoreMetrics] = useState([
    {
      title: 'SmartLinks Actifs',
      value: 42,
      change: '+12%',
      changeType: 'positive',
      icon: <LinkIcon />,
      color: '#E50914', // Rouge MDMC
    },
    {
      title: 'Clics ce mois',
      value: 15847,
      change: '+28%',
      changeType: 'positive',
      icon: <Visibility />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Artistes Portfolio',
      value: 18,
      change: '+3%',
      changeType: 'positive',
      icon: <Group />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Top Platform',
      value: 'Spotify 45%',
      change: '+8%',
      changeType: 'positive',
      icon: <MusicNote />,
      color: theme.palette.success.main,
    },
    {
      title: 'Conversion Rate',
      value: '12.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: <TrendingUp />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Performance Score',
      value: '94/100',
      change: '+5 pts',
      changeType: 'positive',
      icon: <StarRate />,
      color: theme.palette.info.main,
    },
  ]);

  // Actions rapides (seulement 2 essentielles)
  const quickActions = [
    {
      title: 'Créer SmartLink',
      icon: <Add />,
      color: '#E50914',
      onClick: () => navigate('/admin/smartlinks/new'),
    },
    {
      title: 'Ajouter Artiste',
      icon: <Group />,
      color: theme.palette.secondary.main,
      onClick: () => navigate('/admin/artists/new'),
    },
  ];

  // Top 3 SmartLinks mockés
  const [topSmartLinks, setTopSmartLinks] = useState([
    {
      rank: 1,
      title: 'Summer Vibes',
      artist: 'DJ Alex',
      clicks: 3847,
      platform: 'Spotify',
    },
    {
      rank: 2,
      title: 'Midnight Dreams',
      artist: 'Luna Band',
      clicks: 2954,
      platform: 'Apple Music',
    },
    {
      rank: 3,
      title: 'Rock Anthem',
      artist: 'Thunder Kings',
      clicks: 2103,
      platform: 'YouTube Music',
    },
  ]);

  // Performance hebdomadaire simplifiée
  const [weeklyPerformance, setWeeklyPerformance] = useState({
    newClicks: 4672,
    weekOverWeek: '+15%'
  });

  // Simulation de chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
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
        <title>Dashboard Admin - MDMC Music Ads</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <Fade in={!loading} timeout={800}>
          <Box sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #E50914 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Dashboard MDMC
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Bienvenue Denis ! Voici un aperçu de vos performances
              </Typography>
            </Box>

            {/* 6 MÉTRIQUES CORE */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {coreMetrics.map((metric, index) => (
                <Grid item xs={12} sm={6} lg={2} key={metric.title}>
                  <MetricCard {...metric} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              {/* Section gauche : Performance Hebdomadaire + Actions Rapides */}
              <Grid item xs={12} lg={8}>
                {/* Performance Hebdomadaire */}
                <Paper
                  sx={{
                    p: 4,
                    mb: 3,
                    background: 'linear-gradient(135deg, #E50914 0%, #8b5cf6 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Performance de la Semaine
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                        {weeklyPerformance.newClicks.toLocaleString()}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Nouveaux clics
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                        {weeklyPerformance.weekOverWeek}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Semaine/Semaine
                      </Typography>
                    </Grid>
                  </Grid>
                  <LinearProgress
                    variant="determinate"
                    value={85}
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

                {/* Actions Rapides */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Actions Rapides
                  </Typography>
                  <Grid container spacing={3}>
                    {quickActions.map((action) => (
                      <Grid item xs={6} key={action.title}>
                        <QuickActionCard {...action} />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>

              {/* Section droite : Top 3 SmartLinks */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, height: 'fit-content' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Top 3 SmartLinks
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={() => navigate('/admin/analytics')}
                      startIcon={<Analytics />}
                    >
                      Voir tout
                    </Button>
                  </Box>
                  <Stack spacing={1}>
                    {topSmartLinks.map((smartlink) => (
                      <TopSmartLinkItem 
                        key={smartlink.rank}
                        {...smartlink}
                        onClick={() => navigate(`/admin/smartlinks/analytics/${smartlink.rank}`)}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default AdminPanel;