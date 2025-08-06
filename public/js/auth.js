/**
 * MDMC SmartLinks - Authentication Manager
 * Gestionnaire d'authentification côté client en JavaScript pur
 * Gestion des tokens JWT, sessions et requêtes authentifiées
 */

class AuthManager {
  constructor() {
    this.token = null;
    this.user = null;
    this.refreshTimer = null;
    this.init();
  }
  
  // --- Initialisation ---
  init() {
    this.loadStoredAuth();
    this.setupAutoRefresh();
    this.setupPageProtection();
    
    // Event listeners pour le changement de stockage
    window.addEventListener('storage', (e) => {
      if (e.key === 'mdmc_token' || e.key === 'mdmc_user') {
        this.loadStoredAuth();
      }
    });
  }
  
  // --- Gestion du stockage ---
  loadStoredAuth() {
    // Vérifier localStorage puis sessionStorage
    this.token = localStorage.getItem('mdmc_token') || sessionStorage.getItem('mdmc_token');
    const userData = localStorage.getItem('mdmc_user') || sessionStorage.getItem('mdmc_user');
    
    try {
      this.user = userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Données utilisateur corrompues:', error);
      this.user = null;
    }
    
    // Validation du token
    if (this.token && !this.isTokenValid()) {
      this.clearAuth();
    }
  }
  
  storeAuth(token, user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    
    storage.setItem('mdmc_token', token);
    storage.setItem('mdmc_user', JSON.stringify(user));
    
    this.token = token;
    this.user = user;
    
    this.setupAutoRefresh();
  }
  
  clearAuth() {
    localStorage.removeItem('mdmc_token');
    localStorage.removeItem('mdmc_user');
    sessionStorage.removeItem('mdmc_token');
    sessionStorage.removeItem('mdmc_user');
    
    // CORRECTION: Supprimer aussi le cookie
    document.cookie = 'mdmc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
    
    this.token = null;
    this.user = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  // --- Validation des tokens ---
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Vérifier l'expiration avec une marge de 60 secondes
      return payload.exp > (currentTime + 60);
    } catch (error) {
      console.warn('Token invalide:', error);
      return false;
    }
  }
  
  getTokenExpiry() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
  
  getTimeUntilExpiry() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return 0;
    
    return expiry.getTime() - Date.now();
  }
  
  // --- État d'authentification ---
  isAuthenticated() {
    return !!(this.token && this.user && this.isTokenValid());
  }
  
  getUser() {
    return this.user;
  }
  
  getToken() {
    return this.token;
  }
  
  hasRole(role) {
    return this.user && this.user.role === role;
  }
  
  hasAnyRole(roles) {
    return this.user && roles.includes(this.user.role);
  }
  
  // --- Requêtes authentifiées ---
  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      throw new Error('Non authentifié');
    }
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      // Gestion des erreurs d'authentification
      if (response.status === 401) {
        const result = await response.json().catch(() => ({}));
        
        if (result.code === 'TOKEN_EXPIRED') {
          // Tentative de rafraîchissement du token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry la requête avec le nouveau token
            headers.Authorization = `Bearer ${this.token}`;
            return fetch(url, { ...options, headers });
          }
        }
        
        // Échec de l'authentification
        this.handleAuthFailure();
        throw new Error('Authentification requise');
      }
      
      return response;
    } catch (error) {
      console.error('Erreur de requête authentifiée:', error);
      throw error;
    }
  }
  
  // --- Gestion des sessions ---
  async refreshToken() {
    if (!this.token) return false;
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.token) {
          // Mise à jour du token existant
          const isStored = !!localStorage.getItem('mdmc_token');
          this.storeAuth(result.token, this.user, isStored);
          console.log('✅ Token rafraîchi avec succès');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Erreur de rafraîchissement du token:', error);
    }
    
    return false;
  }
  
  setupAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    if (!this.isAuthenticated()) return;
    
    const timeUntilExpiry = this.getTimeUntilExpiry();
    
    // Programmer le rafraîchissement à 5 minutes avant l'expiration
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
    
    this.refreshTimer = setTimeout(async () => {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        this.handleAuthFailure();
      }
    }, refreshTime);
  }
  
  // --- Connexion et déconnexion ---
  async login(credentials) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.storeAuth(result.token, result.user, credentials.rememberMe);
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, message: 'Erreur de réseau' };
    }
  }
  
  async logout() {
    try {
      if (this.token) {
        // Notifier le serveur de la déconnexion
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {}); // Ignorer les erreurs de déconnexion côté serveur
      }
    } finally {
      this.clearAuth();
      this.redirectToLogin();
    }
  }
  
  // --- Vérification du statut ---
  async verifyAuth() {
    if (!this.token) return false;
    
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          this.user = result.user;
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur de vérification:', error);
    }
    
    this.clearAuth();
    return false;
  }
  
  // --- Protection des pages ---
  setupPageProtection() {
    // Vérifier les pages protégées au chargement
    const protectedPages = ['/dashboard'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.startsWith(page))) {
      // Vérifier si on ne vient pas déjà de la page de login (circuit breaker)
      const fromLogin = document.referrer && document.referrer.includes('/login');
      const redirectAttempts = parseInt(sessionStorage.getItem('mdmc_redirect_attempts') || '0');
      
      if (fromLogin && redirectAttempts > 2) {
        console.log('🛡️ Protection: Trop de redirections depuis /login, arrêt automatique');
        this.showAuthError('Problème de connexion détecté. Veuillez vous reconnecter manuellement.');
        return;
      }
      
      if (!this.isAuthenticated()) {
        // Incrémenter le compteur de tentatives
        sessionStorage.setItem('mdmc_redirect_attempts', (redirectAttempts + 1).toString());
        this.redirectToLogin();
      } else {
        // Réinitialiser le compteur en cas de succès
        sessionStorage.removeItem('mdmc_redirect_attempts');
        // Vérification périodique de l'authentification
        this.verifyAuth();
      }
    }
  }
  
  // --- Navigation ---
  redirectToLogin() {
    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?redirect=${currentUrl}`;
  }
  
  redirectToDashboard() {
    window.location.href = '/dashboard';
  }
  
  handleAuthFailure() {
    this.clearAuth();
    
    // Vérifier le nombre de tentatives pour éviter les boucles
    const attempts = parseInt(sessionStorage.getItem('mdmc_auth_failures') || '0');
    if (attempts > 3) {
      console.log('🛡️ Trop d\'erreurs d\'authentification, arrêt automatique');
      this.showAuthError('Multiples erreurs d\'authentification. Rechargez la page ou contactez le support.');
      return;
    }
    
    sessionStorage.setItem('mdmc_auth_failures', (attempts + 1).toString());
    
    // Afficher une notification si possible
    if (typeof showNotification === 'function') {
      showNotification('Votre session a expiré. Veuillez vous reconnecter.', 'warning');
    }
    
    // Redirection après un délai pour permettre à l'utilisateur de voir le message
    setTimeout(() => {
      this.redirectToLogin();
    }, 2000);
  }
  
  // --- Utilitaires ---
  showAuthError(message) {
    // Créer une notification d'erreur persistante
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc2626;
      color: white;
      padding: 20px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      z-index: 10001;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 400px;
    `;
    
    errorDiv.innerHTML = `
      <div style="margin-bottom: 16px;">🛡️</div>
      <div style="margin-bottom: 16px;">${message}</div>
      <button onclick="window.location.href='/login'" style="
        background: white;
        color: #dc2626;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Retour à la connexion</button>
    `;
    
    // Ajouter un overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(errorDiv);
  }
  
  formatRole(role) {
    const roles = {
      'admin': 'Administrateur',
      'manager': 'Manager',
      'user': 'Utilisateur'
    };
    return roles[role] || role;
  }
  
  getWelcomeMessage() {
    if (!this.user) return 'Dashboard';
    return `Bonjour ${this.user.name || this.user.username}`;
  }
  
  // --- Debug (développement uniquement) ---
  getDebugInfo() {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.user,
      tokenValid: this.isTokenValid(),
      tokenExpiry: this.getTokenExpiry(),
      timeUntilExpiry: this.getTimeUntilExpiry()
    };
  }
}

// --- Instance globale ---
const auth = new AuthManager();

// --- Sécurité et sanitization ---
const SecurityUtils = {
  // Sanitization HTML pour prévenir XSS
  sanitizeHtml(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },
  
  // Validation et nettoyage des URLs
  sanitizeUrl(url) {
    try {
      const parsed = new URL(url);
      // Autoriser seulement HTTPS et HTTP
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  },
  
  // Validation des noms d'artistes/titres
  sanitizeText(text, maxLength = 100) {
    if (typeof text !== 'string') return '';
    
    return text
      .trim()
      .substring(0, maxLength)
      .replace(/[<>\"'&]/g, '') // Retirer caractères dangereux
      .replace(/\s+/g, ' '); // Normaliser espaces
  },
  
  // Validation des IDs (alphanumériques + tirets)
  validateId(id) {
    if (typeof id !== 'string') return false;
    return /^[a-z0-9-]+$/i.test(id) && id.length <= 50;
  }
};

// --- Utilitaires globaux ---
window.MDMC = window.MDMC || {};
window.MDMC.auth = auth;
window.MDMC.security = SecurityUtils;

// --- Helpers pour les templates ---
function requireAuth() {
  if (!auth.isAuthenticated()) {
    auth.redirectToLogin();
    return false;
  }
  return true;
}

function requireRole(role) {
  if (!requireAuth()) return false;
  
  if (!auth.hasRole(role)) {
    alert('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
    history.back();
    return false;
  }
  return true;
}

// --- Protection automatique sur DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
  // Ajouter des event listeners pour les boutons de déconnexion
  const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn, #logoutBtn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        auth.logout();
      }
    });
  });
  
  // Mettre à jour l'interface utilisateur
  updateAuthUI();
});

// --- Mise à jour de l'interface ---
function updateAuthUI() {
  if (!auth.isAuthenticated()) return;
  
  // Mettre à jour les messages de bienvenue
  const welcomeElements = document.querySelectorAll('[data-welcome]');
  welcomeElements.forEach(el => {
    el.textContent = auth.getWelcomeMessage();
  });
  
  // Mettre à jour les informations utilisateur
  const userElements = document.querySelectorAll('[data-user-name]');
  userElements.forEach(el => {
    el.textContent = auth.user.name || auth.user.username;
  });
  
  const roleElements = document.querySelectorAll('[data-user-role]');
  roleElements.forEach(el => {
    el.textContent = auth.formatRole(auth.user.role);
  });
}

// --- Notification système simple ---
function showNotification(message, type = 'info') {
  // Création d'une notification simple
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 5000);
}

// --- CSS pour les animations ---
if (!document.getElementById('auth-animations')) {
  const style = document.createElement('style');
  style.id = 'auth-animations';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker enregistré:', registration.scope);
        
        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              if (typeof showNotification === 'function') {
                showNotification('Nouvelle version disponible. Rechargez pour mettre à jour.', 'info');
              }
            }
          });
        });
      })
      .catch(error => {
        console.warn('❌ Erreur Service Worker:', error);
      });
  });
}

// Export pour les modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, auth };
}