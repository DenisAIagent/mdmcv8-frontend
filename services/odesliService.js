// Service Odesli (SongLink) pour récupération automatique des liens plateformes
// Intégration obligatoire API Odesli selon spécifications MDMC SmartLinks

const https = require('https');
const { URL } = require('url');

class OdesliService {
  constructor() {
    this.apiUrl = process.env.ODESLI_API_URL || 'https://api.song.link/v1-alpha.1/links';
    this.userAgent = process.env.ODESLI_USER_AGENT || 'MDMCMusicAds/1.0';
    this.timeout = 10000; // 10 secondes max
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 seconde
    
    // Cache local pour éviter les appels répétés
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24h
    
    console.log('🎵 Service Odesli initialisé');
  }

  /**
   * Récupère les liens de toutes les plateformes depuis une URL source
   * @param {string} sourceUrl - URL d'une plateforme (Spotify, Apple Music, etc.)
   * @param {string} userCountry - Code pays utilisateur (FR par défaut)
   * @returns {Promise<Object>} - Données Odesli enrichies
   */
  async fetchPlatformLinks(sourceUrl, userCountry = 'FR') {
    try {
      // Validation de l'URL source
      this.validateSourceUrl(sourceUrl);
      
      // Vérification du cache
      const cacheKey = `${sourceUrl}:${userCountry}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit Odesli: ${sourceUrl}`);
        return cached;
      }
      
      console.log(`🔍 Appel API Odesli: ${sourceUrl}`);
      
      // Appel API avec retry logic
      const odesliData = await this.makeApiCallWithRetry(sourceUrl, userCountry);
      
      // Transformation des données pour MDMC
      const enrichedData = this.transformOdesliData(odesliData, sourceUrl);
      
      // Mise en cache
      this.setCachedResult(cacheKey, enrichedData);
      
      console.log(`✅ Données Odesli récupérées: ${enrichedData.platformLinks.length} plateformes`);
      return enrichedData;
      
    } catch (error) {
      console.error('❌ Erreur service Odesli:', error.message);
      throw new Error(`Impossible de récupérer les liens Odesli: ${error.message}`);
    }
  }

  /**
   * Effectue l'appel API avec retry logic
   * @param {string} sourceUrl - URL source
   * @param {string} userCountry - Code pays
   * @returns {Promise<Object>} - Réponse Odesli brute
   */
  async makeApiCallWithRetry(sourceUrl, userCountry) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeApiCall(sourceUrl, userCountry);
        return response;
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Backoff exponentiel
          console.log(`⚠️ Tentative ${attempt}/${this.maxRetries} échouée, retry dans ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Effectue l'appel API Odesli
   * @param {string} sourceUrl - URL source
   * @param {string} userCountry - Code pays
   * @returns {Promise<Object>} - Réponse API
   */
  makeApiCall(sourceUrl, userCountry) {
    return new Promise((resolve, reject) => {
      const apiUrl = new URL(this.apiUrl);
      apiUrl.searchParams.set('url', sourceUrl);
      apiUrl.searchParams.set('userCountry', userCountry);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      };
      
      const req = https.request(apiUrl.toString(), requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              throw new Error(`API Odesli error: ${res.statusCode} - ${data}`);
            }
            
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Parsing error: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.setTimeout(this.timeout);
      req.end();
    });
  }

  /**
   * Transforme les données Odesli au format MDMC SmartLinks
   * @param {Object} odesliData - Données brutes Odesli
   * @param {string} sourceUrl - URL source originale
   * @returns {Object} - Données formatées pour MDMC
   */
  transformOdesliData(odesliData, sourceUrl) {
    try {
      const { linksByPlatform, entitiesByUniqueId, entityUniqueId } = odesliData;
      
      // Récupération des métadonnées principales
      const mainEntity = entitiesByUniqueId[entityUniqueId];
      if (!mainEntity) {
        throw new Error('Entité principale non trouvée dans la réponse Odesli');
      }
      
      // Mapping des plateformes Odesli vers format MDMC
      const platformMapping = {
        spotify: 'spotify',
        appleMusic: 'apple',
        youtubeMusic: 'youtube',
        youtube: 'youtube',
        deezer: 'deezer',
        tidal: 'tidal',
        amazonMusic: 'amazon',
        soundcloud: 'soundcloud',
        bandcamp: 'bandcamp',
        pandora: 'pandora',
        napster: 'napster'
      };
      
      // Transformation des liens plateformes
      const platformLinks = [];
      
      Object.entries(linksByPlatform || {}).forEach(([platform, data]) => {
        const mdmcPlatform = platformMapping[platform];
        if (mdmcPlatform && data.url) {
          platformLinks.push({
            platform: mdmcPlatform,
            url: data.url,
            nativeAppUriMobile: data.nativeAppUriMobile || null,
            nativeAppUriDesktop: data.nativeAppUriDesktop || null
          });
        }
      });
      
      // Génération du slug automatique
      const artistSlug = this.generateSlug(mainEntity.artistName);
      const trackSlug = this.generateSlug(mainEntity.title);
      
      return {
        // Métadonnées enrichies
        trackTitle: mainEntity.title,
        artist: {
          name: mainEntity.artistName,
          slug: artistSlug
        },
        slug: trackSlug,
        
        // Données visuelles
        coverImageUrl: mainEntity.thumbnailUrl || null,
        audioPreviewUrl: mainEntity.audioPreviewUrl || null,
        
        // Description générée automatiquement
        description: `Écoutez "${mainEntity.title}" de ${mainEntity.artistName} sur toutes les plateformes de streaming musical. SmartLink MDMC Music Ads.`,
        
        // Liens plateformes
        platformLinks: platformLinks,
        
        // Métadonnées techniques
        odesliData: {
          entityUniqueId: entityUniqueId,
          userCountry: odesliData.userCountry || 'FR',
          pageUrl: odesliData.pageUrl || null,
          sourceUrl: sourceUrl,
          fetchedAt: new Date().toISOString()
        },
        
        // Status
        isActive: true,
        createdBy: 'odesli-service',
        source: 'odesli-api'
      };
      
    } catch (error) {
      console.error('❌ Erreur transformation Odesli:', error);
      throw new Error(`Transformation des données Odesli échouée: ${error.message}`);
    }
  }

  /**
   * Génère un slug à partir d'un texte
   * @param {string} text - Texte à transformer
   * @returns {string} - Slug généré
   */
  generateSlug(text) {
    if (!text) return 'unknown';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces, tirets
      .replace(/\s+/g, '-') // Remplace espaces par tirets
      .replace(/-+/g, '-') // Supprime tirets multiples
      .replace(/^-|-$/g, ''); // Supprime tirets début/fin
  }

  /**
   * Valide l'URL source
   * @param {string} url - URL à valider
   */
  validateSourceUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('URL source manquante ou invalide');
    }
    
    try {
      const parsedUrl = new URL(url);
      
      // Liste des domaines supportés par Odesli
      const supportedDomains = [
        'open.spotify.com',
        'music.apple.com',
        'music.youtube.com',
        'youtube.com',
        'youtu.be',
        'deezer.com',
        'tidal.com',
        'music.amazon.com',
        'soundcloud.com',
        'bandcamp.com'
      ];
      
      const isSupported = supportedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isSupported) {
        console.warn(`⚠️ Domaine potentiellement non supporté: ${parsedUrl.hostname}`);
      }
      
    } catch (error) {
      throw new Error('Format d\'URL invalide');
    }
  }

  /**
   * Récupère un résultat depuis le cache
   * @param {string} key - Clé de cache
   * @returns {Object|null} - Données cachées ou null
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const { data, timestamp } = cached;
    const now = Date.now();
    
    if (now - timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  /**
   * Met en cache un résultat
   * @param {string} key - Clé de cache
   * @param {Object} data - Données à cacher
   */
  setCachedResult(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
    
    // Nettoyage automatique du cache si trop volumineux
    if (this.cache.size > 1000) {
      const oldestKeys = Array.from(this.cache.keys()).slice(0, 100);
      oldestKeys.forEach(k => this.cache.delete(k));
      console.log('🧹 Cache Odesli nettoyé');
    }
  }

  /**
   * Pause l'exécution pendant un délai
   * @param {number} ms - Millisecondes
   * @returns {Promise} - Promise résolue après délai
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Met à jour les liens d'un SmartLink existant via Odesli
   * @param {string} sourceUrl - URL source
   * @param {string} userCountry - Code pays
   * @returns {Promise<Object>} - Données mises à jour
   */
  async refreshPlatformLinks(sourceUrl, userCountry = 'FR') {
    try {
      console.log(`🔄 Actualisation liens Odesli: ${sourceUrl}`);
      
      // Force un nouvel appel API (ignore le cache)
      const cacheKey = `${sourceUrl}:${userCountry}`;
      this.cache.delete(cacheKey);
      
      // Récupération des nouvelles données
      const refreshedData = await this.fetchPlatformLinks(sourceUrl, userCountry);
      
      console.log(`✅ Liens actualisés: ${refreshedData.platformLinks.length} plateformes`);
      return refreshedData;
      
    } catch (error) {
      console.error('❌ Erreur actualisation Odesli:', error);
      throw error;
    }
  }

  /**
   * Statistiques du service Odesli
   * @returns {Object} - Statistiques
   */
  getServiceStats() {
    return {
      service: 'Odesli Integration',
      cacheSize: this.cache.size,
      cacheExpiry: `${this.cacheExpiry / (60 * 60 * 1000)}h`,
      maxRetries: this.maxRetries,
      timeout: `${this.timeout / 1000}s`,
      supportedPlatforms: [
        'Spotify',
        'Apple Music', 
        'YouTube Music',
        'Deezer',
        'Tidal',
        'Amazon Music',
        'SoundCloud',
        'Bandcamp'
      ]
    };
  }

  /**
   * Vide le cache Odesli
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache Odesli vidé');
  }

  /**
   * Test de connectivité API Odesli
   * @returns {Promise<Object>} - Résultat du test
   */
  async testConnection() {
    try {
      const testUrl = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'; // Wait and Bleed - Slipknot
      
      console.log('🧪 Test de connexion API Odesli...');
      
      const startTime = Date.now();
      const result = await this.fetchPlatformLinks(testUrl);
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration: `${duration}ms`,
        platformsFound: result.platformLinks.length,
        testUrl: testUrl,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = OdesliService;