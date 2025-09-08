#!/usr/bin/env node

/**
 * Script d'optimisation d'images pour MDMC
 * Génère automatiquement les formats WebP et optimise les images existantes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '../src/assets/images'),
  outputDir: path.join(__dirname, '../src/assets/images/optimized'),
  
  // Qualité d'optimisation
  quality: {
    webp: 85,
    jpeg: 85,
    png: [0.8, 0.9]
  },
  
  // Extensions supportées
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.svg'],
  
  // Tailles responsives à générer
  responsiveSizes: [480, 768, 1024, 1200, 1920],
  
  // Images critiques (préchargement prioritaire)
  criticalImages: [
    'hero-bg',
    'logo',
    'avatar-default'
  ]
};

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      optimized: 0,
      webpGenerated: 0,
      sizeSaved: 0,
      errors: 0
    };
  }

  // Créer les dossiers de sortie
  ensureDirectories() {
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Créer sous-dossiers par taille
    CONFIG.responsiveSizes.forEach(size => {
      const sizeDir = path.join(CONFIG.outputDir, `${size}w`);
      if (!fs.existsSync(sizeDir)) {
        fs.mkdirSync(sizeDir, { recursive: true });
      }
    });

    console.log('📁 Dossiers de sortie créés');
  }

  // Trouver toutes les images à optimiser
  findImages() {
    const images = [];
    
    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (CONFIG.supportedExtensions.includes(ext)) {
            images.push({
              path: filePath,
              name: path.basename(file, ext),
              extension: ext,
              size: stat.size,
              relativePath: path.relative(CONFIG.sourceDir, filePath)
            });
          }
        }
      });
    };

    if (fs.existsSync(CONFIG.sourceDir)) {
      scanDirectory(CONFIG.sourceDir);
    }

    return images;
  }

  // Optimiser une image individuelle
  async optimizeImage(image) {
    try {
      console.log(`🔄 Optimisation: ${image.relativePath}`);
      
      const inputDir = path.dirname(image.path);
      const outputPath = path.join(CONFIG.outputDir, image.relativePath);
      const outputDir = path.dirname(outputPath);
      
      // Créer le dossier de sortie si nécessaire
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let optimizedFiles = [];

      // Optimisation selon le type de fichier
      if (image.extension === '.svg') {
        // Optimiser SVG
        const svgResult = await imagemin([image.path], {
          destination: outputDir,
          plugins: [
            imageminSvgo({
              plugins: [
                { name: 'removeViewBox', active: false },
                { name: 'removeEmptyAttrs', active: true },
                { name: 'removeUselessStrokeAndFill', active: true },
                { name: 'cleanupIDs', active: true }
              ]
            })
          ]
        });
        optimizedFiles = optimizedFiles.concat(svgResult);
        
      } else {
        // Optimiser images raster
        
        // 1. Optimisation format original
        const originalPlugins = [];
        
        if (['.jpg', '.jpeg'].includes(image.extension)) {
          originalPlugins.push(imageminMozjpeg({ quality: CONFIG.quality.jpeg }));
        } else if (image.extension === '.png') {
          originalPlugins.push(imageminPngquant({ quality: CONFIG.quality.png }));
        }
        
        const originalResult = await imagemin([image.path], {
          destination: outputDir,
          plugins: originalPlugins
        });
        optimizedFiles = optimizedFiles.concat(originalResult);
        
        // 2. Génération WebP
        const webpResult = await imagemin([image.path], {
          destination: outputDir,
          plugins: [
            imageminWebp({ quality: CONFIG.quality.webp })
          ]
        });
        optimizedFiles = optimizedFiles.concat(webpResult);
        this.stats.webpGenerated++;
        
        // 3. Génération tailles responsives (seulement pour images critiques)
        if (this.isCriticalImage(image.name)) {
          await this.generateResponsiveSizes(image);
        }
      }

      // Calculer les économies
      const originalSize = image.size;
      const optimizedSize = optimizedFiles.reduce((total, file) => {
        try {
          return total + fs.statSync(file.destinationPath).size;
        } catch {
          return total;
        }
      }, 0);
      
      const saved = Math.max(0, originalSize - optimizedSize);
      this.stats.sizeSaved += saved;
      
      console.log(`✅ ${image.relativePath} - Économie: ${this.formatBytes(saved)}`);
      this.stats.optimized++;
      
    } catch (error) {
      console.error(`❌ Erreur ${image.relativePath}:`, error.message);
      this.stats.errors++;
    }
    
    this.stats.processed++;
  }

  // Vérifier si l'image est critique
  isCriticalImage(imageName) {
    return CONFIG.criticalImages.some(critical => 
      imageName.toLowerCase().includes(critical.toLowerCase())
    );
  }

  // Générer les tailles responsives
  async generateResponsiveSizes(image) {
    for (const size of CONFIG.responsiveSizes) {
      try {
        const outputDir = path.join(CONFIG.outputDir, `${size}w`);
        
        // Utiliser sharp si disponible, sinon imagemin basique
        await imagemin([image.path], {
          destination: outputDir,
          plugins: [
            imageminWebp({ 
              quality: CONFIG.quality.webp,
              resize: { width: size }
            })
          ]
        });
        
        console.log(`📐 Généré: ${image.name} - ${size}w`);
        
      } catch (error) {
        console.warn(`⚠️ Impossible de générer ${size}w pour ${image.name}:`, error.message);
      }
    }
  }

  // Formater la taille en bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Générer le manifeste d'images optimisées
  generateManifest(images) {
    const manifest = {
      generated: new Date().toISOString(),
      config: CONFIG,
      stats: this.stats,
      images: images.map(img => ({
        original: img.relativePath,
        optimized: path.relative(CONFIG.sourceDir, 
          path.join(CONFIG.outputDir, img.relativePath)),
        webp: path.relative(CONFIG.sourceDir,
          path.join(CONFIG.outputDir, img.name + '.webp')),
        critical: this.isCriticalImage(img.name),
        responsiveSizes: this.isCriticalImage(img.name) ? CONFIG.responsiveSizes : []
      }))
    };

    const manifestPath = path.join(CONFIG.outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`📋 Manifeste généré: ${manifestPath}`);
  }

  // Générer les helpers CSS/JS
  generateHelpers() {
    // CSS Helper pour picture elements
    const cssHelper = `
/* Generated by MDMC Image Optimizer */
/* Helper classes pour images optimisées */

.picture-responsive {
  display: block;
  width: 100%;
  height: auto;
}

.picture-responsive img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Lazy loading avec intersection observer */
.img-lazy {
  opacity: 0;
  transition: opacity 0.3s;
}

.img-lazy.loaded {
  opacity: 1;
}

/* Preload critique */
.img-critical {
  /* Ces images seront préchargées */
}

/* Sizes pour responsive */
.img-hero {
  /* sizes: (max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px */
}
`;

    // JS Helper pour lazy loading
    const jsHelper = `
// Generated by MDMC Image Optimizer
// Helper pour lazy loading et format WebP

export const ImageHelpers = {
  // Vérifier le support WebP
  supportsWebP: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  },

  // Générer srcset responsive
  generateSrcSet: (basePath, sizes = [480, 768, 1024, 1200]) => {
    const ext = ImageHelpers.supportsWebP() ? 'webp' : 'jpg';
    return sizes.map(size => 
      \`/assets/images/optimized/\${size}w/\${basePath}.\${ext} \${size}w\`
    ).join(', ');
  },

  // Lazy loading avec Intersection Observer
  lazyLoad: (selector = '.img-lazy') => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll(selector).forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
  ImageHelpers.lazyLoad();
});
`;

    // Écrire les fichiers helpers
    fs.writeFileSync(path.join(CONFIG.outputDir, 'images.css'), cssHelper);
    fs.writeFileSync(path.join(CONFIG.outputDir, 'images.js'), jsHelper);
    
    console.log('🛠️ Helpers CSS/JS générés');
  }

  // Processus principal
  async optimize() {
    console.log('🚀 Démarrage optimisation images MDMC...\n');
    
    // Vérifier les dossiers
    if (!fs.existsSync(CONFIG.sourceDir)) {
      console.error(`❌ Dossier source non trouvé: ${CONFIG.sourceDir}`);
      process.exit(1);
    }
    
    // Préparer l'environnement
    this.ensureDirectories();
    
    // Trouver les images
    const images = this.findImages();
    console.log(`📸 ${images.length} image(s) trouvée(s)\n`);
    
    if (images.length === 0) {
      console.log('ℹ️ Aucune image à optimiser');
      return;
    }
    
    // Optimiser chaque image
    for (const image of images) {
      await this.optimizeImage(image);
    }
    
    // Générer les fichiers de support
    this.generateManifest(images);
    this.generateHelpers();
    
    // Rapport final
    this.generateReport();
  }

  // Rapport final
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT OPTIMISATION IMAGES MDMC');
    console.log('='.repeat(50));
    console.log(`📸 Images traitées: ${this.stats.processed}`);
    console.log(`✅ Images optimisées: ${this.stats.optimized}`);
    console.log(`🌐 Formats WebP générés: ${this.stats.webpGenerated}`);
    console.log(`💾 Espace économisé: ${this.formatBytes(this.stats.sizeSaved)}`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);
    
    if (this.stats.errors === 0) {
      console.log('\n🎉 Optimisation terminée avec succès!');
    } else {
      console.log('\n⚠️ Optimisation terminée avec des erreurs');
    }
    
    console.log('\n📁 Fichiers générés:');
    console.log(`  • Images: ${CONFIG.outputDir}`);
    console.log(`  • Manifeste: ${path.join(CONFIG.outputDir, 'manifest.json')}`);
    console.log(`  • Helpers: ${path.join(CONFIG.outputDir, 'images.css')} & images.js`);
    
    console.log('='.repeat(50));
  }
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Démarrage
const optimizer = new ImageOptimizer();
optimizer.optimize().catch(console.error);
