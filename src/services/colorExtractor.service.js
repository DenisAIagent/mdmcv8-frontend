/**
 * 🎨 Service d'extraction de couleur dominante pour les SmartLinks
 * Utilise ColorThief pour analyser les artworks et créer des backgrounds dynamiques
 */

import ColorThief from 'colorthief';

class ColorExtractorService {
  constructor() {
    this.colorThief = new ColorThief();
    this.cache = new Map(); // Cache pour éviter les recalculs
  }

  /**
   * Extrait la couleur dominante d'une image
   * @param {string} imageUrl - URL de l'image à analyser
   * @param {Object} options - Options de configuration
   * @returns {Promise<Object>} Couleurs extraites et informations
   */
  async extractDominantColor(imageUrl, options = {}) {
    const {
      quality = 10,
      crossOrigin = 'anonymous',
      fallbackColor = [255, 107, 53], // Orange MDMC par défaut
      enableCache = true
    } = options;

    console.log('🎨 ColorExtractor: Extraction couleur pour:', imageUrl);

    // Vérifier le cache
    if (enableCache && this.cache.has(imageUrl)) {
      console.log('✅ Cache hit pour:', imageUrl);
      return this.cache.get(imageUrl);
    }

    try {
      // Créer une image et attendre son chargement
      const img = await this.loadImage(imageUrl, crossOrigin);
      
      // Extraire la couleur dominante
      const dominantColor = this.colorThief.getColor(img, quality);
      
      // Extraire une palette de couleurs
      const palette = this.colorThief.getPalette(img, 5, quality);
      
      // Analyser les couleurs et créer les variantes
      const colorData = this.generateColorVariants(dominantColor, palette);
      
      console.log('✅ Couleurs extraites:', colorData);

      // Mettre en cache
      if (enableCache) {
        this.cache.set(imageUrl, colorData);
      }

      return colorData;

    } catch (error) {
      console.warn('⚠️ Erreur extraction couleur:', error);
      
      // Retourner couleur de fallback
      const fallbackData = this.generateColorVariants(fallbackColor, [fallbackColor]);
      return {
        ...fallbackData,
        isError: true,
        errorMessage: error.message
      };
    }
  }

  /**
   * Charge une image de manière asynchrone
   * @param {string} src - URL de l'image
   * @param {string} crossOrigin - Politique CORS
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(src, crossOrigin = 'anonymous') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Impossible de charger l'image: ${src}`));
      
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }
      
      img.src = src;
    });
  }

  /**
   * Génère les variantes de couleur pour le background
   * @param {Array} dominantColor - Couleur RGB dominante [r, g, b]
   * @param {Array} palette - Palette de couleurs
   * @returns {Object} Toutes les variantes de couleur
   */
  generateColorVariants(dominantColor, palette = []) {
    const [r, g, b] = dominantColor;
    
    // Convertir en différents formats
    const hex = this.rgbToHex(r, g, b);
    const hsl = this.rgbToHsl(r, g, b);
    
    // Générer des variantes pour le background
    const variants = {
      // Couleur principale
      primary: {
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, 1)`,
        hex: hex,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      },
      
      // Background avec opacité
      background: {
        light: `rgba(${r}, ${g}, ${b}, 0.1)`,
        medium: `rgba(${r}, ${g}, ${b}, 0.3)`,
        dark: `rgba(${r}, ${g}, ${b}, 0.7)`
      },
      
      // Gradients
      gradients: {
        radial: `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 0.4) 0%, rgba(${r}, ${g}, ${b}, 0.1) 70%, transparent 100%)`,
        linear: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.4) 0%, rgba(${r}, ${g}, ${b}, 0.1) 100%)`,
        blur: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.6) 0%, rgba(${r}, ${g}, ${b}, 0.2) 50%, rgba(${r}, ${g}, ${b}, 0.4) 100%)`
      },
      
      // Couleurs complémentaires de la palette
      palette: palette.map(color => ({
        rgb: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        hex: this.rgbToHex(color[0], color[1], color[2])
      })),
      
      // Métadonnées
      metadata: {
        brightness: this.getBrightness(r, g, b),
        isLight: this.isLightColor(r, g, b),
        isDark: !this.isLightColor(r, g, b),
        contrast: this.getRecommendedTextColor(r, g, b)
      }
    };

    return variants;
  }

  /**
   * Convertit RGB en HEX
   */
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Convertit RGB en HSL
   */
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Calcule la luminosité d'une couleur
   */
  getBrightness(r, g, b) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  /**
   * Détermine si une couleur est claire
   */
  isLightColor(r, g, b) {
    return this.getBrightness(r, g, b) > 128;
  }

  /**
   * Recommande une couleur de texte basée sur la couleur de fond
   */
  getRecommendedTextColor(r, g, b) {
    const isLight = this.isLightColor(r, g, b);
    return {
      primary: isLight ? '#000000' : '#ffffff',
      secondary: isLight ? '#333333' : '#cccccc',
      accent: isLight ? '#666666' : '#999999'
    };
  }

  /**
   * Nettoie le cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache ColorExtractor nettoyé');
  }

  /**
   * Obtient la taille du cache
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Instance singleton
const colorExtractorService = new ColorExtractorService();

export default colorExtractorService;