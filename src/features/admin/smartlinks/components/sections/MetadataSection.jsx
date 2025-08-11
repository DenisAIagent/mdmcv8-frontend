import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, Card, CardMedia } from '@mui/material';
import { Controller } from 'react-hook-form';
import apiService from '../../../../../services/api.service';
import AudioUpload from '../../../../../components/common/AudioUpload';

const MetadataSection = ({ metadata, control, setValue }) => {
  // Plus besoin de charger les artistes - le nom vient de l'API Odesli

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Métadonnées du morceau
      </Typography>
      
      <Grid container spacing={3}>
        {/* Pochette de l'album */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardMedia
              component="img"
              image={metadata.artwork || `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#E5E7EB"/>
      <rect x="120" y="120" width="60" height="60" fill="#9CA3AF" rx="8"/>
      <text x="150" y="210" font-family="Arial" font-size="16" fill="#6B7280" text-anchor="middle">Pochette</text>
      <text x="150" y="230" font-family="Arial" font-size="14" fill="#6B7280" text-anchor="middle">non disponible</text>
    </svg>
  `)}`}
              alt={metadata.title}
              sx={{ height: 300, objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        {/* Informations du morceau */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="trackTitle"
                control={control}
                rules={{ required: "Le titre est requis" }}
                defaultValue={metadata.title || ""}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Titre du morceau"
                    variant="outlined"
                    fullWidth
                    required
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="artistName"
                control={control}
                rules={{ required: "Le nom d'artiste est requis" }}
                defaultValue={metadata.artist || ""}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Nom de l'artiste"
                    variant="outlined"
                    fullWidth
                    required
                    error={!!error}
                    helperText={error ? error.message : "Nom détecté automatiquement depuis l'API"}
                    value={field.value || metadata.artist || ""}
                    InputProps={{
                      readOnly: !!metadata.artist,
                      startAdornment: metadata.artist && (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          ✅
                        </Box>
                      )
                    }}
                    placeholder="Nom de l'artiste (détecté automatiquement)"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="seo.description"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Meta description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder={`Écouter "${metadata.title || 'ce titre'}" de ${metadata.artist || 'cet artiste'} sur toutes les plateformes de streaming musical.`}
                    error={!!error}
                    helperText={error ? error.message : "Description SEO qui apparaîtra dans les résultats de recherche et partages sociaux (max 160 caractères)"}
                    inputProps={{ maxLength: 160 }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="isrc"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="ISRC"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="label"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Label"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.label || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('label', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="distributor"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Distributeur"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.distributor || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('distributor', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="releaseDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Date de sortie"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.releaseDate || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('releaseDate', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Upload d'extrait audio pour preview */}
            <Grid item xs={12}>
              <Controller
                name="previewAudioUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <AudioUpload
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                    helperText="Ajoutez un extrait audio de 30 secondes maximum pour le bouton play sur la pochette"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetadataSection;
