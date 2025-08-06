const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Utilisateurs générés par le script setup-admin.js
const USERS = [
  {
    id: 'mdmc_admin_001',
    username: 'mdmc_admin',
    password: '$2b$10$1jbx7FMEzCURQuBsQdX77OygmmwmKF7O/qOM6W1Y250k/4ZzJxpoi', // password: 'MDMC2025!'
    role: 'admin',
    name: 'Administrateur MDMC',
    email: 'admin@mdmcmusicads.com',
    permissions: ['create', 'edit', 'delete', 'analytics', 'admin'],
    createdAt: new Date('2025-08-06'),
    isActive: true
  },
  {
    id: 'mdmc_client_001',
    username: 'mdmc_client',
    password: '$2b$10$CWq9uOeONM1HOdXDNARKfO/5/mUDugfMSO4qrFLBBQF7IDB6bhL4W', // password: 'Client2025!'
    role: 'client',
    name: 'Client MDMC',
    email: 'client@mdmcmusicads.com',
    permissions: ['create', 'edit', 'analytics'],
    createdAt: new Date('2025-08-06'),
    isActive: true
  },
  {
    id: 'mdmc_demo_001',
    username: 'mdmc_demo',
    password: '$2b$10$KnBdoVVCCiNd8d8jyR.V1ekwASG.GPwROrdlmLhIfXH.LB4CbPdyG', // password: 'Demo2025!'
    role: 'client',
    name: 'Utilisateur Démo',
    email: 'demo@mdmcmusicads.com',
    permissions: ['create', 'edit', 'analytics'],
    createdAt: new Date('2025-08-06'),
    isActive: true
  }
];

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'mdmc_smartlinks_secret_key_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// --- Route de connexion ---
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    
    // Validation des données
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur et mot de passe requis'
      });
    }
    
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    // Recherche de l'utilisateur
    const user = USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      // Simulation d'un délai pour éviter les attaques par timing
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }
    
    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }
    
    // Génération du token JWT
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const tokenOptions = {
      expiresIn: rememberMe ? '30d' : JWT_EXPIRES_IN,
      issuer: 'MDMC SmartLinks',
      audience: 'MDMC Dashboard'
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, tokenOptions);
    
    // Données utilisateur pour le frontend (sans mot de passe)
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    };
    
    // Log de connexion réussie
    console.log(`✅ Connexion réussie: ${user.username} (${user.role}) - IP: ${req.ip}`);
    
    // SOLUTION: Créer le cookie côté SERVEUR (plus fiable)
    const cookieOptions = {
      httpOnly: false, // Permettre accès JavaScript côté client
      secure: process.env.NODE_ENV === 'production', // HTTPS en production
      sameSite: 'lax', // Protection CSRF mais allow navigation
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30j ou 24h en ms
      path: '/' // Disponible sur tout le site
    };
    
    res.cookie('mdmc_token', token, cookieOptions);
    
    // Debug optionnel
    if (process.env.NODE_ENV === 'development') {
      console.log('🍪 Cookie côté serveur créé avec options:', cookieOptions);
    }
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userData,
      expiresIn: rememberMe ? '30 jours' : '24 heures'
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// --- Route de déconnexion ---
router.post('/logout', verifyToken, (req, res) => {
  try {
    // Log de déconnexion
    console.log(`📤 Déconnexion: ${req.user.username} - IP: ${req.ip}`);
    
    // Supprimer le cookie côté serveur
    res.clearCookie('mdmc_token', {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    console.log('🍪 Cookie supprimé côté serveur');
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('❌ Erreur de déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
});

// --- Route de déconnexion simple (GET pour liens directs) ---
router.get('/logout', (req, res) => {
  // Supprimer le cookie
  res.clearCookie('mdmc_token', {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  console.log('📤 Déconnexion via GET, redirection vers login');
  res.redirect('/login?message=disconnected');
});

// --- Route de vérification du token ---
router.get('/verify', verifyToken, (req, res) => {
  try {
    const user = USERS.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    };
    
    res.json({
      success: true,
      user: userData,
      tokenValid: true
    });
  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de vérification'
    });
  }
});

// --- Route de rafraîchissement du token ---
router.post('/refresh', verifyToken, (req, res) => {
  try {
    const user = USERS.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Génération d'un nouveau token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const newToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'MDMC SmartLinks',
      audience: 'MDMC Dashboard'
    });
    
    res.json({
      success: true,
      token: newToken,
      message: 'Token rafraîchi'
    });
  } catch (error) {
    console.error('❌ Erreur de rafraîchissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de rafraîchissement'
    });
  }
});

// --- Middleware de vérification du token JWT ---
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification manquant'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'TOKEN_INVALID'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Erreur d\'authentification',
        code: 'AUTH_ERROR'
      });
    }
  }
}

// --- Middleware de vérification des rôles ---
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }
    
    next();
  };
}

// --- Route de test (développement uniquement) ---
if (process.env.NODE_ENV === 'development') {
  router.post('/create-hash', async (req, res) => {
    try {
      const { password } = req.body;
      const hash = await bcrypt.hash(password, 10);
      res.json({ password, hash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// --- Route d'informations système ---
router.get('/info', (req, res) => {
  res.json({
    service: 'MDMC Authentication Service',
    version: '1.0.0',
    supportedMethods: ['login', 'logout', 'verify', 'refresh'],
    tokenExpiry: JWT_EXPIRES_IN,
    timestamp: new Date().toISOString()
  });
});

// Exportation du router et des middlewares
module.exports = {
  router,
  verifyToken,
  requireRole,
  
  // Utilitaires pour d'autres modules
  verifyTokenSync: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  },
  
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'MDMC SmartLinks',
      audience: 'MDMC Dashboard'
    });
  }
};