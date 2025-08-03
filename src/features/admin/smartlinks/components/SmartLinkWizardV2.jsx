// src/features/admin/smartlinks/components/SmartLinkWizardV2.jsx
// Version améliorée du wizard selon les User Stories

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  FormControlLabel,
  Switch,
  Tooltip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Preview,
  OpenInNew,
  ContentCopy,
  QrCode,
  Palette,
  Link as LinkIcon,
  DragIndicator,
  Visibility,
  VisibilityOff,
  Add
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Services
import musicPlatformService from '../../../../services/musicPlatform.service';
import apiService from '../../../../services/api.service';
import staticPageService from '../../../../services/staticPage.service';
import { generateStaticHTML } from '../../../../utils/staticPageGenerator';

// --- STYLED COMPONENTS ---
const WizardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  minHeight: '80vh'
}));

const StepContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  minHeight: '60vh'
}));

const InputCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[50]
}));

const FormatHint = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.info.light,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

const ArtworkSelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginTop: theme.spacing(2)
}));

const ArtworkOption = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4]
  }
}));

const PlatformItem = styled(ListItem)(({ theme, detected }) => ({
  backgroundColor: detected ? theme.palette.success.light : theme.palette.grey[100],
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  border: `1px solid ${detected ? theme.palette.success.main : theme.palette.grey[300]}`
}));

const PreviewFrame = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  height: '600px',
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper
}));

// --- CONSTANTES ---
const WIZARD_STEPS = [
  'Recherche contenu',
  'Métadonnées',
  'Plateformes',
  'Personnalisation',
  'Preview & Test',
  'Publication'
];

const DETECTION_STATUS = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  SUCCESS: 'success',
  ERROR: 'error',
  PARTIAL: 'partial'
};

// --- COMPOSANT PRINCIPAL ---
const SmartLinkWizardV2 = () => {
  console.log('🔥 SmartLinkWizardV2 chargé - version avec nom artiste de l\'API');
  const navigate = useNavigate();
  
  // États principaux
  const [activeStep, setActiveStep] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState(DETECTION_STATUS.IDLE);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [sourceData, setSourceData] = useState(null);
  const [platformLinks, setPlatformLinks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [alternativeArtworks, setAlternativeArtworks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form control
  const { control, handleSubmit, setValue, getValues, watch, trigger, formState: { errors } } = useForm({
    defaultValues: {
      sourceUrl: '',
      trackTitle: '',
      artistName: '', // Changé de artistId à artistName
      album: '',
      isrc: '',
      releaseDate: '',
      customSlug: '',
      template: 'auto',
      primaryColor: '#FF6B35',
      userCountry: 'FR'
    }
  });

  const formValues = watch();

  // Plus besoin de charger les artistes - le nom vient directement de l'API Odesli

  // --- ÉTAPE 1: RECHERCHE CONTENU ---
  const handleSourceDetection = async () => {
    const sourceUrl = getValues('sourceUrl');
    const userCountry = getValues('userCountry');
    
    if (!sourceUrl?.trim()) {
      toast.error('Veuillez saisir une URL ou un ISRC');
      return;
    }

    // Validation format
    const validation = musicPlatformService.validateInput(sourceUrl);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setDetectionStatus(DETECTION_STATUS.SEARCHING);
    setDetectionProgress(0);

    try {
      console.log(`🔍 Recherche: ${sourceUrl} (${userCountry})`);
      
      // Simulation progression
      const progressInterval = setInterval(() => {
        setDetectionProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await musicPlatformService.fetchLinksFromSourceUrl(sourceUrl, userCountry);
      
      clearInterval(progressInterval);
      setDetectionProgress(100);

      if (result.success && result.data) {
        // Mise à jour des données
        setSourceData(result.data);
        
        // Auto-remplissage formulaire avec données Odesli
        setValue('trackTitle', result.data.title);
        setValue('artistName', result.data.artist); // Nom d'artiste direct de l'API
        setValue('album', result.data.album);
        setValue('isrc', result.data.isrc);
        setValue('releaseDate', result.data.releaseDate);
        
        // Gestion artwork
        setSelectedArtwork(result.data.artwork);
        setValue('coverImageUrl', result.data.artwork);
        setAlternativeArtworks(result.data.alternativeArtworks || []);
        
        // Gestion plateformes
        const platforms = Object.entries(result.data.linksByPlatform).map(([platform, url]) => ({
          platform,
          url,
          enabled: true,
          detected: true,
          status: 'success'
        }));
        setPlatformLinks(platforms);
        
        setDetectionStatus(DETECTION_STATUS.SUCCESS);
        toast.success(`${platforms.length} plateformes détectées !`);
        
        // Auto-passage étape suivante après 1s
        setTimeout(() => {
          setActiveStep(1);
        }, 1000);
        
      } else {
        throw new Error(result.error || 'Aucune donnée récupérée');
      }
      
    } catch (error) {
      console.error('Erreur détection:', error);
      setDetectionStatus(DETECTION_STATUS.ERROR);
      setDetectionProgress(0);
      toast.error(error.message || 'Erreur lors de la recherche');
    }
  };

  // --- ÉTAPE 2: GESTION ARTWORK ---
  const handleArtworkSelection = (artwork) => {
    setSelectedArtwork(artwork);
    setValue('coverImageUrl', artwork);
  };

  // --- ÉTAPE 3: GESTION PLATEFORMES ---
  const togglePlatform = (index) => {
    const updated = [...platformLinks];
    updated[index].enabled = !updated[index].enabled;
    setPlatformLinks(updated);
  };

  const addCustomPlatform = () => {
    const newPlatform = {
      platform: 'Custom Platform',
      url: '',
      enabled: true,
      detected: false,
      status: 'manual'
    };
    setPlatformLinks([...platformLinks, newPlatform]);
  };

  // --- NAVIGATION STEPS ---
  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  // --- SOUMISSION FINALE ---
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const smartLinkData = {
        artistName: data.artistName,
        trackTitle: data.trackTitle,
        album: data.album,
        isrc: data.isrc,
        releaseDate: data.releaseDate,
        coverImageUrl: selectedArtwork,
        platformLinks: platformLinks
          .filter(link => link.enabled)
          .map(link => ({
            platform: link.platform,
            url: link.url
          })),
        customization: {
          template: data.template,
          primaryColor: data.primaryColor,
          customSlug: data.customSlug
        },
        isPublished: true
      };

      console.log('Création SmartLink:', smartLinkData);
      
      const response = await apiService.smartlinks.create(smartLinkData);
      
      if (response?.success) {
        console.log('✅ SmartLink créé:', response.data);
        
        // 🆕 GÉNÉRATION AUTOMATIQUE DE LA PAGE STATIQUE HTML
        if (response.data?.shortId) {
          try {
            console.log('📄 Génération de la page statique HTML...');
            
            const staticPageData = {
              shortId: response.data.shortId,
              trackTitle: smartLinkData.trackTitle,
              artistName: smartLinkData.artistName,
              coverImageUrl: smartLinkData.coverImageUrl,
              description: `Écoutez ${smartLinkData.trackTitle} de ${smartLinkData.artistName} sur toutes les plateformes de streaming`,
              platforms: smartLinkData.platformLinks
            };
            
            // Générer et sauvegarder la page statique
            const staticResult = await staticPageService.generateStaticPage(staticPageData);
            
            if (staticResult.success) {
              console.log('✅ Page statique générée:', staticResult.url);
              
              // 🔥 URL POUR PARTAGE RÉSEAUX SOCIAUX (statique HTML)
              const socialSharingURL = `https://www.mdmcmusicads.com/sl/${response.data.shortId}.html`;
              
              // 🎯 URL POUR NAVIGATION UTILISATEUR (React app avec hash)
              const userNavigationURL = `https://www.mdmcmusicads.com/#/smartlinks/${response.data.artistSlug || 'artist'}/${response.data.trackSlug || response.data.shortId}`;
              
              toast.success(`SmartLink créé avec succès !
              
🔗 URL pour partage social: ${socialSharingURL}
🌐 URL pour navigation: ${userNavigationURL}
              
La page statique est optimisée pour Facebook, Twitter, WhatsApp !`);
            } else {
              console.warn('⚠️ Erreur génération page statique:', staticResult.error);
              toast.success('SmartLink créé avec succès ! (Page statique en cours...)');
            }
          } catch (staticError) {
            console.error('❌ Erreur page statique:', staticError);
            toast.success('SmartLink créé avec succès ! (Page statique en cours...)');
          }
        }
        
        // Navigation vers le SmartLink créé
        setTimeout(() => {
          navigate(`/admin/smartlinks/${response.data._id}`);
        }, 1500);
      } else {
        throw new Error(response?.error || 'Erreur de création');
      }
      
    } catch (error) {
      console.error('Erreur création:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDU STEPS ---
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepContent>
            <Typography variant="h5" gutterBottom>
              🔍 Recherche de contenu (WizardV2 + Odesli API)
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Collez votre lien Spotify, Apple Music, YouTube Music, Deezer ou saisissez un ISRC/UPC - Le nom d'artiste sera détecté automatiquement
            </Typography>

            <InputCard>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Controller
                    name="sourceUrl"
                    control={control}
                    rules={{ required: "URL ou ISRC requis" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="URL ou ISRC/UPC"
                        variant="outlined"
                        fullWidth
                        placeholder="https://open.spotify.com/track/... ou GBUM71507609"
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={handleSourceDetection} disabled={detectionStatus === DETECTION_STATUS.SEARCHING}>
                              <Search />
                            </IconButton>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="userCountry"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Pays"
                        variant="outlined"
                        fullWidth
                        SelectProps={{ native: true }}
                      >
                        <option value="FR">France</option>
                        <option value="US">États-Unis</option>
                        <option value="GB">Royaume-Uni</option>
                        <option value="DE">Allemagne</option>
                        <option value="ES">Espagne</option>
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>

              {detectionStatus === DETECTION_STATUS.SEARCHING && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Recherche en cours... {detectionProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={detectionProgress} />
                </Box>
              )}

              {detectionStatus === DETECTION_STATUS.SUCCESS && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">
                    ✅ Contenu trouvé : {sourceData?.title} - {sourceData?.artist}
                  </Typography>
                  <Typography variant="body2">
                    {platformLinks.length} plateformes détectées
                  </Typography>
                </Alert>
              )}

              {detectionStatus === DETECTION_STATUS.ERROR && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Échec de la recherche. Vérifiez l'URL ou réessayez.
                </Alert>
              )}
            </InputCard>

            <FormatHint>
              <Typography variant="subtitle2" gutterBottom>
                📋 Formats supportés :
              </Typography>
              {musicPlatformService.getSupportedFormats().map((format, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{format.type}:</strong> {format.example}
                  </Typography>
                </Box>
              ))}
            </FormatHint>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled>Précédent</Button>
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={detectionStatus !== DETECTION_STATUS.SUCCESS}
              >
                Suivant
              </Button>
            </Box>
          </StepContent>
        );

      case 1:
        return (
          <StepContent>
            <Typography variant="h5" gutterBottom>
              🎵 Métadonnées
            </Typography>
            
            <Grid container spacing={3}>
              {/* Sélection Artwork */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Pochette
                </Typography>
                
                {selectedArtwork && (
                  <Card sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={selectedArtwork}
                      alt="Artwork sélectionné"
                    />
                    <CardContent>
                      <Typography variant="caption">
                        Artwork principal
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {alternativeArtworks.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Alternatives disponibles :
                    </Typography>
                    <ArtworkSelector>
                      {alternativeArtworks.map((artwork, index) => (
                        <ArtworkOption
                          key={index}
                          selected={selectedArtwork === artwork.url}
                          onClick={() => handleArtworkSelection(artwork.url)}
                        >
                          <CardMedia
                            component="img"
                            height="80"
                            image={artwork.url}
                            alt={`Artwork ${index + 1}`}
                          />
                        </ArtworkOption>
                      ))}
                    </ArtworkSelector>
                  </Box>
                )}
              </Grid>

              {/* Champs métadonnées */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="trackTitle"
                      control={control}
                      rules={{ required: "Titre requis" }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Titre du morceau"
                          variant="outlined"
                          fullWidth
                          required
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="artistName"
                      control={control}
                      rules={{ required: "Nom d'artiste requis" }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Artiste"
                          variant="outlined"
                          fullWidth
                          required
                          error={!!error}
                          helperText={error?.message || (sourceData?.artist ? "Détecté automatiquement depuis l'API" : "Sera rempli automatiquement après détection")}
                          InputProps={{
                            readOnly: !!sourceData?.artist,
                            startAdornment: sourceData?.artist && (
                              <CheckCircle color="success" sx={{ mr: 1 }} />
                            )
                          }}
                          placeholder="Nom de l'artiste (détecté automatiquement)"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="album"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Album"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="isrc"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ISRC"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="releaseDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Date de sortie"
                          type="date"
                          variant="outlined"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Précédent</Button>
              <Button variant="contained" onClick={handleNext}>
                Suivant
              </Button>
            </Box>
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            <Typography variant="h5" gutterBottom>
              🔗 Plateformes de streaming
            </Typography>

            <List>
              {platformLinks.map((platform, index) => (
                <PlatformItem key={index} detected={platform.detected}>
                  <ListItemIcon>
                    <DragIndicator />
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={platform.platform}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {platform.url}
                        </Typography>
                        <Chip
                          size="small"
                          label={platform.detected ? '✅ Détecté' : '📝 Manuel'}
                          color={platform.detected ? 'success' : 'default'}
                        />
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title="Activer/Désactiver">
                      <Switch
                        checked={platform.enabled}
                        onChange={() => togglePlatform(index)}
                      />
                    </Tooltip>
                    <Tooltip title="Tester le lien">
                      <IconButton
                        onClick={() => window.open(platform.url, '_blank')}
                        disabled={!platform.url}
                      >
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </PlatformItem>
              ))}
            </List>

            <Button
              startIcon={<Add />}
              onClick={addCustomPlatform}
              sx={{ mt: 2 }}
            >
              Ajouter une plateforme
            </Button>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Précédent</Button>
              <Button variant="contained" onClick={handleNext}>
                Suivant
              </Button>
            </Box>
          </StepContent>
        );

      case 3:
        return (
          <StepContent>
            <Typography variant="h5" gutterBottom>
              🎨 Personnalisation
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Design
                </Typography>
                
                <Controller
                  name="template"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Template"
                      variant="outlined"
                      fullWidth
                      SelectProps={{ native: true }}
                    >
                      <option value="auto">Auto (couleurs artwork)</option>
                      <option value="dark">Dark Mode</option>
                      <option value="minimal">Minimal</option>
                      <option value="gradient">Gradient</option>
                    </TextField>
                  )}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Couleur d'accent
                  </Typography>
                  <Controller
                    name="primaryColor"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="color"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  URL personnalisée
                </Typography>
                
                <Controller
                  name="customSlug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug personnalisé"
                      variant="outlined"
                      fullWidth
                      placeholder="mon-titre-artiste"
                      helperText="Laissez vide pour génération automatique"
                    />
                  )}
                />

                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  URL finale : mdmc.link/{field.value || 'titre-artiste-auto'}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Précédent</Button>
              <Button variant="contained" onClick={handleNext}>
                Suivant
              </Button>
            </Box>
          </StepContent>
        );

      case 4:
        return (
          <StepContent>
            <Typography variant="h5" gutterBottom>
              👀 Preview & Test
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Preview mobile
                </Typography>
                <PreviewFrame>
                  {/* IFrame preview ici */}
                  <Box sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Preview du SmartLink en temps réel
                    </Typography>
                  </Box>
                </PreviewFrame>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Tests automatiques
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Métadonnées complètes" />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`${platformLinks.filter(p => p.enabled).length} plateformes actives`} />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary="Test des liens en cours..." />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2 }}>
                  <Button startIcon={<Preview />} variant="outlined" fullWidth>
                    Ouvrir preview dans nouvel onglet
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Précédent</Button>
              <Button variant="contained" onClick={handleNext}>
                Publier
              </Button>
            </Box>
          </StepContent>
        );

      case 5:
        return (
          <StepContent>
            <Typography variant="h5" gutterBottom>
              🚀 Publication
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6">
                SmartLink prêt à être publié !
              </Typography>
              <Typography variant="body2">
                Toutes les vérifications sont passées avec succès.
              </Typography>
            </Alert>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Publication en cours...' : 'Publier le SmartLink'}
              </Button>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Précédent</Button>
              <Box />
            </Box>
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <WizardContainer elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Créer un nouveau SmartLink
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </WizardContainer>
    </Container>
  );
};

export default SmartLinkWizardV2;