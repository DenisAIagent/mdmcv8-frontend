/**
 * 🎛️ Service de gestion de l'ordre des plateformes
 * Gère la personnalisation, le stockage et l'A/B testing
 */

class PlatformOrderService {
  constructor() {
    this.storageKey = 'mdmc_platform_order_preferences';
    this.abTestKey = 'mdmc_platform_order_ab_test';
    
    // Ordre par défaut optimisé pour les conversions (basé sur la popularité mondiale)
    this.defaultOrder = [
      'Spotify',
      'Apple Music', 
      'YouTube Music',
      'Deezer',
      'Amazon Music',
      'Tidal',
      'SoundCloud',
      'YouTube',
      'iTunes',
      'Napster',
      'Pandora',
      'Audiomack',
      'Anghami',
      'Boomplay'
    ];
    
    // Variantes d'A/B test pour optimiser les conversions
    this.abTestVariants = {
      'control': this.defaultOrder,
      'streaming_first': ['Spotify', 'Apple Music', 'YouTube Music', 'Deezer', 'Tidal', 'Amazon Music'],
      'regional_optimized': this.getRegionalOptimizedOrder(),
      'conversion_optimized': ['Apple Music', 'Spotify', 'Amazon Music', 'YouTube Music', 'Deezer', 'Tidal']
    };
  }

  /**
   * Obtient l'ordre optimisé selon la région de l'utilisateur
   */
  getRegionalOptimizedOrder(countryCode = null) {
    const regionalOrders = {
      'US': ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Pandora', 'Tidal'],
      'FR': ['Spotify', 'Deezer', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal'],
      'UK': ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Deezer', 'Tidal'],
      'DE': ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Deezer', 'Tidal'],
      'BR': ['Spotify', 'YouTube Music', 'Deezer', 'Apple Music', 'Amazon Music', 'SoundCloud'],
      'IN': ['Spotify', 'YouTube Music', 'Apple Music', 'JioSaavn', 'Amazon Music', 'Deezer'],
      'MX': ['Spotify', 'YouTube Music', 'Apple Music', 'Deezer', 'Amazon Music', 'SoundCloud']
    };
    
    return regionalOrders[countryCode] || this.defaultOrder;
  }

  /**
   * Assigne un utilisateur à une variante d'A/B test
   */
  getABTestVariant() {
    let storedVariant = localStorage.getItem(this.abTestKey);
    
    if (!storedVariant) {
      // Répartition égale entre les variantes
      const variants = Object.keys(this.abTestVariants);
      const randomIndex = Math.floor(Math.random() * variants.length);
      storedVariant = variants[randomIndex];
      
      // Stocker la variante avec timestamp pour analytics
      const abTestData = {
        variant: storedVariant,
        assignedAt: new Date().toISOString(),
        sessionId: this.generateSessionId()
      };
      
      localStorage.setItem(this.abTestKey, JSON.stringify(abTestData));
      // A/B Test assignment logged for analytics
    } else {
      try {
        const parsed = JSON.parse(storedVariant);
        storedVariant = parsed.variant;
      } catch {
        storedVariant = 'control';
      }
    }
    
    return storedVariant;
  }

  /**
   * Génère un ID de session unique pour le tracking
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Applique l'ordre personnalisé ou d'A/B test aux plateformes
   */
  applyCustomOrder(platforms, options = {}) {
    const { 
      enableABTest = true, 
      userCountry = null,
      forceVariant = null 
    } = options;

    // 1. Récupérer l'ordre personnalisé de l'utilisateur
    const customOrder = this.getUserCustomOrder();
    
    // 2. Récupérer la variante d'A/B test si activée
    let orderToUse = this.defaultOrder;
    
    if (customOrder.length > 0) {
      orderToUse = customOrder;
      // Custom order applied
    } else if (enableABTest) {
      const variant = forceVariant || this.getABTestVariant();
      orderToUse = this.abTestVariants[variant] || this.defaultOrder;
      // A/B test variant applied
    } else if (userCountry) {
      orderToUse = this.getRegionalOptimizedOrder(userCountry);
      // Regional optimization applied
    }

    // 3. Trier les plateformes selon l'ordre défini
    const sortedPlatforms = this.sortPlatformsByOrder(platforms, orderToUse);
    
    return {
      platforms: sortedPlatforms,
      orderUsed: orderToUse,
      source: customOrder.length > 0 ? 'custom' : enableABTest ? 'ab_test' : 'regional'
    };
  }

  /**
   * Trie les plateformes selon un ordre spécifique
   */
  sortPlatformsByOrder(platforms, order) {
    const platformMap = new Map();
    platforms.forEach(platform => {
      platformMap.set(platform.platform, platform);
    });

    const sorted = [];
    const remaining = [...platforms];

    // Ajouter les plateformes dans l'ordre spécifié
    order.forEach(platformName => {
      const platform = platformMap.get(platformName);
      if (platform) {
        sorted.push(platform);
        const index = remaining.findIndex(p => p.platform === platformName);
        if (index !== -1) {
          remaining.splice(index, 1);
        }
      }
    });

    // Ajouter les plateformes restantes à la fin
    sorted.push(...remaining);

    return sorted;
  }

  /**
   * Sauvegarde l'ordre personnalisé de l'utilisateur
   */
  saveUserCustomOrder(orderedPlatforms) {
    const order = orderedPlatforms.map(p => p.platform);
    const preferences = {
      order,
      updatedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    
    // Tracking pour analytics
    this.trackOrderChange('user_customization', order);
  }

  /**
   * Récupère l'ordre personnalisé de l'utilisateur
   */
  getUserCustomOrder() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const preferences = JSON.parse(stored);
        return preferences.order || [];
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de l\'ordre personnalisé:', error);
    }
    return [];
  }

  /**
   * Remet à zéro l'ordre personnalisé
   */
  resetToDefault() {
    localStorage.removeItem(this.storageKey);
    
    // Tracking
    this.trackOrderChange('reset_to_default', this.defaultOrder);
  }

  /**
   * Tracking des changements d'ordre pour analytics
   */
  trackOrderChange(action, order) {
    const trackingData = {
      action,
      order,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    // Envoyer à votre service d'analytics
    // Production analytics integration here
    
    // Ici vous pouvez intégrer Google Analytics, Mixpanel, etc.
    if (window.gtag) {
      window.gtag('event', 'platform_order_change', {
        'custom_parameter_action': action,
        'custom_parameter_order_length': order.length
      });
    }
  }

  /**
   * Obtient les statistiques d'A/B test
   */
  getABTestStats() {
    try {
      const stored = localStorage.getItem(this.abTestKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération des stats A/B test:', error);
    }
    return null;
  }

  /**
   * Force une variante d'A/B test (pour le debug)
   */
  forceABTestVariant(variantName) {
    if (this.abTestVariants[variantName]) {
      const abTestData = {
        variant: variantName,
        assignedAt: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        forced: true
      };
      
      localStorage.setItem(this.abTestKey, JSON.stringify(abTestData));
      // Variant forced for testing
      return true;
    }
    return false;
  }
}

// Export singleton
const platformOrderService = new PlatformOrderService();
export default platformOrderService;