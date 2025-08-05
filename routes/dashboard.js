const express = require('express');
const router = express.Router();

// Route principale du dashboard
router.get('/', async (req, res) => {
  try {
    // TODO: Récupérer les données réelles depuis la base de données
    // Pour l'instant, on utilise des données simulées
    const dashboardData = {
      // Statistiques globales
      totalSmartlinks: 0,
      totalViews: 0,
      totalClicks: 0,
      clickRate: '0%',
      
      // Analytics temporelles
      todayViews: 0,
      weekViews: 0,
      monthViews: 0,
      topSmartlink: 'Aucun',
      
      // Liste des SmartLinks
      smartlinks: []
    };
    
    res.render('dashboard', dashboardData);
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).send('Erreur chargement dashboard');
  }
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