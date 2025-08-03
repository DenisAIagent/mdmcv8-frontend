#!/usr/bin/env node

// Script de génération pour SmartLinks MDMC
// Génère les fichiers HTML statiques depuis des URLs ou données existantes

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const StaticHtmlGenerator = require('../services/staticHtmlGenerator');

// Exemples de SmartLinks à générer
const EXAMPLE_SMARTLINKS = [
  {
    sourceUrl: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', // Slipknot - Wait and Bleed
    customData: {
      description: 'Découvrez "Wait and Bleed" de Slipknot, un classique du nu-metal. Écoutez sur toutes les plateformes de streaming.'
    }
  },
  {
    sourceUrl: 'https://open.spotify.com/track/4VqPOruhp5EdPBeR92t6lQ', // Metallica - Master of Puppets
    customData: {
      description: 'Le légendaire "Master of Puppets" de Metallica, chef-d\'œuvre du thrash metal disponible partout.'
    }
  },
  {
    sourceUrl: 'https://open.spotify.com/track/0DiWol3AO6WpXZgp0goxAV', // Daft Punk - One More Time
    customData: {
      description: '"One More Time" de Daft Punk, l\'hymne électronique incontournable des années 2000.'
    }
  }
];

async function generateSmartLinks() {
  console.log('🎵 === GÉNÉRATION SMARTLINKS MDMC ===\n');
  
  const htmlGenerator = new StaticHtmlGenerator();
  const results = {
    success: [],
    errors: []
  };
  
  console.log(`📋 Génération de ${EXAMPLE_SMARTLINKS.length} SmartLinks exemples...\n`);
  
  for (let i = 0; i < EXAMPLE_SMARTLINKS.length; i++) {
    const smartlink = EXAMPLE_SMARTLINKS[i];
    
    try {
      console.log(`🔄 ${i + 1}/${EXAMPLE_SMARTLINKS.length} - Traitement: ${smartlink.sourceUrl}`);
      
      // Génération via Odesli
      const result = await htmlGenerator.generateFromUrl(smartlink.sourceUrl, {
        customData: smartlink.customData
      });
      
      if (result.success) {
        console.log(`✅ Généré: ${result.smartlinkData.artist.name} - ${result.smartlinkData.trackTitle}`);
        console.log(`   📁 Fichier: ${result.filePath}`);
        console.log(`   🔗 URL: ${result.url}\n`);
        
        results.success.push({
          artist: result.smartlinkData.artist.name,
          track: result.smartlinkData.trackTitle,
          url: result.url,
          filePath: result.filePath
        });
      } else {
        throw new Error('Génération échouée');
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}\n`);
      results.errors.push({
        sourceUrl: smartlink.sourceUrl,
        error: error.message
      });
    }
    
    // Délai entre les appels pour respecter les limites API
    if (i < EXAMPLE_SMARTLINKS.length - 1) {
      console.log('⏱️ Pause 2s (respect limites API)...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // --- Résumé ---
  console.log('🎯 === RÉSUMÉ GÉNÉRATION ===');
  console.log(`✅ SmartLinks générés: ${results.success.length}`);
  console.log(`❌ Erreurs: ${results.errors.length}`);
  
  if (results.success.length > 0) {
    console.log('\n📋 SmartLinks générés avec succès :');
    results.success.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.artist} - ${item.track}`);
      console.log(`      🔗 ${item.url}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ Erreurs rencontrées :');
    results.errors.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.sourceUrl}`);
      console.log(`      ❌ ${item.error}`);
    });
  }
  
  // Statistiques finales
  const stats = await htmlGenerator.getStats();
  console.log('\n📊 Statistiques du service :');
  console.log(`   📁 Total fichiers: ${stats.totalFiles}`);
  console.log(`   👥 Total artistes: ${stats.totalArtists}`);
  console.log(`   💾 Taille totale: ${Math.round(stats.totalSize / 1024)} KB`);
  
  if (results.errors.length === 0) {
    console.log('\n🚀 Génération terminée avec succès !');
  } else {
    console.log('\n⚠️ Génération terminée avec des erreurs');
    process.exit(1);
  }
}

// Fonction pour générer un SmartLink depuis les arguments CLI
async function generateFromCLI() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎵 === GÉNÉRATEUR SMARTLINKS MDMC ===\n');
    console.log('Usage:');
    console.log('  npm run generate                    # Génère les exemples');
    console.log('  npm run generate <url>              # Génère depuis une URL');
    console.log('  npm run generate <url> <description># Génère avec description custom\n');
    console.log('Exemples:');
    console.log('  npm run generate https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC');
    console.log('  npm run generate "https://music.apple.com/..." "Description personnalisée"\n');
    
    return generateSmartLinks();
  }
  
  const sourceUrl = args[0];
  const customDescription = args[1];
  
  console.log(`🎵 Génération SmartLink depuis: ${sourceUrl}\n`);
  
  const htmlGenerator = new StaticHtmlGenerator();
  
  try {
    const result = await htmlGenerator.generateFromUrl(sourceUrl, {
      customData: customDescription ? { description: customDescription } : undefined
    });
    
    if (result.success) {
      console.log('✅ SmartLink généré avec succès !');
      console.log(`   🎵 Track: ${result.smartlinkData.trackTitle}`);
      console.log(`   👤 Artiste: ${result.smartlinkData.artist.name}`);
      console.log(`   📁 Fichier: ${result.filePath}`);
      console.log(`   🔗 URL: ${result.url}`);
      console.log(`   🎯 Plateformes: ${result.smartlinkData.platformLinks.length}`);
    } else {
      throw new Error('Génération échouée');
    }
    
  } catch (error) {
    console.log(`❌ Erreur génération: ${error.message}`);
    process.exit(1);
  }
}

// Gestion des erreurs
process.on('unhandledRejection', (reason) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

// Exécution
generateFromCLI().catch((error) => {
  console.error('❌ Erreur critique:', error);
  process.exit(1);
});