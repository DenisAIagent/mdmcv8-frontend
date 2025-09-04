// src/components/sections/Reviews.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Skeleton,
  Alert,
  Chip,
  IconButton,
  Fade,
  Slide,
  useTheme,
  alpha,
  Stack,
  Divider
} from '@mui/material';
import {
  Star,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Verified,
  TrendingUp,
  Refresh,
  FormatQuote,
  Business
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import du service Featurable pour Google My Business
import featurableService from '../../services/featurable.service';

// Composant pour une carte d'avis individuelle
const ReviewCard = ({ review, index, delay = 0 }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: delay + (index * 0.1), 
        duration: 0.6,
        ease: "easeOut"
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: review.featured 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`
            : 'background.paper',
          border: review.featured 
            ? `2px solid ${alpha(theme.palette.primary.main, 0.4)}`
            : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
          '&::before': review.featured ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          } : {}
        }}
      >
        {/* Badge pour avis vedette */}
        {review.featured && (
          <Chip
            label="⭐ Coup de cœur"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              zIndex: 2,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
              boxShadow: theme.shadows[3]
            }}
          />
        )}

        <CardContent sx={{ p: 3 }}>
          {/* Header avec avatar et infos client */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <Avatar
              src={review.avatar}
              alt={`Avatar de ${review.name} - Avis Google`}
              sx={{
                width: 56,
                height: 56,
                mr: 2.5,
                bgcolor: review.featured 
                  ? theme.palette.primary.main 
                  : theme.palette.secondary.main,
                fontSize: '1.2rem',
                fontWeight: 700,
                border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: theme.shadows[3]
              }}
            >
              {review.initials}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: '1.1rem'
                  }}
                >
                  {review.name}
                </Typography>
                <Verified 
                  sx={{ 
                    color: theme.palette.success.main, 
                    fontSize: 18 
                  }} 
                />
              </Box>
              
              {review.company && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Business sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {review.company}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: '#FFD700'
                    },
                    '& .MuiRating-iconEmpty': {
                      color: alpha('#FFD700', 0.3)
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {review.timeAgo}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Citation avec guillemets */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <FormatQuote 
              sx={{ 
                position: 'absolute',
                top: -16,
                left: -8,
                color: alpha(theme.palette.primary.main, 0.15),
                fontSize: 48,
                transform: 'rotate(180deg)',
                zIndex: 0
              }} 
            />
            
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.7,
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 1,
                pl: 2,
                color: 'text.primary',
                fontSize: '0.95rem'
              }}
            >
              "{review.comment}"
            </Typography>
          </Box>

          {/* Footer avec source */}
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Chip
              label={`${review.rating}/5 étoiles`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                height: 26,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                borderColor: alpha(theme.palette.success.main, 0.3),
                color: theme.palette.success.main,
                fontWeight: 600
              }}
            />
            
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.7rem',
                fontWeight: 500
              }}
            >
              via {review.source}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant principal Reviews
const Reviews = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [connectionTest, setConnectionTest] = useState(null);
  
  const reviewsPerPage = 6;

  // Test de connexion Featurable au montage
  useEffect(() => {
    const testFeaturableConnection = async () => {
      const result = await featurableService.testConnection();
      setConnectionTest(result);
      console.log('🔧 Test connexion Featurable:', result);
    };

    testFeaturableConnection();
  }, []);

  // Chargement des avis
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('📊 Chargement des avis Google My Business...');
        const reviewsData = await featurableService.getReviews();
        
        if (reviewsData && reviewsData.length > 0) {
          setReviews(reviewsData);
          console.log('✅ Avis Google chargés:', { count: reviewsData.length });
        } else {
          console.log('ℹ️ Aucun avis Google trouvé');
          setReviews([]);
        }
      } catch (err) {
        console.error('❌ Erreur chargement avis Google:', err);
        setError(err.message);
        
        // Fallback avec avis locaux pour les problèmes de connexion mobile
        const fallbackReviews = [
          {
            id: 'fallback-1',
            name: 'Capucine Trotobas',
            initials: 'CT',
            rating: 5,
            comment: 'Service exceptionnel ! L\'équipe MDMC a transformé notre stratégie digitale avec des résultats impressionnants.',
            timeAgo: 'Il y a 2 semaines',
            source: 'Google My Business',
            featured: true,
            avatar: null
          },
          {
            id: 'fallback-2', 
            name: 'Marie-Caroline DONY',
            initials: 'MD',
            rating: 5,
            comment: 'Expertise remarquable en marketing musical. Nos campagnes YouTube ont dépassé toutes nos attentes.',
            timeAgo: 'Il y a 1 mois',
            source: 'Google My Business', 
            featured: true,
            avatar: null
          }
        ];
        
        setReviews(fallbackReviews);
        console.log('🔄 Fallback: Avis locaux chargés pour mobile');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleRefresh = async () => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const reviewsData = await featurableService.getReviews();
        setReviews(reviewsData || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  };

  // Calcul des statistiques
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const featuredCount = reviews.filter(review => review.featured).length;

  // Composant de chargement
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <Card sx={{ height: 320 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2.5 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mt: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="85%" height={20} />
              <Skeleton variant="text" width="30%" height={24} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box 
        component="section" 
        id="reviews"
        sx={{ 
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha('#000', 0.02)} 0%, ${alpha('#000', 0.05)} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 6,
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t('reviews.title', 'Avis de nos Clients')}
          </Typography>
          <LoadingSkeleton />
        </Container>
      </Box>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <Box component="section" id="reviews" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 6 }}>
            {t('reviews.title', 'Avis de nos Clients')}
          </Typography>
          <Alert 
            severity="warning" 
            sx={{ maxWidth: 600, mx: 'auto' }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                <Refresh sx={{ mr: 1 }} />
                Réessayer
              </Button>
            }
          >
            Problème de connexion avec Google My Business. Les avis seront bientôt disponibles.
            {connectionTest && !connectionTest.success && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Statut: {connectionTest.error || 'Configuration en cours'}
              </Typography>
            )}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      component="section" 
      id="reviews"
      sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha('#000', 0.02)} 0%, ${alpha('#000', 0.05)} 100%)`
      }}
    >
      <Container maxWidth="lg">
        {/* Header avec statistiques */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 3,
                color: '#ffffff',
                fontWeight: 800
              }}
            >
              {t('reviews.title', 'Avis de nos Clients')}
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              {t('reviews.subtitle', 'Découvrez les témoignages de nos clients satisfaits')}
            </Typography>

            {/* Statistiques */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={4} 
              justifyContent="center" 
              alignItems="center"
              sx={{ mb: 6 }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                  {avgRating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Note moyenne
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
                  {reviews.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avis clients
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                  {featuredCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coups de cœur
                </Typography>
              </Box>
            </Stack>

          </Box>
        </Fade>

        {/* Grille des avis */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={4}>
              {currentReviews.map((review, index) => (
                <Grid item xs={12} md={6} lg={4} key={review.id}>
                  <ReviewCard 
                    review={review} 
                    index={index}
                    delay={0.2}
                  />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </AnimatePresence>

        {/* Controls de pagination */}
        {totalPages > 1 && (
          <Fade in timeout={1000} style={{ transitionDelay: '800ms' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              mt: 6 
            }}>
              <IconButton 
                onClick={handlePrevPage}
                disabled={totalPages <= 1}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>
              
              <Typography variant="body2" color="text.secondary">
                {currentPage + 1} / {totalPages}
              </Typography>
              
              <IconButton 
                onClick={handleNextPage}
                disabled={totalPages <= 1}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <KeyboardArrowRight />
              </IconButton>
            </Box>
          </Fade>
        )}

        {/* CTA vers tous les avis */}
        <Fade in timeout={1000} style={{ transitionDelay: '1000ms' }}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              href="/all-reviews"
              sx={{
                borderRadius: 50,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              Voir tous les avis ({reviews.length})
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Reviews;
