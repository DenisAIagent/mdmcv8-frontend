// test-server-bot.js
// Test d'intégration pour simuler des requêtes de bots sur le serveur

import axios from 'axios';

const SERVER_URL = 'http://localhost:3001';
const TEST_SMARTLINK = '/smartlinks/test-artist/test-track';

// User-Agents de test pour différents bots
const botUserAgents = [
  {
    name: 'Facebook Bot',
    userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
  },
  {
    name: 'Twitter Bot',
    userAgent: 'Twitterbot/1.0'
  },
  {
    name: 'LinkedIn Bot',
    userAgent: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)'
  },
  {
    name: 'WhatsApp',
    userAgent: 'WhatsApp/2.19.81 A'
  }
];

// User-Agent humain pour comparaison
const humanUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function testServerResponse() {
  console.log('🚀 TESTING SERVER BOT DETECTION');
  console.log('='.repeat(60));
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Test SmartLink: ${TEST_SMARTLINK}`);
  console.log('');

  // Test avec un utilisateur humain normal
  console.log('👤 TESTING HUMAN USER');
  console.log('-'.repeat(30));
  
  try {
    const humanResponse = await axios.get(`${SERVER_URL}${TEST_SMARTLINK}`, {
      headers: {
        'User-Agent': humanUserAgent
      },
      timeout: 10000
    });
    
    console.log(`✅ Human request status: ${humanResponse.status}`);
    console.log(`📄 Content-Type: ${humanResponse.headers['content-type']}`);
    console.log(`📏 Content-Length: ${humanResponse.data.length} characters`);
    
    // Vérifier que c'est bien le HTML React standard
    const hasReactApp = humanResponse.data.includes('id="root"');
    console.log(`⚛️ Contains React app div: ${hasReactApp ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.log(`❌ Human request failed: ${error.message}`);
  }

  console.log('');

  // Test avec différents bots
  console.log('🤖 TESTING BOT USERS');
  console.log('-'.repeat(30));

  for (const bot of botUserAgents) {
    try {
      console.log(`\nTesting ${bot.name}...`);
      
      const botResponse = await axios.get(`${SERVER_URL}${TEST_SMARTLINK}`, {
        headers: {
          'User-Agent': bot.userAgent
        },
        timeout: 10000
      });
      
      console.log(`✅ ${bot.name} status: ${botResponse.status}`);
      console.log(`📄 Content-Type: ${botResponse.headers['content-type']}`);
      console.log(`📏 Content-Length: ${botResponse.data.length} characters`);
      
      // Vérifier la présence des meta tags Open Graph
      const hasOgTitle = botResponse.data.includes('property="og:title"');
      const hasOgImage = botResponse.data.includes('property="og:image"');
      const hasTwitterCard = botResponse.data.includes('name="twitter:card"');
      const hasMusicMeta = botResponse.data.includes('property="music:');
      
      console.log(`🏷️ Open Graph title: ${hasOgTitle ? 'Found' : 'Missing'}`);
      console.log(`🖼️ Open Graph image: ${hasOgImage ? 'Found' : 'Missing'}`);
      console.log(`🐦 Twitter card: ${hasTwitterCard ? 'Found' : 'Missing'}`);
      console.log(`🎵 Music meta tags: ${hasMusicMeta ? 'Found' : 'Missing'}`);
      
      // Extraire et afficher le titre si disponible
      const titleMatch = botResponse.data.match(/<meta property="og:title" content="([^"]*)">/);
      if (titleMatch) {
        console.log(`📝 Extracted title: "${titleMatch[1]}"`);
      }
      
      // Extraire et afficher l'image si disponible
      const imageMatch = botResponse.data.match(/<meta property="og:image" content="([^"]*)">/);
      if (imageMatch) {
        console.log(`🖼️ Extracted image: "${imageMatch[1]}"`);
      }
      
    } catch (error) {
      console.log(`❌ ${bot.name} request failed: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Tip: Make sure the server is running with "npm start"');
      }
    }
  }

  console.log('\n🎯 TEST COMPLETE');
  console.log('='.repeat(60));
}

// Test de santé du serveur
async function checkServerHealth() {
  try {
    console.log('🏥 Checking server health...');
    const healthResponse = await axios.get(`${SERVER_URL}/health`, { timeout: 5000 });
    console.log(`✅ Server is healthy: ${JSON.stringify(healthResponse.data)}`);
    return true;
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`);
    console.log('💡 Please start the server with: npm start');
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  const serverIsHealthy = await checkServerHealth();
  
  if (serverIsHealthy) {
    console.log('');
    await testServerResponse();
  } else {
    console.log('\n🚫 Cannot run tests - server is not accessible');
    console.log('📋 To run these tests:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Wait for "Server running on port 3000"');
    console.log('   3. Run this test: node test-server-bot.js');
  }
}

runTests();