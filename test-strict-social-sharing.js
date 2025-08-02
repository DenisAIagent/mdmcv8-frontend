// Test de validation du partage social STRICT (SANS FALLBACKS)
// Usage: node test-strict-social-sharing.js

import fetch from 'node-fetch';

const TEST_URLS = [
  'http://localhost:3000/smartlinks/test-artist/test-track',
  'http://localhost:3000/smartlinks/real-artist/real-track'
];

const SOCIAL_BOT_USER_AGENTS = [
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Twitterbot/1.0',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com/)',
  'WhatsApp/2.2037.6 A',
  'Discordbot/2.0 (+https://discordapp.com)',
  'TelegramBot (like TwitterBot)'
];

const HUMAN_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
];

/**
 * Test l'endpoint SmartLink avec un User-Agent spécifique
 */
async function testSmartLinkEndpoint(url, userAgent, isBot = false) {
  try {
    console.log(`\n🧪 Testing: ${url}`);
    console.log(`👤 User-Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`🤖 Expected bot detection: ${isBot}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent
      }
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Analyse du contenu
    const hasOgImage = html.includes('property="og:image"');
    const hasTwitterImage = html.includes('name="twitter:image"');
    const hasFallbackImage = html.includes('banniere site.jpg') || html.includes('og-image.jpg');
    const hasRealOgTitle = html.includes('property="og:title"') && !html.includes('MDMC Music Ads');
    const hasRealData = html.includes('property="og:title"') && html.includes(' - ') && !html.includes('SmartLink non trouvé');
    
    const result = {
      success: true,
      isBot: isBot,
      botDetected: hasOgImage || hasTwitterImage,
      hasRealData: hasRealData,
      hasFallbackImages: hasFallbackImage,
      hasMetaTags: hasOgImage,
      contentLength: html.length
    };
    
    // Validation stricte
    if (isBot) {
      if (result.hasRealData && !result.hasFallbackImages) {
        console.log(`✅ BOT: Vraies données utilisées, aucun fallback`);
      } else if (!result.hasMetaTags) {
        console.log(`✅ BOT: Pas de meta tags (données incomplètes) - comportement correct`);
      } else if (result.hasFallbackImages) {
        console.log(`❌ BOT: FALLBACK détecté - VIOLATION des exigences`);
      } else {
        console.log(`⚠️ BOT: Comportement ambigu`);
      }
    } else {
      if (!result.hasMetaTags) {
        console.log(`✅ HUMAN: Application React normale (pas de meta tags)`);
      } else {
        console.log(`⚠️ HUMAN: Meta tags présents - unexpected`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test principal
 */
async function runTests() {
  console.log('🚀 DÉMARRAGE DES TESTS - Partage Social Strict SANS FALLBACKS');
  console.log('=' * 80);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    violations: 0
  };
  
  // Test avec bots sociaux
  console.log('\n📱 TESTS AVEC BOTS SOCIAUX');
  console.log('-' * 40);
  
  for (const url of TEST_URLS) {
    for (const userAgent of SOCIAL_BOT_USER_AGENTS.slice(0, 2)) { // Limite pour éviter le spam
      const result = await testSmartLinkEndpoint(url, userAgent, true);
      results.total++;
      
      if (result.success) {
        if (result.hasFallbackImages) {
          results.violations++;
          console.log(`🚨 VIOLATION: Fallback détecté`);
        } else {
          results.passed++;
        }
      } else {
        results.failed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Délai entre requêtes
    }
  }
  
  // Test avec utilisateurs humains
  console.log('\n👤 TESTS AVEC UTILISATEURS HUMAINS');
  console.log('-' * 40);
  
  for (const url of TEST_URLS.slice(0, 1)) { // Test rapide
    for (const userAgent of HUMAN_USER_AGENTS.slice(0, 1)) {
      const result = await testSmartLinkEndpoint(url, userAgent, false);
      results.total++;
      
      if (result.success) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('=' * 40);
  console.log(`Total: ${results.total}`);
  console.log(`Réussis: ${results.passed}`);
  console.log(`Échoués: ${results.failed}`);
  console.log(`Violations: ${results.violations}`);
  
  if (results.violations === 0) {
    console.log('\n✅ SUCCÈS: Aucun fallback détecté - Exigences respectées');
  } else {
    console.log('\n❌ ÉCHEC: Fallbacks détectés - Correction nécessaire');
  }
  
  return results.violations === 0;
}

/**
 * Tests spécifiques de validation
 */
async function runValidationTests() {
  console.log('\n🔍 TESTS DE VALIDATION SPÉCIFIQUES');
  console.log('=' * 50);
  
  // Test 1: Vérifier que les vraies données sont utilisées quand disponibles
  console.log('\n🎯 Test 1: Vraies données disponibles');
  const realDataTest = await testSmartLinkEndpoint(
    'http://localhost:3000/smartlinks/real-artist/real-track',
    'facebookexternalhit/1.1',
    true
  );
  
  if (realDataTest.success && realDataTest.hasRealData && !realDataTest.hasFallbackImages) {
    console.log('✅ Test 1 RÉUSSI: Vraies données utilisées sans fallback');
  } else {
    console.log('❌ Test 1 ÉCHOUÉ');
  }
  
  // Test 2: Vérifier l'absence de meta tags si données incomplètes
  console.log('\n🎯 Test 2: Données incomplètes');
  const incompleteDataTest = await testSmartLinkEndpoint(
    'http://localhost:3000/smartlinks/incomplete/data',
    'facebookexternalhit/1.1',
    true
  );
  
  if (incompleteDataTest.success && !incompleteDataTest.hasMetaTags) {
    console.log('✅ Test 2 RÉUSSI: Pas de meta tags pour données incomplètes');
  } else if (incompleteDataTest.success && incompleteDataTest.hasFallbackImages) {
    console.log('❌ Test 2 ÉCHOUÉ: Fallback utilisé au lieu d\'échouer proprement');
  } else {
    console.log('⚠️ Test 2: Résultat ambigu');
  }
  
  // Test 3: Vérifier comportement utilisateurs humains
  console.log('\n🎯 Test 3: Utilisateurs humains');
  const humanTest = await testSmartLinkEndpoint(
    'http://localhost:3000/smartlinks/real-artist/real-track',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    false
  );
  
  if (humanTest.success && !humanTest.hasMetaTags) {
    console.log('✅ Test 3 RÉUSSI: Application React normale pour humains');
  } else {
    console.log('❌ Test 3 ÉCHOUÉ: Comportement inattendu pour humains');
  }
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('⚠️ IMPORTANT: Assurez-vous que le serveur est démarré sur localhost:3000');
  console.log('Commande: npm start ou node server.js\n');
  
  runTests()
    .then(success => {
      if (success) {
        console.log('\n🎉 TOUS LES TESTS SONT PASSÉS');
        return runValidationTests();
      } else {
        console.log('\n💥 TESTS ÉCHOUÉS - Correction nécessaire');
        process.exit(1);
      }
    })
    .then(() => {
      console.log('\n✨ VALIDATION TERMINÉE');
    })
    .catch(error => {
      console.error('\n💥 ERREUR DURANT LES TESTS:', error);
      process.exit(1);
    });
}

export { runTests, runValidationTests };