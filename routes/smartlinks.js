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
          color: #ffffff; 
          font-size: 2rem; 
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        .tagline {
          color: #ffffff; 
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
        .creation-form {
          margin: 2rem 0;
          text-align: left;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #ffffff;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          background: #1a1a1a;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .form-group input:focus {
          outline: none;
          border-color: #cc271a;
          box-shadow: 0 0 0 3px rgba(204, 39, 26, 0.1);
        }
        .create-btn {
          width: 100%;
          padding: 1rem;
          background: #cc271a;
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        .create-btn:hover {
          background: #a61f15;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(204, 39, 26, 0.3);
        }
        .create-btn:disabled {
          background: #666666;
          cursor: not-allowed;
          transform: none;
        }
        .result-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #1a1a1a;
          border-radius: 0.5rem;
          border: 1px solid rgba(204, 39, 26, 0.3);
        }
        .result-section h3 {
          color: #cc271a;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }
        .smartlink-url {
          display: flex;
          gap: 0.5rem;
        }
        .smartlink-url input {
          flex: 1;
          padding: 0.75rem;
          background: #141414;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          color: #ffffff;
          font-family: monospace;
        }
        .smartlink-url button {
          padding: 0.75rem 1.5rem;
          background: #cc271a;
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
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
        <!-- Formulaire de création SmartLink -->
        <form id="smartlinkForm" class="creation-form">
          <div class="form-group">
            <label for="artistName">Nom de l'artiste</label>
            <input type="text" id="artistName" name="artistName" placeholder="Ex: Muse" required>
          </div>
          <div class="form-group">
            <label for="trackTitle">Titre du morceau</label>
            <input type="text" id="trackTitle" name="trackTitle" placeholder="Ex: Uprising" required>
          </div>
          <div class="form-group">
            <label for="sourceUrl">URL de la source</label>
            <input type="url" id="sourceUrl" name="sourceUrl" placeholder="Ex: https://open.spotify.com/track/..." required>
          </div>
          <button type="submit" class="create-btn">Créer SmartLink</button>
        </form>
        
        <div id="result" class="result-section" style="display: none;">
          <h3>SmartLink créé avec succès !</h3>
          <div class="smartlink-url">
            <input type="text" id="generatedUrl" readonly>
            <button onclick="copyToClipboard()">Copier</button>
          </div>
        </div>
        
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
      
      <script>
        // Gestion du formulaire de création SmartLink
        document.getElementById('smartlinkForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const data = {
            artistName: formData.get('artistName').trim(),
            trackTitle: formData.get('trackTitle').trim(),
            sourceUrl: formData.get('sourceUrl').trim()
          };
          
          const submitBtn = document.querySelector('.create-btn');
          const resultSection = document.getElementById('result');
          
          // État de chargement
          submitBtn.disabled = true;
          submitBtn.textContent = 'Création en cours...';
          resultSection.style.display = 'none';
          
          try {
            const response = await fetch('/api/create-smartlink', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Succès
              const generatedUrl = \`https://smartlink.mdmcmusicads.com/\${result.artistSlug}/\${result.trackSlug}\`;
              document.getElementById('generatedUrl').value = generatedUrl;
              resultSection.style.display = 'block';
              
              // Reset form
              e.target.reset();
            } else {
              alert('Erreur lors de la création: ' + result.error);
            }
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
          } finally {
            // Restaurer bouton
            submitBtn.disabled = false;
            submitBtn.textContent = 'Créer SmartLink';
          }
        });
        
        // Fonction pour copier l'URL
        function copyToClipboard() {
          const urlInput = document.getElementById('generatedUrl');
          urlInput.select();
          document.execCommand('copy');
          
          const copyBtn = event.target;
          copyBtn.textContent = 'Copié !';
          setTimeout(() => {
            copyBtn.textContent = 'Copier';
          }, 2000);
        }
      </script>
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