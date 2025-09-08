/**
 * Service RSS avancé avec cache localStorage et fallbacks robustes
 * Solution pour contourner les problèmes de CSP et CORS
 */

// Configuration du blog MDMC
const BLOG_CONFIG = {
  BASE_URL: 'https://blog.mdmcmusicads.com',
  RSS_URL: 'https://blog.mdmcmusicads.com/feed/',
  
  // Bypass CSP - Utilisation directe sans proxy
  DIRECT_FETCH: true, // Mode bypass CSP
  CORS_PROXIES: [
    '', // Essai direct sans proxy
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://proxy.cors.sh/',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ],
  
  TIMEOUT: 10000, // Réduit pour être plus agressif
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes de cache
  CACHE_KEY: 'mdmc_rss_cache'
};

class RSSService {
  constructor() {
    this.cache = this.loadFromCache();
  }

  /**
   * Récupère les derniers articles avec cache localStorage
   */
  async getLatestArticles(limit = 3, useCache = true) {
    console.log('📰 RSS: Démarrage récupération articles...', { limit, useCache });

    // Vérifier le cache en premier
    if (useCache && this.cache && this.isCacheValid()) {
      console.log('✅ RSS: Cache valide trouvé, utilisation cache local');
      return {
        success: true,
        data: this.cache.articles.slice(0, limit),
        source: 'cache'
      };
    }

    // Essayer la récupération RSS
    console.log('🔄 RSS: Cache expiré ou non trouvé, récupération depuis RSS...');
    
    try {
      const result = await this.fetchRSSWithFallbacks();
      
      if (result.success) {
        // Sauvegarder en cache
        this.saveToCache(result.data);
        console.log('✅ RSS: Articles récupérés et mis en cache');
        
        return {
          success: true,
          data: result.data.slice(0, limit),
          source: 'rss'
        };
      } else {
        // En cas d'échec, utiliser le cache même expiré si disponible
        if (this.cache && this.cache.articles.length > 0) {
          console.warn('⚠️ RSS: Échec récupération, utilisation cache expiré');
          return {
            success: true,
            data: this.cache.articles.slice(0, limit),
            source: 'cache_expired',
            warning: 'Cache expiré utilisé en fallback'
          };
        }
        
        // Aucun cache disponible, retourner les données de fallback
        console.error('❌ RSS: Échec total, utilisation données statiques');
        return {
          success: false,
          data: this.getStaticFallbackArticles(limit),
          source: 'fallback',
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ RSS: Erreur critique:', error);
      return {
        success: false,
        data: this.getStaticFallbackArticles(limit),
        source: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Essaie tous les proxys CORS avec timeout progressif
   */
  async fetchRSSWithFallbacks() {
    const errors = [];
    
    for (let i = 0; i < BLOG_CONFIG.CORS_PROXIES.length; i++) {
      const proxy = BLOG_CONFIG.CORS_PROXIES[i];
      const attempt = i + 1;
      
      try {
        console.log(`🔄 RSS: Tentative ${attempt}/${BLOG_CONFIG.CORS_PROXIES.length} - ${proxy ? proxy.replace('https://', '') : 'DIRECT'}`);
        
        const proxyUrl = proxy ? `${proxy}${encodeURIComponent(BLOG_CONFIG.RSS_URL)}` : BLOG_CONFIG.RSS_URL;
        
        // Timeout progressif (plus long pour les derniers proxys)
        const timeout = BLOG_CONFIG.TIMEOUT + (i * 2000);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 
            'Accept': 'application/xml, application/rss+xml, text/xml',
            'User-Agent': 'Mozilla/5.0 (compatible; MDMC-RSS-Bot/1.0)'
          },
          signal: controller.signal,
          mode: proxy ? 'cors' : 'no-cors' // Mode no-cors pour bypass CSP
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();
        console.log(`✅ RSS: Flux récupéré via proxy ${attempt} (${xmlText.length} chars)`);

        // Validation XML basique
        if (xmlText.includes('<html') || xmlText.includes('<!DOCTYPE')) {
          throw new Error('Réponse HTML reçue au lieu de XML');
        }

        if (xmlText.length < 100) {
          throw new Error('Réponse XML trop courte');
        }

        // Parser le XML
        const articles = await this.parseRSSXML(xmlText);
        
        if (articles.length === 0) {
          throw new Error('Aucun article trouvé dans le flux RSS');
        }

        console.log(`✅ RSS: ${articles.length} articles parsés avec succès via proxy ${attempt}`);
        
        return {
          success: true,
          data: articles,
          proxy: attempt
        };

      } catch (error) {
        const errorMsg = `Proxy ${attempt} (${proxy.replace('https://', '')}): ${error.message}`;
        console.warn(`⚠️ RSS: ${errorMsg}`);
        errors.push(errorMsg);
        
        // Pause progressive entre les tentatives
        if (i < BLOG_CONFIG.CORS_PROXIES.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 + (i * 200)));
        }
      }
    }
    
    // Tous les proxys ont échoué
    console.error('❌ RSS: Tous les proxys CORS ont échoué');
    return {
      success: false,
      error: `Tous les ${BLOG_CONFIG.CORS_PROXIES.length} proxys ont échoué. Erreurs: ${errors.join('; ')}`,
      errors
    };
  }

  /**
   * Parse le XML RSS avec gestion d'erreurs robuste
   */
  async parseRSSXML(xmlText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Vérifier les erreurs de parsing
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error(`Erreur parsing XML: ${parseError.textContent}`);
      }

      // Récupérer les items
      const items = Array.from(xmlDoc.querySelectorAll('item'));
      
      if (items.length === 0) {
        throw new Error('Aucun élément <item> trouvé dans le RSS');
      }

      // Parser chaque article
      const articles = items.map((item, index) => this.parseRSSItem(item, index))
                           .filter(article => article !== null); // Filtrer les articles malformés

      console.log(`📝 RSS: ${articles.length}/${items.length} articles valides parsés`);
      
      return articles;

    } catch (error) {
      console.error('❌ RSS: Erreur parsing XML:', error);
      throw new Error(`Impossible de parser le flux RSS: ${error.message}`);
    }
  }

  /**
   * Parse un item RSS individuel
   */
  parseRSSItem(item, index) {
    try {
      const title = this.getTextContent(item, 'title') || `Article ${index + 1}`;
      const link = this.getTextContent(item, 'link') || BLOG_CONFIG.BASE_URL;
      const description = this.getTextContent(item, 'description') || '';
      const pubDate = this.getTextContent(item, 'pubDate');
      const creator = this.getTextContent(item, 'dc:creator') || 'MDMC Team';

      // Extraction image avec méthodes multiples
      const imageUrl = this.extractImageFromItem(item, index);
      
      // Nettoyage description
      const cleanDescription = this.cleanDescription(description);
      
      // Formatage date
      const formattedDate = this.formatDate(pubDate);

      return {
        id: `article-${index}-${Date.now()}`,
        title: this.sanitizeText(title),
        link: this.sanitizeUrl(link),
        description: cleanDescription,
        image: imageUrl,
        date: formattedDate,
        author: this.sanitizeText(creator),
        rawPubDate: pubDate
      };

    } catch (error) {
      console.warn(`⚠️ RSS: Erreur parsing article ${index}:`, error);
      return null; // Article sera filtré
    }
  }

  /**
   * Extraction d'image avec méthodes multiples
   */
  extractImageFromItem(item, index) {
    const methods = [
      // Méthode 1: media:content
      () => {
        const mediaContent = item.querySelector('media\\:content, content');
        if (mediaContent) {
          const url = mediaContent.getAttribute('url');
          if (url && this.isValidImageUrl(url)) {
            console.log(`🖼️ Image trouvée via media:content pour article ${index}:`, url);
            return url;
          }
        }
        return null;
      },

      // Méthode 2: enclosure
      () => {
        const enclosure = item.querySelector('enclosure');
        if (enclosure) {
          const url = enclosure.getAttribute('url');
          const type = enclosure.getAttribute('type');
          if (url && type && type.startsWith('image/')) {
            console.log(`🖼️ Image trouvée via enclosure pour article ${index}:`, url);
            return url;
          }
        }
        return null;
      },

      // Méthode 3: contenu HTML
      () => {
        const content = this.getTextContent(item, 'content:encoded') || this.getTextContent(item, 'description');
        if (content) {
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) {
            const url = imgMatch[1];
            if (this.isValidImageUrl(url)) {
              console.log(`🖼️ Image trouvée via HTML content pour article ${index}:`, url);
              return url;
            }
          }
        }
        return null;
      },

      // Méthode 4: image par défaut basée sur l'index
      () => {
        const fallbackImages = [
          '/assets/images/blog-default-1.jpg',
          '/assets/images/blog-default-2.jpg',
          '/assets/images/blog-default-3.jpg'
        ];
        return fallbackImages[index % fallbackImages.length];
      }
    ];

    // Essayer chaque méthode
    for (const method of methods) {
      try {
        const result = method();
        if (result) return result;
      } catch (error) {
        console.warn(`⚠️ RSS: Erreur extraction image méthode pour article ${index}:`, error);
      }
    }

    // Fallback final
    return '/assets/images/blog-fallback.jpg';
  }

  /**
   * Utilitaires de parsing
   */
  getTextContent(item, selector) {
    try {
      // Gestion spéciale pour les namespaces XML (dc:creator, etc.)
      if (selector.includes(':')) {
        const elements = item.getElementsByTagName(selector);
        if (elements.length > 0) {
          return elements[0].textContent.trim();
        }
        return '';
      }
      
      // Utilisation normale de querySelector pour les autres éléments
      const element = item.querySelector(selector);
      return element ? element.textContent.trim() : '';
    } catch (error) {
      console.warn(`⚠️ RSS: Erreur parsing sélecteur ${selector}:`, error);
      return '';
    }
  }

  isValidImageUrl(url) {
    if (!url || url.length < 10) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('image');
  }

  sanitizeText(text) {
    return text.replace(/<[^>]*>/g, '').trim();
  }

  sanitizeUrl(url) {
    try {
      return new URL(url, BLOG_CONFIG.BASE_URL).href;
    } catch {
      return BLOG_CONFIG.BASE_URL;
    }
  }

  cleanDescription(description) {
    return description
      .replace(/<[^>]*>/g, '') // Supprimer HTML
      .replace(/\s+/g, ' ')    // Normaliser espaces
      .substring(0, 150)       // Limiter longueur
      .trim();
  }

  formatDate(dateStr) {
    if (!dateStr) return 'Récemment';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Récemment';
    }
  }

  /**
   * Gestion du cache localStorage
   */
  loadFromCache() {
    try {
      const cached = localStorage.getItem(BLOG_CONFIG.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ RSS: Erreur lecture cache:', error);
      return null;
    }
  }

  saveToCache(articles) {
    try {
      const cacheData = {
        timestamp: Date.now(),
        articles: articles,
        version: '1.0'
      };
      localStorage.setItem(BLOG_CONFIG.CACHE_KEY, JSON.stringify(cacheData));
      console.log(`💾 RSS: ${articles.length} articles sauvés en cache`);
    } catch (error) {
      console.warn('⚠️ RSS: Erreur sauvegarde cache:', error);
    }
  }

  isCacheValid() {
    if (!this.cache || !this.cache.timestamp) return false;
    
    const age = Date.now() - this.cache.timestamp;
    const isValid = age < BLOG_CONFIG.CACHE_DURATION;
    
    if (isValid) {
      console.log(`✅ RSS: Cache valide (âge: ${Math.round(age / 1000)}s)`);
    } else {
      console.log(`❌ RSS: Cache expiré (âge: ${Math.round(age / 1000)}s)`);
    }
    
    return isValid;
  }

  /**
   * Articles de fallback statiques
   */
  getStaticFallbackArticles(limit = 3) {
    const fallbackArticles = [
      {
        id: 'fallback-1',
        title: 'Guide Marketing Musical 2024 - Les Stratégies Gagnantes',
        link: `${BLOG_CONFIG.BASE_URL}/guide-marketing-musical-2024`,
        description: 'Découvrez les dernières stratégies de marketing musical qui fonctionnent vraiment en 2024. YouTube Ads, Meta Ads, TikTok...',
        image: '/assets/images/blog-fallback-1.jpg',
        date: 'Récemment',
        author: 'MDMC Team'
      },
      {
        id: 'fallback-2',
        title: 'YouTube Ads pour Musiciens - ROI +300% en 30 jours',
        link: `${BLOG_CONFIG.BASE_URL}/youtube-ads-musiciens`,
        description: 'Comment nous avons généré +2M de vues YouTube et +300% de ROI pour nos artistes en seulement 30 jours...',
        image: '/assets/images/blog-fallback-2.jpg',
        date: 'Il y a 2 jours',
        author: 'MDMC Team'
      },
      {
        id: 'fallback-3',
        title: 'Meta Ads vs TikTok Ads - Quelle Plateforme Choisir ?',
        link: `${BLOG_CONFIG.BASE_URL}/meta-ads-vs-tiktok-ads`,
        description: 'Analyse comparative complète : coûts, audience, ROI. Découvrez quelle plateforme correspond à votre style musical...',
        image: '/assets/images/blog-fallback-3.jpg',
        date: 'Il y a 1 semaine',
        author: 'MDMC Team'
      }
    ];

    return fallbackArticles.slice(0, limit);
  }

  /**
   * Méthodes utilitaires pour debugging
   */
  clearCache() {
    localStorage.removeItem(BLOG_CONFIG.CACHE_KEY);
    this.cache = null;
    console.log('🗑️ RSS: Cache vidé');
  }

  getCacheInfo() {
    if (!this.cache) return { cached: false };
    
    return {
      cached: true,
      articles: this.cache.articles.length,
      age: Math.round((Date.now() - this.cache.timestamp) / 1000),
      valid: this.isCacheValid()
    };
  }
}

// Export singleton
const rssService = new RSSService();
export default rssService;

// Export pour debugging
export { BLOG_CONFIG, RSSService };