import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, TextField, Button, Chip, Avatar, Grid, Paper } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// Logos des plateformes
const platformLogos = {
  spotify: 'https://services.linkfire.com/logo_spotify_onlight.svg',
  deezer: 'https://services.linkfire.com/logo_deezer_onlight.svg',
  appleMusic: 'https://services.linkfire.com/logo_applemusic_onlight.svg',
  youtube: 'https://services.linkfire.com/logo_youtube_onlight.svg',
  youtubeMusic: 'https://services.linkfire.com/logo_youtubemusic_onlight.svg',
  amazonMusic: 'https://services.linkfire.com/logo_amazonmusic_onlight.svg',
  tidal: 'https://services.linkfire.com/logo_tidal_onlight.svg',
  soundcloud: 'https://services.linkfire.com/logo_soundcloud_onlight.svg',
  // Ajouter d'autres plateformes au besoin
};

// Fonction pour obtenir le logo d'une plateforme
const getPlatformLogo = (platform) => {
  const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, '');
  
  // Correspondances spécifiques
  const mappings = {
    'spotify': 'spotify',
    'deezer': 'deezer',
    'applemusic': 'appleMusic',
    'apple music': 'appleMusic',
    'youtube': 'youtube',
    'youtubemusic': 'youtubeMusic',
    'youtube music': 'youtubeMusic',
    'amazonmusic': 'amazonMusic',
    'amazon music': 'amazonMusic',
    'tidal': 'tidal',
    'soundcloud': 'soundcloud',
  };
  
  const key = mappings[normalizedPlatform] || normalizedPlatform;
  if (platformLogos[key]) {
    return platformLogos[key];
  }
  
  // Créer un placeholder SVG local
  const fallbackText = platform.substring(0, 2).toUpperCase();
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#6B7280" rx="8"/>
      <text x="20" y="25" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${fallbackText}</text>
    </svg>
  `)}`;
};

const PlatformLinksSection = ({ platformLinks, setPlatformLinks }) => {
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editUrl, setEditUrl] = useState('');
  
  // Fonction pour réorganiser les liens
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(platformLinks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPlatformLinks(items);
  };
  
  // Fonction pour ajouter un nouveau lien
  const handleAddLink = () => {
    if (!newPlatform || !newUrl) return;
    
    setPlatformLinks([
      ...platformLinks,
      {
        platform: newPlatform,
        url: newUrl,
        enabled: true
      }
    ]);
    
    setNewPlatform('');
    setNewUrl('');
  };
  
  // Fonction pour supprimer un lien
  const handleDeleteLink = (index) => {
    const newLinks = [...platformLinks];
    newLinks.splice(index, 1);
    setPlatformLinks(newLinks);
  };
  
  // Fonction pour activer/désactiver un lien
  const handleToggleLink = (index) => {
    const newLinks = [...platformLinks];
    newLinks[index].enabled = !newLinks[index].enabled;
    setPlatformLinks(newLinks);
  };
  
  // Fonction pour éditer un lien
  const handleEditLink = (index) => {
    setEditIndex(index);
    setEditUrl(platformLinks[index].url);
  };
  
  // Fonction pour sauvegarder l'édition
  const handleSaveEdit = (index) => {
    const newLinks = [...platformLinks];
    newLinks[index].url = editUrl;
    setPlatformLinks(newLinks);
    setEditIndex(-1);
  };
  
  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setEditIndex(-1);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Liens des plateformes
      </Typography>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="platformLinks">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ width: '100%', bgcolor: 'background.paper' }}
            >
              {platformLinks.map((link, index) => (
                <Draggable key={`${link.platform}-${index}`} draggableId={`${link.platform}-${index}`} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      elevation={1}
                      sx={{ mb: 2, p: 1, opacity: link.enabled ? 1 : 0.6 }}
                    >
                      <ListItem
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              aria-label="toggle" 
                              onClick={() => handleToggleLink(index)}
                              color={link.enabled ? "primary" : "default"}
                            >
                              {link.enabled ? <CheckIcon /> : <CloseIcon />}
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="edit" 
                              onClick={() => handleEditLink(index)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              onClick={() => handleDeleteLink(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                            <IconButton 
                              {...provided.dragHandleProps}
                              edge="end" 
                              aria-label="drag"
                            >
                              <DragIndicatorIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <Avatar 
                          src={getPlatformLogo(link.platform)} 
                          alt={link.platform}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        />
                        <ListItemText
                          primary={link.platform}
                          secondary={
                            editIndex === index ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  variant="outlined"
                                />
                                <IconButton onClick={() => handleSaveEdit(index)} color="primary">
                                  <CheckIcon />
                                </IconButton>
                                <IconButton onClick={handleCancelEdit}>
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              link.url
                            )
                          }
                        />
                      </ListItem>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Ajouter une plateforme
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Plateforme"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              variant="outlined"
              placeholder="ex: Spotify, Deezer, etc."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              variant="outlined"
              placeholder="https://..."
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddLink}
              disabled={!newPlatform || !newUrl}
              sx={{ height: '100%' }}
            >
              Ajouter
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Plateformes disponibles:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {Object.keys(platformLogos).map((platform) => (
            <Chip
              key={platform}
              avatar={<Avatar src={platformLogos[platform]} />}
              label={platform.charAt(0).toUpperCase() + platform.slice(1).replace(/([A-Z])/g, ' $1').trim()}
              variant="outlined"
              onClick={() => setNewPlatform(platform.charAt(0).toUpperCase() + platform.slice(1).replace(/([A-Z])/g, ' $1').trim())}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PlatformLinksSection;
