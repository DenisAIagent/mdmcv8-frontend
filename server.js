import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Configuration pour servir les fichiers statiques depuis le dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

// Configuration des headers de sécurité et cache
app.use((req, res, next) => {
  // Headers de sécurité
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://connect.facebook.net https://capi-automation.s3.us-east-2.amazonaws.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://capi-automation.s3.us-east-2.amazonaws.com; media-src 'self' blob: data: https: https://res.cloudinary.com; connect-src 'self' https://api.mdmcmusicads.com https://mdmcv4-backend-production-b615.up.railway.app https://blog.mdmcmusicads.com https://api.brevo.com https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net https://capi-automation.s3.us-east-2.amazonaws.com;"
  );
  
  // Cache pour les assets statiques
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  next();
});

// Health check endpoint pour Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Endpoint Newsletter avec Brevo
app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email, source = 'Website', attributes = {} } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email requis' 
    });
  }

  // Clé API Brevo depuis les variables d'environnement
  const BREVO_API_KEY = process.env.VITE_BREVO_API_KEY;
  
  if (!BREVO_API_KEY) {
    console.error('❌ Newsletter Backend: VITE_BREVO_API_KEY manquante');
    return res.status(500).json({ 
      success: false, 
      message: 'Configuration serveur manquante' 
    });
  }
  
  console.log('📧 Newsletter Backend: Tentative inscription', { email, source });
  
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [2], // ID de votre liste Brevo
        attributes: {
          SOURCE: source,
          DATE_INSCRIPTION: new Date().toISOString(),
          ...attributes
        },
        updateEnabled: true
      }),
    });

    const responseData = await response.json().catch(() => null);
    
    if (response.ok) {
      console.log('✅ Newsletter Backend: Inscription réussie');
      return res.status(200).json({ 
        success: true, 
        message: 'Inscription réussie' 
      });
    } else if (response.status === 400) {
      // Email déjà inscrit
      console.log('ℹ️ Newsletter Backend: Email déjà inscrit');
      return res.status(200).json({ 
        success: true, 
        message: 'Vous êtes déjà inscrit(e)' 
      });
    } else {
      console.error('❌ Newsletter Backend: Erreur Brevo', response.status, responseData);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'inscription' 
      });
    }
  } catch (error) {
    console.error('❌ Newsletter Backend: Erreur', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Route pour servir les pages statiques SmartLinks
app.get('/sl/:shortId.html', (req, res) => {
  const { shortId } = req.params;
  const staticPagePath = path.join(__dirname, 'dist', 'sl', `${shortId}.html`);
  
  console.log(`📄 Serving static SmartLink page: /sl/${shortId}.html`);
  
  // Vérifier si la page statique existe
  if (fs.existsSync(staticPagePath)) {
    console.log(`✅ Static page found: ${staticPagePath}`);
    res.sendFile(staticPagePath);
  } else {
    console.log(`❌ Static page not found: ${staticPagePath}`);
    // Fallback vers l'application React
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Route catch-all pour l'application React (SPA routing)
app.get('*', (req, res) => {
  console.log(`📄 Serving React app for: ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📄 Static SmartLinks: /sl/{shortId}.html`);
  console.log(`🔍 React app: /#/smartlinks/artist/track`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('💤 Server shutting down gracefully...');
  process.exit(0);
});

export default app;