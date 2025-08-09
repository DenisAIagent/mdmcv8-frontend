import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, TextField, Button, Paper, Divider, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import musicPlatformService from '../../../../services/musicPlatform.service';
import apiService from '../../../../services/api.service';

// Composants pour chaque section
import MetadataSection from './sections/MetadataSection';
import PlatformLinksSection from './sections/PlatformLinksSection';
import UtmSection from './sections/UtmSection';
import TrackingSection from './sections/TrackingSection';
import CustomizationSection from './sections/CustomizationSection';
import PreviewSection from './sections/PreviewSection';

const SmartLinkWizard = () => {
  // Ajout d'un useEffect pour le débogage
  useEffect(() => {
    console.log("SmartLinkWizard monté");
    return () => {
      console.log("SmartLinkWizard démonté");
    };
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceData, setSourceData] = useState(null);
  const [platformLinks, setPlatformLinks] = useState([]);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    isrc: '',
    label: '',
    distributor: '',
    releaseDate: '',
    artwork: ''
  });

  const { control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: {
      sourceUrl: '',
      trackTitle: '',
      artistName: '',
      isrc: '',
      previewAudioUrl: '',
      seo: {
        description: ''
      },
      analytics: {
        customTracking: {
          trackingMode: 'global',
          clientName: '',
          campaignName: '',
          ga4Override: {
            enabled: false,
            measurementId: ''
          },
          gtmOverride: {
            enabled: false,
            containerId: ''
          },
          metaPixelOverride: {
            enabled: false,
            pixelId: ''
          },
          tiktokPixelOverride: {
            enabled: false,
            pixelId: ''
          }
        }
      },
      utmSource: 'wiseband',
      utmMedium: 'smartlink',
      utmCampaign: '',
      gaId: '',
      gtmId: '',
      adsId: '',
      metaPixelId: '',
      tiktokPixelId: '',
      template: 'standard',
      primaryColor: '#FF0000'
    }
  });

  // Observer les changements de valeur pour mettre à jour la prévisualisation
  const formValues = watch();

  const fetchLinksFromSource = async (sourceUrl) => {
    setIsLoading(true);
    try {
      // Ajout de logs pour le débogage
      console.log("Tentative d'appel à fetchLinksFromSourceUrl avec:", sourceUrl);
      
      const response = await musicPlatformService.fetchLinksFromSourceUrl(sourceUrl);
      console.log("Réponse de l'API:", response);
      
      if (response && response.success && response.data) {
        // Extraire les métadonnées
        const { title, artist, artwork, isrc, linksByPlatform } = response.data;
        
        setMetadata({
          title: title || '',
          artist: artist || '',
          isrc: isrc || '',
          label: response.data.label || '',
          distributor: response.data.distributor || '',
          releaseDate: response.data.releaseDate || '',
          artwork: artwork || ''
        });
        
        // Mettre à jour les champs du formulaire
        setValue('trackTitle', title || '');
        setValue('artistName', artist || ''); // Remplir le nom d'artiste depuis l'API
        setValue('isrc', isrc || '');
        setValue('utmCampaign', `${artist || 'artist'}-${title || 'track'}`.toLowerCase().replace(/\s+/g, '-'));
        
        // Traiter les liens des plateformes
        if (linksByPlatform && typeof linksByPlatform === 'object') {
          const links = Object.entries(linksByPlatform).map(([platform, url]) => ({
            platform,
            url: typeof url === 'string' ? url.replace(/;$/, '') : url,
            enabled: true
          }));
          
          setPlatformLinks(links);
          setSourceData(response.data);
          
          toast.success(`${links.length} liens de plateformes trouvés !`);
        } else {
          toast.info("Aucun lien de plateforme trouvé.");
        }
      } else {
        toast.error(response?.error || "Impossible de récupérer les liens pour cette source.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des liens:", error);
      toast.error("Une erreur est survenue lors de la recherche des liens.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    // Traitement final pour créer le SmartLink
    console.log("Données finales:", data, platformLinks);
    setIsSubmitting(true);
    
    try {
      // Vérification de la présence du nom d'artiste
      if (!data.artistName) {
        toast.error("Le nom d'artiste est requis pour créer le SmartLink.");
        setIsSubmitting(false);
        return;
      }
      
      // Préparation des données pour l'API - CORRIGÉ selon modèle SmartLink.js
      const smartLinkData = {
        // Champs obligatoires pour le backend
        artistName: data.artistName,
        trackTitle: data.trackTitle,
        
        // Métadonnées supportées par le modèle SmartLink
        releaseDate: data.releaseDate || metadata.releaseDate || null,
        coverImageUrl: metadata.artwork || null,
        previewAudioUrl: data.previewAudioUrl || null,
        
        // Liens des plateformes (uniquement ceux activés)
        platformLinks: platformLinks
          .filter(link => link.enabled)
          .map(link => ({
            platform: link.platform,
            url: link.url
          })),
        
        // Outils de tracking (format backend - utilise le nouveau schéma 'analytics')
        analytics: data.analytics,
        
        // Description (pour le backend)
        description: data.description || `SmartLink pour ${data.trackTitle}`,
        
        // Statut de publication
        isPublished: true
      };
      
      console.log("Payload envoyé au backend:", smartLinkData);
      console.log("🔍 DEBUG - Payload complet JSON:", JSON.stringify(smartLinkData, null, 2));
      
      // Appel à l'API pour créer le SmartLink
      toast.info("Création du SmartLink en cours...");
      const response = await apiService.smartlinks.create(smartLinkData);
      
      if (response && response.success) {
        toast.success("SmartLink créé avec succès !");
        
        // Redirection vers le SmartLink public créé pour voir le résultat
        setTimeout(() => {
          if (response.data && response.data.slug && response.data.artistId) {
            console.log("SmartLink créé:", response.data);
            
            // Utiliser le slug de l'artiste depuis la réponse du backend
            const artistSlug = response.data.artistId?.slug;
            const trackSlug = response.data.slug;
            
            if (artistSlug && trackSlug) {
              const smartlinkUrl = `/smartlinks/${artistSlug}/${trackSlug}`;
              console.log("🎯 Redirection vers le SmartLink public:", smartlinkUrl);
              navigate(smartlinkUrl);
            } else {
              console.warn("Informations manquantes pour la redirection:", { artistSlug, trackSlug });
              // Fallback vers la page d'édition du SmartLink
              navigate(`/admin/smartlinks/edit/${response.data._id}`);
            }
          } else {
            console.warn("Données de réponse incomplètes:", response.data);
            navigate('/admin/smartlinks');
          }
        }, 1500);
      } else {
        toast.error(response?.error || "Erreur lors de la création du SmartLink.");
      }
    } catch (error) {
      console.error("Erreur lors de la création du SmartLink:", error);
      toast.error("Une erreur est survenue lors de la création du SmartLink.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSourceSubmit = () => {
    const sourceUrl = getValues('sourceUrl');
    if (!sourceUrl || sourceUrl.trim() === '') {
      toast.warn("Veuillez saisir un code ISRC/UPC ou une URL de plateforme musicale.");
      return;
    }
    
    fetchLinksFromSource(sourceUrl);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Créer un Nouveau SmartLink
        </Typography>
        
        {!sourceData ? (
          // Étape 1: Saisie de la source
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSourceSubmit(); }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="sourceUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ISRC / UPC ou URL Spotify/Apple Music/Deezer"
                      variant="outlined"
                      fullWidth
                      required
                      helperText="Entrez un code ISRC, UPC ou une URL de plateforme musicale"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit" 
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  fullWidth
                >
                  {isLoading ? 'Recherche en cours...' : 'Rechercher les liens'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Étape 2: Page intermédiaire avec toutes les sections
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Section Métadonnées */}
              <Grid item xs={12}>
                <MetadataSection 
                  metadata={metadata} 
                  control={control} 
                  setValue={setValue}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Liens des plateformes */}
              <Grid item xs={12}>
                <PlatformLinksSection 
                  platformLinks={platformLinks} 
                  setPlatformLinks={setPlatformLinks} 
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section UTM */}
              <Grid item xs={12}>
                <UtmSection 
                  control={control} 
                  platformLinks={platformLinks}
                  setPlatformLinks={setPlatformLinks}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Outils de tracking */}
              <Grid item xs={12}>
                <TrackingSection control={control} watch={watch} />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Personnalisation */}
              <Grid item xs={12}>
                <CustomizationSection control={control} />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Prévisualisation */}
              <Grid item xs={12} md={6}>
                <PreviewSection 
                  metadata={metadata}
                  platformLinks={platformLinks}
                  formValues={formValues}
                />
              </Grid>
              
              {/* Boutons d'action */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setSourceData(null)}
                    disabled={isSubmitting}
                  >
                    Retour
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Création en cours...' : 'Créer le SmartLink'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SmartLinkWizard;
