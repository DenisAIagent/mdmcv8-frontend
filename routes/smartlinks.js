// Routes principales pour SmartLinks HTML statiques
// Sert les fichiers HTML générés avec métadonnées Open Graph optimales

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');

const router = express.Router();
const htmlGenerator = new StaticHtmlGenerator();

// Configuration multer pour upload de fichiers audio
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/audio/'));
  },
  filename: function (req, file, cb) {
    // Nom unique avec timestamp + extension originale
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtrage des fichiers audio seulement
const audioFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers audio sont autorisés'), false);
  }
};

// Configuration multer avec limites
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  }
});

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
        .file-input {
          padding: 0.5rem !important;
          cursor: pointer;
        }
        .file-input::-webkit-file-upload-button {
          background: #cc271a;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-right: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        .file-input::-webkit-file-upload-button:hover {
          background: #a61f15;
        }
        .audio-preview {
          margin-top: 1rem;
          padding: 1rem;
          background: #1a1a1a;
          border-radius: 0.5rem;
          border: 1px solid rgba(204, 39, 26, 0.3);
        }
        .audio-info {
          color: #cccccc;
          font-size: 0.85rem;
          margin: 0.5rem 0 0 0;
        }
        .step-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .step-section:last-child {
          border-bottom: none;
        }
        .step-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #cc271a;
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          font-size: 1.2rem;
        }
        .step-header h3 {
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.3rem;
          margin: 0;
        }
        .subsection {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #1a1a1a;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .subsection-title {
          color: #cc271a;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .tracking-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-actions {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
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
        .secondary-btn {
          background: transparent;
          border: 2px solid rgba(255,255,255,0.3);
          color: #cccccc;
          padding: 0.875rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .secondary-btn:hover {
          border-color: rgba(255,255,255,0.5);
          color: #ffffff;
          background: rgba(255,255,255,0.05);
        }
        .tracking-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
          .tracking-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <header class="header">
        <img src="/images/MDMC_logo_blanc fond transparent.png" alt="MDMC" class="logo">
        <div class="user-info">
          <span>Dashboard SmartLinks</span>
          <button class="logout-btn" id="logoutBtn">Déconnexion</button>
        </div>
      </header>
      
      <div class="container">
        <h1 class="page-title">Créer un SmartLink</h1>
        <p class="page-subtitle">Générez des liens universels pour vos sorties musicales</p>
        
        <!-- Formulaire unique avec toutes les options -->
        <div class="form-card">
          <form id="completeSmartlinkForm" enctype="multipart/form-data">
            
            <!-- ÉTAPE 1: URL de la musique -->
            <div class="step-section">
              <div class="step-header">
                <span class="step-number">1</span>
                <h3>URL de la musique</h3>
              </div>
              <div class="form-group">
                <label for="sourceUrl">Lien de votre musique</label>
                <input type="url" id="sourceUrl" name="sourceUrl" placeholder="Collez votre lien Spotify, Apple Music, Deezer, YouTube..." required>
                <small class="help-text">Collez n'importe quel lien de plateforme musicale et nous récupérerons automatiquement toutes les informations</small>
              </div>
            </div>

            <!-- ÉTAPE 2: Personnalisation -->
            <div class="step-section">
              <div class="step-header">
                <span class="step-number">2</span>
                <h3>Personnalisation (optionnel)</h3>
              </div>
              
              <!-- Audio de prévisualisation -->
              <div class="subsection">
                <h4 class="subsection-title">🎵 Audio de prévisualisation</h4>
                <div class="form-group">
                  <label for="audioFile">Fichier audio (optionnel)</label>
                  <input type="file" id="audioFile" name="audioFile" accept=".mp3,.wav" class="file-input">
                  <small class="help-text">Format MP3 ou WAV, durée maximum 30 secondes. Seuls les 3 premières secondes seront lues dans le SmartLink.</small>
                  <div id="audioPreview" class="audio-preview" style="display: none;">
                    <audio id="audioPreviewPlayer" controls style="width: 100%; margin-top: 0.5rem;"></audio>
                    <p class="audio-info" id="audioInfo"></p>
                  </div>
                </div>
              </div>

              <!-- Tracking Analytics -->
              <div class="subsection">
                <h4 class="subsection-title">📊 Tracking Analytics</h4>
                <div class="tracking-grid">
                  <div class="form-group">
                    <label for="customGa4Id">Google Analytics 4</label>
                    <input type="text" id="customGa4Id" name="ga4Id" placeholder="G-XXXXXXXXXX">
                    <small class="help-text">ID de mesure GA4 (ex: G-XXXXXXXXXX)</small>
                  </div>
                  
                  <div class="form-group">
                    <label for="customGtmId">Google Tag Manager</label>
                    <input type="text" id="customGtmId" name="gtmId" placeholder="GTM-XXXXXXX">
                    <small class="help-text">ID du conteneur GTM (ex: GTM-XXXXXXX)</small>
                  </div>
                  
                  <div class="form-group">
                    <label for="customMetaPixelId">Meta Pixel (Facebook)</label>
                    <input type="text" id="customMetaPixelId" name="metaPixelId" placeholder="123456789012345">
                    <small class="help-text">ID du pixel Meta/Facebook</small>
                  </div>
                  
                  <div class="form-group">
                    <label for="customTiktokPixelId">TikTok Pixel</label>
                    <input type="text" id="customTiktokPixelId" name="tiktokPixelId" placeholder="CXXXXXXXXXXXXXXX">
                    <small class="help-text">ID du pixel TikTok</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton de génération -->
            <div class="form-actions">
              <button type="submit" class="create-btn">🚀 Générer mon SmartLink complet</button>
            </div>
          </form>
          
          <!-- Résultat -->
          <div id="result" class="result-section">
            <h3>🎉 SmartLink créé avec succès !</h3>
            
            <!-- Informations récupérées -->
            <div class="retrieved-info">
              <h4 style="color: #cc271a; margin: 0 0 1rem 0; font-size: 1rem;">📄 Informations détectées</h4>
              <div class="info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <p><strong>Titre :</strong> <span id="retrievedTitle">-</span></p>
                  <p><strong>Artiste :</strong> <span id="retrievedArtist">-</span></p>
                </div>
                <div>
                  <p><strong>Plateformes :</strong> <span id="platformCount">0</span></p>
                  <p><strong>Audio ajouté :</strong> <span id="audioStatus">Non</span></p>
                </div>
              </div>
            </div>
            
            <!-- URL générée -->
            <div class="url-section">
              <h4 style="color: #cc271a; margin: 0 0 1rem 0; font-size: 1rem;">🔗 Votre SmartLink</h4>
              <div class="smartlink-url">
                <input type="text" id="generatedUrl" readonly>
                <button id="copyBtn" onclick="copyToClipboard()">Copier</button>
              </div>
              <p class="help-text" style="margin-top: 0.5rem;">Partagez ce lien sur vos réseaux sociaux, site web, ou partout où vous voulez !</p>
            </div>
            
            <!-- Actions -->
            <div class="result-actions" style="margin-top: 1.5rem; text-align: center;">
              <button onclick="testSmartLink()" class="secondary-btn" style="margin-right: 1rem;">👀 Tester le SmartLink</button>
              <button onclick="createAnother()" class="secondary-btn">➕ Créer un autre</button>
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
        // Initialisation des event listeners au chargement
        document.addEventListener('DOMContentLoaded', function() {
          // Event listeners pour les boutons
          const logoutBtn = document.getElementById('logoutBtn');
          if (logoutBtn) logoutBtn.addEventListener('click', logout);
        });
        
        // Validation et preview du fichier audio
        document.getElementById('audioFile').addEventListener('change', function(e) {
          const file = e.target.files[0];
          const audioPreview = document.getElementById('audioPreview');
          const audioPlayer = document.getElementById('audioPreviewPlayer');
          const audioInfo = document.getElementById('audioInfo');
          
          if (file) {
            // Validation du format
            if (!file.type.match(/audio\/(mp3|wav|mpeg)/)) {
              alert('Format non supporté. Utilisez MP3 ou WAV.');
              e.target.value = '';
              audioPreview.style.display = 'none';
              return;
            }
            
            // Validation de la taille (10MB max)
            if (file.size > 10 * 1024 * 1024) {
              alert('Fichier trop volumineux. Maximum 10MB.');
              e.target.value = '';
              audioPreview.style.display = 'none';
              return;
            }
            
            // Affichage de la preview
            const objectUrl = URL.createObjectURL(file);
            audioPlayer.src = objectUrl;
            audioInfo.textContent = \`\${file.name} (\${(file.size / 1024 / 1024).toFixed(2)}MB)\`;
            audioPreview.style.display = 'block';
            
            // Validation de la durée
            audioPlayer.addEventListener('loadedmetadata', function() {
              if (audioPlayer.duration > 30) {
                audioInfo.innerHTML += \` <span style="color: #cc271a;">⚠️ Durée: \${audioPlayer.duration.toFixed(1)}s (>30s détecté, seules les 3 premières secondes seront lues)</span>\`;
              } else {
                audioInfo.innerHTML += \` <span style="color: #4CAF50;">✓ Durée: \${audioPlayer.duration.toFixed(1)}s</span>\`;
              }
            });
          } else {
            audioPreview.style.display = 'none';
          }
        });

        // Gestion du formulaire complet
        document.getElementById('completeSmartlinkForm').addEventListener('submit', async (e) => {
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
          submitBtn.textContent = '🔄 Création du SmartLink complet...';
          resultSection.style.display = 'none';
          
          try {
            // Étape 1: Upload audio si présent
            let audioUrl = null;
            const audioFile = formData.get('audioFile');
            if (audioFile && audioFile.size > 0) {
              submitBtn.textContent = '🎵 Upload du fichier audio...';
              
              const audioFormData = new FormData();
              audioFormData.append('audioFile', audioFile);
              
              const audioResponse = await fetch('/api/upload-audio', {
                method: 'POST',
                body: audioFormData
              });
              
              if (audioResponse.ok) {
                const audioResult = await audioResponse.json();
                audioUrl = audioResult.audio.url;
                console.log('Audio uploadé:', audioUrl);
              } else {
                const error = await audioResponse.json();
                alert('Erreur upload audio: ' + error.error);
                return;
              }
            }
            
            // Étape 2: Création du SmartLink avec toutes les données
            submitBtn.textContent = '🔗 Génération du SmartLink...';
            
            const smartlinkData = {
              sourceUrl,
              audioUrl,
              tracking: {
                ga4Id: formData.get('ga4Id')?.trim() || null,
                gtmId: formData.get('gtmId')?.trim() || null,
                metaPixelId: formData.get('metaPixelId')?.trim() || null,
                tiktokPixelId: formData.get('tiktokPixelId')?.trim() || null
              }
            };
            
            const response = await fetch('/api/create-smartlink-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(smartlinkData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Affichage du résultat
              document.getElementById('retrievedTitle').textContent = result.trackTitle || result.title;
              document.getElementById('retrievedArtist').textContent = result.artistName || result.artist?.name;
              document.getElementById('platformCount').textContent = result.platformCount || result.platforms?.length || 0;
              document.getElementById('generatedUrl').value = result.smartlinkUrl || result.url;
              
              // Statut audio
              document.getElementById('audioStatus').textContent = result.audioUrl ? 'Oui ✅' : 'Non';
              document.getElementById('audioStatus').style.color = result.audioUrl ? '#4CAF50' : '#cccccc';
              
              resultSection.style.display = 'block';
              resultSection.scrollIntoView({ behavior: 'smooth' });
              
              submitBtn.textContent = '✅ SmartLink créé avec succès !';
              setTimeout(() => {
                submitBtn.textContent = '🚀 Générer mon SmartLink complet';
              }, 3000);
              
            } else {
              alert('Erreur: ' + result.error);
              submitBtn.textContent = '🚀 Générer mon SmartLink complet';
            }
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
            submitBtn.textContent = '🚀 Générer mon SmartLink complet';
          } finally {
            submitBtn.disabled = false;
          }
        });
        
        // Copier URL
        function copyToClipboard() {
          const urlInput = document.getElementById('generatedUrl');
          urlInput.select();
          document.execCommand('copy');
          
          const copyBtn = document.getElementById('copyBtn');
          const originalText = copyBtn.textContent;
          copyBtn.textContent = '✅ Copié !';
          copyBtn.style.background = '#4CAF50';
          
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#cc271a';
          }, 2000);
        }
        
        // Tester le SmartLink (ouverture dans nouvel onglet)
        function testSmartLink() {
          const url = document.getElementById('generatedUrl').value;
          if (url) {
            window.open(url, '_blank');
          }
        }
        
        // Créer un autre SmartLink
        function createAnother() {
          // Reset du formulaire
          document.getElementById('completeSmartlinkForm').reset();
          document.getElementById('result').style.display = 'none';
          document.getElementById('audioPreview').style.display = 'none';
          
          // Scroll vers le haut
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Focus sur le champ URL
          document.getElementById('sourceUrl').focus();
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

// Route d'édition SmartLink : interface complète post-génération
router.get('/edit/:artistSlug/:trackSlug', async (req, res) => {
  try {
    const { artistSlug, trackSlug } = req.params;
    
    // TODO: Récupérer les données depuis la DB/fichier temporaire
    // Pour l'instant, on simule les données
    const smartlinkData = {
      title: 'Wait and Bleed',
      artist: { name: 'Slipknot', slug: artistSlug },
      slug: trackSlug,
      description: 'Écouter "Wait and Bleed" de Slipknot sur toutes les plateformes de streaming musical.',
      coverImageUrl: 'https://i.scdn.co/image/ab67616d0000b27349de1b4acdde02e84c6023b7',
      platforms: [
        { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com/track/15DLl1r2zi07Ssq5RT1yT0', enabled: true },
        { id: 'apple', name: 'Apple Music', url: 'https://geo.music.apple.com/fr/album/_/927731469?i=927731733&mt=1&app=music&ls=1&at=1000lHKX&ct=api_http&itscg=30200&itsct=odsl_m', enabled: true },
        { id: 'deezer', name: 'Deezer', url: 'https://www.deezer.com/track/4197811', enabled: true },
        { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/watch?v=B1zCN0YhW1s', enabled: true },
        { id: 'youtubeMusic', name: 'YouTube Music', url: 'https://music.youtube.com/watch?v=B1zCN0YhW1s', enabled: true },
        { id: 'tidal', name: 'Tidal', url: 'https://listen.tidal.com/track/3113167', enabled: true },
        { id: 'soundcloud', name: 'SoundCloud', url: 'https://soundcloud.com/slipknot/wait-and-bleed?utm_medium=api&utm_campaign=social_sharing&utm_source=id_314547', enabled: true },
        { id: 'amazon', name: 'Amazon Music', url: 'https://music.amazon.com/albums/B0023UCW38?trackAsin=B0023UB90K', enabled: true },
        { id: 'napster', name: 'Napster', url: 'https://play.napster.com/track/tra.2953351', enabled: true },
        { id: 'pandora', name: 'Pandora', url: 'https://www.pandora.com/TR:7471639', enabled: true }
      ]
    };
    
    res.send(generateEditInterface(smartlinkData));
    
  } catch (error) {
    console.error('❌ Erreur route édition:', error);
    res.status(500).send('Erreur chargement interface d\'édition');
  }
});

// Fonction pour générer l'interface d'édition
function generateEditInterface(data) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Édition SmartLink - ${data.title} | MDMC</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #0a0a0a;
          color: #ffffff;
          line-height: 1.6;
        }
        .header {
          background: #141414;
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo { height: 40px; width: auto; }
        .main-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .edit-panel {
          background: #141414;
          border-radius: 1rem;
          padding: 2rem;
          height: fit-content;
        }
        .preview-panel {
          background: #1a1a1a;
          border-radius: 1rem;
          padding: 2rem;
          position: sticky;
          top: 2rem;
          height: fit-content;
        }
        .section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .section:last-child { border-bottom: none; }
        .section-title {
          color: #cc271a;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #ffffff;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          background: #1a1a1a;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #cc271a;
          box-shadow: 0 0 0 3px rgba(204, 39, 26, 0.1);
        }
        .platform-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background: #1a1a1a;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .platform-checkbox {
          margin-right: 1rem;
          width: 18px;
          height: 18px;
          accent-color: #cc271a;
        }
        .platform-info {
          flex: 1;
        }
        .platform-name {
          font-weight: 500;
          color: #ffffff;
        }
        .platform-url {
          font-size: 0.8rem;
          color: #999999;
          font-family: monospace;
          word-break: break-all;
        }
        .preview-smartlink {
          background: #0f0f0f;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(204, 39, 26, 0.2);
        }
        .preview-cover {
          width: 200px;
          height: 200px;
          border-radius: 1rem;
          margin: 0 auto 1.5rem;
          object-fit: cover;
        }
        .preview-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        .preview-artist {
          font-size: 1.1rem;
          color: #cccccc;
          margin-bottom: 2rem;
        }
        .preview-platforms {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
        }
        .preview-platform {
          padding: 0.75rem 0.5rem;
          background: #cc271a;
          color: #ffffff;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .preview-platform:hover {
          background: #a61f15;
          transform: translateY(-2px);
        }
        .save-btn {
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
          margin-top: 2rem;
        }
        .save-btn:hover {
          background: #a61f15;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(204, 39, 26, 0.3);
        }
        .help-text {
          font-size: 0.8rem;
          color: #999999;
          margin-top: 0.25rem;
          font-style: italic;
        }
        @media (max-width: 1200px) {
          .main-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .preview-panel {
            position: relative;
            top: 0;
          }
        }
      </style>
    </head>
    <body>
      <header class="header">
        <img src="/images/MDMC_logo_blanc fond transparent.png" alt="MDMC" class="logo">
        <div>Panneau d'Administration</div>
      </header>
      
      <div class="main-container">
        <!-- Panel d'édition -->
        <div class="edit-panel">
          <h1 style="color: #cc271a; font-family: 'Poppins', sans-serif; font-size: 2rem; margin-bottom: 2rem;">
            📝 Créer un Nouveau SmartLink
          </h1>
          
          <!-- Métadonnées -->
          <div class="section">
            <h2 class="section-title">🎵 Métadonnées du morceau</h2>
            <div class="form-group">
              <label for="title">Titre du morceau *</label>
              <input type="text" id="title" value="${data.title}" required>
              <div class="help-text">✅ Titre détecté automatiquement depuis l'API</div>
            </div>
            <div class="form-group">
              <label for="artist">Nom de l'artiste *</label>
              <input type="text" id="artist" value="${data.artist.name}" required>
              <div class="help-text">Nom détecté automatiquement depuis l'API</div>
            </div>
            <div class="form-group">
              <label for="description">Meta description</label>
              <textarea id="description" rows="3">${data.description}</textarea>
              <div class="help-text">Description SEO qui apparaîtra dans les résultats de recherche et partages sociaux (max 160 caractères)</div>
            </div>
            <div class="form-group">
              <label for="isrc">ISRC</label>
              <input type="text" id="isrc" placeholder="ISRC">
            </div>
            <div class="form-group">
              <label for="label">Label</label>
              <input type="text" id="label" placeholder="Label">
            </div>
          </div>
          
          <!-- Plateformes -->
          <div class="section">
            <h2 class="section-title">🔗 Liens des plateformes</h2>
            <div class="help-text" style="margin-bottom: 1rem;">
              Sélectionnez les plateformes à afficher sur votre SmartLink
            </div>
            ${data.platforms.map(platform => `
              <div class="platform-item">
                <input type="checkbox" class="platform-checkbox" id="platform-${platform.id}" ${platform.enabled ? 'checked' : ''}>
                <div class="platform-info">
                  <div class="platform-name">${platform.name}</div>
                  <div class="platform-url">${platform.url}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Tracking UTM -->
          <div class="section">
            <h2 class="section-title">📊 Paramètres UTM</h2>
            <div class="help-text" style="margin-bottom: 1rem;">
              Ces paramètres seront automatiquement ajoutés à tous les liens de plateformes pour le tracking analytics
            </div>
            <div class="form-group">
              <label for="utm_source">Source UTM</label>
              <input type="text" id="utm_source" value="mdmc_smartlinks" placeholder="ex: wiseband, instagram, newsletter">
              <div class="help-text">Source de trafic (ex: facebook, newsletter, website)</div>
            </div>
            <div class="form-group">
              <label for="utm_medium">Medium UTM</label>
              <input type="text" id="utm_medium" value="smartlink" placeholder="ex: smartlink, social, email">
              <div class="help-text">Type de medium (ex: email, social, cpc, smartlink)</div>
            </div>
            <div class="form-group">
              <label for="utm_campaign">Campaign UTM</label>
              <input type="text" id="utm_campaign" value="${data.artist.slug}-${data.slug}" placeholder="ex: nom-artiste-titre">
              <div class="help-text">Nom de la campagne marketing</div>
            </div>
            
            <!-- Aperçu des URLs avec tracking -->
            <div id="utmPreview" style="background: #0f0f0f; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; display: none;">
              <h4 style="color: #cc271a; margin-bottom: 0.5rem; font-size: 0.9rem;">🔗 Aperçu des URLs avec tracking</h4>
              <div id="trackedUrls" style="font-family: monospace; font-size: 0.8rem; color: #999; max-height: 200px; overflow-y: auto;"></div>
              <button type="button" id="hideUtmBtn" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #cc271a; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                Masquer l'aperçu
              </button>
            </div>
            <button type="button" id="showUtmBtn" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: transparent; color: #cc271a; border: 1px solid #cc271a; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
              🔍 Voir les URLs avec tracking
            </button>
          </div>
          
          <!-- Section Tracking Analytics -->
          <div class="section">
            <h2 class="section-title">Analytics et Pixels de Tracking</h2>
            <div class="help-text" style="margin-bottom: 1rem;">
              Ajoutez vos codes de tracking personnalisés pour ce SmartLink spécifique
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label for="ga4Id">Google Analytics 4</label>
                <input type="text" id="ga4Id" name="ga4Id" placeholder="G-XXXXXXXXXX" value="">
                <div class="help-text">ID de mesure GA4 (ex: G-XXXXXXXXXX)</div>
              </div>
              
              <div class="form-group">
                <label for="gtmId">Google Tag Manager</label>
                <input type="text" id="gtmId" name="gtmId" placeholder="GTM-XXXXXXX" value="">
                <div class="help-text">ID du conteneur GTM (ex: GTM-XXXXXXX)</div>
              </div>
              
              <div class="form-group">
                <label for="metaPixelId">Meta Pixel (Facebook)</label>
                <input type="text" id="metaPixelId" name="metaPixelId" placeholder="123456789012345" value="">
                <div class="help-text">ID du pixel Meta/Facebook</div>
              </div>
              
              <div class="form-group">
                <label for="tiktokPixelId">TikTok Pixel</label>
                <input type="text" id="tiktokPixelId" name="tiktokPixelId" placeholder="CXXXXXXXXXXXXXXX" value="">
                <div class="help-text">ID du pixel TikTok</div>
              </div>
            </div>
            
            <div class="info-box" style="background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #cc271a; margin-bottom: 1rem;">
              <div style="color: #cc271a; font-weight: 600; margin-bottom: 0.5rem;">Priorité des pixels :</div>
              <div style="color: #cccccc; font-size: 0.9rem;">
                • Les pixels renseignés ici seront utilisés en priorité<br>
                • Si vides, les pixels globaux du service seront utilisés<br>
                • Laissez vide si vous ne souhaitez pas de tracking pour ce SmartLink
              </div>
            </div>
          </div>
          
          <button class="save-btn" id="saveBtn">
            Générer SmartLink Final
          </button>
        </div>
        
        <!-- Panel de prévisualisation -->
        <div class="preview-panel">
          <h3 style="color: #cc271a; font-family: 'Poppins', sans-serif; margin-bottom: 1rem;">
            👀 Prévisualisation
          </h3>
          <div class="preview-smartlink">
            <img src="${data.coverImageUrl}" alt="${data.title}" class="preview-cover">
            <div class="preview-title">${data.title}</div>
            <div class="preview-artist">${data.artist.name}</div>
            <div style="color: #cccccc; margin-bottom: 1.5rem; font-size: 0.9rem;">
              Choisissez votre plateforme préférée
            </div>
            <div class="preview-platforms">
              ${data.platforms.filter(p => p.enabled).map(platform => `
                <div class="preview-platform">${platform.name}</div>
              `).join('')}
            </div>
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: #999999;">
              Propulsé par MDMC Music Ads<br>
              <strong>${data.platforms.filter(p => p.enabled).length} liens de plateformes trouvés !</strong>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Initialisation des event listeners au chargement
        document.addEventListener('DOMContentLoaded', function() {
          // Event listeners pour les boutons
          const logoutBtn = document.getElementById('logoutBtn');
          const copyBtn = document.getElementById('copyBtn');
          const showUtmBtn = document.getElementById('showUtmBtn');
          const hideUtmBtn = document.getElementById('hideUtmBtn');
          const saveBtn = document.getElementById('saveBtn');
          
          if (logoutBtn) logoutBtn.addEventListener('click', logout);
          if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
          if (showUtmBtn) showUtmBtn.addEventListener('click', toggleUtmPreview);
          if (hideUtmBtn) hideUtmBtn.addEventListener('click', toggleUtmPreview);
          if (saveBtn) saveBtn.addEventListener('click', saveSmartLink);
        });
        
        // Mise à jour en temps réel de la prévisualisation
        document.getElementById('title').addEventListener('input', (e) => {
          document.querySelector('.preview-title').textContent = e.target.value;
        });
        
        document.getElementById('artist').addEventListener('input', (e) => {
          document.querySelector('.preview-artist').textContent = e.target.value;
        });
        
        // Gestion des checkboxes plateformes et UTM
        document.querySelectorAll('.platform-checkbox').forEach(checkbox => {
          checkbox.addEventListener('change', updatePreview);
        });
        
        // Écoute des changements UTM
        document.querySelectorAll('#utm_source, #utm_medium, #utm_campaign').forEach(input => {
          input.addEventListener('input', updatePreview);
        });
        
        function updatePreview() {
          const enabledPlatforms = [];
          document.querySelectorAll('.platform-checkbox:checked').forEach(checkbox => {
            const platformId = checkbox.id.replace('platform-', '');
            const platformName = checkbox.closest('.platform-item').querySelector('.platform-name').textContent;
            enabledPlatforms.push(platformName);
          });
          
          const previewPlatforms = document.querySelector('.preview-platforms');
          previewPlatforms.innerHTML = enabledPlatforms.map(name => 
            \`<div class="preview-platform">\${name}</div>\`
          ).join('');
          
          // Mise à jour du compteur avec UTM info
          const utmSource = document.getElementById('utm_source').value || 'mdmc_smartlinks';
          const utmMedium = document.getElementById('utm_medium').value || 'smartlink';
          const utmCampaign = document.getElementById('utm_campaign').value || 'music_promotion';
          
          document.querySelector('.preview-smartlink div:last-child strong').innerHTML = 
            \`\${enabledPlatforms.length} liens de plateformes trouvés !<br>
            <small style="font-weight: normal; color: #999;">UTM: \${utmSource} | \${utmMedium} | \${utmCampaign}</small>\`;
          
          // Mise à jour de l'aperçu UTM si visible
          updateUtmPreview();
        }
        
        function toggleUtmPreview() {
          const preview = document.getElementById('utmPreview');
          const btn = document.getElementById('showUtmBtn');
          
          if (preview.style.display === 'none') {
            preview.style.display = 'block';
            btn.style.display = 'none';
            updateUtmPreview();
          } else {
            preview.style.display = 'none';
            btn.style.display = 'inline-block';
          }
        }
        
        function updateUtmPreview() {
          const preview = document.getElementById('utmPreview');
          if (preview.style.display === 'none') return;
          
          const utmSource = document.getElementById('utm_source').value || 'mdmc_smartlinks';
          const utmMedium = document.getElementById('utm_medium').value || 'smartlink';
          const utmCampaign = document.getElementById('utm_campaign').value || 'music_promotion';
          
          const trackedUrls = document.getElementById('trackedUrls');
          let urlsHtml = '';
          
          // Génération des URLs avec UTM pour les plateformes sélectionnées
          document.querySelectorAll('.platform-checkbox:checked').forEach(checkbox => {
            const platformItem = checkbox.closest('.platform-item');
            const platformName = platformItem.querySelector('.platform-name').textContent;
            const originalUrl = platformItem.querySelector('.platform-url').textContent;
            
            try {
              const url = new URL(originalUrl);
              url.searchParams.set('utm_source', utmSource);
              url.searchParams.set('utm_medium', utmMedium);
              url.searchParams.set('utm_campaign', utmCampaign);
              url.searchParams.set('utm_content', platformName.toLowerCase().replace(' ', '_'));
              url.searchParams.set('mdmc_source', 'smartlink');
              url.searchParams.set('mdmc_platform', platformName.toLowerCase());
              
              urlsHtml += \`
                <div style="margin-bottom: 1rem; padding: 0.5rem; background: #1a1a1a; border-radius: 0.25rem;">
                  <strong style="color: #cc271a;">\${platformName}:</strong><br>
                  <div style="word-break: break-all; margin-top: 0.25rem;">\${url.toString()}</div>
                </div>
              \`;
            } catch (error) {
              urlsHtml += \`
                <div style="margin-bottom: 1rem; padding: 0.5rem; background: #1a1a1a; border-radius: 0.25rem;">
                  <strong style="color: #cc271a;">\${platformName}:</strong><br>
                  <div style="color: #ff6b6b;">Erreur: URL invalide</div>
                </div>
              \`;
            }
          });
          
          if (!urlsHtml) {
            urlsHtml = '<div style="color: #666; font-style: italic;">Sélectionnez au moins une plateforme pour voir les URLs trackées</div>';
          }
          
          trackedUrls.innerHTML = urlsHtml;
        }
        
        async function saveSmartLink() {
          const saveBtn = document.querySelector('.save-btn');
          
          // Collecte des données du formulaire
          const title = document.getElementById('title').value.trim();
          const artistName = document.getElementById('artist').value.trim();
          
          const smartlinkData = {
            // Format attendu par staticHtmlGenerator
            trackTitle: title,
            title: title,
            artist: {
              name: artistName,
              slug: '${data.artist.slug}'
            },
            slug: '${data.slug}',
            description: document.getElementById('description').value.trim(),
            isrc: document.getElementById('isrc').value.trim(),
            label: document.getElementById('label').value.trim(),
            coverImageUrl: '${data.coverImageUrl}',
            
            // Plateformes sélectionnées (format platformLinks)
            platformLinks: [],
            
            // Paramètres UTM
            utm: {
              source: document.getElementById('utm_source').value.trim(),
              medium: document.getElementById('utm_medium').value.trim(),
              campaign: document.getElementById('utm_campaign').value.trim()
            },
            
            // Pixels de tracking personnalisés
            tracking: {
              ga4Id: document.getElementById('ga4Id').value.trim() || null,
              gtmId: document.getElementById('gtmId').value.trim() || null,
              metaPixelId: document.getElementById('metaPixelId').value.trim() || null,
              tiktokPixelId: document.getElementById('tiktokPixelId').value.trim() || null
            },
            
            // Métadonnées techniques
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Récupération des plateformes sélectionnées (format platformLinks)
          document.querySelectorAll('.platform-checkbox:checked').forEach(checkbox => {
            const platformId = checkbox.id.replace('platform-', '');
            const platformItem = checkbox.closest('.platform-item');
            const platformName = platformItem.querySelector('.platform-name').textContent;
            const platformUrl = platformItem.querySelector('.platform-url').textContent;
            
            smartlinkData.platformLinks.push({
              platform: platformId,
              url: platformUrl,
              enabled: true,
              displayName: platformName
            });
          });
          
          // Validation
          if (!smartlinkData.title || !smartlinkData.artist.name) {
            alert('Veuillez remplir le titre et le nom de l\\'artiste');
            return;
          }
          
          if (smartlinkData.platformLinks.length === 0) {
            alert('Veuillez sélectionner au moins une plateforme');
            return;
          }
          
          // Animation du bouton
          saveBtn.disabled = true;
          saveBtn.innerHTML = '⏳ Génération en cours...';
          
          try {
            // Appel API pour sauvegarder et générer le SmartLink final
            const response = await fetch(\`/api/update/\${smartlinkData.artist.slug}/\${smartlinkData.slug}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(smartlinkData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Succès - Redirection vers le SmartLink généré
              saveBtn.innerHTML = '✅ SmartLink généré !';
              
              setTimeout(() => {
                const finalUrl = \`https://smartlink.mdmcmusicads.com/\${smartlinkData.artist.slug}/\${smartlinkData.slug}\`;
                
                // Afficher le résultat final
                if (confirm(\`SmartLink généré avec succès !\\n\\nURL: \${finalUrl}\\n\\nVoulez-vous ouvrir le SmartLink dans un nouvel onglet ?\`)) {
                  window.open(finalUrl, '_blank');
                }
                
                // Copier l'URL dans le presse-papier
                navigator.clipboard.writeText(finalUrl).then(() => {
                  console.log('URL copiée dans le presse-papier');
                }).catch(err => {
                  console.warn('Impossible de copier dans le presse-papier:', err);
                });
                
              }, 1000);
              
            } else {
              throw new Error(result.error || 'Erreur lors de la génération');
            }
            
          } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la génération du SmartLink: ' + error.message);
            
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Générer SmartLink Final';
          }
        }
      </script>
    </body>
    </html>
  `;
}

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