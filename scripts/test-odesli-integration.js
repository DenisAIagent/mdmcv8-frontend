#!/usr/bin/env node

/**
 * Test Complet de l'Intégration Odesli
 * MDMC SmartLinks Service
 * 
 * Ce script teste toutes les fonctionnalités Odesli :
 * - Connexion API
 * - Récupération de données depuis différentes plateformes
 * - Génération de SmartLinks avec tracking UTM
 * - Validation du template moderne
 */

const OdesliService = require('../services/odesliService');
const StaticHtmlGenerator = require('../services/staticHtmlGenerator');
const fs = require('fs').promises;
const path = require('path');

// Configuration des tests
const TEST_URLS = [
  {
    name: 'Spotify - Track populaire',
    url: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
    expectedPlatforms: ['spotify', 'apple', 'youtube', 'deezer']
  },
  {
    name: 'Apple Music - Track populaire',
    url: 'https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408590',
    expectedPlatforms: ['apple', 'spotify', 'youtube']
  },
  {
    name: 'YouTube Music - Track populaire',  
    url: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
    expectedPlatforms: ['youtube', 'spotify', 'apple']
  }
];

class OdesliIntegrationTester {
  constructor() {
    this.odesliService = new OdesliService();
    this.htmlGenerator = new StaticHtmlGenerator();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Lance tous les tests
   */
  async runAllTests() {
    console.log('🎵 MDMC SmartLinks - Test Intégration Odesli');
    console.log('=' .repeat(60));
    
    try {
      // 1. Test de connexion Odesli
      await this.testOdesliConnection();
      
      // 2. Test de récupération de données
      await this.testDataRetrieval();
      
      // 3. Test de génération SmartLinks
      await this.testSmartLinkGeneration();
      
      // 4. Test des paramètres UTM
      await this.testUtmTracking();
      
      // 5. Test du template moderne
      await this.testModernTemplate();
      
      // Résumé final
      this.printFinalReport();
      
    } catch (error) {
      console.error('❌ Erreur critique dans les tests:', error);
      process.exit(1);
    }
  }

  /**
   * Test 1: Connexion Odesli
   */
  async testOdesliConnection() {
    console.log('\\n🔌 Test 1: Connexion API Odesli');
    console.log('-'.repeat(40));
    
    try {
      const testResult = await this.odesliService.testConnection();
      
      if (testResult.success) {
        console.log('✅ Connexion Odesli réussie');
        console.log(`   API URL: ${testResult.apiUrl}`);
        console.log(`   Status: ${testResult.status}`);
        this.results.passed++;
      } else {
        throw new Error('Connexion échouée: ' + testResult.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur connexion Odesli:', error.message);
      this.results.failed++;
      this.results.errors.push(`Connexion Odesli: ${error.message}`);
    }
    
    this.results.total++;
  }

  /**
   * Test 2: Récupération de données depuis différentes plateformes
   */
  async testDataRetrieval() {
    console.log('\\n📊 Test 2: Récupération de données');
    console.log('-'.repeat(40));
    
    for (const testCase of TEST_URLS) {
      try {
        console.log(`\\n🎵 Testing: ${testCase.name}`);
        console.log(`   URL: ${testCase.url}`);
        
        const data = await this.odesliService.fetchPlatformLinks(testCase.url, 'FR');
        
        // Vérifications
        if (!data.trackTitle) {
          throw new Error('Titre manquant');
        }
        
        if (!data.artist?.name) {
          throw new Error('Artiste manquant');
        }
        
        if (!data.platformLinks || data.platformLinks.length === 0) {
          throw new Error('Aucun lien de plateforme trouvé');
        }
        
        // Vérification des plateformes attendues
        const foundPlatforms = data.platformLinks.map(p => p.platform);
        const missingPlatforms = testCase.expectedPlatforms.filter(p => !foundPlatforms.includes(p));
        
        console.log(`   ✅ Titre: ${data.trackTitle}`);
        console.log(`   ✅ Artiste: ${data.artist.name}`);
        console.log(`   ✅ Plateformes trouvées: ${foundPlatforms.length}`);
        console.log(`   📋 Plateformes: ${foundPlatforms.join(', ')}`);
        
        if (missingPlatforms.length > 0) {
          console.log(`   ⚠️ Plateformes manquantes: ${missingPlatforms.join(', ')}`);
        }
        
        if (data.coverImageUrl) {
          console.log(`   🖼️ Cover image: Disponible`);
        }
        
        this.results.passed++;
        
      } catch (error) {
        console.error(`   ❌ Erreur ${testCase.name}:`, error.message);
        this.results.failed++;
        this.results.errors.push(`${testCase.name}: ${error.message}`);
      }
      
      this.results.total++;
    }
  }

  /**
   * Test 3: Génération de SmartLinks
   */
  async testSmartLinkGeneration() {
    console.log('\\n🔗 Test 3: Génération SmartLinks');
    console.log('-'.repeat(40));
    
    try {
      // Test avec le premier URL
      const testUrl = TEST_URLS[0].url;
      console.log(`Testing avec: ${testUrl}`);
      
      // Récupération des données
      const odesliData = await this.odesliService.fetchPlatformLinks(testUrl, 'FR');
      
      // Préparation des données pour génération
      const smartlinkData = {
        trackTitle: odesliData.trackTitle,
        title: odesliData.trackTitle,
        artist: odesliData.artist,
        slug: odesliData.slug,
        description: odesliData.description,
        coverImageUrl: odesliData.coverImageUrl,
        platformLinks: odesliData.platformLinks,
        utm: {
          source: 'test_integration',
          medium: 'automated_test',
          campaign: 'odesli_validation'
        },
        createdAt: new Date()
      };
      
      // Génération du HTML
      const filePath = await this.htmlGenerator.generateSmartLinkHtml(smartlinkData);
      
      // Vérification du fichier généré
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (fileExists) {
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // Vérifications du contenu
        const checks = [
          { name: 'Titre présent', test: fileContent.includes(odesliData.trackTitle) },
          { name: 'Artiste présent', test: fileContent.includes(odesliData.artist.name) },
          { name: 'Meta description', test: fileContent.includes('<meta name=\"description\"') },
          { name: 'Open Graph', test: fileContent.includes('og:title') },
          { name: 'Schema.org', test: fileContent.includes('application/ld+json') },
          { name: 'Glassmorphism CSS', test: fileContent.includes('backdrop-filter') },
          { name: 'Audio player', test: fileContent.includes('audioPlayer') },
          { name: 'Platform logos SVG', test: fileContent.includes('<svg viewBox') }
        ];
        
        console.log(`   ✅ Fichier généré: ${filePath}`);
        
        checks.forEach(check => {
          if (check.test) {
            console.log(`   ✅ ${check.name}`);
          } else {
            console.log(`   ❌ ${check.name}`);
          }
        });
        
        const passedChecks = checks.filter(c => c.test).length;
        console.log(`   📊 Score: ${passedChecks}/${checks.length} vérifications passées`);
        
        if (passedChecks >= checks.length * 0.8) { // 80% minimum
          this.results.passed++;
        } else {
          throw new Error(`Score insuffisant: ${passedChecks}/${checks.length}`);
        }
        
      } else {
        throw new Error('Fichier SmartLink non généré');
      }
      
    } catch (error) {
      console.error('   ❌ Erreur génération SmartLink:', error.message);
      this.results.failed++;
      this.results.errors.push(`Génération SmartLink: ${error.message}`);
    }
    
    this.results.total++;
  }

  /**
   * Test 4: Tracking UTM
   */
  async testUtmTracking() {
    console.log('\\n📈 Test 4: Tracking UTM');
    console.log('-'.repeat(40));
    
    try {
      // Test d'ajout UTM
      const originalUrl = 'https://open.spotify.com/track/test';
      const utmParams = {
        source: 'test_source',
        medium: 'test_medium', 
        campaign: 'test_campaign'
      };
      
      const trackedUrl = this.htmlGenerator.addUtmParameters(originalUrl, 'spotify', utmParams);
      const url = new URL(trackedUrl);
      
      // Vérifications UTM
      const utmChecks = [
        { param: 'utm_source', expected: 'test_source' },
        { param: 'utm_medium', expected: 'test_medium' },
        { param: 'utm_campaign', expected: 'test_campaign' },
        { param: 'utm_content', expected: 'spotify' },
        { param: 'mdmc_source', expected: 'smartlink' },
        { param: 'mdmc_platform', expected: 'spotify' }
      ];
      
      let passedUtmChecks = 0;
      
      utmChecks.forEach(check => {
        const value = url.searchParams.get(check.param);
        if (value === check.expected) {
          console.log(`   ✅ ${check.param}: ${value}`);
          passedUtmChecks++;
        } else {
          console.log(`   ❌ ${check.param}: attendu '${check.expected}', trouvé '${value}'`);
        }
      });
      
      console.log(`   📊 UTM Score: ${passedUtmChecks}/${utmChecks.length}`);
      
      if (passedUtmChecks >= utmChecks.length * 0.8) {
        this.results.passed++;
      } else {
        throw new Error(`UTM tracking insuffisant: ${passedUtmChecks}/${utmChecks.length}`);
      }
      
    } catch (error) {
      console.error('   ❌ Erreur tracking UTM:', error.message);
      this.results.failed++;
      this.results.errors.push(`Tracking UTM: ${error.message}`);
    }
    
    this.results.total++;
  }

  /**
   * Test 5: Template moderne
   */
  async testModernTemplate() {
    console.log('\\n🎨 Test 5: Template moderne');
    console.log('-'.repeat(40));
    
    try {
      const templatePath = path.join(__dirname, '../templates/smartlink.ejs');
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Vérifications design moderne
      const modernFeatures = [
        { name: 'CSS Variables', test: templateContent.includes(':root {') },
        { name: 'Glassmorphism', test: templateContent.includes('backdrop-filter') },
        { name: 'SVG Logos', test: templateContent.includes('<svg viewBox=\"0 0 24 24\"') },
        { name: 'Audio Player', test: templateContent.includes('audioPlayer') },
        { name: 'Animations CSS', test: templateContent.includes('@keyframes') },
        { name: 'Responsive Design', test: templateContent.includes('@media') },
        { name: 'MDMC Colors', test: templateContent.includes('#cc271a') },
        { name: 'Inter Font', test: templateContent.includes('font-family: \'Inter\'') },
        { name: 'Background Blur', test: templateContent.includes('background-artwork') },
        { name: 'Modern Interactions', test: templateContent.includes('hover') }
      ];
      
      let passedFeatures = 0;
      
      modernFeatures.forEach(feature => {
        if (feature.test) {
          console.log(`   ✅ ${feature.name}`);
          passedFeatures++;
        } else {
          console.log(`   ❌ ${feature.name}`);
        }
      });
      
      console.log(`   🎨 Design Score: ${passedFeatures}/${modernFeatures.length}`);
      
      if (passedFeatures >= modernFeatures.length * 0.9) { // 90% pour le design
        this.results.passed++;
      } else {
        throw new Error(`Design moderne insuffisant: ${passedFeatures}/${modernFeatures.length}`);
      }
      
    } catch (error) {
      console.error('   ❌ Erreur template moderne:', error.message);
      this.results.failed++;
      this.results.errors.push(`Template moderne: ${error.message}`);
    }
    
    this.results.total++;
  }

  /**
   * Affichage du rapport final
   */
  printFinalReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('📊 RAPPORT FINAL - Test Intégration Odesli');
    console.log('='.repeat(60));
    
    console.log(`\\n📈 Résultats:`);
    console.log(`   Total tests: ${this.results.total}`);
    console.log(`   ✅ Réussis: ${this.results.passed}`);
    console.log(`   ❌ Échoués: ${this.results.failed}`);
    
    const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
    console.log(`   📊 Taux de réussite: ${successRate}%`);
    
    if (this.results.errors.length > 0) {
      console.log(`\\n🚨 Erreurs rencontrées:`);
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Verdict final
    if (successRate >= 80) {
      console.log(`\\n🎉 SUCCÈS - Intégration Odesli validée !`);
      console.log(`   Le service MDMC SmartLinks est prêt pour la production.`);
      process.exit(0);
    } else {
      console.log(`\\n⚠️ ATTENTION - Intégration partiellement fonctionnelle`);
      console.log(`   Certains tests ont échoué. Vérifiez les erreurs ci-dessus.`);
      process.exit(1);
    }
  }
}

// Lancement des tests si script exécuté directement
if (require.main === module) {
  const tester = new OdesliIntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = OdesliIntegrationTester;