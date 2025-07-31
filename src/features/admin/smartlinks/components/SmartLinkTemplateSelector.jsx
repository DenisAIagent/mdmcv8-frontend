import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const SmartLinkTemplateSelector = ({ selectedTemplate, onTemplateChange, error, helperText, disabled }) => {
  const templates = [
    { value: 'music', label: 'SmartLink Musique (pour single/album)' },
    { value: 'landing_page', label: 'Page de Destination Personnalisée' },
    // { value: 'podcast', label: 'Podcast' }, // Exemple pour plus tard
    // { value: 'event', label: 'Événement' }, // Exemple pour plus tard
  ];

  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      <InputLabel id="smartlink-template-select-label">Type de SmartLink *</InputLabel>
      <Select
        labelId="smartlink-template-select-label"
        label="Type de SmartLink *"
        value={selectedTemplate}
        onChange={(e) => onTemplateChange(e.target.value)}
      >
        <MenuItem value="" disabled>
          <em>Sélectionnez un type de page...</em>
        </MenuItem>
        {templates.map((template) => (
          <MenuItem key={template.value} value={template.value}>
            {template.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SmartLinkTemplateSelector;

