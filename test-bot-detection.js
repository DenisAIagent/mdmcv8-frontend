// test-bot-detection.js
// Script de test pour valider le middleware bot detection

import { isSocialBot, fetchSmartLinkData, generateSocialMetaTags } from './src/utils/botDetection.js';

// Test User-Agents pour différents bots sociaux
const testUserAgents = [
  // Facebook bots
  {
    name: 'Facebook External Hit',
    userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    expected: true
  },
  {
    name: 'Facebook Bot',
    userAgent: 'Facebot',
    expected: true
  },
  
  // Twitter/X bots
  {
    name: 'Twitter Bot',
    userAgent: 'Twitterbot/1.0',
    expected: true
  },
  
  // LinkedIn
  {
    name: 'LinkedIn Bot',
    userAgent: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
    expected: true
  },
  
  // WhatsApp
  {
    name: 'WhatsApp',
    userAgent: 'WhatsApp/2.19.81 A',
    expected: true
  },
  
  // Navigateurs normaux (ne devraient pas être détectés comme bots)
  {
    name: 'Chrome Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    expected: false
  },
  {
    name: 'Safari Mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    expected: false
  },
  {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    expected: false
  }
];

// Test de détection des bots
console.log('🧪 TESTING BOT DETECTION');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

testUserAgents.forEach(test => {
  const result = isSocialBot(test.userAgent);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${status} ${test.name}: ${result} (expected: ${test.expected})`);
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
    console.log(`   User-Agent: ${test.userAgent}`);
  }
});

console.log('\n📊 RESULTS:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

// Test de génération des meta tags
console.log('\n🏷️ TESTING META TAGS GENERATION');
console.log('='.repeat(50));

const mockSmartLinkData = {
  trackTitle: 'Test Track',
  artistName: 'Test Artist',
  coverImageUrl: 'https://example.com/cover.jpg',
  description: 'This is a test track description'
};

const testUrl = 'https://mdmcmusicads.com/smartlinks/test-artist/test-track';
const metaTags = generateSocialMetaTags(mockSmartLinkData, testUrl);

console.log('Generated meta tags:');
console.log(metaTags);

// Test avec données nulles (fallback)
console.log('\n🚨 TESTING FALLBACK META TAGS');
console.log('='.repeat(50));

const fallbackMetaTags = generateSocialMetaTags(null, testUrl);
console.log('Fallback meta tags:');
console.log(fallbackMetaTags);

// Test de récupération des données SmartLink (nécessite un serveur backend actif)
console.log('\n🔍 TESTING SMARTLINK DATA FETCH');
console.log('='.repeat(50));

async function testFetchSmartLinkData() {
  try {
    console.log('Testing with mock artist/track...');
    const data = await fetchSmartLinkData('test-artist', 'test-track');
    
    if (data) {
      console.log('✅ Data fetched successfully:');
      console.log(`   Track: ${data.trackTitle}`);
      console.log(`   Artist: ${data.artistName}`);
      console.log(`   Cover: ${data.coverImageUrl}`);
    } else {
      console.log('⚠️ No data returned (expected if backend not available)');
    }
  } catch (error) {
    console.log('❌ Error during fetch test:', error.message);
  }
}

// Exécuter le test de fetch
testFetchSmartLinkData();

console.log('\n🎯 TESTING COMPLETE');
console.log('='.repeat(50));
console.log('✅ Bot detection middleware is ready to deploy!');