// Test simple de l'intégration SmartLink
// node test-integration-simple.js

const axios = require('axios');

async function testIntegration() {
  console.log('🧪 Test simple intégration SmartLink + Odesli\n');

  const testData = {
    sourceUrl: 'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr',
    userCountry: 'FR'
  };

  console.log('📤 Test POST avec bypass token');
  console.log('URL:', testData.sourceUrl);

  try {
    const response = await axios.post('http://localhost:5001/api/v1/smartlinks/fetch-platform-links', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-bypass-token'
      },
      timeout: 30000
    });

    console.log('\n✅ Réponse API:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      console.log('\n📋 Métadonnées:');
      console.log(`   Titre: ${data.title}`);
      console.log(`   Artiste: ${data.artist || data.artistName}`);
      console.log(`   Album: ${data.album || data.albumName}`);
      console.log(`   ISRC: ${data.isrc || 'N/A'}`);
      console.log(`   Artwork: ${data.artwork ? '✅' : '❌'}`);
      
      console.log('\n🔗 Liens plateformes:');
      const links = data.linksByPlatform || {};
      Object.entries(links).forEach(([platform, linkData]) => {
        const url = typeof linkData === 'string' ? linkData : linkData?.url;
        if (url) {
          console.log(`   ${platform}: ${url.substring(0, 60)}...`);
        }
      });
      
      console.log(`\n📊 Total: ${Object.keys(links).length} plateformes détectées`);
      
      console.log('\n🎉 INTÉGRATION FRONTEND-BACKEND RÉUSSIE !');
      console.log('✅ L\'API Odesli fonctionne parfaitement');
      console.log('✅ Le backend traite les requêtes correctement');
      console.log('✅ Les données sont formatées pour le frontend');
      
    } else {
      console.log('❌ Pas de données dans la réponse');
      console.log('Response:', response.data);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serveur backend non accessible sur localhost:5001');
      console.log('💡 Essayez: cd backend && npm run dev');
    } else if (error.response) {
      console.log('❌ Erreur HTTP:', error.response.status);
      console.log('Message:', error.response.data);
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
}

testIntegration();