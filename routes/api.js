// API Routes pour gestion SmartLinks
// CRUD pour créer, modifier, supprimer SmartLinks HTML

const express = require('express');
const multer = require('multer');
const path = require('path');
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');
const OdesliService = require('../services/odesliService');
const { verifyToken, requireRole } = require('./auth');

const router = express.Router();
const htmlGenerator = new StaticHtmlGenerator();
const odesliService = new OdesliService();

// Configuration multer pour upload audio
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const audioDir = path.join(__dirname, '../public/audio/');
    // Créer le dossier s'il n'existe pas
    require('fs').mkdirSync(audioDir, { recursive: true });
    cb(null, audioDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio sont autorisés'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  }
});

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

function getPlatformDisplayName(platform) {
  const names = {
    spotify: 'Spotify',
    apple: 'Apple Music',
    youtube: 'YouTube Music',
    deezer: 'Deezer',
    tidal: 'TIDAL',
    amazon: 'Amazon Music',
    soundcloud: 'SoundCloud',
    bandcamp: 'Bandcamp',
    pandora: 'Pandora',
    napster: 'Napster'
  };
  return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
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

// POST /api/create-smartlink-auto - Créer SmartLink automatiquement depuis URL (nouveau workflow)
router.post('/create-smartlink-auto', async (req, res) => {
  try {
    const { sourceUrl } = req.body;
    
    // Validation de l'URL seulement
    if (!sourceUrl) {
      return res.status(400).json({
        error: 'URL source requise'
      });
    }
    
    try {
      new URL(sourceUrl);
    } catch {
      return res.status(400).json({
        error: 'URL source invalide'
      });
    }
    
    console.log(`🎵 Création SmartLink automatique depuis: ${sourceUrl}`);
    
    // Récupération automatique des données via Odesli
    let odesliData;
    try {
      console.log(`🔄 Récupération automatique via Odesli...`);
      odesliData = await odesliService.fetchPlatformLinks(sourceUrl, 'FR');
      console.log(`✅ Données Odesli récupérées automatiquement: ${odesliData.platformLinks?.length || 0} plateformes`);
    } catch (odesliError) {
      console.error('❌ Erreur Odesli:', odesliError.message);
      return res.status(500).json({
        error: 'Impossible de récupérer les informations de cette URL',
        details: 'Vérifiez que l\'URL provient d\'une plateforme musicale supportée (Spotify, Apple Music, etc.)'
      });
    }
    
    // Utilisation des données Odesli pour les slugs
    const artistSlug = odesliData.artist?.slug || createSlug(odesliData.artist?.name || 'unknown-artist');
    const trackSlug = odesliData.slug || createSlug(odesliData.trackTitle || 'unknown-track');
    
    // Données prêtes pour le générateur HTML (format attendu par validateSmartLinkData)
    const smartlinkData = {
      trackTitle: odesliData.trackTitle, // trackTitle requis par validation
      title: odesliData.trackTitle,
      artist: odesliData.artist,
      slug: trackSlug,
      image: odesliData.coverImageUrl,
      coverImageUrl: odesliData.coverImageUrl,
      description: odesliData.description,
      platformLinks: odesliData.platformLinks || [], // platformLinks requis par validation
      links: formatPlatformLinksForTemplate(odesliData.platformLinks || []), // links pour template
      createdAt: new Date(),
      sourceUrl,
      odesliData: odesliData.odesliData
    };
    
    // Génération du fichier HTML statique
    console.log(`📝 Génération HTML automatique...`);
    const htmlPath = await htmlGenerator.generateSmartLinkHtml(smartlinkData);
    console.log(`✅ HTML généré automatiquement: ${htmlPath}`);
    
    // Réponse de succès avec toutes les infos récupérées
    res.json({
      success: true,
      title: odesliData.trackTitle,
      artist: odesliData.artist?.name,
      artistSlug,
      trackSlug,
      url: `https://smartlink.mdmcmusicads.com/${artistSlug}/${trackSlug}`,
      platforms: odesliData.platformLinks?.map(p => p.platform) || [],
      platformCount: odesliData.platformLinks?.length || 0,
      coverImage: odesliData.coverImageUrl,
      message: 'SmartLink créé automatiquement via Odesli'
    });
    
  } catch (error) {
    console.error('❌ Erreur création SmartLink automatique:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/create-smartlink - Créer un nouveau SmartLink (ancienne interface manuelle)
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

// POST /api/search-platforms - Rechercher plateformes sans créer SmartLink
router.post('/search-platforms', async (req, res) => {
  try {
    const { sourceUrl } = req.body;
    
    if (!sourceUrl) {
      return res.status(400).json({
        error: 'URL ou identifiant requis',
        message: 'Fournir une URL de plateforme ou un code ISRC/UPC'
      });
    }

    // Validation et nettoyage de l'URL
    const cleanUrl = sourceUrl.trim();
    console.log('🧹 URL nettoyée:', cleanUrl);
    
    // Vérification format URL Spotify
    if (cleanUrl.includes('spotify.com') && !cleanUrl.includes('open.spotify.com')) {
      console.log('⚠️ URL Spotify détectée, possible redirection nécessaire');
    }

    console.log('🔍 Recherche plateformes pour:', cleanUrl);

    // Récupération des données via Odesli avec gestion d'erreur
    console.log('📡 Appel service Odesli...');
    let odesliData;
    try {
      odesliData = await odesliService.fetchPlatformLinks(cleanUrl);
      console.log('📊 Données Odesli reçues:', odesliData ? 'SUCCESS' : 'FAILED');
      
      if (odesliData) {
        console.log('🎵 Track:', odesliData.trackTitle);
        console.log('🎤 Artist:', odesliData.artist?.name);
        console.log('🔗 Platforms:', odesliData.platformLinks?.length || 0);
      }
    } catch (odesliError) {
      console.error('❌ Erreur service Odesli:', odesliError.message);
      return res.status(500).json({
        error: 'Erreur du service de recherche',
        message: 'Impossible de récupérer les données musicales. Vérifiez que l\'URL est correcte et accessible.',
        details: odesliError.message
      });
    }
    
    if (!odesliData || !odesliData.trackTitle || !odesliData.artist?.name) {
      console.error('❌ Données Odesli invalides:', odesliData);
      return res.status(400).json({
        error: 'Musique non trouvée',
        message: 'Vérifiez que l\'URL/ISRC/UPC est valide et que la musique est disponible publiquement',
        debug: {
          hasOdesliData: !!odesliData,
          hasTrackTitle: !!odesliData?.trackTitle,
          hasArtist: !!odesliData?.artist?.name,
          platformLinksCount: odesliData?.platformLinks?.length || 0
        }
      });
    }

    console.log('📊 Odesli transformé:', {
      trackTitle: odesliData.trackTitle,
      artistName: odesliData.artist.name,
      platformLinksCount: odesliData.platformLinks?.length || 0,
      platformLinks: odesliData.platformLinks?.map(p => ({ platform: p.platform, url: p.url }))
    });

    // Retour des plateformes sans génération de SmartLink
    res.json({
      success: true,
      message: 'Plateformes trouvées avec succès',
      trackInfo: {
        title: odesliData.trackTitle,
        artist: odesliData.artist.name,
        artwork: odesliData.coverImageUrl,
        slug: odesliData.slug,
        artistSlug: odesliData.artist.slug
      },
      platforms: odesliData.platformLinks.map(platform => ({
        id: platform.platform,
        name: getPlatformDisplayName(platform.platform),
        url: platform.url,
        platform: platform.platform,
        available: true
      })),
      totalPlatforms: odesliData.platformLinks?.length || 0,
      searchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur recherche plateformes:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/test-odesli - Test rapide du service Odesli avec URL exemple
router.get('/test-odesli', async (req, res) => {
  try {
    const testUrl = 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh'; // Test avec "Never Gonna Give You Up"
    console.log('🧪 Test Odesli avec URL exemple:', testUrl);
    
    const result = await odesliService.fetchPlatformLinks(testUrl);
    
    res.json({
      success: true,
      message: 'Test Odesli réussi',
      testUrl,
      result: {
        hasData: !!result,
        trackTitle: result?.trackTitle,
        artistName: result?.artist?.name,
        platformCount: result?.platformLinks?.length || 0,
        platforms: result?.platformLinks?.map(p => p.platform) || []
      },
      serviceStats: odesliService.getServiceStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test Odesli échoué:', error);
    res.status(500).json({
      success: false,
      error: 'Test Odesli échoué',
      message: error.message,
      serviceStats: odesliService.getServiceStats(),
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/create-smartlink-complete - Créer SmartLink complet avec audio et tracking
router.post('/create-smartlink-complete', async (req, res) => {
  try {
    const { sourceUrl, audioUrl, tracking, selectedPlatforms, trackInfo } = req.body;
    
    if (!sourceUrl) {
      return res.status(400).json({
        error: 'URL source requise'
      });
    }

    console.log('🚀 Création SmartLink complet:', { sourceUrl, audioUrl, tracking, selectedPlatforms: selectedPlatforms?.length });

    // Si des plateformes ont été sélectionnées, utiliser ces données
    let completeSmartlinkData;
    
    if (selectedPlatforms && selectedPlatforms.length > 0 && trackInfo) {
      // Utilisation des données de recherche existantes
      completeSmartlinkData = {
        trackTitle: trackInfo.title,
        artist: {
          name: trackInfo.artist,
          slug: trackInfo.artistSlug
        },
        slug: trackInfo.slug,
        coverImageUrl: trackInfo.artwork,
        platformLinks: selectedPlatforms.map(platform => ({
          platform: platform.id,
          name: platform.name,
          displayName: platform.name,
          url: platform.url
        })),
        audioUrl, // URL du fichier audio uploadé
        tracking  // Paramètres de tracking personnalisés
      };
    } else {
      // Fallback : récupération via Odesli
      const odesliData = await odesliService.fetchPlatformLinks(sourceUrl);
      
      if (!odesliData || !odesliData.trackTitle || !odesliData.artist?.name) {
        return res.status(400).json({
          error: 'Impossible de récupérer les données musicales',
          message: 'Vérifiez que l\'URL est valide et publique'
        });
      }

      completeSmartlinkData = {
        ...odesliData,
        audioUrl, // URL du fichier audio uploadé
        tracking  // Paramètres de tracking personnalisés
      };
    }

    // Génération du SmartLink HTML
    const result = await htmlGenerator.generateSmartLinkHtml(completeSmartlinkData);
    const publicUrl = htmlGenerator.getPublicUrl(completeSmartlinkData.artist.slug, completeSmartlinkData.slug);
    
    console.log('✅ SmartLink complet créé:', publicUrl);

    res.json({
      success: true,
      message: 'SmartLink complet créé avec succès',
      trackTitle: completeSmartlinkData.trackTitle,
      artistName: completeSmartlinkData.artist.name,
      artistSlug: completeSmartlinkData.artist.slug,
      trackSlug: completeSmartlinkData.slug,
      platformCount: completeSmartlinkData.platformLinks?.length || 0,
      smartlinkUrl: publicUrl,
      audioUrl: audioUrl,
      tracking: tracking,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur création SmartLink complet:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du SmartLink complet',
      message: error.message
    });
  }
});

// POST /api/upload-audio - Upload fichier audio avec validation durée
router.post('/upload-audio', uploadAudio.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucun fichier audio fourni'
      });
    }

    const audioPath = req.file.path;
    const audioUrl = `/audio/${req.file.filename}`;
    
    // TODO: Validation de durée avec ffprobe/ffmpeg
    // Pour l'instant, on retourne les infos basiques
    const audioInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: audioUrl,
      path: audioPath,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    console.log(`🎵 Audio uploadé: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);

    res.json({
      success: true,
      message: 'Fichier audio uploadé avec succès',
      audio: audioInfo
    });

  } catch (error) {
    console.error('❌ Erreur upload audio:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'upload du fichier audio',
      message: error.message
    });
  }
});

// --- ROUTES AUTHENTIFIÉES POUR LE DASHBOARD ---

// GET /api/smartlinks - Liste des SmartLinks de l'utilisateur
router.get('/smartlinks', verifyToken, async (req, res) => {
  try {
    // Pour le moment, on retourne des données de test
    // En production, on récupèrerait depuis une base de données
    const mockSmartlinks = [
      {
        id: 'slipknot-wait-and-bleed',
        title: 'Wait and Bleed',
        artist: 'Slipknot',
        artwork: 'https://i.scdn.co/image/ab67616d0000b27349de1b4acdde02e84c6023b7',
        url: 'https://smartlink.mdmcmusicads.com/slipknot/wait-and-bleed',
        status: 'active',
        platforms: 8,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: req.user.userId,
        stats: {
          totalClicks: 1200,
          todayClicks: 89,
          conversionRate: 12.3,
          uniqueVisitors: 987,
          topPlatform: 'Spotify'
        }
      },
      {
        id: 'metallica-master-of-puppets',
        title: 'Master of Puppets',
        artist: 'Metallica',
        artwork: 'https://i.scdn.co/image/ab67616d0000b273b8b7f85671a0dd5ea957ec6d',
        url: 'https://smartlink.mdmcmusicads.com/metallica/master-of-puppets',
        status: 'active',
        platforms: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: req.user.userId,
        stats: {
          totalClicks: 2800,
          todayClicks: 156,
          conversionRate: 18.7,
          uniqueVisitors: 2100,
          topPlatform: 'Apple Music'
        }
      },
      {
        id: 'daft-punk-one-more-time',
        title: 'One More Time',
        artist: 'Daft Punk',
        artwork: 'https://i.scdn.co/image/ab67616d0000b273d60776e0b24ad39e71fe8732',
        url: 'https://smartlink.mdmcmusicads.com/daft-punk/one-more-time',
        status: 'draft',
        platforms: 6,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        createdBy: req.user.userId,
        stats: {
          totalClicks: 0,
          todayClicks: 0,
          conversionRate: 0,
          uniqueVisitors: 0,
          topPlatform: null
        }
      }
    ];

    res.json({
      success: true,
      smartlinks: mockSmartlinks,
      total: mockSmartlinks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur récupération SmartLinks:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des SmartLinks'
    });
  }
});

// GET /api/dashboard/stats - Statistiques du dashboard utilisateur
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    // Statistiques de test pour le dashboard
    const stats = {
      totalSmartlinks: 24,
      activeSmartlinks: 21,
      totalClicks: 12400,
      monthlyClicks: 3200,
      conversionRate: 8.7,
      totalPlatforms: 47,
      topPlatforms: [
        { name: 'Spotify', clicks: 4200, percentage: 33.9 },
        { name: 'Apple Music', clicks: 3100, percentage: 25.0 },
        { name: 'YouTube Music', clicks: 2400, percentage: 19.4 },
        { name: 'Deezer', clicks: 1200, percentage: 9.7 },
        { name: 'Others', clicks: 1500, percentage: 12.0 }
      ],
      recentActivity: [
        { action: 'SmartLink créé', item: 'Daft Punk - One More Time', timestamp: new Date().toISOString() },
        { action: 'Clics reçus', item: 'Slipknot - Wait and Bleed', count: 89, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
      ],
      growth: {
        smartlinks: { value: 3, percentage: 14.3, trend: 'up' },
        clicks: { value: 580, percentage: 18.1, trend: 'up' },
        conversion: { value: -0.3, percentage: -3.3, trend: 'down' }
      }
    };

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur statistiques dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// DELETE /api/smartlinks/:id - Supprimer un SmartLink
router.delete('/smartlinks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Suppression SmartLink demandée: ${id} par ${req.user.username}`);
    
    // En production, vérifier que l'utilisateur est propriétaire du SmartLink
    // et supprimer de la base de données + fichier HTML
    
    // Pour le moment, simulation de succès
    res.json({
      success: true,
      message: `SmartLink ${id} supprimé avec succès`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur suppression SmartLink:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du SmartLink'
    });
  }
});

// POST /api/smartlinks - Créer un nouveau SmartLink (version authentifiée)
router.post('/smartlinks', verifyToken, async (req, res) => {
  try {
    const { sourceUrl, customData } = req.body;
    
    if (!sourceUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL source requise'
      });
    }
    
    console.log(`🎵 Création SmartLink authentifiée par ${req.user.username}: ${sourceUrl}`);
    
    // Récupération des données via Odesli
    const odesliData = await odesliService.fetchPlatformLinks(sourceUrl, 'FR');
    
    if (!odesliData || !odesliData.trackTitle || !odesliData.artist?.name) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de récupérer les données musicales depuis cette URL'
      });
    }
    
    // Transformation des platformLinks pour le template EJS
    const platforms = (odesliData.platformLinks || []).map(platform => ({
      name: getPlatformDisplayName(platform.platform),
      url: platform.url,
      platform: platform.platform,
      nativeAppUriDesktop: platform.nativeAppUriDesktop || platform.url
    }));

    // Ajout des métadonnées utilisateur
    const smartlinkData = {
      ...odesliData,
      platforms, // Ajout des platforms formatés pour le template
      createdBy: req.user.userId,
      createdByUsername: req.user.username,
      createdAt: new Date().toISOString(),
      status: 'active',
      customData: customData || {}
    };
    
    // Génération du fichier HTML
    const htmlPath = await htmlGenerator.generateSmartLinkHtml(smartlinkData);
    const publicUrl = htmlGenerator.getPublicUrl(odesliData.artist.slug, odesliData.slug);
    
    console.log(`✅ SmartLink créé par ${req.user.username}: ${publicUrl}`);
    
    res.status(201).json({
      success: true,
      message: 'SmartLink créé avec succès',
      smartlink: {
        id: `${odesliData.artist.slug}-${odesliData.slug}`,
        title: odesliData.trackTitle,
        artist: odesliData.artist.name,
        artwork: odesliData.coverImageUrl,
        url: publicUrl,
        status: 'active',
        platforms: odesliData.platformLinks?.length || 0,
        createdAt: smartlinkData.createdAt,
        createdBy: req.user.userId
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur création SmartLink authentifiée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du SmartLink',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/smartlinks/:id - Détails d'un SmartLink spécifique
router.get('/smartlinks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulation des détails d'un SmartLink
    // En production, récupérer depuis la base de données
    const smartlinkDetails = {
      id,
      title: 'Wait and Bleed',
      artist: 'Slipknot',
      artwork: 'https://i.scdn.co/image/ab67616d0000b27349de1b4acdde02e84c6023b7',
      url: `https://smartlink.mdmcmusicads.com/slipknot/${id}`,
      status: 'active',
      platforms: 8,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: req.user.userId,
      detailedStats: {
        totalClicks: 1200,
        uniqueVisitors: 987,
        conversionRate: 12.3,
        clicksByPlatform: [
          { platform: 'Spotify', clicks: 420, percentage: 35 },
          { platform: 'Apple Music', clicks: 300, percentage: 25 },
          { platform: 'YouTube Music', clicks: 240, percentage: 20 },
          { platform: 'Deezer', clicks: 120, percentage: 10 },
          { platform: 'Others', clicks: 120, percentage: 10 }
        ],
        clicksByDay: [
          { date: '2025-08-01', clicks: 45 },
          { date: '2025-08-02', clicks: 67 },
          { date: '2025-08-03', clicks: 89 },
          { date: '2025-08-04', clicks: 123 },
          { date: '2025-08-05', clicks: 98 },
          { date: '2025-08-06', clicks: 89 }
        ]
      }
    };
    
    res.json({
      success: true,
      smartlink: smartlinkDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur récupération détails SmartLink:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails'
    });
  }
});

module.exports = router;