import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  YouTube as YouTubeIcon,
  ShoppingBag as ShoppingBagIcon,
  MusicNote as MusicNoteIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const defaultStats = {
  youtube: {
    views: 22333,
    conversions: 91,
    conversionRate: 4.23,
    engagementRate: 4.53,
    likes: 183,
    subscribers: 1706
  },
  merch: {
    conversions: 79,
    roas: 647.48,
    conversionValue: 1880,
    cost: 290
  },
  streaming: {
    clicks: 26200,
    conversions: 4050,
    costPerConversion: 0.05,
    totalCost: 201
  }
};

const MotionCard = motion(Card);

const StatCard = ({ icon: Icon, title, value, color }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.3s ease-in-out'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 2
        }}
      >
        <Icon />
      </Box>
      <CardContent sx={{ pt: 4 }}>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            fontSize: isMobile ? '1.5rem' : '2rem'
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const CampaignStatsShowcase = ({
  title = "Des résultats concrets, prouvés par les chiffres",
  stats = defaultStats,
  darkMode = false,
  backgroundColor,
  textColor
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(2)}%`;
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const getVariantConfig = () => {
    switch (title.toLowerCase()) {
      case 'merch':
        return {
          title: 'Campagne Merch',
          color: theme.palette.success.main,
          stats: [
            {
              icon: PeopleIcon,
              title: 'Ventes',
              value: stats.sales || '0',
              color: theme.palette.success.main
            },
            {
              icon: TrendingUpIcon,
              title: 'Revenus',
              value: `$${stats.revenue || '0'}`,
              color: theme.palette.info.main
            },
            {
              icon: PercentIcon,
              title: 'Taux de conversion',
              value: stats.conversionRate || '0%',
              color: theme.palette.warning.main
            }
          ]
        };
      case 'streaming':
        return {
          title: 'Campagne Streaming',
          color: theme.palette.info.main,
          stats: [
            {
              icon: VisibilityIcon,
              title: 'Écoutes',
              value: stats.streams || '0',
              color: theme.palette.info.main
            },
            {
              icon: PersonAddIcon,
              title: 'Nouveaux fans',
              value: stats.newFans || '0',
              color: theme.palette.success.main
            },
            {
              icon: PercentIcon,
              title: 'Engagement',
              value: stats.engagement || '0%',
              color: theme.palette.warning.main
            }
          ]
        };
      default:
        return {
          title: 'Campagne YouTube Ads',
          color: theme.palette.error.main,
          stats: [
            {
              icon: VisibilityIcon,
              title: 'Vues',
              value: stats.views || '0',
              color: theme.palette.error.main
            },
            {
              icon: ThumbUpIcon,
              title: 'Likes',
              value: stats.likes || '0',
              color: theme.palette.primary.main
            },
            {
              icon: PersonAddIcon,
              title: 'Abonnés',
              value: stats.subscribers || '0',
              color: theme.palette.success.main
            },
            {
              icon: PercentIcon,
              title: 'Taux de conversion',
              value: stats.conversionRate || '0%',
              color: theme.palette.warning.main
            }
          ]
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: backgroundColor || (darkMode ? theme.palette.grey[900] : theme.palette.background.default),
        color: textColor || (darkMode ? theme.palette.common.white : theme.palette.text.primary)
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 6
          }}
        >
          {title}
        </Typography>

        <Grid
          container
          spacing={4}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {config.stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 4,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
          >
            Ces statistiques sont basées sur des données réelles de campagnes réussies.
            Les résultats peuvent varier en fonction de votre stratégie et de votre public cible.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CampaignStatsShowcase; 
