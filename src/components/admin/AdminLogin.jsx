// src/components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api.service'; // Assure-toi que ce chemin est correct
import '../../assets/styles/admin-login.css'; // Garde ton chemin de style s'il existe et est utilisé

// Importations MUI si tu veux l'utiliser (optionnel, basé sur mes suggestions précédentes)
// import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // Pour obtenir l'URL d'où l'utilisateur vient (si redirigé)

  // Utiliser 'email' pour correspondre à ce que le backend attend (authController.js)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Pour afficher les messages d'erreur du login
  const [loading, setLoading] = useState(false); // Pour l'état de chargement du bouton

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page par le formulaire
    setLoading(true); // Active l'indicateur de chargement
    setError(''); // Réinitialise les erreurs précédentes

    try {
      // Appel de la fonction login de notre service API.
      // apiService.auth.login s'attend à un objet { email, password }.
      // Il utilise l'instance Axios configurée (avec withCredentials: true).
      // Si le login réussit, le backend aura défini le cookie HttpOnly.
      console.log('AdminLogin: Tentative de connexion avec email:', email); // Log de debug
      const response = await apiService.auth.login({ email, password });

      console.log('AdminLogin: Réponse du login reçue:', response); // Log de debug

      // Si nous arrivons ici sans erreur, le login a réussi du point de vue de l'API.
      // L'intercepteur d'erreurs dans api.service.js aurait lancé une exception en cas d'échec.
      // Le cookie est maintenant (normalement) positionné par le navigateur.

      // Rediriger vers le tableau de bord admin ou la page précédente d'où l'utilisateur a été redirigé.
      const from = location.state?.from?.pathname || '/admin/dashboard';
      console.log('AdminLogin: Connexion réussie. Redirection vers:', from); // Log de debug
      navigate(from, { replace: true }); // 'replace: true' évite que la page de login soit dans l'historique

      // Pas besoin de setLoading(false) ici car la page change via la navigation.
    } catch (err) {
      // L'erreur a déjà été traitée et structurée par l'intercepteur d'api.service.js.
      console.error("AdminLogin: Échec de la connexion - Erreur capturée:", err.status, err.message, err.data);
      setError(err.message || t('admin.login_error_network', 'Erreur de connexion. Veuillez vérifier vos identifiants ou réessayer.'));
      setLoading(false); // Désactive l'indicateur de chargement en cas d'erreur
    }
  };

  // Le JSX ci-dessous reprend la structure de ton AdminLogin.jsx original.
  // Adapte-le si tu as utilisé MUI ou une autre librairie UI.
  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>{t('admin.login', 'Connexion Administrateur')}</h1>
          <p>{t('admin.login_subtitle', 'Accédez à votre panneau de contrôle.')}</p>
        </div>

        {error && <div className="admin-login-error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">{t('admin.email_label', 'Adresse Email')}</label>
            <input
              type="email" // type="email" pour la validation HTML5
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading} // Désactive le champ pendant le chargement
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('admin.password_label', 'Mot de Passe')}</label> {/* Clé de traduction suggérée */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading} // Désactive le champ pendant le chargement
            />
          </div>

          <button
            type="submit"
            className={`admin-login-button ${loading ? 'loading' : ''}`} // Style pour l'état de chargement
            disabled={loading} // Désactive le bouton pendant le chargement
          >
            {loading ? t('admin.logging_in', 'Connexion en cours...') : t('admin.login_button', 'Se Connecter')}
          </button>
        </form>

        <div className="admin-login-footer">
          {/* Lien pour retourner à la page d'accueil publique */}
          <a href="/">{t('footer.nav_home', "Retour à l'accueil")}</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
