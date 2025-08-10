import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api.service';
import '../../assets/styles/admin-login.css'; // Re-using the login page styles

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { resettoken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Support token via query ?token=
  const queryToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token');
  }, [location.search]);

  const effectiveToken = queryToken || resettoken;

  // Valider le token au chargement
  useEffect(() => {
    let isMounted = true;
    const validate = async () => {
      if (!effectiveToken) {
        if (isMounted) setTokenValid(false);
        return;
      }
      try {
        const res = await apiService.auth.validateResetToken(effectiveToken);
        if (isMounted) setTokenValid(res?.success !== false);
      } catch (e) {
        if (isMounted) setTokenValid(false);
      }
    };
    validate();
    return () => { isMounted = false; };
  }, [effectiveToken]);

  // Validation checklist
  const checks = useMemo(() => {
    const hasMin = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const match = password.length > 0 && password === confirmPassword;
    const score = [hasMin, hasUpper, hasLower, hasDigit].filter(Boolean).length;
    const allOk = hasMin && hasUpper && hasLower && hasDigit && match;
    return { hasMin, hasUpper, hasLower, hasDigit, match, score, allOk };
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!checks.allOk) {
      setLoading(false);
      return;
    }

    try {
      await apiService.auth.postResetPassword(effectiveToken, password);
      setMessage('Votre mot de passe a été réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion.');

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

        {!tokenValid && !message && (
          <div className="admin-login-error" style={{ color: 'red', marginBottom: '1rem' }}>
            Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.
            <div className="admin-login-footer" style={{ marginTop: 12 }}>
              <Link to="/admin/login">Retour à la connexion</Link>
            </div>
          </div>
        )}

        {!message && tokenValid && (
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

            {/* Checklist */}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 12, color: '#333' }} aria-live="polite">
              <li>{checks.hasMin ? '✅' : '⬜️'} Au moins 8 caractères</li>
              <li>{checks.hasUpper ? '✅' : '⬜️'} 1 majuscule</li>
              <li>{checks.hasLower ? '✅' : '⬜️'} 1 minuscule</li>
              <li>{checks.hasDigit ? '✅' : '⬜️'} 1 chiffre</li>
              <li>{checks.match ? '✅' : '⬜️'} Confirmation identique</li>
            </ul>

            {/* Indicateur de force 0–4 */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }} aria-label="Indicateur de force du mot de passe">
              {[0,1,2,3].map((i) => (
                <div key={i} style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: i < checks.score ? 'var(--color-primary)' : '#ddd'
                }} />
              ))}
            </div>

            <button
              type="submit"
              className={`admin-login-button ${loading ? 'loading' : ''}`}
              disabled={loading || !checks.allOk}
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
