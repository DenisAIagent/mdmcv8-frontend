#!/usr/bin/env node

/**
 * Test Rapide - MDMC SmartLinks Service
 * Validation rapide de l'intégration Odesli
 */

const OdesliService = require('../services/odesliService');

async function quickTest() {
  console.log('🎵 MDMC SmartLinks - Test Rapide');
  console.log('='.repeat(40));
  
  const odesliService = new OdesliService();
  
  try {
    // Test avec une URL Spotify populaire
    const testUrl = 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh';
    console.log(`🎵 Test avec: ${testUrl}`);
    
    const startTime = Date.now();
    const data = await odesliService.fetchPlatformLinks(testUrl, 'FR');
    const duration = Date.now() - startTime;
    
    console.log(`\\n✅ Succès en ${duration}ms !`);
    console.log(`   Titre: ${data.trackTitle}`);
    console.log(`   Artiste: ${data.artist?.name}`);
    console.log(`   Plateformes: ${data.platformLinks?.length || 0}`);
    console.log(`   Cover: ${data.coverImageUrl ? 'Disponible' : 'Manquante'}`);
    
    if (data.platformLinks?.length > 0) {
      console.log(`\\n🔗 Plateformes trouvées:`);
      data.platformLinks.slice(0, 5).forEach(platform => {
        console.log(`   - ${platform.platform}: ${platform.url.substring(0, 60)}...`);
      });
    }
    
    console.log(`\\n🎉 Test réussi - Service fonctionnel !`);
    
  } catch (error) {
    console.error(`\\n❌ Erreur:`, error.message);
    console.log(`\\n🔧 Vérifiez:`);
    console.log(`   - Connexion Internet`);
    console.log(`   - API Odesli accessible`);
    console.log(`   - URL de test valide`);
    process.exit(1);
  }
}

// Lancement du test
if (require.main === module) {
  quickTest();
}

module.exports = quickTest;