import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { TextField, Button, IconButton, Box, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// Ce composant gère la partie "Liens Sociaux" du formulaire Artiste
// Il utilise useFieldArray de react-hook-form pour gérer un tableau dynamique de champs
const SocialLinksInput = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks"
  });

  return (
    <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Liens Sociaux
      </Typography>
      {fields.map((item, index) => (
        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            {...register(`socialLinks.${index}.platform`)}
            label="Plateforme" // Ex: Spotify, Instagram, Facebook
            variant="outlined"
            size="small"
            error={!!errors.socialLinks?.[index]?.platform}
            helperText={errors.socialLinks?.[index]?.platform?.message}
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <TextField
            {...register(`socialLinks.${index}.url`)}
            label="URL"
            variant="outlined"
            size="small"
            error={!!errors.socialLinks?.[index]?.url}
            helperText={errors.socialLinks?.[index]?.url?.message}
            sx={{ mr: 1, flexGrow: 2 }}
          />
          <IconButton onClick={() => remove(index)} color="error">
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        type="button"
        onClick={() => append({ platform: '', url: '' })}
        startIcon={<AddCircleOutlineIcon />}
        variant="outlined"
        size="small"
      >
        Ajouter un lien social
      </Button>
    </Box>
  );
};

export default SocialLinksInput;

