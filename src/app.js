// MDMC SmartLinks Service - Application Express dédiée
// Service HTML statique pour SmartLinks avec SEO optimal

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// --- Compression GZIP ---
app.use(compression());

// --- Configuration de sécurité ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://connect.facebook.net"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://www.facebook.com"]
    }
  }
}));

// --- CORS pour sous-domaine ---
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://smartlink.mdmcmusicads.com'],
  credentials: true
}));

// --- Logging ---
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// --- Support des cookies pour l'authentification ---
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// --- Middleware de base ---
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' }));

// --- Configuration du moteur de template EJS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// --- Servir les fichiers statiques ---
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// --- API Routes (AVANT les routes SmartLinks génériques) ---
const apiRoutes = require('../routes/api');
app.use('/api', apiRoutes);

// --- Authentication Routes ---
const { router: authRoutes } = require('../routes/auth');
app.use('/api/auth', authRoutes);

// --- Dashboard Routes ---
const dashboardRoutes = require('../routes/dashboard');
app.use('/dashboard', dashboardRoutes);

// --- Debug Routes (temporaire) ---
const debugRoutes = require('../routes/debug');
app.use(debugRoutes);

// --- Login Page Route avec vérification d'authentification ---
app.get('/login', (req, res) => {
  // Vérifier d'abord si l'utilisateur est déjà connecté
  const token = req.cookies?.mdmc_token || req.query?.token;
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'mdmc_smartlinks_secret_key_2025';
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Token valide, rediriger vers le dashboard
      console.log('🔄 Utilisateur déjà connecté, redirection depuis /login vers /dashboard');
      const redirectUrl = req.query.redirect || '/dashboard';
      return res.redirect(redirectUrl);
    } catch (error) {
      // Token invalide, supprimer le cookie et continuer vers login
      console.log('🗑️ Token invalide détecté, suppression du cookie');
      res.clearCookie('mdmc_token', {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
  }
  
  // Pas de token ou token invalide, afficher la page de login
  res.render('login');
});

// --- Routes pour SmartLinks HTML statiques (EN DERNIER car catch-all) ---
const smartlinkRoutes = require('../routes/smartlinks');
app.use('/', smartlinkRoutes);

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'MDMC SmartLinks Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// --- Gestion d'erreurs 404 ---
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'SmartLink non trouvé',
    message: 'Cette URL SmartLink n\'existe pas',
    service: 'MDMC SmartLinks'
  });
});

// --- Gestionnaire d'erreurs global ---
app.use((err, req, res, next) => {
  console.error('Erreur SmartLinks Service:', err);
  
  res.status(err.status || 500).json({
    error: 'Erreur du service SmartLinks',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne',
    service: 'MDMC SmartLinks'
  });
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎵 MDMC SmartLinks Service démarré sur le port ${PORT}`);
  console.log(`🌐 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔗 URLs: http://localhost:${PORT}`);
  console.log(`🚀 Service dédié HTML statique pour SEO optimal`);
});

module.exports = app;