const express = require('express');
const router = express.Router();

// Route principale du dashboard - Création de SmartLinks
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Créer SmartLink | MDMC Dashboard</title>
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
        <h1>Dashboard MDMC SmartLinks</h1>
        <p>Interface de création de SmartLinks</p>
        <p>Cette page sera bientôt implémentée avec l'interface de création complète.</p>
        <a href="/dashboard/manage" class="nav-link">📱 Gérer mes SmartLinks</a>
        <a href="/dashboard/analytics" class="nav-link">📊 Analytics</a>
      </div>
    </body>
    </html>
  `);
});

// Route de gestion des SmartLinks
router.get('/manage', async (req, res) => {
  try {
    // Cette route utilise le template EJS avec le vrai code HTML
    res.render('dashboard');
  } catch (error) {
    console.error('❌ Erreur dashboard manage:', error);
    res.status(500).send('Erreur chargement dashboard');
  }
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