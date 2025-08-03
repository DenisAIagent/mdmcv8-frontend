// Routes principales pour SmartLinks HTML statiques
// Sert les fichiers HTML générés avec métadonnées Open Graph optimales

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');

const router = express.Router();
const htmlGenerator = new StaticHtmlGenerator();

// Middleware pour logs et analytics
const logAccess = (req, res, next) => {
  const { artistSlug, trackSlug } = req.params;
  const userAgent = req.get('User-Agent') || '';
  const isBot = /bot|crawler|spider|facebook|twitter|whatsapp|telegram|slack/i.test(userAgent);
  
  console.log(`🎵 SmartLink: ${artistSlug}/${trackSlug} - ${isBot ? '🤖 Bot' : '👤 User'}`);
  
  // Headers de cache optimisés
  if (isBot) {
    res.set('Cache-Control', 'public, max-age=3600'); // 1h pour bots
  } else {
    res.set('Cache-Control', 'public, max-age=300'); // 5min pour utilisateurs
  }
  
  next();
};

// Route principale : /:artistSlug/:trackSlug
router.get('/:artistSlug/:trackSlug', logAccess, async (req, res) => {
  try {
    const { artistSlug, trackSlug } = req.params;
    
    console.log(`📂 Recherche SmartLink: ${artistSlug}/${trackSlug}`);
    
    // Chemin vers le fichier HTML statique
    const filePath = htmlGenerator.getFilePath(artistSlug, trackSlug);
    
    try {
      // Tentative de lecture du fichier HTML existant
      const htmlContent = await fs.readFile(filePath, 'utf8');
      
      // Headers pour SEO
      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Service': 'MDMC SmartLinks',
        'X-Generated': 'Static HTML'
      });
      
      console.log(`✅ HTML statique servi: ${filePath}`);
      return res.send(htmlContent);
      
    } catch (fileError) {
      console.log(`⚠️ Fichier HTML non trouvé: ${filePath}`);
      
      // TODO: Essayer de générer le HTML à la volée depuis la DB
      // Pour l'instant, on retourne une page 404 propre
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SmartLink non trouvé | MDMC Music Ads</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
              color: #141414;
              text-align: center;
              padding: 2rem;
            }
            .container { 
              max-width: 420px; 
              margin: 0 auto;
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            }
            h1 { color: #E50914; font-size: 1.5rem; margin-bottom: 1rem; }
            p { color: #6C757D; margin-bottom: 1.5rem; }
            a { 
              color: #E50914; 
              text-decoration: none; 
              font-weight: 500;
              padding: 0.75rem 1.5rem;
              border: 2px solid #E50914;
              border-radius: 0.5rem;
              display: inline-block;
              transition: all 0.3s;
            }
            a:hover { 
              background: #E50914; 
              color: white; 
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SmartLink non trouvé</h1>
            <p>Le SmartLink <strong>${artistSlug}/${trackSlug}</strong> n'existe pas ou n'a pas encore été généré.</p>
            <a href="https://www.mdmcmusicads.com">Retour au site MDMC</a>
          </div>
        </body>
        </html>
      `);
    }
    
  } catch (error) {
    console.error('❌ Erreur route SmartLink:', error);
    res.status(500).send('Erreur du service SmartLinks');
  }
});

// Route racine : redirection vers site principal
router.get('/', (req, res) => {
  res.redirect('https://www.mdmcmusicads.com');
});

// Route de test
router.get('/test', (req, res) => {
  res.json({
    service: 'MDMC SmartLinks',
    status: 'Fonctionnel',
    timestamp: new Date().toISOString(),
    exemple: '/slipknot/wait-and-bleed'
  });
});

module.exports = router;