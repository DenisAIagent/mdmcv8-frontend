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

// Route racine : page de connexion
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connexion | MDMC SmartLinks</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #0a0a0a;
          color: #ffffff;
          text-align: center;
          padding: 2rem;
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container { 
          max-width: 400px; 
          width: 100%;
          background: #141414;
          padding: 3rem 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .logo {
          width: 200px;
          height: auto;
          margin-bottom: 2rem;
          filter: brightness(1.1);
        }
        h1 { 
          color: #ffffff; 
          font-size: 1.5rem; 
          margin-bottom: 0.5rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }
        .subtitle {
          color: #cccccc;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #ffffff;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
        }
        .form-group input {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          background: #1a1a1a;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .form-group input:focus {
          outline: none;
          border-color: #cc271a;
          box-shadow: 0 0 0 3px rgba(204, 39, 26, 0.1);
        }
        .login-btn {
          width: 100%;
          padding: 1rem;
          background: #cc271a;
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        .login-btn:hover {
          background: #a61f15;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(204, 39, 26, 0.3);
        }
        .login-btn:disabled {
          background: #666666;
          cursor: not-allowed;
          transform: none;
        }
        .error-message {
          background: #2d1b1b;
          color: #ff6b6b;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
          font-size: 0.9rem;
          display: none;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }
        .footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 0.8rem;
          color: #999999;
        }
        .footer a {
          color: #cc271a;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <img src="/images/MDMC_logo_blanc fond transparent.png" alt="MDMC Music Ads" class="logo">
        <h1>SmartLinks Service</h1>
        <p class="subtitle">Accès réservé aux clients MDMC</p>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" class="login-btn">Se connecter</button>
          <div id="errorMessage" class="error-message"></div>
        </form>
        
        <div class="footer">
          <a href="https://www.mdmcmusicads.com">Retour au site MDMC</a><br>
          Marketing musical qui convertit
        </div>
      </div>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const credentials = {
            username: formData.get('username').trim(),
            password: formData.get('password').trim()
          };
          
          const submitBtn = document.querySelector('.login-btn');
          const errorDiv = document.getElementById('errorMessage');
          
          // État de chargement
          submitBtn.disabled = true;
          submitBtn.textContent = 'Connexion...';
          errorDiv.style.display = 'none';
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Connexion réussie - redirection vers dashboard
              window.location.href = '/dashboard';
            } else {
              // Erreur de connexion
              errorDiv.textContent = result.error || 'Identifiants incorrects';
              errorDiv.style.display = 'block';
            }
          } catch (error) {
            console.error('Erreur:', error);
            errorDiv.textContent = 'Erreur de connexion. Veuillez réessayer.';
            errorDiv.style.display = 'block';
          } finally {
            // Restaurer bouton
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Route dashboard : interface de création SmartLinks (sécurisée)
router.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard | MDMC SmartLinks</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #0a0a0a;
          color: #ffffff;
          margin: 0;
          min-height: 100vh;
        }
        .header {
          background: #141414;
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          height: 40px;
          width: auto;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #cccccc;
          font-size: 0.9rem;
        }
        .logout-btn {
          background: none;
          border: 1px solid #cc271a;
          color: #cc271a;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background: #cc271a;
          color: #ffffff;
        }
        .container { 
          max-width: 600px; 
          margin: 2rem auto;
          padding: 0 2rem;
        }
        .page-title {
          color: #ffffff;
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        .page-subtitle {
          color: #cccccc;
          margin-bottom: 3rem;
          font-size: 1rem;
        }
        .form-card {
          background: #141414;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 2rem;
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
          padding: 0.875rem;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          background: #1a1a1a;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
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
          background: #1a1a1a;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(204, 39, 26, 0.3);
          display: none;
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
          padding: 0.875rem;
          background: #141414;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          color: #ffffff;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .smartlink-url button {
          padding: 0.875rem 1.5rem;
          background: #cc271a;
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          white-space: nowrap;
        }
        .info-section {
          background: #141414;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          margin-top: 2rem;
        }
        .info-section h3 {
          color: #ffffff;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }
        .info-section p {
          color: #cccccc;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        .help-text {
          display: block;
          font-size: 0.85rem;
          color: #999999;
          margin-top: 0.5rem;
          font-style: italic;
        }
        .retrieved-info {
          background: #0f0f0f;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(204, 39, 26, 0.2);
        }
        .retrieved-info p {
          margin: 0.5rem 0;
          color: #cccccc;
          font-size: 0.9rem;
        }
        .retrieved-info strong {
          color: #ffffff;
        }
        .retrieved-info span {
          color: #cc271a;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <header class="header">
        <img src="/images/MDMC_logo_blanc fond transparent.png" alt="MDMC" class="logo">
        <div class="user-info">
          <span>Dashboard SmartLinks</span>
          <button class="logout-btn" onclick="logout()">Déconnexion</button>
        </div>
      </header>
      
      <div class="container">
        <h1 class="page-title">Créer un SmartLink</h1>
        <p class="page-subtitle">Générez des liens universels pour vos sorties musicales</p>
        
        <div class="form-card">
          <form id="smartlinkForm">
            <div class="form-group">
              <label for="sourceUrl">URL de la musique</label>
              <input type="url" id="sourceUrl" name="sourceUrl" placeholder="Collez votre lien Spotify, Apple Music, Deezer, YouTube..." required>
              <small class="help-text">Collez n'importe quel lien de plateforme musicale et nous récupérerons automatiquement toutes les informations</small>
            </div>
            <button type="submit" class="create-btn">Générer SmartLink automatiquement</button>
          </form>
          
          <div id="result" class="result-section">
            <h3>SmartLink créé avec succès !</h3>
            <div class="retrieved-info">
              <p><strong>Titre :</strong> <span id="retrievedTitle">-</span></p>
              <p><strong>Artiste :</strong> <span id="retrievedArtist">-</span></p>
              <p><strong>Plateformes détectées :</strong> <span id="platformCount">0</span></p>
            </div>
            <div class="smartlink-url">
              <input type="text" id="generatedUrl" readonly>
              <button onclick="copyToClipboard()">Copier</button>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h3>Magie d'Odesli - Tout automatique !</h3>
          <p>• <strong>Collez simplement</strong> n'importe quel lien musical (Spotify, Apple Music, Deezer, YouTube, etc.)</p>
          <p>• <strong>Récupération automatique</strong> du titre, artiste, pochette et description</p>
          <p>• <strong>Génération de tous les liens</strong> : Spotify, Apple Music, Deezer, YouTube Music, Tidal, SoundCloud, Amazon Music...</p>
          <p>• <strong>SmartLink optimisé</strong> pour le partage sur réseaux sociaux avec métadonnées parfaites</p>
          <p>• <strong>URLs propres</strong> pour un référencement optimal</p>
        </div>
      </div>
      
      <script>
        // Gestion du formulaire simplifié
        document.getElementById('smartlinkForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const sourceUrl = formData.get('sourceUrl').trim();
          
          if (!sourceUrl) {
            alert('Veuillez saisir une URL de musique');
            return;
          }
          
          const submitBtn = document.querySelector('.create-btn');
          const resultSection = document.getElementById('result');
          
          submitBtn.disabled = true;
          submitBtn.textContent = 'Récupération des données automatique...';
          resultSection.style.display = 'none';
          
          try {
            const response = await fetch('/api/create-smartlink-auto', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sourceUrl })
            });
            
            const result = await response.json();
            
            if (response.ok) {
              const generatedUrl = \`https://smartlink.mdmcmusicads.com/\${result.artistSlug}/\${result.trackSlug}\`;
              document.getElementById('generatedUrl').value = generatedUrl;
              
              // Afficher les informations récupérées
              document.getElementById('retrievedTitle').textContent = result.title || 'Titre récupéré';
              document.getElementById('retrievedArtist').textContent = result.artist || 'Artiste récupéré';
              document.getElementById('platformCount').textContent = result.platforms?.length || 0;
              
              resultSection.style.display = 'block';
              e.target.reset();
            } else {
              alert('Erreur: ' + result.error);
            }
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Générer SmartLink automatiquement';
          }
        });
        
        // Copier URL
        function copyToClipboard() {
          const urlInput = document.getElementById('generatedUrl');
          urlInput.select();
          document.execCommand('copy');
          
          const copyBtn = event.target;
          copyBtn.textContent = 'Copié !';
          setTimeout(() => copyBtn.textContent = 'Copier', 2000);
        }
        
        // Déconnexion
        function logout() {
          if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            fetch('/api/logout', { method: 'POST' })
              .then(() => window.location.href = '/')
              .catch(() => window.location.href = '/');
          }
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