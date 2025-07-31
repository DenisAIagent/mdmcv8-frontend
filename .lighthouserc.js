// .lighthouserc.js - Configuration Lighthouse CI pour MDMC

module.exports = {
  ci: {
    collect: {
      // URLs à tester
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/#/admin/login',
        'http://localhost:3000/#/all-reviews'
      ],
      // Paramètres de collecte
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:.*http://localhost:4173',
      startServerReadyTimeout: 30000,
      // Options Chrome
      chromePath: undefined, // Utilise Chrome installé
      chromeFlags: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions'
      ]
    },
    assert: {
      // Assertions pour MDMC - Objectifs ambitieux
      assertions: {
        // Performance - Objectif 90+
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Accessibilité - Objectif 95+
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'color-contrast': 'error',
        'image-alt': 'error',
        'button-name': 'error',
        'link-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'heading-order': 'warn',
        'skip-link': 'warn',
        'focus-traps': 'warn',
        
        // SEO - Objectif 95+
        'categories:seo': ['error', { minScore: 0.95 }],
        'meta-description': 'error',
        'document-title': 'error',
        'hreflang': 'warn',
        'canonical': 'error',
        'robots-txt': 'warn',
        'image-alt': 'error',
        'structured-data': 'warn',
        
        // Bonnes pratiques - Objectif 90+
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        'is-on-https': 'error',
        'external-anchors-use-rel-noopener': 'error',
        
        // PWA - Objectifs spécifiques MDMC
        'installable-manifest': 'off', // Pas nécessaire pour site vitrine
        'splash-screen': 'off',
        'themed-omnibox': 'off',
        'service-worker': 'off', // Pas de PWA pour l'instant
        
        // Performance spécifique
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'error',
        'uses-webp-images': 'error',
        'efficient-animated-content': 'warn',
        'preload-fonts': 'warn',
        'font-display': 'error',
        
        // Sécurité
        'csp-xss': 'warn',
        'no-document-write': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',
        
        // Mobile
        'viewport': 'error',
        'content-width': 'error',
        'tap-targets': 'error'
      }
    },
    upload: {
      // Configuration pour stocker les résultats
      target: 'temporary-public-storage', // Pour debug
      // target: 'lhci', // Pour serveur LHCI privé
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-lhci-token'
    },
    server: {
      // Configuration serveur LHCI (optionnel)
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    }
  }
};
