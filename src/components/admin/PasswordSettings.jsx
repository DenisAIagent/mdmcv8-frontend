 import React, { useState } from 'react';
  import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress
  } from '@mui/material';
  import {
    Visibility,
    VisibilityOff,
    Lock,
    Security
  } from '@mui/icons-material';
  import apiService from '../../services/api.service';

  const PasswordSettings = () => {
    const [formData, setFormData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    // Validation du mot de passe
    const validatePassword = (password) => {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const errors = [];
      if (password.length < minLength) {
        errors.push(`Au moins ${minLength} caractères`);
      }
      if (!hasUpperCase) {
        errors.push('Au moins 1 majuscule');
      }
      if (!hasLowerCase) {
        errors.push('Au moins 1 minuscule');
      }
      if (!hasNumbers) {
        errors.push('Au moins 1 chiffre');
      }
      if (!hasSpecialChar) {
        errors.push('Au moins 1 caractère spécial');
      }

      return errors;
    };

    // Gestion des changements dans les champs
    const handleChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Clear errors when user types
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }

      // Clear general message
      if (message) {
        setMessage('');
      }
    };

    // Toggle visibility des mots de passe
    const togglePasswordVisibility = (field) => {
      setShowPasswords(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    };

    // Validation du formulaire
    const validateForm = () => {
      const newErrors = {};

      // Vérifier que tous les champs sont remplis
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Le mot de passe actuel est requis';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe est requis';
      } else {
        // Valider le nouveau mot de passe
        const passwordErrors = validatePassword(formData.newPassword);
        if (passwordErrors.length > 0) {
          newErrors.newPassword = `Le mot de passe doit contenir : ${passwordErrors.join(', ')}`;
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Veuillez confirmer le nouveau mot de passe';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }

      // Vérifier que le nouveau mot de passe est différent de l'ancien
      if (formData.currentPassword && formData.newPassword &&
          formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'ancien';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Soumettre le changement de mot de passe
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setMessage('');

      try {
        // Appel à l'API pour changer le mot de passe - Custom domain
        const apiUrl = 'https://api.mdmcmusicads.com/api/v1';
        console.log('🔗 Password Change API URL (HARDCODED):', apiUrl);
        const response = await fetch(`${apiUrl}/auth/updatepassword`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-bypass-token'}`
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });

        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);

        const data = await response.json();
        console.log('🔍 Response data:', data);

        if (response.ok && data.success) {
          setMessage('Mot de passe modifié avec succès !');
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          setMessage(data.error || data.message || `Erreur ${response.status}:
  ${response.statusText}`);
        }
      } catch (error) {
        console.error('🔥 Erreur complète:', error);
        setMessage(`Erreur de connexion: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Calculer la force du mot de passe
    const getPasswordStrength = (password) => {
      if (!password) return { score: 0, label: '', color: 'grey' };

      const errors = validatePassword(password);
      const score = Math.max(0, 5 - errors.length);

      if (score === 5) return { score, label: 'Très fort', color: 'success' };
      if (score === 4) return { score, label: 'Fort', color: 'info' };
      if (score === 3) return { score, label: 'Moyen', color: 'warning' };
      if (score <= 2) return { score, label: 'Faible', color: 'error' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h1">
                Changer le mot de passe
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Pour votre sécurité, choisissez un mot de passe fort et unique.
            </Typography>

            {message && (
              <Alert
                severity={message.includes('succès') ? 'success' : 'error'}
                sx={{ mb: 3 }}
              >
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Mot de passe actuel */}
              <TextField
                fullWidth
                type={showPasswords.current ? 'text' : 'password'}
                label="Mot de passe actuel"
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Nouveau mot de passe */}
              <TextField
                fullWidth
                type={showPasswords.new ? 'text' : 'password'}
                label="Nouveau mot de passe"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Indicateur de force du mot de passe */}
              {formData.newPassword && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="caption" color={`${passwordStrength.color}.main`}>
                    Force du mot de passe : {passwordStrength.label}
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Box
                        key={level}
                        sx={{
                          flex: 1,
                          height: 4,
                          mx: 0.25,
                          backgroundColor: level <= passwordStrength.score
                            ? `${passwordStrength.color}.main`
                            : 'grey.300',
                          borderRadius: 2
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Confirmation du nouveau mot de passe */}
              <TextField
                fullWidth
                type={showPasswords.confirm ? 'text' : 'password'}
                label="Confirmer le nouveau mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Bouton de soumission */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Changement en cours...
                  </Box>
                ) : (
                  'Changer le mot de passe'
                )}
              </Button>
            </Box>

            {/* Conseils de sécurité */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Conseils pour un mot de passe sécurisé :
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Au moins 8 caractères</li>
                <li>Mélange de majuscules et minuscules</li>
                <li>Au moins un chiffre</li>
                <li>Au moins un caractère spécial (!@#$%^&*)</li>
                <li>Évitez les informations personnelles</li>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  export default PasswordSettings;
