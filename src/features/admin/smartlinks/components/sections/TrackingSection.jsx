import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, Paper, Divider } from '@mui/material';
import { Controller } from 'react-hook-form';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BusinessIcon from '@mui/icons-material/Business';
import Tooltip from '@mui/material/Tooltip';

const TrackingSection = ({ control, watch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const trackingMode = watch?.('analytics.customTracking.trackingMode') || 'global';
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuration du tracking
      </Typography>
      
      {/* Section Tracking Personnalisé */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TrackChangesIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            Tracking personnalisé par SmartLink
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="analytics.customTracking.trackingMode"
              control={control}
              defaultValue="global"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Mode de tracking</InputLabel>
                  <Select {...field} label="Mode de tracking">
                    <MenuItem value="global">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Global MDMC</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Utilise les codes tracking MDMC par défaut
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="custom">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Codes personnalisés</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Utilise uniquement vos codes GA4/GTM personnalisés
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="hybrid">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Hybride</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Combine vos codes avec ceux de MDMC
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {(trackingMode === 'custom' || trackingMode === 'hybrid') && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="analytics.customTracking.clientName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom du client"
                      variant="outlined"
                      fullWidth
                      placeholder="Ex: Jiro Records, Universal Music"
                      helperText="Nom affiché dans les données de tracking"
                      InputProps={{
                        startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="analytics.customTracking.campaignName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom de campagne"
                      variant="outlined"
                      fullWidth
                      placeholder="Ex: Album Launch 2025"
                      helperText="Identifiant de la campagne marketing"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Codes de tracking personnalisés
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.ga4Override.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="Activer GA4 personnalisé"
                />
                
                <Controller
                  name="analytics.customTracking.ga4Override.measurementId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Google Analytics 4 (Personnalisé)"
                      variant="outlined"
                      fullWidth
                      placeholder="G-VOTRE-CODE123"
                      helperText="ID de mesure GA4 spécifique à ce SmartLink"
                      disabled={!watch?.('analytics.customTracking.ga4Override.enabled')}
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Code GA4 qui remplacera ou s'ajoutera au code MDMC selon le mode choisi">
                            <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.gtmOverride.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="Activer GTM personnalisé"
                />
                
                <Controller
                  name="analytics.customTracking.gtmOverride.containerId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Google Tag Manager (Personnalisé)"
                      variant="outlined"
                      fullWidth
                      placeholder="GTM-VOTRE-CODE"
                      helperText="ID de conteneur GTM spécifique à ce SmartLink"
                      disabled={!watch?.('analytics.customTracking.gtmOverride.enabled')}
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Code GTM qui remplacera ou s'ajoutera au code MDMC selon le mode choisi">
                            <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.metaPixelOverride.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="Activer Meta Pixel personnalisé"
                />
                
                <Controller
                  name="analytics.customTracking.metaPixelOverride.pixelId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meta Pixel (Personnalisé)"
                      variant="outlined"
                      fullWidth
                      placeholder="VOTRE-PIXEL-ID"
                      helperText="ID du pixel Facebook/Instagram spécifique à ce SmartLink"
                      disabled={!watch?.('analytics.customTracking.metaPixelOverride.enabled')}
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Pixel Meta qui remplacera ou s'ajoutera au pixel MDMC selon le mode choisi">
                            <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.tiktokPixelOverride.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="Activer TikTok Pixel personnalisé"
                />
                
                <Controller
                  name="analytics.customTracking.tiktokPixelOverride.pixelId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="TikTok Pixel (Personnalisé)"
                      variant="outlined"
                      fullWidth
                      placeholder="VOTRE-TIKTOK-PIXEL"
                      helperText="ID du pixel TikTok spécifique à ce SmartLink"
                      disabled={!watch?.('analytics.customTracking.tiktokPixelOverride.enabled')}
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Pixel TikTok qui remplacera ou s'ajoutera au pixel MDMC selon le mode choisi">
                            <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Section Tracking Global (pour référence) */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Tracking global et pixels marketing
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="gaId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Google Analytics 4"
                variant="outlined"
                fullWidth
                placeholder="G-XXXXXXXXXX"
                helperText="ID de mesure GA4"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de mesure Google Analytics 4 pour suivre les visites et les interactions sur votre SmartLink">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="gtmId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Google Tag Manager"
                variant="outlined"
                fullWidth
                placeholder="GTM-XXXXXXX"
                helperText="ID de conteneur GTM"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de conteneur Google Tag Manager pour gérer tous vos tags marketing et analytics">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="adsId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Google Ads"
                variant="outlined"
                fullWidth
                placeholder="AW-XXXXXXXXXX"
                helperText="ID de conversion Google Ads"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de conversion Google Ads pour suivre les conversions de vos campagnes publicitaires">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="metaPixelId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Meta Pixel"
                variant="outlined"
                fullWidth
                placeholder="XXXXXXXXXX"
                helperText="ID du pixel Facebook/Instagram"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de pixel Meta pour suivre les conversions de vos campagnes Facebook et Instagram">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="tiktokPixelId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="TikTok Pixel"
                variant="outlined"
                fullWidth
                placeholder="XXXXXXXXXX"
                helperText="ID du pixel TikTok"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de pixel TikTok pour suivre les conversions de vos campagnes TikTok">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                color="primary"
              />
            }
            label="Options avancées"
          />
        </Grid>
        
        {showAdvanced && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Configuration avancée des événements</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="gaEventCategory"
                      control={control}
                      defaultValue="SmartLink"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Catégorie d'événement GA"
                          variant="outlined"
                          fullWidth
                          size="small"
                          helperText="Catégorie d'événement pour Google Analytics"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="gaEventAction"
                      control={control}
                      defaultValue="click"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Action d'événement GA"
                          variant="outlined"
                          fullWidth
                          size="small"
                          helperText="Action d'événement pour Google Analytics"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="fbEventName"
                      control={control}
                      defaultValue="ViewContent"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nom d'événement Meta"
                          variant="outlined"
                          fullWidth
                          size="small"
                          helperText="Nom d'événement pour Meta Pixel"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="customTrackingCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Code de tracking personnalisé"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          helperText="Code JavaScript personnalisé pour le tracking (sera exécuté lors du chargement de la page)"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TrackingSection;
