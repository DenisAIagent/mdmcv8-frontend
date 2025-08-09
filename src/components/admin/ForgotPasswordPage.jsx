import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import '../../assets/styles/admin-login.css'; // Re-using the login page styles

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiService.auth.forgotPassword(email);
      setMessage(t('admin.forgot_password_success', 'Si un compte correspondant à cet email existe, un lien de réinitialisation a été envoyé.'));
    } catch (err) {
      // Even on error, we might not want to reveal if an email exists or not
      // For better security, we can show the same message.
      // However, for debugging/internal tool, showing an error might be fine.
      setError(err.message || t('admin.forgot_password_error', 'Une erreur est survenue.'));
      // For better security, you might want to always show the success message.
      // setMessage(t('admin.forgot_password_success', 'Si un compte correspondant à cet email existe, un lien de réinitialisation a été envoyé.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>{t('admin.forgot_password_title', 'Mot de passe oublié')}</h1>
          <p>{t('admin.forgot_password_subtitle', 'Entrez votre email pour recevoir un lien de réinitialisation.')}</p>
        </div>

        {message && <div className="admin-login-success" style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="admin-login-error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">{t('admin.email_label', 'Adresse Email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`admin-login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? t('admin.sending', 'Envoi en cours...') : t('admin.send_reset_link', 'Envoyer le lien')}
            </button>
          </form>
        )}

        <div className="admin-login-footer">
          <Link to="/admin/login">{t('admin.back_to_login', 'Retour à la connexion')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
