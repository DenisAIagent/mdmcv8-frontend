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

// Route racine : page d'accueil SmartLinks
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MDMC SmartLinks | Service de partage musical</title>
      <style>
        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #0a0a0a;
          color: #ffffff;
          text-align: center;
          padding: 2rem;
          margin: 0;
          min-height: 100vh;
        }
        .container { 
          max-width: 500px; 
          margin: 0 auto;
          background: #141414;
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }
        h1 { 
          color: #cc271a; 
          font-size: 2rem; 
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        .tagline {
          color: #cc271a; 
          margin-bottom: 2rem;
          font-style: italic;
          font-size: 1.1rem;
        }
        .description {
          color: #cccccc;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .example {
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          color: #cc271a;
          margin-bottom: 2rem;
          border: 1px solid rgba(204, 39, 26, 0.3);
        }
        a { 
          color: #cc271a; 
          text-decoration: none; 
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          border: 2px solid #cc271a;
          border-radius: 50px;
          display: inline-block;
          transition: all 0.3s ease;
          margin: 0.5rem;
          font-family: 'Poppins', sans-serif;
        }
        a:hover { 
          background: #cc271a; 
          color: #ffffff; 
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 30px rgba(204, 39, 26, 0.3);
        }
        .footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 0.9rem;
          color: #999999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>MDMC SmartLinks</h1>
        <p class="tagline">Marketing musical qui convertit</p>
        <p class="description">
          Service de SmartLinks pour partager votre musique sur toutes les plateformes de streaming. 
          URLs optimisées pour le partage social avec métadonnées Open Graph parfaites.
        </p>
        <div class="example">
          smartlink.mdmcmusicads.com/artist/track
        </div>
        <a href="/test">Tester le service</a>
        <a href="https://www.mdmcmusicads.com">Site principal MDMC</a>
        <div class="footer">
          Powered by MDMC Music Ads<br>
          Service HTML statique pour SEO optimal
        </div>
      </div>
    </body>
    </html>
  `);
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