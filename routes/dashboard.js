const express = require('express');
const { verifyToken, requireRole } = require('./auth');
const router = express.Router();

// Middleware pour vérifier l'authentification sur les pages (pas API)
function requireAuthPage(req, res, next) {
  // SOLUTION: Recherche du token dans plusieurs sources avec priorité améliorée
  const tokenSources = [
    { name: 'cookie', value: req.cookies?.mdmc_token },
    { name: 'query', value: req.query?.token }, // Support token en URL (fallback)
    { name: 'session', value: req.session?.mdmc_token },
    { name: 'header', value: req.headers.authorization?.replace('Bearer ', '') }
  ];
  
  let token = null;
  let tokenSource = 'aucune';
  
  for (const source of tokenSources) {
    if (source.value && source.value.trim()) {
      token = source.value.trim();
      tokenSource = source.name;
      break;
    }
  }
  
  // Debug optionnel pour développement uniquement
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DEBUG AUTH - URL: ${req.originalUrl}, Token source: ${tokenSource}`);
    console.log(`🔍 Token trouvé: ${token ? 'OUI (' + token.substring(0, 20) + '...)' : 'NON'}`);
  }
  
  if (!token) {
    console.log(`❌ Aucun token trouvé pour ${req.originalUrl}, redirection vers login`);
    return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
  }
  
  // Vérification du token avec le même système que l'API
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'mdmc_smartlinks_secret_key_2025';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    console.log(`✅ Authentification réussie pour ${decoded.username} sur ${req.originalUrl}`);
    
    // Si le token vient de l'URL, le sauvegarder en cookie pour la prochaine fois
    if (tokenSource === 'query') {
      res.cookie('mdmc_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24h
        path: '/'
      });
      console.log('🍪 Token URL sauvegardé en cookie');
    }
    
    next();
  } catch (error) {
    console.log(`❌ Token invalide (source: ${tokenSource}) pour ${req.originalUrl}:`, error.message);
    
    // Supprimer les cookies invalides
    if (tokenSource === 'cookie') {
      res.clearCookie('mdmc_token', {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      console.log('🗑️ Cookie invalide supprimé');
    }
    
    return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
  }
}

// Route principale du dashboard - PROTÉGÉE PAR AUTHENTIFICATION
router.get('/', requireAuthPage, async (req, res) => {
  try {
    // Passage des données utilisateur au template
    res.render('dashboard', {
      user: req.user,
      pageTitle: 'Mes SmartLinks | MDMC Dashboard'
    });
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).send('Erreur chargement dashboard');
  }
});

// Route de création de SmartLinks - PROTÉGÉE PAR AUTHENTIFICATION
router.get('/create', requireAuthPage, (req, res) => {
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
              <p style="color: var(--success); font-weight: 500;">✓ Fichier audio ajouté</p>
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
          <span id="generateText">🚀 Générer mon SmartLink</span>
          <div class="loading-spinner" style="display: none;"></div>
        </button>
      </div>

    </div>

    <!-- Panel de prévisualisation (droite) -->
    <div class="preview-panel">
      <div class="preview-card">
        
        <!-- Header de prévisualisation -->
        <div class="preview-header">
          <h3 class="preview-title">👀 Prévisualisation</h3>
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
        const response = await fetch('/api/search-platforms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceUrl })
        });

        const result = await response.json();

        if (response.ok) {
          state.searchData = result;
          setSearchState('success');
          updateTrackCard(result.trackInfo);
          showPlatformsStep(result.platforms);
          updatePreview();
        } else {
          throw new Error(result.error || 'Erreur de recherche');
        }
      } catch (error) {
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
        div.innerHTML = \`
          <input type="checkbox" class="platform-checkbox" checked value="\${platform.id}">
          <span class="platform-name">\${platform.name}</span>
        \`;

        const checkbox = div.querySelector('.platform-checkbox');
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
        elements.audioInfo.textContent = \`\${file.name} (\${(file.size / 1024 / 1024).toFixed(2)}MB)\`;
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
        div.textContent = \`+\${state.selectedPlatforms.length - 5} autres plateformes\`;
        div.style.opacity = '0.7';
        elements.previewPlatforms.appendChild(div);
      }

      // Stats
      elements.platformsCount.textContent = \`\${state.selectedPlatforms.length} plateformes\`;
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
        // Simulation de génération
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const url = \`https://smartlink.mdmcmusicads.com/\${state.searchData.trackInfo.artistSlug}/\${state.searchData.trackInfo.slug}\`;
        
        alert(\`SmartLink généré avec succès !\\n\\nURL: \${url}\\n\\nLe lien a été copié dans votre presse-papier.\`);
        
        // Copie dans le presse-papier
        navigator.clipboard.writeText(url).catch(() => {});
        
      } catch (error) {
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
</html>`);
});

// Route de gestion des SmartLinks - Redirection vers la route principale
router.get('/manage', (req, res) => {
  res.redirect('/dashboard');
});

// Route Analytics
router.get('/analytics', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Analytics | MDMC Dashboard</title>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #E50914; margin-bottom: 20px; }
        p { color: #a0a0a0; margin-bottom: 30px; }
        .nav-link { display: inline-block; margin: 10px; padding: 12px 24px; background: #E50914; color: white; text-decoration: none; border-radius: 8px; }
        .nav-link:hover { background: #cc271a; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Analytics SmartLinks</h1>
        <p>Statistiques détaillées de vos SmartLinks</p>
        <p>Cette page sera bientôt implémentée avec des graphiques et métriques avancées.</p>
        <a href="/dashboard" class="nav-link">➕ Créer SmartLink</a>
        <a href="/dashboard/manage" class="nav-link">📱 Gérer SmartLinks</a>
      </div>
    </body>
    </html>
  `);
});

// Route d'édition d'un SmartLink
router.get('/edit/:smartlinkId', (req, res) => {
  const { smartlinkId } = req.params;
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Éditer SmartLink | MDMC Dashboard</title>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #E50914; margin-bottom: 20px; }
        p { color: #a0a0a0; margin-bottom: 30px; }
        .nav-link { display: inline-block; margin: 10px; padding: 12px 24px; background: #E50914; color: white; text-decoration: none; border-radius: 8px; }
        .nav-link:hover { background: #cc271a; }
        .smartlink-id { color: #666; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Éditer SmartLink</h1>
        <p class="smartlink-id">ID: ${smartlinkId}</p>
        <p>Interface d'édition du SmartLink</p>
        <p>Cette page sera bientôt implémentée avec l'éditeur complet.</p>
        <a href="/dashboard/manage" class="nav-link">← Retour à la liste</a>
      </div>
    </body>
    </html>
  `);
});

// API: Recherche de titres
router.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.length < 2) {
      return res.json({ success: false, message: 'Requête trop courte' });
    }
    
    // TODO: Implémenter la recherche via l'API Spotify/Odesli
    // Pour l'instant, on simule une réponse
    const results = [
      {
        id: 'test-track-1',
        name: 'Exemple de titre',
        artists: [{ name: 'Artiste Exemple' }],
        album: {
          images: [{ url: 'https://via.placeholder.com/300x300' }]
        }
      }
    ];
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('❌ Erreur recherche:', error);
    res.json({ success: false, message: 'Erreur de recherche' });
  }
});

// API: Création d'un SmartLink
router.post('/api/smartlink/create', async (req, res) => {
  try {
    const { trackId, title, artist, image, customSlug } = req.body;
    
    if (!trackId || !title || !artist) {
      return res.json({ success: false, message: 'Données manquantes' });
    }
    
    // TODO: Implémenter la création réelle du SmartLink
    // Pour l'instant, on simule une réponse
    const smartlinkId = Date.now().toString();
    const slug = customSlug || `${artist.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`;
    const smartlinkUrl = `${req.protocol}://${req.get('host')}/smartlink/${slug}`;
    
    console.log(`✅ SmartLink créé: ${smartlinkUrl}`);
    
    res.json({ 
      success: true, 
      smartlinkId,
      smartlinkUrl,
      message: 'SmartLink créé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur création SmartLink:', error);
    res.json({ success: false, message: 'Erreur lors de la création' });
  }
});

// API: Statistiques d'un SmartLink
router.get('/api/smartlink/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Récupérer les vraies statistiques depuis la DB
    // Pour l'instant, on simule des données
    const stats = {
      id,
      title: 'Titre exemple',
      artist: 'Artiste exemple',
      views: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 500),
      created_at: new Date().toISOString()
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    res.json({ success: false, message: 'Erreur chargement statistiques' });
  }
});

// API: Suppression d'un SmartLink
router.delete('/api/smartlink/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implémenter la suppression réelle
    console.log(`🗑️ Suppression SmartLink: ${id}`);
    
    res.json({ success: true, message: 'SmartLink supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.json({ success: false, message: 'Erreur lors de la suppression' });
  }
});

// API: Liste des SmartLinks
router.get('/api/smartlinks', async (req, res) => {
  try {
    // TODO: Récupérer la liste depuis la DB
    const smartlinks = [];
    
    res.json({ success: true, smartlinks });
  } catch (error) {
    console.error('❌ Erreur liste SmartLinks:', error);
    res.json({ success: false, message: 'Erreur chargement liste' });
  }
});

module.exports = router;