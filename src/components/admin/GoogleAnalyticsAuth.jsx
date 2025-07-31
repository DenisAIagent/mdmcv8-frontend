import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Box, Typography } from '@mui/material';

const CLIENT_ID = '705640041454-j97emr6accija3d94670v3oh5046l39k.apps.googleusercontent.com';

const GoogleAnalyticsAuth = ({ onToken }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
        {!accessToken ? (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              setAccessToken(credentialResponse.credential);
              setError(null);
              if (onToken) onToken(credentialResponse.credential);
            }}
            onError={() => {
              setError('Erreur lors de la connexion Google.');
            }}
            useOneTap
          />
        ) : (
          <Typography variant="body1" color="success.main">
            Connecté à Google Analytics !
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </GoogleOAuthProvider>
  );
};

export default GoogleAnalyticsAuth;
