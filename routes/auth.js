const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Configuration des utilisateurs (en dur pour le prototype, à migrer vers DB)
const USERS = [
  {
    id: '1',
    username: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'mdmc2025'
    role: 'admin',
    name: 'Administrateur MDMC',
    email: 'admin@mdmcmusicads.com',
    createdAt: new Date('2025-01-01')
  },
  {
    id: '2',
    username: 'manager',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'mdmc2025'
    role: 'manager',
    name: 'Manager MDMC',
    email: 'manager@mdmcmusicads.com',
    createdAt: new Date('2025-01-01')
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