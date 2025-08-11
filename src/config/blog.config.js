// Configuration centralisée du blog MDMC
const BLOG_CONFIG = {
  // URL de base de votre blog WordPress MDMC
  BASE_URL: import.meta.env.VITE_BLOG_URL || 'https://blog.mdmcmusicads.com',
  
  // Flux RSS (WordPress génère automatiquement /feed/)
  RSS_URL: (import.meta.env.VITE_BLOG_URL || 'https://blog.mdmcmusicads.com') + '/feed/',
  
  // API WordPress REST (si on veut utiliser l'API au lieu du RSS)
  API_URL: (import.meta.env.VITE_BLOG_URL || 'https://blog.mdmcmusicads.com') + '/wp-json/wp/v2',
  
  // Configuration par défaut
  ARTICLES_LIMIT: 3,
  TIMEOUT: 15000, // 15 secondes
  
  // Proxy CORS (pour éviter les problèmes de CORS)
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  // Utiliser le proxy CORS par défaut à cause des restrictions CSP
  USE_CORS_PROXY: true,
  // Limites et configuration
  MAX_ARTICLES: 3,
  MAX_EXCERPT_LENGTH: 150,
  MAX_RETRY_COUNT: 3
};

export default BLOG_CONFIG;