/**
 * 🔗 Service de génération d'URLs propres et tracking
 * Gère les URLs courtes, UTM params, QR codes et analytics
 */

class URLGeneratorService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SITE_URL || 'https://smartlinks.mdmc.com';
    this.shortDomain = import.meta.env.VITE_SHORT_DOMAIN || 'mdmc.link';
    this.trackingDomain = import.meta.env.VITE_TRACKING_DOMAIN || 'track.mdmc.com';
    
    // UTM campaign sources par défaut
    this.defaultUTMSources = {
      social: 'social_media',
      direct: 'direct_link',
      email: 'email_campaign',
      qr: 'qr_code',
      embed: 'website_embed',
      api: 'api_integration'
    };

    // Formats d'URL supportés
    this.urlFormats = {
      clean: '/s/{slug}',                          // URL courte
      artist: '/smartlinks/{artistSlug}/{trackSlug}', // URL avec artiste
      short: '/{shortCode}',                       // URL ultra-courte
      branded: '/{brand}/{shortCode}',             // URL avec marque
      campaign: '/c/{campaignId}/{shortCode}'      // URL de campagne
    };
  }

  /**
   * Génère une URL propre pour un SmartLink
   */
  generateCleanURL(smartLinkData, options = {}) {
    const {
      format = 'artist',
      utm = {},
      campaign = null,
      source = 'direct',
      medium = 'smartlink',
      customDomain = null,
      shortCode = null
    } = options;

    const domain = customDomain || this.baseUrl;
    const artistSlug = smartLinkData.artist?.slug || this.generateSlug(smartLinkData.artist?.name);
    const trackSlug = smartLinkData.smartLink?.slug || this.generateSlug(smartLinkData.smartLink?.trackTitle);

    let path = '';

    switch (format) {
      case 'clean':
        path = this.urlFormats.clean.replace('{slug}', shortCode || trackSlug);
        break;
      
      case 'artist':
        path = this.urlFormats.artist
          .replace('{artistSlug}', artistSlug)
          .replace('{trackSlug}', trackSlug);
        break;
      
      case 'short':
        path = this.urlFormats.short.replace('{shortCode}', shortCode || this.generateShortCode());
        break;
      
      case 'branded':
        const brand = smartLinkData.brand || 'mdmc';
        path = this.urlFormats.branded
          .replace('{brand}', brand)
          .replace('{shortCode}', shortCode || this.generateShortCode());
        break;
      
      case 'campaign':
        path = this.urlFormats.campaign
          .replace('{campaignId}', campaign || 'default')
          .replace('{shortCode}', shortCode || this.generateShortCode());
        break;
      
      default:
        path = this.urlFormats.artist
          .replace('{artistSlug}', artistSlug)
          .replace('{trackSlug}', trackSlug);
    }

    const baseURL = new URL(path, domain);

    // Ajouter les paramètres UTM
    const utmParams = this.generateUTMParams({
      source,
      medium,
      campaign: campaign || `${artistSlug}-${trackSlug}`,
      ...utm
    });

    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        baseURL.searchParams.set(key, value);
      }
    });

    return {
      url: baseURL.toString(),
      shortUrl: this.generateShortURL(baseURL.toString()),
      qrCode: this.generateQRCodeURL(baseURL.toString()),
      tracking: this.generateTrackingPixel(smartLinkData, utmParams)
    };
  }

  /**
   * Génère des paramètres UTM standardisés
   */
  generateUTMParams(params = {}) {
    const {
      source = 'direct',
      medium = 'smartlink',
      campaign = null,
      term = null,
      content = null,
      customParams = {}
    } = params;

    const utmParams = {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
    };

    if (term) utmParams.utm_term = term;
    if (content) utmParams.utm_content = content;

    // Paramètres personnalisés MDMC
    const mdmcParams = {
      mdmc_id: this.generateTrackingId(),
      mdmc_timestamp: Date.now(),
      mdmc_version: '2.0',
      ...customParams
    };

    return { ...utmParams, ...mdmcParams };
  }

  /**
   * Génère un code court unique
   */
  generateShortCode(length = 6) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Génère un slug propre à partir d'un texte
   */
  generateSlug(text, maxLength = 50) {
    if (!text) return 'unknown';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Supprimer tirets multiples
      .replace(/^-|-$/g, '') // Supprimer tirets en début/fin
      .substring(0, maxLength);
  }

  /**
   * Génère une URL courte avec service externe ou interne
   */
  generateShortURL(longUrl) {
    // En production, intégrer avec bit.ly, tinyurl, ou service interne
    const shortCode = this.generateShortCode(8);
    return `https://${this.shortDomain}/${shortCode}`;
  }

  /**
   * Génère l'URL pour un QR code
   */
  generateQRCodeURL(url, options = {}) {
    const {
      size = 200,
      format = 'png',
      errorCorrection = 'M',
      margin = 1
    } = options;

    // Utiliser un service QR code ou générer en interne
    const qrParams = new URLSearchParams({
      data: encodeURIComponent(url),
      size: `${size}x${size}`,
      format,
      ecc: errorCorrection,
      margin
    });

    return `https://api.qrserver.com/v1/create-qr-code/?${qrParams.toString()}`;
  }

  /**
   * Génère un pixel de tracking pour analytics
   */
  generateTrackingPixel(smartLinkData, utmParams) {
    const trackingId = this.generateTrackingId();
    const params = new URLSearchParams({
      id: smartLinkData.smartLink?._id,
      artist: smartLinkData.artist?._id,
      tracking_id: trackingId,
      ...utmParams
    });

    return `https://${this.trackingDomain}/pixel.gif?${params.toString()}`;
  }

  /**
   * Génère un ID de tracking unique
   */
  generateTrackingId() {
    return 'mdmc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Analyse et extrait les paramètres UTM d'une URL
   */
  parseUTMParams(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      
      // Paramètres UTM standards
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        if (urlObj.searchParams.has(param)) {
          params[param] = urlObj.searchParams.get(param);
        }
      });

      // Paramètres MDMC personnalisés
      ['mdmc_id', 'mdmc_timestamp', 'mdmc_version'].forEach(param => {
        if (urlObj.searchParams.has(param)) {
          params[param] = urlObj.searchParams.get(param);
        }
      });

      return params;
    } catch (error) {
      console.warn('Erreur parsing UTM params:', error);
      return {};
    }
  }

  /**
   * Génère des variantes d'URL pour différents canaux
   */
  generateMultiChannelURLs(smartLinkData, baseCampaign = null) {
    const campaign = baseCampaign || `${smartLinkData.artist?.slug}-${smartLinkData.smartLink?.slug}`;
    
    return {
      // Réseaux sociaux
      facebook: this.generateCleanURL(smartLinkData, {
        utm: { source: 'facebook', medium: 'social', campaign }
      }),
      
      instagram: this.generateCleanURL(smartLinkData, {
        utm: { source: 'instagram', medium: 'social', campaign }
      }),
      
      twitter: this.generateCleanURL(smartLinkData, {
        utm: { source: 'twitter', medium: 'social', campaign }
      }),
      
      tiktok: this.generateCleanURL(smartLinkData, {
        utm: { source: 'tiktok', medium: 'social', campaign }
      }),

      // Email marketing
      email: this.generateCleanURL(smartLinkData, {
        utm: { source: 'email', medium: 'newsletter', campaign }
      }),

      // QR Code
      qr: this.generateCleanURL(smartLinkData, {
        utm: { source: 'qr_code', medium: 'offline', campaign }
      }),

      // Direct
      direct: this.generateCleanURL(smartLinkData, {
        utm: { source: 'direct', medium: 'link', campaign }
      }),

      // API/Embed
      embed: this.generateCleanURL(smartLinkData, {
        utm: { source: 'embed', medium: 'widget', campaign }
      })
    };
  }

  /**
   * Génère des métadonnées pour le partage social
   */
  generateSocialMetadata(smartLinkData, url) {
    const title = `${smartLinkData.smartLink?.trackTitle} - ${smartLinkData.artist?.name}`;
    const description = `Listen to ${smartLinkData.smartLink?.trackTitle} by ${smartLinkData.artist?.name} on your favorite music platform.`;
    const image = smartLinkData.smartLink?.coverImageUrl;

    return {
      // Open Graph (Facebook, LinkedIn)
      og: {
        title,
        description,
        image,
        url,
        type: 'music.song',
        site_name: 'MDMC SmartLinks'
      },

      // Twitter Cards
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image,
        site: '@mdmc_music'
      },

      // Schema.org JSON-LD
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        name: smartLinkData.smartLink?.trackTitle,
        byArtist: {
          '@type': 'MusicGroup',
          name: smartLinkData.artist?.name
        },
        image,
        url,
        sameAs: smartLinkData.smartLink?.platformLinks?.map(link => link.url) || []
      }
    };
  }

  /**
   * Valide et nettoie une URL
   */
  validateAndCleanURL(url) {
    try {
      const urlObj = new URL(url);
      
      // Supprimer les paramètres indésirables
      const unwantedParams = ['fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign'];
      unwantedParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch (error) {
      throw new Error('URL invalide: ' + url);
    }
  }

  /**
   * Génère des analytics pour une URL
   */
  generateAnalyticsData(url, clickData = {}) {
    const utmParams = this.parseUTMParams(url);
    
    return {
      url,
      utm_params: utmParams,
      click_data: {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...clickData
      },
      tracking_id: utmParams.mdmc_id || this.generateTrackingId()
    };
  }
}

// Export singleton
const urlGeneratorService = new URLGeneratorService();
export default urlGeneratorService;