// API Routes pour gestion SmartLinks
// CRUD pour créer, modifier, supprimer SmartLinks HTML

const express = require('express');
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');
const OdesliService = require('../services/odesliService');

const router = express.Router();
const htmlGenerator = new StaticHtmlGenerator();
const odesliService = new OdesliService();

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