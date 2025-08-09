import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import '../../assets/styles/admin-login.css'; // Re-using the login page styles

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { resettoken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError(t('admin.passwords_do_not_match', 'Les mots de passe ne correspondent pas.'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('admin.password_too_short', 'Le mot de passe doit contenir au moins 6 caractères.'));
      setLoading(false);
      return;
    }

    try {
      await apiService.auth.resetPassword(resettoken, password);
      setMessage(t('admin.reset_password_success', 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'));

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);

    } catch (err) {
      setError(err.message || t('admin.reset_password_error', 'Une erreur est survenue. Le lien est peut-être invalide ou a expiré.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>{t('admin.reset_password_title', 'Réinitialiser le mot de passe')}</h1>
        </div>

        {message && <div className="admin-login-success" style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="admin-login-error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="password">{t('admin.new_password_label', 'Nouveau mot de passe')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('admin.confirm_password_label', 'Confirmer le mot de passe')}</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`admin-login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? t('admin.resetting_password', 'Réinitialisation en cours...') : t('admin.reset_password_button', 'Réinitialiser le mot de passe')}
            </button>
          </form>
        )}

        {message && (
            <div className="admin-login-footer">
                <Link to="/admin/login">{t('admin.go_to_login', 'Aller à la page de connexion')}</Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
