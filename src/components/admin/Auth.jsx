import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/auth.css';

// Composant pour l'authentification sécurisée
const Auth = ({ onLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      // Dans une version réelle, vérifier la validité du token avec une API
      onLogin(true);
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
    
    // Vérifier si le compte est verrouillé
    const lockedUntil = localStorage.getItem('account_locked_until');
    if (lockedUntil) {
      const lockTimeMs = parseInt(lockedUntil);
      if (lockTimeMs > Date.now()) {
        setIsLocked(true);
        setLockTime(Math.ceil((lockTimeMs - Date.now()) / 1000));
        
        // Mettre à jour le compteur de verrouillage
        const interval = setInterval(() => {
          setLockTime(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsLocked(false);
              localStorage.removeItem('account_locked_until');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('account_locked_until');
      }
    }
  }, [navigate, onLogin, location]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simuler une requête d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une version réelle, cela ferait une requête à une API d'authentification
      if (username === 'admin' && password === 'mdmc2025') {
        // Générer un token (simulé)
        const token = 'simulated_jwt_token_' + Math.random().toString(36).substring(2);
        
        // Stocker le token selon la préférence "Se souvenir de moi"
        if (rememberMe) {
          localStorage.setItem('auth_token', token);
        } else {
          sessionStorage.setItem('auth_token', token);
        }
        
        // Réinitialiser les tentatives de connexion
        localStorage.removeItem('login_attempts');
        
        // Informer le parent de la connexion réussie
        onLogin(true);
        
        // Rediriger vers la page demandée ou la page d'administration
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        // Incrémenter le compteur de tentatives
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        localStorage.setItem('login_attempts', attempts.toString());
        
        // Verrouiller le compte après 5 tentatives échouées
        if (attempts >= 5) {
          const lockDuration = 5 * 60 * 1000; // 5 minutes
          const lockedUntil = Date.now() + lockDuration;
          localStorage.setItem('account_locked_until', lockedUntil.toString());
          setIsLocked(true);
          setLockTime(lockDuration / 1000);
          setError('Trop de tentatives échouées. Compte verrouillé pendant 5 minutes.');
        } else {
          setError('Identifiants incorrects. Tentative ' + attempts + '/5');
        }
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formater le temps de verrouillage
  const formatLockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('admin.login')}</h1>
          <p>Connectez-vous pour accéder au panneau d'administration</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        {isLocked ? (
          <div className="auth-locked">
            <i className="lock-icon">🔒</i>
            <h2>Compte temporairement verrouillé</h2>
            <p>Trop de tentatives de connexion échouées.</p>
            <p>Réessayez dans <span className="lock-timer">{formatLockTime(lockTime)}</span></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <div className="input-wrapper">
                <i className="input-icon">👤</i>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <i className="input-icon">🔑</i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Se souvenir de moi</span>
              </label>
            </div>
            
            <button
              type="submit"
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <p>© 2025 MDMC Music Ads. Tous droits réservés.</p>
          <p>Besoin d'aide ? <a href="mailto:support@mdmc.com">Contactez-nous</a></p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
