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
          padding: 1rem 1.25rem;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 0.75rem;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          position: relative;
        }
        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }
        .form-group input:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(26, 26, 26, 0.9);
        }
        .form-group input:focus {
          outline: none;
          border-color: #E50914;
          box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.15), 0 8px 24px rgba(229, 9, 20, 0.1);
          background: rgba(26, 26, 26, 0.95);
          transform: translateY(-1px);
        }
        .form-group input:focus::placeholder {
          color: rgba(255, 255, 255, 0.7);
          transform: translateY(-2px);
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

// Route dashboard moderne pour MDMC SmartLinks
router.get('/dashboard', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | MDMC SmartLinks</title>
  <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0U1MDkxNCIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHA+dGggZD0iTTIwIDhIMjhWMTZIMjBWOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCAyMEgyOFYyOEgyMFYyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --primary: #E50914;
      --primary-hover: #cc271a;
      --primary-light: rgba(229, 9, 20, 0.1);
      --background: #0a0a0a;
      --surface: #111111;
      --surface-light: #161616;
      --border: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.16);
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --text-muted: #666666;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --gradient: linear-gradient(135deg, var(--primary) 0%, #cc271a 100%);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      --radius: 12px;
      --radius-sm: 8px;
      --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--background);
      color: var(--text-primary);
      line-height: 1.6;
      font-size: 14px;
      overflow-x: hidden;
    }

    /* Header moderne et fin */
    .header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .logo {
      height: 32px;
      width: auto;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .logout-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      cursor: pointer;
      transition: var(--transition);
      font-weight: 500;
    }

    .logout-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Layout principal en 2 colonnes */
    .main-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 32px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px;
      min-height: calc(100vh - 64px);
    }

    /* Panel de formulaire */
    .form-panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      margin-bottom: 8px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      letter-spacing: -0.025em;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 400;
    }

    /* Cards modernes et fines */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: var(--transition);
    }

    .card:hover {
      border-color: var(--border-hover);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .step-indicator {
      width: 24px;
      height: 24px;
      background: var(--gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Formulaires modernes */
    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      color: var(--text-primary);
      font-size: 13px;
      font-weight: 500;
    }

    .form-label.required::after {
      content: "*";
      color: var(--primary);
      margin-left: 2px;
    }

    .form-input {
      width: 100%;
      background: var(--surface-light);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      color: var(--text-primary);
      font-size: 14px;
      transition: var(--transition);
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    .input-group {
      display: flex;
      gap: 8px;
    }

    .input-group .form-input {
      flex: 1;
    }

    .help-text {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Boutons modernes */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      border: none;
      text-decoration: none;
      font-family: inherit;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--gradient);
      color: white;
      box-shadow: var(--shadow);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: var(--shadow);
    }

    .btn-secondary {
      background: var(--surface-light);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .btn-ghost {
      background: none;
      color: var(--text-secondary);
      border: 1px solid transparent;
    }

    .btn-ghost:hover {
      color: var(--text-primary);
      background: var(--surface-light);
    }

    .btn-sm {
      padding: 6px 10px;
      font-size: 12px;
    }

    /* États de recherche */
    .search-state {
      padding: 16px;
      border-radius: var(--radius-sm);
      margin-top: 12px;
      display: none;
    }

    .search-state.loading {
      background: var(--primary-light);
      border: 1px solid var(--primary);
      display: block;
    }

    .search-state.success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid var(--success);
      display: block;
    }

    .search-state.error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error);
      display: block;
    }

    /* Track Info Card */
    .track-card {
      background: var(--surface-light);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 12px 0;
    }

    .track-artwork {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      background: var(--surface);
    }

    .track-info h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .track-info p {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Plateformes grid compacte */
    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 8px;
      margin: 12px 0;
    }

    .platform-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: var(--surface-light);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
      font-size: 12px;
    }

    .platform-item:hover {
      border-color: var(--border-hover);
    }

    .platform-item.selected {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .platform-checkbox {
      width: 14px;
      height: 14px;
      accent-color: var(--primary);
    }

    .platform-name {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 12px;
    }

    /* Analytics section compacte */
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Panel de prévisualisation */
    .preview-panel {
      position: sticky;
      top: 96px;
      height: fit-content;
    }

    .preview-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .preview-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: between;
      gap: 12px;
    }

    .preview-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
    }

    .preview-status {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }

    .preview-status.draft {
      background: rgba(156, 163, 175, 0.2);
      color: #9ca3af;
    }

    .preview-status.ready {
      background: var(--primary-light);
      color: var(--primary);
    }

    /* SmartLink Preview */
    .smartlink-preview {
      padding: 24px;
      text-align: center;
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      min-height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .smartlink-preview.empty {
      color: var(--text-muted);
      font-size: 13px;
    }

    .preview-artwork {
      width: 120px;
      height: 120px;
      border-radius: var(--radius);
      margin: 0 auto 16px;
      object-fit: cover;
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .preview-track-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .preview-artist-name {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .preview-platforms {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }

    .preview-platform {
      background: var(--surface-light);
      border: 1px solid var(--border);
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 500;
      transition: var(--transition);
    }

    .preview-platform:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    /* Stats du bas */
    .preview-stats {
      padding: 12px 16px;
      background: var(--surface-light);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Actions finales */
    .final-actions {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .btn-large {
      width: 100%;
      padding: 14px 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--radius);
    }

    /* États et animations */
    .fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .main-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .preview-panel {
        position: relative;
        top: 0;
      }
    }

    @media (max-width: 768px) {
      .main-layout {
        padding: 16px;
      }
      
      .analytics-grid {
        grid-template-columns: 1fr;
      }
      
      .platforms-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Micro-interactions */
    .card:hover .step-indicator {
      transform: scale(1.1);
    }

    .platform-item:hover .platform-checkbox {
      transform: scale(1.1);
    }

    /* Code/URL styles */
    .code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: var(--surface-light);
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }

    /* Audio upload zone */
    .upload-zone {
      border: 2px dashed var(--border);
      border-radius: var(--radius-sm);
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
    }

    .upload-zone:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .upload-zone.has-file {
      border-style: solid;
      border-color: var(--success);
      background: rgba(16, 185, 129, 0.1);
    }
  </style>
</head>

<body>
  <!-- Header fin et moderne -->
  <header class="header">
    <img src="/images/MDMC_logo_blanc fond transparent.png" alt="MDMC" class="logo">
    <div class="header-info">
      <span>Dashboard SmartLinks</span>
      <button class="logout-btn" id="logoutBtn">Déconnexion</button>
    </div>
  </header>

  <!-- Layout principal en 2 colonnes -->
  <div class="main-layout">
    
    <!-- Panel de formulaire (gauche) -->
    <div class="form-panel">
      
      <!-- En-tête de page -->
      <div class="page-header">
        <h1 class="page-title">Créer un SmartLink</h1>
        <p class="page-subtitle">Générez des liens universels pour vos sorties musicales</p>
      </div>

      <!-- Étape 1: Recherche -->
      <div class="card">
        <div class="card-header">
          <div class="step-indicator">1</div>
          <h3 class="card-title">Recherche de votre musique</h3>
        </div>

        <form id="searchForm">
          <div class="form-group">
            <label class="form-label required" for="sourceUrl">ISRC / UPC ou URL de plateforme</label>
            <div class="input-group">
              <input 
                type="text" 
                id="sourceUrl" 
                class="form-input"
                placeholder="ISRC: USUM71703692 ou https://open.spotify.com/track/..."
                required
              >
              <button type="submit" class="btn btn-primary">
                <span class="search-text">Rechercher</span>
                <div class="loading-spinner" style="display: none;"></div>
              </button>
            </div>
            <div class="help-text">Saisissez un code ISRC, UPC ou collez une URL de plateforme musicale</div>
          </div>

          <!-- États de recherche -->
          <div id="searchLoading" class="search-state loading">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="loading-spinner"></div>
              Recherche en cours...
            </div>
          </div>

          <div id="searchError" class="search-state error">
            <strong>Erreur de recherche</strong>
            <p id="searchErrorMessage">Impossible de trouver cette musique</p>
          </div>

          <div id="searchSuccess" class="search-state success">
            <strong>Musique trouvée !</strong>
            <div id="trackCard" class="track-card">
              <img id="trackArtwork" class="track-artwork" src="" alt="">
              <div class="track-info">
                <h5 id="trackTitle">-</h5>
                <p id="trackArtist">-</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Étape 2: Plateformes (masquée au début) -->
      <div id="platformsCard" class="card" style="display: none;">
        <div class="card-header">
          <div class="step-indicator">2</div>
          <h3 class="card-title">Sélection des plateformes</h3>
        </div>

        <div class="platforms-grid" id="platformsGrid">
          <!-- Rempli dynamiquement -->
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 12px; color: var(--text-muted);">
          <span><strong id="selectedCount">0</strong> plateformes sélectionnées</span>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-ghost btn-sm" id="selectAllBtn">Tout sélectionner</button>
            <button type="button" class="btn btn-ghost btn-sm" id="deselectAllBtn">Tout désélectionner</button>
          </div>
        </div>
      </div>

      <!-- Étape 3: Personnalisation (masquée au début) -->
      <div id="customizationCard" class="card" style="display: none;">
        <div class="card-header">
          <div class="step-indicator">3</div>
          <h3 class="card-title">Personnalisation</h3>
        </div>

        <!-- Audio Upload -->
        <div class="form-group">
          <label class="form-label" for="audioFile">Audio de prévisualisation</label>
          <div class="upload-zone" id="uploadZone">
            <input type="file" id="audioFile" accept=".mp3,.wav" style="display: none;">
            <div id="uploadPlaceholder">
              <p style="margin-bottom: 4px; font-weight: 500;">Glissez un fichier audio ou cliquez pour sélectionner</p>
              <p class="help-text">MP3 ou WAV, max 30s (3s seront lues)</p>
            </div>
            <div id="uploadSuccess" style="display: none;">
              <p style="color: var(--success); font-weight: 500;">Fichier audio ajouté</p>
              <p class="help-text" id="audioInfo">-</p>
            </div>
          </div>
        </div>

        <!-- Analytics Tracking -->
        <div class="form-group">
          <label class="form-label">Tracking Analytics</label>
          <div class="analytics-grid">
            <div>
              <input type="text" class="form-input" id="ga4Id" placeholder="Google Analytics 4">
              <div class="help-text">G-XXXXXXXXXX</div>
            </div>
            <div>
              <input type="text" class="form-input" id="gtmId" placeholder="Google Tag Manager">
              <div class="help-text">GTM-XXXXXXX</div>
            </div>
            <div>
              <input type="text" class="form-input" id="metaPixelId" placeholder="Meta Pixel">
              <div class="help-text">123456789012345</div>
            </div>
            <div>
              <input type="text" class="form-input" id="tiktokPixelId" placeholder="TikTok Pixel">
              <div class="help-text">CXXXXXXXXXXXXXXX</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions finales -->
      <div id="finalActions" class="final-actions" style="display: none;">
        <button id="generateBtn" class="btn btn-primary btn-large">
          <span id="generateText">Générer mon SmartLink</span>
          <div class="loading-spinner" style="display: none;"></div>
        </button>
      </div>

    </div>

    <!-- Panel de prévisualisation (droite) -->
    <div class="preview-panel">
      <div class="preview-card">
        
        <!-- Header de prévisualisation -->
        <div class="preview-header">
          <h3 class="preview-title">Prévisualisation</h3>
          <span id="previewStatus" class="preview-status draft">Brouillon</span>
        </div>

        <!-- Contenu de prévisualisation -->
        <div id="smartlinkPreview" class="smartlink-preview empty">
          <div id="emptyState">
            <p>Recherchez d'abord votre musique pour voir la prévisualisation</p>
          </div>
          
          <div id="previewContent" style="display: none;">
            <img id="previewArtwork" class="preview-artwork" src="" alt="">
            <h4 id="previewTitle" class="preview-track-title">-</h4>
            <p id="previewArtist" class="preview-artist-name">-</p>
            <div id="previewPlatforms" class="preview-platforms">
              <!-- Rempli dynamiquement -->
            </div>
          </div>
        </div>

        <!-- Stats du bas -->
        <div class="preview-stats">
          <span id="platformsCount">0 plateformes</span>
          <span id="audioStatus">Sans audio</span>
        </div>

      </div>
    </div>

  </div>

  <script>
    // État global de l'application
    const state = {
      searchData: null,
      selectedPlatforms: [],
      hasAudio: false,
      isReady: false
    };

    // Éléments du DOM
    const elements = {
      // Formulaire de recherche
      searchForm: document.getElementById('searchForm'),
      sourceUrl: document.getElementById('sourceUrl'),
      searchBtn: document.querySelector('#searchForm button[type="submit"]'),
      searchText: document.querySelector('.search-text'),
      searchSpinner: document.querySelector('#searchForm .loading-spinner'),
      
      // États de recherche
      searchLoading: document.getElementById('searchLoading'),
      searchError: document.getElementById('searchError'),
      searchSuccess: document.getElementById('searchSuccess'),
      searchErrorMessage: document.getElementById('searchErrorMessage'),
      
      // Track card
      trackCard: document.getElementById('trackCard'),
      trackArtwork: document.getElementById('trackArtwork'),
      trackTitle: document.getElementById('trackTitle'),
      trackArtist: document.getElementById('trackArtist'),
      
      // Cards d'étapes
      platformsCard: document.getElementById('platformsCard'),
      customizationCard: document.getElementById('customizationCard'),
      finalActions: document.getElementById('finalActions'),
      
      // Plateformes
      platformsGrid: document.getElementById('platformsGrid'),
      selectedCount: document.getElementById('selectedCount'),
      selectAllBtn: document.getElementById('selectAllBtn'),
      deselectAllBtn: document.getElementById('deselectAllBtn'),
      
      // Audio
      audioFile: document.getElementById('audioFile'),
      uploadZone: document.getElementById('uploadZone'),
      uploadPlaceholder: document.getElementById('uploadPlaceholder'),
      uploadSuccess: document.getElementById('uploadSuccess'),
      audioInfo: document.getElementById('audioInfo'),
      
      // Génération
      generateBtn: document.getElementById('generateBtn'),
      generateText: document.getElementById('generateText'),
      generateSpinner: document.querySelector('#generateBtn .loading-spinner'),
      
      // Prévisualisation
      previewStatus: document.getElementById('previewStatus'),
      smartlinkPreview: document.getElementById('smartlinkPreview'),
      emptyState: document.getElementById('emptyState'),
      previewContent: document.getElementById('previewContent'),
      previewArtwork: document.getElementById('previewArtwork'),
      previewTitle: document.getElementById('previewTitle'),
      previewArtist: document.getElementById('previewArtist'),
      previewPlatforms: document.getElementById('previewPlatforms'),
      platformsCount: document.getElementById('platformsCount'),
      audioStatus: document.getElementById('audioStatus')
    };

    // Gestion de la recherche
    elements.searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const sourceUrl = elements.sourceUrl.value.trim();
      if (!sourceUrl) return;

      setSearchState('loading');

      try {
        console.log('Début recherche pour URL:', sourceUrl);
        
        const response = await fetch('/api/search-platforms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceUrl })
        });

        console.log('Réponse API reçue, status:', response.status);
        const result = await response.json();
        console.log('Données reçues:', result);

        if (response.ok) {
          state.searchData = result;
          setSearchState('success');
          updateTrackCard(result.trackInfo);
          showPlatformsStep(result.platforms);
          updatePreview();
        } else {
          throw new Error(result.error || result.message || 'Erreur de recherche');
        }
      } catch (error) {
        console.error('Erreur recherche:', error);
        setSearchState('error', error.message);
      }
    });

    // États de recherche
    function setSearchState(state, message = '') {
      // Reset tous les états
      elements.searchLoading.style.display = 'none';
      elements.searchError.style.display = 'none';
      elements.searchSuccess.style.display = 'none';
      
      // Bouton état
      if (state === 'loading') {
        elements.searchText.style.display = 'none';
        elements.searchSpinner.style.display = 'block';
        elements.searchBtn.disabled = true;
        elements.searchLoading.style.display = 'block';
      } else {
        elements.searchText.style.display = 'block';
        elements.searchSpinner.style.display = 'none';
        elements.searchBtn.disabled = false;
        
        if (state === 'success') {
          elements.searchSuccess.style.display = 'block';
        } else if (state === 'error') {
          elements.searchError.style.display = 'block';
          elements.searchErrorMessage.textContent = message;
        }
      }
    }

    // Mise à jour de la track card
    function updateTrackCard(trackInfo) {
      elements.trackArtwork.src = trackInfo.artwork || '/assets/images/default-cover.jpg';
      elements.trackTitle.textContent = trackInfo.title;
      elements.trackArtist.textContent = trackInfo.artist;
    }

    // Affichage de l'étape plateformes
    function showPlatformsStep(platforms) {
      // Génération de la grille
      elements.platformsGrid.innerHTML = '';
      state.selectedPlatforms = [];

      platforms.forEach(platform => {
        const div = document.createElement('div');
        div.className = 'platform-item selected';
        div.innerHTML = '';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'platform-checkbox';
        checkbox.checked = true;
        checkbox.value = platform.id;
        
        const span = document.createElement('span');
        span.className = 'platform-name';
        span.textContent = platform.name;
        
        div.appendChild(checkbox);
        div.appendChild(span);

        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            div.classList.add('selected');
            if (!state.selectedPlatforms.find(p => p.id === platform.id)) {
              state.selectedPlatforms.push(platform);
            }
          } else {
            div.classList.remove('selected');
            state.selectedPlatforms = state.selectedPlatforms.filter(p => p.id !== platform.id);
          }
          updateSelectedCount();
          updatePreview();
        });

        elements.platformsGrid.appendChild(div);
        state.selectedPlatforms.push(platform);
      });

      // Affichage des cards suivantes
      elements.platformsCard.style.display = 'block';
      elements.platformsCard.classList.add('fade-in');
      elements.customizationCard.style.display = 'block';
      elements.customizationCard.classList.add('fade-in');
      elements.finalActions.style.display = 'block';
      elements.finalActions.classList.add('fade-in');

      updateSelectedCount();
    }

    // Boutons sélection/désélection
    elements.selectAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.platform-checkbox').forEach(cb => {
        if (!cb.checked) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });

    elements.deselectAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.platform-checkbox').forEach(cb => {
        if (cb.checked) {
          cb.checked = false;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });

    // Mise à jour du compteur
    function updateSelectedCount() {
      elements.selectedCount.textContent = state.selectedPlatforms.length;
    }

    // Gestion de l'upload audio
    elements.uploadZone.addEventListener('click', () => {
      elements.audioFile.click();
    });

    elements.audioFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        elements.uploadPlaceholder.style.display = 'none';
        elements.uploadSuccess.style.display = 'block';
        elements.uploadZone.classList.add('has-file');
        elements.audioInfo.textContent = file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + 'MB)';
        state.hasAudio = true;
        updatePreview();
      }
    });

    // Mise à jour de la prévisualisation
    function updatePreview() {
      if (!state.searchData) {
        elements.previewStatus.textContent = 'Brouillon';
        elements.previewStatus.className = 'preview-status draft';
        elements.emptyState.style.display = 'block';
        elements.previewContent.style.display = 'none';
        elements.smartlinkPreview.className = 'smartlink-preview empty';
        return;
      }

      // Contenu de la prévisualisation
      elements.emptyState.style.display = 'none';
      elements.previewContent.style.display = 'block';
      elements.smartlinkPreview.className = 'smartlink-preview';
      
      const trackInfo = state.searchData.trackInfo;
      elements.previewArtwork.src = trackInfo.artwork || '/assets/images/default-cover.jpg';
      elements.previewTitle.textContent = trackInfo.title;
      elements.previewArtist.textContent = trackInfo.artist;

      // Plateformes sélectionnées
      elements.previewPlatforms.innerHTML = '';
      state.selectedPlatforms.slice(0, 5).forEach(platform => {
        const div = document.createElement('div');
        div.className = 'preview-platform';
        div.textContent = platform.name;
        elements.previewPlatforms.appendChild(div);
      });

      if (state.selectedPlatforms.length > 5) {
        const div = document.createElement('div');
        div.className = 'preview-platform';
        div.textContent = '+' + (state.selectedPlatforms.length - 5) + ' autres plateformes';
        div.style.opacity = '0.7';
        elements.previewPlatforms.appendChild(div);
      }

      // Stats
      elements.platformsCount.textContent = state.selectedPlatforms.length + ' plateformes';
      elements.audioStatus.textContent = state.hasAudio ? 'Avec audio' : 'Sans audio';

      // Status
      const isReady = state.selectedPlatforms.length > 0;
      if (isReady) {
        elements.previewStatus.textContent = 'Prêt';
        elements.previewStatus.className = 'preview-status ready';
      } else {
        elements.previewStatus.textContent = 'Incomplet';
        elements.previewStatus.className = 'preview-status draft';
      }
      
      state.isReady = isReady;
    }

    // Génération du SmartLink
    elements.generateBtn.addEventListener('click', async () => {
      if (!state.isReady) return;

      elements.generateText.style.display = 'none';
      elements.generateSpinner.style.display = 'block';
      elements.generateBtn.disabled = true;

      try {
        // Préparation des données de tracking
        const tracking = {};
        const ga4Id = document.getElementById('ga4Id').value;
        const gtmId = document.getElementById('gtmId').value;
        const metaPixelId = document.getElementById('metaPixelId').value;
        const tiktokPixelId = document.getElementById('tiktokPixelId').value;
        
        if (ga4Id) tracking.ga4Id = ga4Id;
        if (gtmId) tracking.gtmId = gtmId;
        if (metaPixelId) tracking.metaPixelId = metaPixelId;
        if (tiktokPixelId) tracking.tiktokPixelId = tiktokPixelId;

        // Upload audio si présent
        let audioUrl = null;
        const audioFile = elements.audioFile.files[0];
        if (audioFile) {
          console.log('Upload du fichier audio:', audioFile.name);
          
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
            console.warn('Erreur upload audio, continuer sans audio');
          }
        }

        // Génération du SmartLink
        console.log('Génération SmartLink complet...');
        
        const response = await fetch('/api/create-smartlink-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceUrl: elements.sourceUrl.value.trim(),
            audioUrl: audioUrl,
            tracking: tracking,
            selectedPlatforms: state.selectedPlatforms,
            trackInfo: state.searchData.trackInfo
          })
        });

        const result = await response.json();

        if (response.ok) {
          const finalUrl = result.smartlinkUrl;
          
          alert('SmartLink généré avec succès !\\n\\nURL: ' + finalUrl + '\\n\\nLe lien a été copié dans votre presse-papier.');
          
          // Copie dans le presse-papier
          navigator.clipboard.writeText(finalUrl).catch(() => {
            console.log('Impossible de copier automatiquement');
          });
          
          // Option d'ouverture
          if (confirm('Voulez-vous ouvrir le SmartLink dans un nouvel onglet ?')) {
            window.open(finalUrl, '_blank');
          }
        } else {
          throw new Error(result.error || result.message || 'Erreur lors de la génération');
        }
        
      } catch (error) {
        console.error('Erreur génération:', error);
        alert('Erreur lors de la génération : ' + error.message);
      } finally {
        elements.generateText.style.display = 'block';
        elements.generateSpinner.style.display = 'none';
        elements.generateBtn.disabled = false;
      }
    });

    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        window.location.href = '/';
      }
    });
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
            <h2 class="section-title">Métadonnées du morceau</h2>
            <div class="form-group">
              <label for="title">Titre du morceau *</label>
              <input type="text" id="title" value="${data.title}" required>
              <div class="help-text">Titre détecté automatiquement depuis l'API</div>
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
            <h2 class="section-title">Liens des plateformes</h2>
            <div class="help-text" style="margin-bottom: 1rem;">
              Sélectionnez les plateformes à afficher sur votre SmartLink
            </div>
${data.platforms.map(platform => 
              '<div class="platform-item">' +
                '<input type="checkbox" class="platform-checkbox" id="platform-' + platform.id + '" ' + (platform.enabled ? 'checked' : '') + '>' +
                '<div class="platform-info">' +
                  '<div class="platform-name">' + platform.name + '</div>' +
                  '<div class="platform-url">' + platform.url + '</div>' +
                '</div>' +
              '</div>'
            ).join('')}
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
              <h4 style="color: #cc271a; margin-bottom: 0.5rem; font-size: 0.9rem;">Aperçu des URLs avec tracking</h4>
              <div id="trackedUrls" style="font-family: monospace; font-size: 0.8rem; color: #999; max-height: 200px; overflow-y: auto;"></div>
              <button type="button" id="hideUtmBtn" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #cc271a; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                Masquer l'aperçu
              </button>
            </div>
            <button type="button" id="showUtmBtn" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: transparent; color: #cc271a; border: 1px solid #cc271a; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
              Voir les URLs avec tracking
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
${data.platforms.filter(p => p.enabled).map(platform => 
                '<div class="preview-platform">' + platform.name + '</div>'
              ).join('')}
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
            '<div class="preview-platform">' + name + '</div>'
          ).join('');
          
          // Mise à jour du compteur avec UTM info
          const utmSource = document.getElementById('utm_source').value || 'mdmc_smartlinks';
          const utmMedium = document.getElementById('utm_medium').value || 'smartlink';
          const utmCampaign = document.getElementById('utm_campaign').value || 'music_promotion';
          
          document.querySelector('.preview-smartlink div:last-child strong').innerHTML = 
            enabledPlatforms.length + ' liens de plateformes trouvés !<br>' +
            '<small style="font-weight: normal; color: #999;">UTM: ' + utmSource + ' | ' + utmMedium + ' | ' + utmCampaign + '</small>';
          
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
              
              urlsHtml += 
                '<div style="margin-bottom: 1rem; padding: 0.5rem; background: #1a1a1a; border-radius: 0.25rem;">' +
                  '<strong style="color: #cc271a;">' + platformName + ':</strong><br>' +
                  '<div style="word-break: break-all; margin-top: 0.25rem;">' + url.toString() + '</div>' +
                '</div>';
            } catch (error) {
              urlsHtml += 
                '<div style="margin-bottom: 1rem; padding: 0.5rem; background: #1a1a1a; border-radius: 0.25rem;">' +
                  '<strong style="color: #cc271a;">' + platformName + ':</strong><br>' +
                  '<div style="color: #ff6b6b;">Erreur: URL invalide</div>' +
                '</div>';
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
          saveBtn.innerHTML = 'Génération en cours...';
          
          try {
            // Appel API pour sauvegarder et générer le SmartLink final
            const response = await fetch('/api/update/' + smartlinkData.artist.slug + '/' + smartlinkData.slug, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(smartlinkData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Succès - Redirection vers le SmartLink généré
              saveBtn.innerHTML = 'SmartLink généré !';
              
              setTimeout(() => {
                const finalUrl = 'https://smartlink.mdmcmusicads.com/' + smartlinkData.artist.slug + '/' + smartlinkData.slug;
                
                // Afficher le résultat final
                if (confirm('SmartLink généré avec succès !\\n\\nURL: ' + finalUrl + '\\n\\nVoulez-vous ouvrir le SmartLink dans un nouvel onglet ?')) {
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
            saveBtn.innerHTML = 'Générer SmartLink Final';
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