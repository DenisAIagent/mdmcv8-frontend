/**
 * 🌍 Service de géolocalisation et filtrage territorial pour SmartLinks
 * Détecte le pays de l'utilisateur et filtre les services musicaux disponibles
 */

class GeolocationService {
  constructor() {
    this.cache = new Map();
    this.defaultCountry = 'US'; // Fallback par défaut
    this.userLocation = null;
    
    // 🌍 Configuration des services par territoire
    this.territoryConfig = {
      // 🇺🇸 États-Unis et Canada
      'US': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'pandora', 'tidal', 'soundcloud', 'napster'],
      'CA': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud'],
      
      // 🇪🇺 Europe
      'FR': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'deezer', 'tidal', 'soundcloud', 'qobuz'],
      'DE': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'deezer', 'tidal', 'soundcloud'],
      'GB': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud'],
      'IT': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud'],
      'ES': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud'],
      'NL': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud'],
      
      // 🇯🇵 Asie-Pacifique
      'JP': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud', 'linemusic'],
      'KR': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'melon', 'genie'],
      'CN': ['qq', 'kugou', 'kuwo', 'netease'],
      'IN': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'jiosaavn', 'gaana'],
      'AU': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal', 'soundcloud'],
      
      // 🌍 Afrique
      'NG': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'boomplay', 'audiomack'],
      'ZA': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'deezer', 'boomplay'],
      'KE': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'boomplay'],
      'GH': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'boomplay', 'audiomack'],
      
      // 🌎 Amérique Latine
      'BR': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'deezer', 'tidal'],
      'MX': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal'],
      'AR': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'amazon', 'tidal'],
      
      // 🌏 Moyen-Orient
      'AE': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'anghami', 'deezer'],
      'SA': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'anghami'],
      'EG': ['spotify', 'applemusic', 'youtube', 'youtubemusic', 'anghami']
    };
  }

  /**
   * Détecte le pays de l'utilisateur via l'IP
   * @returns {Promise<Object>} Informations de localisation
   */
  async detectUserLocation() {
    console.log('🌍 Détection de la localisation utilisateur...');

    // Vérifier le cache
    if (this.userLocation) {
      console.log('✅ Cache hit localisation:', this.userLocation);
      return this.userLocation;
    }

    try {
      // Méthode 1: ipapi.co (gratuit, HTTPS)
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.country_code) {
        this.userLocation = {
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region,
          city: data.city,
          timezone: data.timezone,
          ip: data.ip,
          source: 'ipapi.co',
          timestamp: Date.now()
        };
        
        console.log('✅ Localisation détectée:', this.userLocation);
        return this.userLocation;
      }
      
      throw new Error('ipapi.co failed');
      
    } catch (error) {
      console.warn('⚠️ Erreur détection ipapi.co:', error);
      
      // Fallback: Navigator API (moins précis)
      return this.getLocationFromNavigator();
    }
  }

  /**
   * Méthode de fallback utilisant l'API Navigator
   */
  async getLocationFromNavigator() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language || navigator.languages[0];
      
      // Estimation basique du pays via la langue et timezone
      const estimatedCountry = this.estimateCountryFromLocale(language, timezone);
      
      this.userLocation = {
        country: estimatedCountry.name,
        countryCode: estimatedCountry.code,
        region: 'Unknown',
        city: 'Unknown',
        timezone: timezone,
        ip: 'Unknown',
        source: 'navigator-estimate',
        timestamp: Date.now()
      };
      
      console.log('✅ Localisation estimée:', this.userLocation);
      return this.userLocation;
      
    } catch (error) {
      console.error('❌ Toutes les méthodes de géolocalisation ont échoué:', error);
      
      // Utiliser la configuration par défaut
      this.userLocation = {
        country: 'United States',
        countryCode: this.defaultCountry,
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'UTC',
        ip: 'Unknown',
        source: 'default',
        timestamp: Date.now()
      };
      
      return this.userLocation;
    }
  }

  /**
   * Estime le pays basé sur la langue et timezone
   */
  estimateCountryFromLocale(language, timezone) {
    const localeMap = {
      'fr': { code: 'FR', name: 'France' },
      'en-US': { code: 'US', name: 'United States' },
      'en-GB': { code: 'GB', name: 'United Kingdom' },
      'de': { code: 'DE', name: 'Germany' },
      'es': { code: 'ES', name: 'Spain' },
      'it': { code: 'IT', name: 'Italy' },
      'pt-BR': { code: 'BR', name: 'Brazil' },
      'ja': { code: 'JP', name: 'Japan' },
      'ko': { code: 'KR', name: 'South Korea' }
    };

    // Vérifier d'abord par langue
    if (localeMap[language]) {
      return localeMap[language];
    }

    // Fallback par timezone
    if (timezone.includes('Europe/Paris')) return { code: 'FR', name: 'France' };
    if (timezone.includes('America/New_York')) return { code: 'US', name: 'United States' };
    if (timezone.includes('Europe/London')) return { code: 'GB', name: 'United Kingdom' };
    if (timezone.includes('Asia/Tokyo')) return { code: 'JP', name: 'Japan' };

    return { code: this.defaultCountry, name: 'United States' };
  }

  /**
   * Filtre les plateformes musicales disponibles pour un pays
   * @param {Array} platforms - Liste des plateformes
   * @param {string} countryCode - Code pays (optionnel, utilise la détection auto)
   * @returns {Promise<Array>} Plateformes filtrées
   */
  async filterPlatformsByTerritory(platforms, countryCode = null) {
    if (!countryCode) {
      const location = await this.detectUserLocation();
      countryCode = location.countryCode;
    }

    console.log(`🌍 Filtrage plateformes pour ${countryCode}:`, platforms?.length || 0);

    const availableServices = this.territoryConfig[countryCode] || this.territoryConfig[this.defaultCountry];
    
    const filteredPlatforms = platforms?.filter(platform => {
      const platformKey = this.normalizePlatformName(platform.platform);
      const isAvailable = availableServices.includes(platformKey);
      
      if (!isAvailable) {
        console.log(`🚫 ${platform.platform} non disponible en ${countryCode}`);
      }
      
      return isAvailable;
    }) || [];

    console.log(`✅ Plateformes disponibles: ${filteredPlatforms.length}/${platforms?.length || 0}`);
    
    return {
      filtered: filteredPlatforms,
      available: availableServices,
      country: countryCode,
      total: platforms?.length || 0,
      kept: filteredPlatforms.length
    };
  }

  /**
   * Normalise le nom de la plateforme pour la comparaison
   */
  normalizePlatformName(platformName) {
    const normalized = platformName.toLowerCase()
      .replace(/\s+/g, '')
      .replace('music', '')
      .replace('store', '');

    // Mapping spécial pour certaines plateformes
    const platformMap = {
      'apple': 'applemusic',
      'amazon': 'amazon',
      'youtube': 'youtube',
      'youtubemusic': 'youtubemusic',
      'spotify': 'spotify',
      'deezer': 'deezer',
      'tidal': 'tidal',
      'soundcloud': 'soundcloud',
      'napster': 'napster',
      'pandora': 'pandora',
      'boomplay': 'boomplay',
      'audiomack': 'audiomack',
      'anghami': 'anghami',
      'jiosaavn': 'jiosaavn'
    };

    return platformMap[normalized] || normalized;
  }

  /**
   * Obtient la configuration des services pour un pays
   */
  getCountryServices(countryCode) {
    return this.territoryConfig[countryCode] || this.territoryConfig[this.defaultCountry];
  }

  /**
   * Vérifie si un service est disponible dans un pays
   */
  isServiceAvailable(serviceName, countryCode) {
    const services = this.getCountryServices(countryCode);
    const normalizedService = this.normalizePlatformName(serviceName);
    return services.includes(normalizedService);
  }

  /**
   * Nettoie le cache de géolocalisation
   */
  clearCache() {
    this.cache.clear();
    this.userLocation = null;
    console.log('🗑️ Cache géolocalisation nettoyé');
  }

  /**
   * Force une nouvelle détection de localisation
   */
  async refreshLocation() {
    this.userLocation = null;
    return await this.detectUserLocation();
  }
}

// Instance singleton
const geolocationService = new GeolocationService();

export default geolocationService;