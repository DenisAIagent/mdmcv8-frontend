// debug-form-fields.jsx
// Script de debug pour tester les nouveaux champs du formulaire

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  FormControlLabel,
  Switch,
  FormHelperText,
  Grid,
  Typography,
  Paper,
  Box
} from '@mui/material';
import { smartLinkSchema } from './src/features/admin/smartlinks/schemas/smartLinkSchema.js';

const DebugFormFields = () => {
  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(smartLinkSchema),
    defaultValues: {
      customSubtitle: "Choose music service",
      useDescriptionAsSubtitle: false,
      description: ""
    }
  });

  console.log('🐛 Debug Form Fields loaded');
  console.log('🐛 Watch useDescriptionAsSubtitle:', watch("useDescriptionAsSubtitle"));
  console.log('🐛 Watch customSubtitle:', watch("customSubtitle"));

  return (
    <Box p={3}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🐛 Debug - Nouveaux champs SmartLink
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              {...register("description")}
              label="Description (pour test)"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Sous-titre de la page
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="useDescriptionAsSubtitle"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Utiliser la description comme sous-titre"
                />
              )}
            />
            <FormHelperText>
              Si activé, la description sera affichée sous le titre.
            </FormHelperText>
          </Grid>

          {!watch("useDescriptionAsSubtitle") && (
            <Grid item xs={12}>
              <TextField
                {...register("customSubtitle")}
                label="Sous-titre personnalisé (max 40 caractères)"
                fullWidth
                variant="outlined"
                error={!!errors.customSubtitle}
                helperText={errors.customSubtitle?.message || "Ex: 'Découvrez le nouveau single'"}
                inputProps={{ maxLength: 40 }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Debug Info:
              <br />
              • useDescriptionAsSubtitle: {JSON.stringify(watch("useDescriptionAsSubtitle"))}
              <br />
              • customSubtitle: "{watch("customSubtitle")}"
              <br />
              • Erreurs: {JSON.stringify(errors)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DebugFormFields;