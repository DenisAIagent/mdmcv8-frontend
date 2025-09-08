import React from 'react';
import { TextField, Box, Typography, Grid } from '@mui/material';

// Ce composant gère la partie "IDs de Suivi" du formulaire Smartlink
const TrackingIdsInput = ({ register, errors }) => {
  return (
    <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        IDs de Suivi (Optionnel)
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('trackingIds.ga4Id')}
            label="Google Analytics 4 ID (GA4)"
            fullWidth
            variant="outlined"
            size="small"
            error={!!errors.trackingIds?.ga4Id}
            helperText={errors.trackingIds?.ga4Id?.message || 'Ex: G-XXXXXXXXXX'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('trackingIds.gtmId')}
            label="Google Tag Manager ID (GTM)"
            fullWidth
            variant="outlined"
            size="small"
            error={!!errors.trackingIds?.gtmId}
            helperText={errors.trackingIds?.gtmId?.message || 'Ex: GTM-XXXXXXX'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('trackingIds.metaPixelId')}
            label="Meta Pixel ID (Facebook)"
            fullWidth
            variant="outlined"
            size="small"
            error={!!errors.trackingIds?.metaPixelId}
            helperText={errors.trackingIds?.metaPixelId?.message || 'Ex: 1234567890123456'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('trackingIds.tiktokPixelId')}
            label="TikTok Pixel ID"
            fullWidth
            variant="outlined"
            size="small"
            error={!!errors.trackingIds?.tiktokPixelId}
            helperText={errors.trackingIds?.tiktokPixelId?.message || 'Ex: CXXXXXXXXXXXXXXX'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('trackingIds.googleAdsId')}
            label="Google Ads Tag ID"
            fullWidth
            variant="outlined"
            size="small"
            error={!!errors.trackingIds?.googleAdsId}
            helperText={errors.trackingIds?.googleAdsId?.message || 'Ex: AW-XXXXXXXXXX'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrackingIdsInput;

