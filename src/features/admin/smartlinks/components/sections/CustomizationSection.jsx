import React from 'react';
import { Box, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';

const CustomizationSection = ({ control }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Personnalisation
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="template"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Template</InputLabel>
                <Select
                  {...field}
                  label="Template"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="vibrant">Vibrant</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                  <MenuItem value="gradient">Gradient</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="primaryColor"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Couleur principale"
                variant="outlined"
                fullWidth
                type="color"
                InputProps={{
                  inputProps: {
                    style: { height: 40, cursor: 'pointer' }
                  }
                }}
              />
            )}
          />
        </Grid>
        
        {/* Suppression du champ ctaText puisque nous n'affichons plus de texte sur les boutons */}
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Options avancées
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="secondaryColor"
                control={control}
                defaultValue="#333333"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Couleur secondaire"
                    variant="outlined"
                    fullWidth
                    type="color"
                    InputProps={{
                      inputProps: {
                        style: { height: 40, cursor: 'pointer' }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="backgroundColor"
                control={control}
                defaultValue="#FFFFFF"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Couleur d'arrière-plan"
                    variant="outlined"
                    fullWidth
                    type="color"
                    InputProps={{
                      inputProps: {
                        style: { height: 40, cursor: 'pointer' }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="customCss"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CSS personnalisé"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder=".smartlink-container { ... }"
                    helperText="CSS personnalisé pour les utilisateurs avancés"
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

export default CustomizationSection;
