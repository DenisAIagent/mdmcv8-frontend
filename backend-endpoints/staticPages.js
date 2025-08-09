// backend-endpoints/staticPages.js
// Endpoints pour la génération de pages statiques HTML

const fs = require('fs').promises;
const path = require('path');

/**
 * Génère une page HTML statique pour un SmartLink
 */
const generateStaticPage = async (req, res) => {
  try {
    const {
      smartlinkId,
      shortId,
      trackTitle,
      artistName,
      coverImageUrl,
      description,
      platforms = []
    } = req.body;

    console.log(`📄 Génération page statique pour: ${shortId}`);

    // Validation des données requises
    if (!shortId || !trackTitle || !artistName || !coverImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes: shortId, trackTitle, artistName, coverImageUrl requis'
      });
    }

    // Génération du HTML
    const html = generateStaticHTML({
      shortId,
      trackTitle,
      artistName,
      coverImageUrl,
      description: description || `Écoutez ${trackTitle} de ${artistName} sur toutes les plateformes`,
      platforms
    });

    // Chemin de destination
    const staticDir = path.join(__dirname, '..', 'dist', 'sl');
    const filePath = path.join(staticDir, `${shortId}.html`);

    // Créer le dossier si nécessaire
    await fs.mkdir(staticDir, { recursive: true });

    // Sauvegarder le fichier HTML
    await fs.writeFile(filePath, html, 'utf8');

    console.log(`✅ Page statique sauvegardée: ${filePath}`);

    res.json({
      success: true,
      message: 'Page statique générée avec succès',
      url: `https://www.mdmcmusicads.com/sl/${shortId}.html`,
      filePath: `/sl/${shortId}.html`,
      shortId
    });

  } catch (error) {
    console.error('❌ Erreur génération page statique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la génération',
      error: error.message
    });
  }
};

/**
 * Régénère toutes les pages statiques existantes
 */
const regenerateAllPages = async (req, res) => {
  try {
    console.log('🔄 Régénération de toutes les pages statiques...');

    // Récupérer tous les SmartLinks depuis la base de données
    // Note: Adapter selon votre modèle de données
    const SmartLink = require('../models/SmartLink'); // Ajuster le chemin
    const smartlinks = await SmartLink.find({ isPublished: true });

    const results = {
      total: smartlinks.length,
      generated: 0,
      failed: 0,
      errors: []
    };

    for (const smartlink of smartlinks) {
      try {
        const html = generateStaticHTML({
          shortId: smartlink.shortId,
          trackTitle: smartlink.trackTitle,
          artistName: smartlink.artistName,
          coverImageUrl: smartlink.coverImageUrl,
          description: smartlink.description || smartlink.customDescription,
          platforms: smartlink.platformLinks || []
        });

        const staticDir = path.join(__dirname, '..', 'dist', 'sl');
        const filePath = path.join(staticDir, `${smartlink.shortId}.html`);

        await fs.mkdir(staticDir, { recursive: true });
        await fs.writeFile(filePath, html, 'utf8');

        results.generated++;
        console.log(`✅ Régénéré: ${smartlink.shortId}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          shortId: smartlink.shortId,
          error: error.message
        });
        console.error(`❌ Échec régénération: ${smartlink.shortId}`, error);
      }
    }

    console.log(`🎯 Régénération terminée: ${results.generated}/${results.total} réussies`);

    res.json({
      success: true,
      message: `${results.generated} pages régénérées sur ${results.total}`,
      ...results
    });

  } catch (error) {
    console.error('❌ Erreur régénération globale:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la régénération',
      error: error.message
    });
  }
};

/**
 * Supprime une page statique
 */
const deleteStaticPage = async (req, res) => {
  try {
    const { shortId } = req.params;

    if (!shortId) {
      return res.status(400).json({
        success: false,
        message: 'shortId requis'
      });
    }

    const filePath = path.join(__dirname, '..', 'dist', 'sl', `${shortId}.html`);

    try {
      await fs.unlink(filePath);
      console.log(`🗑️ Page statique supprimée: ${shortId}`);

      res.json({
        success: true,
        message: 'Page statique supprimée',
        shortId
      });

    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          message: 'Page statique déjà inexistante',
          shortId
        });
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Erreur suppression page statique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

/**
 * Fonction utilitaire pour générer le HTML
 */
const generateStaticHTML = (data) => {
  const {
    shortId,
    trackTitle,
    artistName,
    coverImageUrl,
    description,
    platforms = []
  } = data;

  const title = `${trackTitle} - ${artistName}`;
  const reactUrl = `/#/smartlinks/${artistName.toLowerCase().replace(/\s+/g, '-')}/${trackTitle.toLowerCase().replace(/\s+/g, '-')}-${shortId}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | MDMC SmartLink</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="https://www.mdmcmusicads.com/sl/${shortId}.html">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(coverImageUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="MDMC SmartLinks">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(coverImageUrl)}">
    
    <!-- Meta standards -->
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="musique, ${escapeHtml(artistName)}, ${escapeHtml(trackTitle)}, streaming">
    
    <!-- Redirection vers React SPA -->
    <script>
      // Redirection après 1 seconde
      setTimeout(function() {
        window.location.href = "${reactUrl}";
      }, 1000);
    </script>
    
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        max-width: 400px;
        background: rgba(255,255,255,0.1);
        padding: 30px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      .cover {
        width: 200px;
        height: 200px;
        border-radius: 15px;
        margin-bottom: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .spinner {
        border: 3px solid rgba(255,255,255,0.3);
        border-top: 3px solid #fff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      h1 { margin: 10px 0; font-size: 1.4em; }
      p { margin: 10px 0; opacity: 0.9; }
      a { color: #fff; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${escapeHtml(coverImageUrl)}" alt="${escapeHtml(title)}" class="cover">
        <h1>${escapeHtml(title)}</h1>
        <p>Redirection vers votre SmartLink...</p>
        <div class="spinner"></div>
        <p><small>Si la redirection ne fonctionne pas, <a href="${reactUrl}">cliquez ici</a></small></p>
    </div>
</body>
</html>`;
};

/**
 * Échapper les caractères HTML
 */
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

module.exports = {
  generateStaticPage,
  regenerateAllPages,
  deleteStaticPage
};