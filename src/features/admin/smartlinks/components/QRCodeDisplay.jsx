import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Paper, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

const QRCodeDisplay = ({ smartLinkUrl }) => {
  if (!smartLinkUrl) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(smartLinkUrl)
      .then(() => {
        toast.info('Lien copié dans le presse-papier !');
      })
      .catch((error) => {
        console.error('Erreur lors de la copie du lien:', error);
        toast.error('Impossible de copier le lien. Veuillez le sélectionner manuellement.');
      });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, width: 'fit-content', maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 'medium' }}>
          QR Code du SmartLink
        </Typography>
        
        <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 1, mb: 1 }}>
          <QRCodeSVG 
            value={smartLinkUrl} 
            size={120}
            level="M"
            includeMargin={true}
            imageSettings={{
              src: "/logo-small.png",
              excavate: true,
              height: 24,
              width: 24,
            }}
          />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          mt: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'calc(100% - 30px)'
            }}
          >
            {smartLinkUrl}
          </Typography>
          <Tooltip title="Copier le lien">
            <IconButton 
              size="small" 
              onClick={handleCopyLink}
              sx={{ ml: 'auto' }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default QRCodeDisplay;
