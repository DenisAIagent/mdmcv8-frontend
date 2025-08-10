import React, { useEffect, useRef, useState, useCallback } from 'react';
import apiService from '../../services/api.service';
import '../../assets/styles/admin-login.css';

/**
 * ForgotPasswordModal
 * - Réutilise les styles admin-login.css
 * - A11y: aria-modal, role dialog, focus trap, Esc pour fermer
 * - Message de succès générique (ne révèle pas si email existe)
 */
const ForgotPasswordModal = ({ open, onClose }) => {
  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [networkError, setNetworkError] = useState('');

  const closeAndReset = useCallback(() => {
    setEmail('');
    setLoading(false);
    setSubmitted(false);
    setNetworkError('');
    onClose?.();
  }, [onClose]);

  // Focus trap + ESC
  useEffect(() => {
    if (!open) return;

    // Focus the first focusable element
    const focusTimer = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 0);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeAndReset();
      }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open, closeAndReset]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNetworkError('');
    try {
      // Toujours afficher un message de succès générique
      await apiService.auth.postForgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Ne pas révéler l'existence de l'email
      console.warn('forgot-password: network error (masqué en UI)');
      setSubmitted(true);
      // Optionnel: garder une trace locale non visible
      setNetworkError('network');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={backdropStyle} aria-hidden={false}>
      <div
        className="admin-login-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-title"
        aria-describedby="forgot-desc"
        ref={dialogRef}
        style={{ maxWidth: 480, width: '100%' }}
      >
        <div className="admin-login-header">
          <h2 id="forgot-title">Réinitialiser le mot de passe</h2>
          <p id="forgot-desc">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
        </div>

        {!submitted && (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Adresse Email</label>
              <input
                ref={firstFocusableRef}
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="admin-login-button"
                onClick={closeAndReset}
                aria-label="Fermer la fenêtre"
              >
                Annuler
              </button>
              <button
                ref={lastFocusableRef}
                type="submit"
                className={`admin-login-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </div>
          </form>
        )}

        {submitted && (
          <div aria-live="polite" className="admin-login-success" style={{ color: 'green', marginBottom: '1rem' }}>
            Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.
          </div>
        )}

        {submitted && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              ref={lastFocusableRef}
              type="button"
              className="admin-login-button"
              onClick={closeAndReset}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
};

export default ForgotPasswordModal;
