// src/config/api.config.server.js
// Configuration API adaptée pour l'environnement serveur Node.js

const API_CONFIG = {
  // URL du backend - Production avec custom domain  
  BASE_URL: process.env.VITE_API_URL || 'https://api.mdmcmusicads.com/api/v1',

  // Timeout pour les requêtes (5 secondes pour les bots)
  TIMEOUT: 5000,

  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'User-Agent': 'MDMC-Bot-Middleware/1.0'
  },

  // Configuration CORS
  WITH_CREDENTIALS: false, // Pas besoin de credentials pour les bots
};

// Configuration pour différents environnements
const ENV_CONFIG = {
  development: {
    BASE_URL: process.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  },
  production: {
    BASE_URL: process.env.VITE_API_URL || 'https://mdmcv4-backend-production-b615.up.railway.app/api/v1',
  }
};

// Détecter l'environnement et ajuster la config
const currentEnv = process.env.NODE_ENV || 'production';
if (ENV_CONFIG[currentEnv]) {
  Object.assign(API_CONFIG, ENV_CONFIG[currentEnv]);
}

// Debug pour toujours voir la config
console.log('🔍 Server API Config:', {
  Environment: currentEnv,
  Base_URL: API_CONFIG.BASE_URL,
  VITE_API_URL: process.env.VITE_API_URL,
  Timeout: API_CONFIG.TIMEOUT
});

export default API_CONFIG;