// src/pages/admin/artists/ArtistCreatePage.jsx
import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import apiService from '@/services/api.service'; // Adaptez le chemin si besoin
// Assurez-vous que ce chemin pointe vers votre artistSchema.js complet
import { artistSchema } from '@/features/admin/artists/schemas/artistSchema.js';

import {
    Box, Typography, Paper, TextField, Button,
    CircularProgress, Alert, IconButton, Grid, FormHelperText
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function ArtistCreatePage({ isInModal = false, onSuccessInModal, onCancelInModal }) {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        register,
        watch,
        reset,
    } = useForm({
        resolver: zodResolver(artistSchema),
        defaultValues: {
            name: '',
            bio: '',
            artistImageUrl: '',
            websiteUrl: '',
            socialLinks: [],
        }
    });

    const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink } = useFieldArray({
        control,
        name: "socialLinks"
    });

    const onSubmit = async (data) => {
        setServerError(null);
        const submissionData = {
            ...data,
            bio: data.bio || undefined,
            artistImageUrl: data.artistImageUrl || undefined,
            websiteUrl: data.websiteUrl || undefined,
            socialLinks: data.socialLinks?.filter(link => link.platform && link.url.trim() !== '') || [],
        };

        try {
            // Utilisation de apiService.artists.createArtist comme dans votre service
            const response = await apiService.artists.createArtist(submissionData);

            // Votre intercepteur Axios retourne response.data (qui contient { success: true/false, data: ..., error: ... })
            if (response && response.success && response.data) {
                const createdArtist = response.data;
                toast.success(`Artiste "${createdArtist.name}" créé avec succès !`);
                if (isInModal && onSuccessInModal) {
                    reset();
                    onSuccessInModal(createdArtist);
                } else if (!isInModal) {
                    navigate('/admin/artists'); // Adaptez la route de redirection si besoin
                }
            } else {
                const errorMsg = response.error || 'Erreur inattendue lors de la création de l\'artiste.';
                if (isInModal) {
                    toast.error(errorMsg);
                } else {
                    setServerError(errorMsg);
                }
                if(!isInModal) toast.error(errorMsg); // Afficher le toast aussi si ce n'est pas dans un modal mais qu'il y a une erreur
            }
        } catch (err) {
            console.error("Erreur API lors de la création de l'artiste:", err);
            const errorMsg = err.message || 'Une erreur serveur est survenue.';
             if (isInModal) {
                toast.error(errorMsg);
            } else {
                setServerError(errorMsg);
            }
            toast.error(errorMsg);
        }
    };

    const formFields = (
        <>
            {serverError && !isInModal && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

            <TextField margin="normal" required fullWidth label="Nom de l'Artiste" autoFocus {...register("name")} error={!!errors.name} helperText={errors.name?.message}/>
            <TextField margin="normal" fullWidth label="Biographie (Optionnel)" multiline rows={3} {...register("bio")} error={!!errors.bio} helperText={errors.bio?.message}/>
            <TextField margin="normal" fullWidth label="URL de l'Image (Optionnel)" type="url" {...register("artistImageUrl")} error={!!errors.artistImageUrl} helperText={errors.artistImageUrl?.message}/>
            {watch('artistImageUrl') && <Box component="img" src={watch('artistImageUrl')} alt="Aperçu" sx={{maxHeight: 100, mt:1, borderRadius:1, display:'block', mx:'auto'}}/>}
            <TextField margin="normal" fullWidth label="Site Web (Optionnel)" type="url" {...register("websiteUrl")} error={!!errors.websiteUrl} helperText={errors.websiteUrl?.message}/>

            <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Liens Sociaux (Optionnel)</Typography>
                {socialLinkFields.map((item, index) => (
                    <Grid container spacing={1.5} key={item.id} sx={{ mb: 2, alignItems: 'flex-start' }}>
                        <Grid item xs={12} sm={5}>
                            <Controller name={`socialLinks.${index}.platform`} control={control} render={({ field }) => (
                                <TextField {...field} label="Plateforme" variant="outlined" fullWidth size="small" error={!!errors.socialLinks?.[index]?.platform} helperText={errors.socialLinks?.[index]?.platform?.message}/>
                            )}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name={`socialLinks.${index}.url`} control={control} render={({ field }) => (
                                <TextField {...field} label="URL du profil" variant="outlined" fullWidth size="small" type="url" error={!!errors.socialLinks?.[index]?.url} helperText={errors.socialLinks?.[index]?.url?.message}/>
                            )}/>
                        </Grid>
                        <Grid item xs={12} sm={1} sx={{ textAlign: {xs: 'right', sm: 'left'}, pt: {xs: 1, sm: 0.5} }}>
                            <IconButton onClick={() => removeSocialLink(index)} color="error" size="small" aria-label="Supprimer lien social">
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button type="button" onClick={() => appendSocialLink({ platform: '', url: '' })} startIcon={<AddCircleOutlineIcon />} variant="outlined" size="small">
                    Ajouter un lien social
                </Button>
                {errors.socialLinks && !Array.isArray(errors.socialLinks) && ( // Erreur générale pour le tableau de liens sociaux
                    <FormHelperText error sx={{mt:1}}>{errors.socialLinks.message || errors.socialLinks.root?.message}</FormHelperText>
                )}
            </Box>
        </>
    );

    if (isInModal) {
        return (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{pt:1}}>
                {formFields}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                    <Button onClick={onCancelInModal} color="inherit" disabled={isSubmitting}>Annuler</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                        {isSubmitting ? 'Création...' : 'Créer et Sélectionner'}
                    </Button>
                </Box>
            </Box>
        );
    }

    // Rendu pour la page autonome
    return (
        <Paper sx={{ p: {xs: 2, md: 3}, maxWidth: '700px', margin: '2rem auto' }}>
            <Typography variant="h5" component="h1" sx={{ mb: 2 }}>Créer un Nouvel Artiste</Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {formFields}
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : "Créer l'Artiste"}
                </Button>
            </Box>
        </Paper>
    );
}

export default ArtistCreatePage;
