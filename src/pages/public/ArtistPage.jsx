import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Grid, Paper, Chip, CircularProgress } from '@mui/material';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaTwitter, FaGlobe } from 'react-icons/fa';
import apiService from '@/services/api.service';

const socialIconMap = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  twitter: FaTwitter,
  site: FaGlobe,
};

const getSocialIcon = (platform) => {
  const key = platform?.toLowerCase();
  return socialIconMap[key] || FaGlobe;
};

const ArtistPage = () => {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [smartlinks, setSmartlinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistAndLinks = async () => {
      setLoading(true);
      try {
        const artistRes = await apiService.artists.getArtistBySlug(slug);
        setArtist(artistRes.data || artistRes);
        if (artistRes.data?._id || artistRes._id) {
          const smartlinksRes = await apiService.smartlinks.getAll({ artistId: artistRes.data?._id || artistRes._id });
          setSmartlinks(smartlinksRes.data || smartlinksRes || []);
        }
      } catch (err) {
        setArtist(null);
        setSmartlinks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistAndLinks();
  }, [slug]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box>;
  }
  if (!artist) {
    return <Typography color="error" align="center" sx={{ mt: 8 }}>Artiste introuvable.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 4, mb: 6, px: { xs: 1, md: 3 } }}>
      {/* Visuel haut */}
      <Box sx={{ position: 'relative', mb: 3 }}>
        {artist.artistImageUrl && (
          <Box sx={{
            width: '100%',
            height: 260,
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2,
            position: 'relative',
            background: '#1a1a1a',
          }}>
            <img
              src={artist.artistImageUrl}
              alt={artist.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }}
            />
            <Avatar
              src={artist.artistImageUrl}
              alt={artist.name}
              sx={{
                width: 120,
                height: 120,
                position: 'absolute',
                left: 32,
                bottom: -60,
                border: '4px solid #fff',
                boxShadow: 3,
                background: '#0d0d0d',
              }}
            />
          </Box>
        )}
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mt: artist.artistImageUrl ? 7 : 0 }}>{artist.name}</Typography>
      </Box>

      {/* Bio courte */}
      {artist.bio && (
        <Typography variant="body1" sx={{ color: '#f5f5f5', mb: 2, fontSize: '1.15rem' }}>{artist.bio}</Typography>
      )}

      {/* Réseaux sociaux */}
      {artist.socialLinks && artist.socialLinks.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {artist.socialLinks.map((link, idx) => {
            const Icon = getSocialIcon(link.platform);
            return (
              <Button
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ minWidth: 0, p: 1.2, borderRadius: '50%', background: '#23272f', color: '#fff', '&:hover': { background: '#ff003c', color: '#fff' } }}
              >
                <Icon size={24} />
              </Button>
            );
          })}
        </Box>
      )}

      {/* Email newsletter et bouton */}
      {artist.emailingProvider && artist.newsletterEmail && (
        <Button
          variant="contained"
          color="primary"
          href={`https://${artist.emailingProvider.toLowerCase()}.com/subscribe?email=${encodeURIComponent(artist.newsletterEmail)}&utm_source=mdmc_artist_page&utm_medium=button`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mb: 4, borderRadius: 99, fontWeight: 600, fontSize: '1.1rem', px: 4, py: 1.2, background: '#fff', color: '#0d0d0d', '&:hover': { background: '#ff003c', color: '#fff' } }}
        >
          S'abonner à la newsletter
        </Button>
      )}

      {/* Liste des SmartLinks */}
      <Paper sx={{ p: { xs: 2, md: 3 }, background: '#1a1a1a', mt: 2 }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>SmartLinks</Typography>
        {smartlinks.length === 0 ? (
          <Typography color="text.secondary">Aucun SmartLink pour cet artiste.</Typography>
        ) : (
          <Grid container spacing={2}>
            {smartlinks.map((sl) => (
              <Grid item xs={12} md={6} key={sl._id}>
                <Paper sx={{ p: 2, background: '#23272f', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 500 }}>{sl.trackTitle}</Typography>
                    <Typography variant="body2" sx={{ color: '#f5f5f5' }}>{sl.releaseDate ? new Date(sl.releaseDate).toLocaleDateString('fr-FR') : ''}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    href={`/smartlinks/${artist.slug}/${sl.slug}`}
                    sx={{ borderRadius: 99, fontWeight: 600, ml: 2, color: '#ff003c', borderColor: '#ff003c', '&:hover': { background: '#ff003c', color: '#fff', borderColor: '#ff003c' } }}
                  >
                    Voir
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default ArtistPage; 