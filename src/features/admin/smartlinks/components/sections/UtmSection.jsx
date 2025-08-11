import React, { useState } from 'react';
import { Box, Typography, TextField, FormControlLabel, Switch, Grid, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import { Controller } from 'react-hook-form';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const UtmSection = ({ control, platformLinks, setPlatformLinks }) => {
  const [useCustomUtm, setUseCustomUtm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Fonction pour appliquer les UTM globaux à toutes les plateformes
  const applyGlobalUtm = (source, medium, campaign) => {
    if (!useCustomUtm) {
      const updatedLinks = platformLinks.map(link => ({
        ...link,
        utmSource: source,
        utmMedium: medium,
        utmCampaign: campaign
      }));
      setPlatformLinks(updatedLinks);
    }
  };
  
  // Fonction pour mettre à jour les UTM d'une plateforme spécifique
  const updatePlatformUtm = (index, field, value) => {
    const updatedLinks = [...platformLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setPlatformLinks(updatedLinks);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paramètres UTM
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Controller
            name="utmSource"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Source"
                variant="outlined"
                fullWidth
                helperText="ex: wiseband, instagram, newsletter"
                onChange={(e) => {
                  field.onChange(e);
                  applyGlobalUtm(e.target.value, field.value, field.value);
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Controller
            name="utmMedium"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Medium"
                variant="outlined"
                fullWidth
                helperText="ex: smartlink, social, email"
                onChange={(e) => {
                  field.onChange(e);
                  applyGlobalUtm(field.value, e.target.value, field.value);
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Controller
            name="utmCampaign"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Campaign"
                variant="outlined"
                fullWidth
                helperText="ex: nom-artiste-titre"
                onChange={(e) => {
                  field.onChange(e);
                  applyGlobalUtm(field.value, field.value, e.target.value);
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomUtm}
                onChange={(e) => setUseCustomUtm(e.target.checked)}
                color="primary"
              />
            }
            label="Personnaliser les UTM par plateforme"
          />
        </Grid>
        
        {useCustomUtm && (
          <Grid item xs={12}>
            <Accordion
              expanded={expanded}
              onChange={() => setExpanded(!expanded)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>UTM personnalisés par plateforme</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {platformLinks.map((link, index) => (
                  <Box key={`${link.platform}-${index}-utm`} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {link.platform}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Source"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={link.utmSource || ''}
                          onChange={(e) => updatePlatformUtm(index, 'utmSource', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Medium"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={link.utmMedium || ''}
                          onChange={(e) => updatePlatformUtm(index, 'utmMedium', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Campaign"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={link.utmCampaign || ''}
                          onChange={(e) => updatePlatformUtm(index, 'utmCampaign', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Préréglages UTM
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  control.setValue('utmSource', 'wiseband');
                  control.setValue('utmMedium', 'smartlink');
                  control.setValue('utmCampaign', control.getValues('utmCampaign'));
                  applyGlobalUtm('wiseband', 'smartlink', control.getValues('utmCampaign'));
                }}
              >
                Wiseband Standard
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  control.setValue('utmSource', 'instagram');
                  control.setValue('utmMedium', 'social');
                  control.setValue('utmCampaign', control.getValues('utmCampaign'));
                  applyGlobalUtm('instagram', 'social', control.getValues('utmCampaign'));
                }}
              >
                Instagram
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  control.setValue('utmSource', 'facebook');
                  control.setValue('utmMedium', 'social');
                  control.setValue('utmCampaign', control.getValues('utmCampaign'));
                  applyGlobalUtm('facebook', 'social', control.getValues('utmCampaign'));
                }}
              >
                Facebook
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  control.setValue('utmSource', 'newsletter');
                  control.setValue('utmMedium', 'email');
                  control.setValue('utmCampaign', control.getValues('utmCampaign'));
                  applyGlobalUtm('newsletter', 'email', control.getValues('utmCampaign'));
                }}
              >
                Newsletter
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UtmSection;
