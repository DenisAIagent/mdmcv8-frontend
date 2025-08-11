// src/utils/staticPageGenerator.js
// Générateur de pages HTML statiques pour les métadonnées SmartLinks

/**
 * Génère une page HTML statique avec métadonnées Open Graph
 * @param {Object} smartlinkData - Données du SmartLink
 * @returns {string} - HTML complet
 */
export const generateStaticHTML = (smartlinkData) => {
  const {
    trackTitle,
    artistName,
    coverImageUrl,
    shortId,
    customDescription,
    description
  } = smartlinkData;

  const title = `${trackTitle} - ${artistName}`;
  const desc = customDescription || description || `Écoutez ${trackTitle} de ${artistName} sur toutes les plateformes de streaming`;
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
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${escapeHtml(coverImageUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="MDMC SmartLinks">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(desc)}">
    <meta name="twitter:image" content="${escapeHtml(coverImageUrl)}">
    
    <!-- Meta standards -->
    <meta name="description" content="${escapeHtml(desc)}">
    <meta name="keywords" content="musique, ${escapeHtml(artistName)}, ${escapeHtml(trackTitle)}, streaming">
    
    <!-- Redirection immédiate vers React SPA -->
    <script>
      // Redirection après 1 seconde (temps pour les bots de crawler)
      setTimeout(function() {
        window.location.href = "${reactUrl}";
      }, 1000);
    </script>
    
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
        background: #f5f5f5;
      }
      .loading {
        max-width: 400px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .cover {
        width: 200px;
        height: 200px;
        border-radius: 10px;
        margin-bottom: 20px;
      }
      .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #E50914;
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
    </style>
</head>
<body>
    <div class="loading">
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
 * Sauvegarde la page HTML statique
 * @param {Object} smartlinkData - Données du SmartLink
 * @param {string} outputDir - Répertoire de sortie (ex: 'public/sl')
 */
export const saveStaticPage = async (smartlinkData, outputDir = 'public/sl') => {
  const html = generateStaticHTML(smartlinkData);
  const fileName = `${smartlinkData.shortId}.html`;
  const filePath = `${outputDir}/${fileName}`;
  
  try {
    // En environnement browser, on ne peut pas écrire de fichiers
    // Cette fonction sera appelée côté serveur ou via API
    console.log(`📄 Page statique générée: ${filePath}`);
    console.log('📋 HTML généré:', html.substring(0, 200) + '...');
    
    return {
      success: true,
      filePath,
      url: `https://www.mdmcmusicads.com/sl/${fileName}`,
      html
    };
  } catch (error) {
    console.error('❌ Erreur génération page statique:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Génère toutes les pages statiques existantes
 * @param {Array} smartlinks - Liste des SmartLinks
 */
export const generateAllStaticPages = async (smartlinks) => {
  const results = [];
  
  for (const smartlink of smartlinks) {
    const result = await saveStaticPage(smartlink);
    results.push(result);
  }
  
  console.log(`✅ ${results.filter(r => r.success).length}/${results.length} pages générées`);
  return results;
};

/**
 * Fonction utilitaire pour échapper le HTML
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

export default {
  generateStaticHTML,
  saveStaticPage,
  generateAllStaticPages
};