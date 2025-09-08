import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Paper, Grid, CircularProgress } from '@mui/material'; // Ajout de CircularProgress
import { toast } from 'react-toastify'; // Ajout de toast
import { artistSchema } from '../schemas/artistSchema';
import SocialLinksInput from './SocialLinksInput';
import ImageUpload from './ImageUpload';
import apiService from '@/services/api.service'; // Utilisation du vrai service API

const ArtistForm = ({ artistData = null, onFormSubmitSuccess, isInModal = false, onCancelInModal }) => {
  const isEditMode = !!artistData;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: artistData?.name || '',
      bio: artistData?.bio || '',
      artistImageUrl: artistData?.artistImageUrl || '',
      websiteUrl: artistData?.websiteUrl || '',
      socialLinks: artistData?.socialLinks || []
    }
  });

  const handleImageUploadSuccess = (imageUrl) => {
    setValue('artistImageUrl', imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.info("L'image de l'artiste a été mise à jour dans le formulaire.");
  };

  const onSubmit = async (data) => {
    try {
      let response;
      if (isEditMode) {
        response = await apiService.artists.updateArtist(artistData.slug, data);
        toast.success(`Artiste "${data.name}" mis à jour avec succès !`);
      } else {
        response = await apiService.artists.createArtist(data);
        toast.success(`Artiste "${data.name}" créé avec succès !`);
      }

      if (response && response.success && response.data) {
        if (onFormSubmitSuccess) {
          onFormSubmitSuccess(response.data); // Passe les données de l'artiste (créé/mis à jour)
        }
        if (!isEditMode) {
          reset(); // Réinitialise le formulaire uniquement en mode création
        }
      } else {
        // L'erreur devrait être interceptée par api.service.js et toastée globalement
        // Mais on peut ajouter un fallback ici si response.error est présent
        toast.error(response.error || "Une erreur est survenue lors de l'enregistrement de l'artiste.");
      }
    } catch (error) {
      // Erreur interceptée par api.service.js et déjà toastée normalement
      // Ce catch est un fallback au cas où l'erreur ne viendrait pas de l'API ou que l'intercepteur échoue
      console.error("Form submission error in ArtistForm:", error);
      toast.error(error.message || "Une erreur serveur est survenue lors de l'enregistrement de l'artiste.");
    }
  };

  return (
    <Paper elevation={isInModal ? 0 : 3} sx={{ p: isInModal ? 0 : 3, boxShadow: isInModal ? 'none' : undefined }}>
      {!isInModal && (
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
          {isEditMode ? 'Modifier l\'artiste' : 'Ajouter un nouvel artiste'}
        </Typography>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              {...register('name')}
              label="Nom de l'artiste"
              required
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('bio')}
              label="Biographie"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              error={!!errors.bio}
              helperText={errors.bio?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
             <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>Image de l'artiste *</Typography>
             <ImageUpload 
                onUploadSuccess={handleImageUploadSuccess} 
                initialImageUrl={watch('artistImageUrl') || null}
                buttonText="Télécharger l'image"
                apiUploadFunction={apiService.upload.uploadImage}
             />
             <input type="hidden" {...register('artistImageUrl')} />
             {errors.artistImageUrl && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {errors.artistImageUrl.message}
                </Typography>
             )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register('websiteUrl')}
              label="Site Web (Optionnel)"
              fullWidth
              variant="outlined"
              error={!!errors.websiteUrl}
              helperText={errors.websiteUrl?.message}
              sx={{ mt: isInModal ? 0 : 2 }} 
            />
          </Grid>

          <Grid item xs={12}>
            <SocialLinksInput control={control} register={register} errors={errors} />
          </Grid>

          <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: isInModal ? 'flex-end' : 'flex-start', gap: 1 }}>
            {isInModal && (
                <Button onClick={onCancelInModal} variant="outlined" disabled={isSubmitting}>
                    Annuler
                </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Ajouter l\'artiste')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ArtistForm;

