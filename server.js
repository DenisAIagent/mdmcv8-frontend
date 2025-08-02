import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  isSocialBot, 
  fetchSmartLinkData, 
  generateSocialMetaTags, 
  injectMetaTags 
} from './src/utils/botDetection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' blob: data: https: https://res.cloudinary.com; connect-src 'self' https://api.mdmcmusicads.com;"
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

// Route pour servir l'application React (SPA routing)
app.get('*', (req, res, next) => {
  // Vérifier si c'est une route SmartLink
  const smartlinkMatch = req.path.match(/^\/smartlinks\/([^\/]+)\/([^\/]+)$/);
  
  if (smartlinkMatch) {
    const [, artistSlug, trackSlug] = smartlinkMatch;
    const userAgent = req.get('User-Agent') || '';
    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    console.log(`🔍 SmartLink request: ${artistSlug}/${trackSlug}`);
    console.log(`👤 User-Agent: ${userAgent}`);
    console.log(`🤖 Is bot: ${isSocialBot(userAgent)}`);
    
    // Si ce n'est pas un bot, servir l'application React normale
    if (!isSocialBot(userAgent)) {
      console.log('👤 Human user - serving React app');
      return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
    
    // C'est un bot - générer la réponse avec meta tags dynamiques
    console.log('🤖 Bot detected - generating dynamic meta tags');
    
    // Fonction asynchrone pour gérer les bots
    (async () => {
      try {
        // Lire le fichier index.html
        const htmlPath = path.join(__dirname, 'dist', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Récupérer les données du SmartLink avec validation stricte
        const smartlinkData = await fetchSmartLinkData(artistSlug, trackSlug);
        
        // VÉRIFICATION STRICTE - AUCUN FALLBACK
        if (!smartlinkData || !smartlinkData.coverImageUrl || !smartlinkData.trackTitle || !smartlinkData.artistName) {
          console.log('❌ INCOMPLETE/MISSING SmartLink data - NO social meta tags generated:', {
            hasData: !!smartlinkData,
            hasImage: !!smartlinkData?.coverImageUrl,
            hasTitle: !!smartlinkData?.trackTitle,
            hasArtist: !!smartlinkData?.artistName,
            fallbackRejected: true
          });
          
          // Servir l'application React normale SANS meta tags sociaux
          return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        }
        
        console.log(`✅ COMPLETE SmartLink data found - generating social meta tags:`, {
          title: smartlinkData.trackTitle,
          artist: smartlinkData.artistName,
          image: smartlinkData.coverImageUrl.substring(0, 100) + '...'
        });
        
        // Générer les meta tags SEULEMENT avec vraies données
        const metaTags = generateSocialMetaTags(smartlinkData, currentUrl, { artistSlug, trackSlug });
        
        // Si aucun meta tag généré (validation a échoué), servir la SPA normale
        if (!metaTags || metaTags.trim() === '') {
          console.log('❌ Meta tags generation failed - serving normal SPA');
          return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        }
        
        // Injecter les meta tags dans le HTML
        html = injectMetaTags(html, metaTags);
        
        // Ajouter des headers pour le cache des bots
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 heure de cache
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        
        return res.send(html);
        
      } catch (error) {
        console.error('❌ Error in SmartLink bot middleware:', error);
        
        // En cas d'erreur, servir l'application React normale
        return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      }
    })();
    
    return; // Important: ne pas continuer après l'appel async
  }
  
  // Pour toutes les autres routes, servir l'application React
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
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});