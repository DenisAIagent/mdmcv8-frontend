#!/usr/bin/env node

// Script de test complet pour le service SmartLinks MDMC
// Teste l'intégration Odesli, génération HTML et APIs

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OdesliService = require('../services/odesliService');
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');

async function runTests() {
  console.log('🧪 === TESTS SERVICE SMARTLINKS MDMC ===\n');
  
  const odesliService = new OdesliService();
  const htmlGenerator = new StaticHtmlGenerator();
  
  let passed = 0;
  let failed = 0;
  
  // --- Test 1: Connexion Odesli ---
  console.log('🔍 Test 1: Connexion API Odesli');
  try {
    const testResult = await odesliService.testConnection();
    if (testResult.success) {
      console.log(`✅ Connexion OK - ${testResult.duration} - ${testResult.platformsFound} plateformes`);
      passed++;
    } else {
      throw new Error(testResult.error);
    }
  } catch (error) {
    console.log(`❌ Connexion échouée: ${error.message}`);
    failed++;
  }
  
  // --- Test 2: Fetch Odesli ---
  console.log('\n🎵 Test 2: Récupération données Odesli');
  try {
    const testUrl = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'; // Slipknot - Wait and Bleed
    const data = await odesliService.fetchPlatformLinks(testUrl);
    
    if (data.trackTitle && data.artist.name && data.platformLinks.length > 0) {
      console.log(`✅ Données récupérées: "${data.trackTitle}" - ${data.artist.name} (${data.platformLinks.length} plateformes)`);
      console.log(`   Slug généré: ${data.artist.slug}/${data.slug}`);
      passed++;
    } else {
      throw new Error('Données incomplètes');
    }
  } catch (error) {
    console.log(`❌ Récupération échouée: ${error.message}`);
    failed++;
  }
  
  // --- Test 3: Génération HTML ---
  console.log('\n📄 Test 3: Génération HTML statique');
  try {
    const testUrl = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC';
    const result = await htmlGenerator.generateFromUrl(testUrl);
    
    if (result.success && result.filePath) {
      console.log(`✅ HTML généré: ${result.filePath}`);
      console.log(`   URL publique: ${result.url}`);
      passed++;
    } else {
      throw new Error('Génération HTML échouée');
    }
  } catch (error) {
    console.log(`❌ Génération HTML échouée: ${error.message}`);
    failed++;
  }
  
  // --- Test 4: Template EJS ---
  console.log('\n🎨 Test 4: Validation template EJS');
  try {
    const templatePath = path.join(__dirname, '../templates/smartlink.ejs');
    const fs = require('fs').promises;
    
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    // Vérifications critiques du template
    const checks = [
      { test: templateContent.includes('og:title'), name: 'Open Graph title' },
      { test: templateContent.includes('og:image'), name: 'Open Graph image' },
      { test: templateContent.includes('twitter:card'), name: 'Twitter Card' },
      { test: templateContent.includes('#E50914'), name: 'Couleur MDMC' },
      { test: templateContent.includes('Poppins'), name: 'Font Poppins' },
      { test: templateContent.includes('Inter'), name: 'Font Inter' },
      { test: templateContent.includes('MDMC Music Ads'), name: 'Branding' },
      { test: !templateContent.includes('emoji'), name: 'Pas d\'emojis' },
    ];
    
    const checksPassed = checks.filter(check => check.test).length;
    
    if (checksPassed === checks.length) {
      console.log(`✅ Template valide: ${checksPassed}/${checks.length} vérifications OK`);
      passed++;
    } else {
      const failed_checks = checks.filter(check => !check.test);
      console.log(`⚠️ Template incomplet: ${checksPassed}/${checks.length} vérifications`);
      failed_checks.forEach(check => console.log(`   - Manque: ${check.name}`));
      failed++;
    }
  } catch (error) {
    console.log(`❌ Validation template échouée: ${error.message}`);
    failed++;
  }
  
  // --- Test 5: Configuration ---
  console.log('\n⚙️ Test 5: Configuration environnement');
  try {
    const requiredEnvVars = [
      'BASE_URL',
      'ODESLI_API_URL',
      'BRAND_NAME'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ Configuration environnement OK');
      console.log(`   BASE_URL: ${process.env.BASE_URL}`);
      console.log(`   ODESLI_API_URL: ${process.env.ODESLI_API_URL}`);
      passed++;
    } else {
      console.log(`⚠️ Variables manquantes: ${missingVars.join(', ')}`);
      console.log('   Créer un fichier .env avec les variables requises');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Vérification config échouée: ${error.message}`);
    failed++;
  }
  
  // --- Test 6: Structure des dossiers ---
  console.log('\n📁 Test 6: Structure des dossiers');
  try {
    const fs = require('fs').promises;
    const requiredPaths = [
      '../templates/smartlink.ejs',
      '../services/odesliService.js',
      '../services/staticHtmlGenerator.js',
      '../routes/api.js',
      '../routes/smartlinks.js',
      '../public/smartlinks'
    ];
    
    const pathChecks = await Promise.all(
      requiredPaths.map(async (relativePath) => {
        try {
          const fullPath = path.join(__dirname, relativePath);
          await fs.access(fullPath);
          return { path: relativePath, exists: true };
        } catch {
          return { path: relativePath, exists: false };
        }
      })
    );
    
    const existingPaths = pathChecks.filter(check => check.exists).length;
    
    if (existingPaths === requiredPaths.length) {
      console.log(`✅ Structure dossiers OK: ${existingPaths}/${requiredPaths.length} fichiers`);
      passed++;
    } else {
      const missingPaths = pathChecks.filter(check => !check.exists);
      console.log(`⚠️ Fichiers manquants: ${existingPaths}/${requiredPaths.length}`);
      missingPaths.forEach(item => console.log(`   - ${item.path}`));
      failed++;
    }
  } catch (error) {
    console.log(`❌ Vérification structure échouée: ${error.message}`);
    failed++;
  }
  
  // --- Résumé ---
  console.log('\n🎯 === RÉSUMÉ DES TESTS ===');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📊 Score: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🚀 Service SmartLinks MDMC prêt pour déploiement !');
    console.log('🔗 URLs à tester :');
    console.log(`   - Health: ${process.env.BASE_URL || 'http://localhost:3001'}/health`);
    console.log(`   - API Test: ${process.env.BASE_URL || 'http://localhost:3001'}/api/odesli/test`);
    console.log(`   - Exemple: ${process.env.BASE_URL || 'http://localhost:3001'}/slipknot/wait-and-bleed`);
  } else {
    console.log('\n⚠️ Corrections nécessaires avant déploiement');
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

// Exécution des tests
runTests().catch((error) => {
  console.error('❌ Erreur critique:', error);
  process.exit(1);
});