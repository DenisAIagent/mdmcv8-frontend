import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, LinearProgress, Alert } from '@mui/material';
import { CloudUpload, Delete, Image, CheckCircle } from '@mui/icons-material';

const ImageUpload = ({ onUploadSuccess, maxFiles = 5, uploadUrl = '/api/upload' }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'selected'
    }));
    
    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(updatedFiles);
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploading(true);
      setError(null);
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const imageUrl = result.url || result.imageUrl || result.path;

      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploaded', url: imageUrl } : f
      ));

      onUploadSuccess && onUploadSuccess(imageUrl);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'error' } : f
      ));
    } finally {
      setUploading(false);
    }
  };

  const uploadAllFiles = async () => {
    const filesToUpload = files.filter(f => f.status === 'selected');
    
    for (const file of filesToUpload) {
      await uploadFile(file);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: '#fafafa',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50'
          }
        }}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Sélectionner des images
        </Typography>
        
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload"
          disabled={uploading}
        />
        
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            Choisir des images
          </Button>
        </label>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Images uniquement - Max {maxFiles} fichiers
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Erreur d'upload: {error}
        </Alert>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Images sélectionnées ({files.length})
            </Typography>
            
            {files.some(f => f.status === 'selected') && (
              <Button
                variant="outlined"
                onClick={uploadAllFiles}
                disabled={uploading}
                startIcon={<CloudUpload />}
                size="small"
              >
                Uploader tout
              </Button>
            )}
          </Box>
          
          {uploading && <LinearProgress sx={{ mb: 2 }} />}
          
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {file.status === 'selected' && (
                      <Button
                        size="small"
                        onClick={() => uploadFile(file)}
                        disabled={uploading}
                      >
                        Upload
                      </Button>
                    )}
                    
                    {file.status === 'uploaded' && (
                      <CheckCircle color="success" />
                    )}
                    
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(file.id)}
                      color="error"
                      disabled={uploading && file.status === 'uploading'}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <Image 
                  sx={{ 
                    mr: 2, 
                    color: file.status === 'uploaded' ? 'success.main' : 
                           file.status === 'error' ? 'error.main' : 'primary.main' 
                  }} 
                />
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Box>
                      <Typography variant="caption">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      {file.status === 'uploading' && (
                        <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                          Upload en cours...
                        </Typography>
                      )}
                      {file.status === 'uploaded' && (
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          Uploadé ✓
                        </Typography>
                      )}
                      {file.status === 'error' && (
                        <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                          Erreur ✗
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
