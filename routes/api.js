// API Routes pour gestion SmartLinks
// CRUD pour créer, modifier, supprimer SmartLinks HTML

const express = require('express');
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');
const OdesliService = require('../services/odesliService');

const router = express.Router();
const htmlGenerator = new StaticHtmlGenerator();
const odesliService = new OdesliService();

// Fonction pour créer un slug valide
function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Fonction utilitaire pour extraire le domaine
function getDomainFromUrl(url) {
  try {
    const domain = new URL(url).hostname;
    
    // Mapping des domaines vers les plateformes
    const platformMap = {
      'open.spotify.com': 'spotify',
      'music.apple.com': 'apple',
      'geo.music.apple.com': 'apple',
      'youtube.com': 'youtube',
      'music.youtube.com': 'youtube',
      'www.youtube.com': 'youtube',
      'm.youtube.com': 'youtube',
      'deezer.com': 'deezer',
      'www.deezer.com': 'deezer',
      'tidal.com': 'tidal',
      'listen.tidal.com': 'tidal',
      'soundcloud.com': 'soundcloud',
      'amazon.com': 'amazon',
      'music.amazon.com': 'amazon'
    };
    
    return platformMap[domain] || domain.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// Fonction pour formatter les liens Odesli vers le format template
function formatPlatformLinksForTemplate(platformLinks) {
  const formattedLinks = {};
  
  if (!platformLinks || !Array.isArray(platformLinks)) {
    return formattedLinks;
  }
  
  platformLinks.forEach(link => {
    if (link.platform && link.url) {
      formattedLinks[link.platform] = {
        url: link.url,
        nativeAppUriDesktop: link.nativeAppUriDesktop || link.url
      };
    }
  });
  
  return formattedLinks;
}

// GET /api/stats - Statistiques du service
router.get('/stats', async (req, res) => {
  try {
    const stats = await htmlGenerator.getStats();
    
    res.json({
      service: 'MDMC SmartLinks',
      stats: {
        totalFiles: stats.totalFiles,
        totalArtists: stats.totalArtists,
        totalSize: `${Math.round(stats.totalSize / 1024)} KB`,
        lastGenerated: stats.lastGenerated
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({ error: 'Erreur récupération statistiques' });
  }
});

// POST /api/create-smartlink - Créer un nouveau SmartLink (interface utilisateur)
router.post('/create-smartlink', async (req, res) => {
  try {
    const { artistName, trackTitle, sourceUrl } = req.body;
    
    // Validation des données
    if (!artistName || !trackTitle || !sourceUrl) {
      return res.status(400).json({
        error: 'Tous les champs sont requis (artistName, trackTitle, sourceUrl)'
      });
    }
    
    // Validation de l'URL
    try {
      new URL(sourceUrl);
    } catch {
      return res.status(400).json({
        error: 'URL source invalide'
      });
    }
    
    console.log(`🎵 Création SmartLink: ${artistName} - ${trackTitle}`);
    console.log(`📎 Source URL: ${sourceUrl}`);
    
    // Création des slugs
    const artistSlug = createSlug(artistName);
    const trackSlug = createSlug(trackTitle);
    
    if (!artistSlug || !trackSlug) {
      return res.status(400).json({
        error: 'Impossible de créer des URLs valides à partir des noms fournis'
      });
    }
    
    // Récupération des données via Odesli
    let trackData;
    try {
      console.log(`🔄 Récupération données Odesli...`);
      trackData = await odesliService.fetchPlatformLinks(sourceUrl, 'FR');
      console.log(`✅ Données Odesli récupérées: ${Object.keys(trackData.links || {}).length} plateformes`);
    } catch (odesliError) {
      console.error('❌ Erreur Odesli:', odesliError.message);
      
      // En cas d'échec Odesli, créer un SmartLink basique avec l'URL source
      trackData = {
        title: trackTitle,
        artist: artistName,
        image: null,
        links: {
          [getDomainFromUrl(sourceUrl)]: {
            url: sourceUrl,
            nativeAppUriDesktop: sourceUrl
          }
        },
        description: `${trackTitle} par ${artistName}`
      };
    }
    
    // Transformation des données au format attendu par le générateur HTML
    const smartlinkData = {
      // Utiliser les données Odesli si disponibles, sinon les données utilisateur
      title: trackData.trackTitle || trackTitle,
      artist: trackData.artist || {
        name: artistName,
        slug: artistSlug
      },
      slug: trackData.slug || trackSlug,
      
      // Métadonnées visuelles depuis Odesli
      image: trackData.coverImageUrl || null,
      coverImageUrl: trackData.coverImageUrl || null,
      description: trackData.description || `${trackTitle} par ${artistName}`,
      
      // Liens plateformes (format compatible avec template)
      links: formatPlatformLinksForTemplate(trackData.platformLinks || []),
      
      // Métadonnées techniques
      createdAt: new Date(),
      sourceUrl,
      odesliData: trackData.odesliData || null
    };
    
    // Génération du fichier HTML statique
    console.log(`📝 Génération HTML statique...`);
    const htmlPath = await htmlGenerator.generateSmartLinkHtml(smartlinkData);
    console.log(`✅ HTML généré: ${htmlPath}`);
    
    // Réponse de succès
    res.json({
      success: true,
      artistSlug,
      trackSlug,
      url: `https://smartlink.mdmcmusicads.com/${artistSlug}/${trackSlug}`,
      platforms: Object.keys(trackData.links || {}),
      message: 'SmartLink créé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur création SmartLink:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/generate - Générer un nouveau SmartLink HTML
router.post('/generate', async (req, res) => {
  try {
    const { sourceUrl, customData } = req.body;
    
    // Validation : soit sourceUrl (Odesli) soit données complètes
    if (!sourceUrl && (!req.body.trackTitle || !req.body.artist?.name)) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Fournir soit sourceUrl (pour Odesli) soit trackTitle + artist.name',
        examples: {
          odesli: { sourceUrl: 'https://open.spotify.com/track/...' },
          manual: { trackTitle: 'Wait and Bleed', artist: { name: 'Slipknot', slug: 'slipknot' } }
        }
      });
    }
    
    let result;
    
    if (sourceUrl) {
      // Génération via Odesli (recommandé)
      console.log(`🎵 Génération SmartLink via Odesli: ${sourceUrl}`);
      result = await htmlGenerator.generateFromUrl(sourceUrl, { customData });
    } else {
      // Génération manuelle (fallback)
      console.log(`🎵 Génération SmartLink manuelle: ${req.body.artist.name} - ${req.body.trackTitle}`);
      const filePath = await htmlGenerator.generateSmartLinkHtml(req.body);
      result = {
        filePath,
        smartlinkData: req.body,
        url: `${process.env.BASE_URL}/${req.body.artist.slug}/${req.body.slug}`,
        generatedAt: new Date().toISOString()
      };
    }
    
    res.status(201).json({
      success: true,
      message: 'SmartLink HTML généré avec succès',
      data: result,
      method: sourceUrl ? 'odesli' : 'manual'
    });
    
  } catch (error) {
    console.error('❌ Erreur génération:', error);
    res.status(500).json({ 
      error: 'Erreur génération SmartLink',
      message: error.message 
    });
  }
});

// PUT /api/update/:artistSlug/:trackSlug - Mettre à jour un SmartLink
router.put('/update/:artistSlug/:trackSlug', async (req, res) => {
  try {
    const { artistSlug, trackSlug } = req.params;
    const smartlinkData = req.body;
    
    console.log(`🔄 Mise à jour SmartLink: ${artistSlug}/${trackSlug}`);
    
    // Mise à jour du fichier HTML
    const filePath = await htmlGenerator.updateSmartLinkHtml(smartlinkData);
    
    res.json({
      success: true,
      message: 'SmartLink HTML mis à jour',
      filePath,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error);
    res.status(500).json({ 
      error: 'Erreur mise à jour SmartLink',
      message: error.message 
    });
  }
});

// DELETE /api/delete/:artistSlug/:trackSlug - Supprimer un SmartLink
router.delete('/delete/:artistSlug/:trackSlug', async (req, res) => {
  try {
    const { artistSlug, trackSlug } = req.params;
    
    console.log(`🗑️ Suppression SmartLink: ${artistSlug}/${trackSlug}`);
    
    // Suppression du fichier HTML
    await htmlGenerator.deleteSmartLinkHtml(artistSlug, trackSlug);
    
    res.json({
      success: true,
      message: 'SmartLink HTML supprimé',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.status(500).json({ 
      error: 'Erreur suppression SmartLink',
      message: error.message 
    });
  }
});

// GET /api/odesli/test - Test de l'intégration Odesli
router.get('/odesli/test', async (req, res) => {
  try {
    const testResult = await odesliService.testConnection();
    
    res.json({
      service: 'Odesli Integration Test',
      result: testResult,
      stats: odesliService.getServiceStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      service: 'Odesli Integration Test',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/odesli/fetch - Test fetch direct Odesli
router.post('/odesli/fetch', async (req, res) => {
  try {
    const { url, userCountry = 'FR' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL manquante',
        message: 'Fournir une URL de plateforme musicale'
      });
    }
    
    const data = await odesliService.fetchPlatformLinks(url, userCountry);
    
    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Erreur fetch Odesli',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/login - Authentification sécurisée
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation basique
    if (!username || !password) {
      return res.status(400).json({
        error: 'Nom d\'utilisateur et mot de passe requis'
      });
    }
    
    // Limitation des tentatives (protection basique contre force brute)
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`🔐 Tentative de connexion: ${username} depuis ${clientIP}`);
    
    // Credentials sécurisés depuis variables d'environnement
    const validCredentials = [
      { 
        username: process.env.ADMIN_USERNAME || 'mdmc_admin', 
        password: process.env.ADMIN_PASSWORD || 'SecureMDMC@2025!Admin#Default',
        role: 'admin'
      },
      { 
        username: process.env.CLIENT_USERNAME || 'mdmc_client', 
        password: process.env.CLIENT_PASSWORD || 'ClientMDMC@2025!Access#Default',
        role: 'client'
      }
    ];
    
    const user = validCredentials.find(
      cred => cred.username === username && cred.password === password
    );
    
    if (user) {
      // Log de connexion réussie
      console.log(`✅ Connexion réussie: ${username} (${user.role}) depuis ${clientIP}`);
      
      // TODO: Implémenter JWT avec expiration
      res.json({
        success: true,
        message: 'Connexion réussie',
        user: { 
          username: user.username, 
          role: user.role 
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // Log de tentative échouée
      console.warn(`❌ Échec connexion: ${username} depuis ${clientIP}`);
      
      // Délai pour ralentir les attaques par force brute
      setTimeout(() => {
        res.status(401).json({
          error: 'Identifiants incorrects'
        });
      }, 1000); // 1 seconde de délai
    }
    
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/logout - Déconnexion
router.post('/logout', (req, res) => {
  // En production : invalider JWT ou session
  res.json({
    success: true,
    message: 'Déconnexion réussie',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'MDMC SmartLinks API',
    status: 'healthy',
    version: '1.0.0',
    odesli: odesliService.getServiceStats(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;