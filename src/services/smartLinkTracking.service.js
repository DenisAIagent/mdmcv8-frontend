/**
 * Service de tracking SmartLink - Gestion des pixels individuels
 * Permet l'injection dynamique et sécurisée des scripts de tracking
 * Supporte GA4, GTM, Meta Pixel, TikTok Pixel avec gestion des conflits
 */

class SmartLinkTrackingService {
  constructor() {
    this.injectedScripts = new Map();
    this.activePixels = new Set();
    this.initializationPromises = new Map();
  }

  /**
   * Injecte Google Analytics 4
   */
  async injectGA4({ measurementId, smartLinkId, mode = 'individual' }) {
    if (!measurementId) {
      console.warn('[TRACKING] GA4: measurementId requis');
      return () => {};
    }

    const scriptId = `ga4-${measurementId}`;
    
    // Éviter les doublons
    if (this.injectedScripts.has(scriptId)) {
      console.log('[TRACKING] GA4 déjà injecté:', measurementId);
      return this.injectedScripts.get(scriptId).cleanup;
    }

    try {
      console.log(`[TRACKING] Injection GA4 ${mode}:`, measurementId);

      // Nettoyer GA4 global si mode individuel
      if (mode === 'individual') {
        this.cleanupGlobalGA4();
      }

      // Injecter le script GA4
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.id = scriptId;
      
      document.head.appendChild(script);

      // Initialiser gtag
      await new Promise((resolve, reject) => {
        script.onload = () => {
          try {
            // Initialiser dataLayer si nécessaire
            window.dataLayer = window.dataLayer || [];
            
            // Fonction gtag
            if (!window.gtag) {
              window.gtag = function() {
                window.dataLayer.push(arguments);
              };
            }
            
            window.gtag('js', new Date());
            window.gtag('config', measurementId, {
              custom_map: {
                'smartlink_id': 'custom_parameter_1',
                'track_title': 'custom_parameter_2',
                'artist_name': 'custom_parameter_3'
              },
              // Paramètres pour éviter les conflits
              send_page_view: mode === 'individual'
            });

            console.log(`[TRACKING] GA4 ${mode} initialisé:`, measurementId);
            resolve();
          } catch (error) {
            console.error('[TRACKING] Erreur initialisation GA4:', error);
            reject(error);
          }
        };
        
        script.onerror = () => {
          console.error('[TRACKING] Erreur chargement script GA4');
          reject(new Error('Échec chargement script GA4'));
        };
      });

      // Fonction de nettoyage
      const cleanup = () => {
        const scriptElement = document.getElementById(scriptId);
        if (scriptElement) {
          scriptElement.remove();
        }
        this.injectedScripts.delete(scriptId);
        this.activePixels.delete(`ga4-${measurementId}`);
        console.log('[TRACKING] GA4 nettoyé:', measurementId);
      };

      this.injectedScripts.set(scriptId, { cleanup, measurementId, mode });
      this.activePixels.add(`ga4-${measurementId}`);

      return cleanup;

    } catch (error) {
      console.error('[TRACKING] Erreur injection GA4:', error);
      return () => {};
    }
  }

  /**
   * Injecte Google Tag Manager
   */
  async injectGTM({ containerId, smartLinkId, mode = 'individual' }) {
    if (!containerId) {
      console.warn('[TRACKING] GTM: containerId requis');
      return () => {};
    }

    const scriptId = `gtm-${containerId}`;
    
    // Éviter les doublons
    if (this.injectedScripts.has(scriptId)) {
      console.log('[TRACKING] GTM déjà injecté:', containerId);
      return this.injectedScripts.get(scriptId).cleanup;
    }

    try {
      console.log(`[TRACKING] Injection GTM ${mode}:`, containerId);

      // Nettoyer GTM global si mode individuel
      if (mode === 'individual') {
        this.cleanupGlobalGTM();
      }

      // Initialiser dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      // Injecter le script GTM
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
      script.id = scriptId;
      
      document.head.appendChild(script);

      // Injecter le noscript GTM
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      noscript.id = `${scriptId}-noscript`;
      document.body.appendChild(noscript);

      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log(`[TRACKING] GTM ${mode} initialisé:`, containerId);
          resolve();
        };
        
        script.onerror = () => {
          console.error('[TRACKING] Erreur chargement script GTM');
          reject(new Error('Échec chargement script GTM'));
        };
      });

      // Fonction de nettoyage
      const cleanup = () => {
        const scriptElement = document.getElementById(scriptId);
        const noscriptElement = document.getElementById(`${scriptId}-noscript`);
        
        if (scriptElement) scriptElement.remove();
        if (noscriptElement) noscriptElement.remove();
        
        this.injectedScripts.delete(scriptId);
        this.activePixels.delete(`gtm-${containerId}`);
        console.log('[TRACKING] GTM nettoyé:', containerId);
      };

      this.injectedScripts.set(scriptId, { cleanup, containerId, mode });
      this.activePixels.add(`gtm-${containerId}`);

      return cleanup;

    } catch (error) {
      console.error('[TRACKING] Erreur injection GTM:', error);
      return () => {};
    }
  }

  /**
   * Injecte Meta Pixel (Facebook)
   */
  async injectMetaPixel({ pixelId, smartLinkId, mode = 'individual' }) {
    if (!pixelId) {
      console.warn('[TRACKING] Meta Pixel: pixelId requis');
      return () => {};
    }

    const scriptId = `meta-pixel-${pixelId}`;
    
    // Éviter les doublons
    if (this.injectedScripts.has(scriptId)) {
      console.log('[TRACKING] Meta Pixel déjà injecté:', pixelId);
      return this.injectedScripts.get(scriptId).cleanup;
    }

    try {
      console.log(`[TRACKING] Injection Meta Pixel ${mode}:`, pixelId);

      // Nettoyer Meta Pixel global si mode individuel
      if (mode === 'individual') {
        this.cleanupGlobalMetaPixel();
      }

      // Initialiser fbq
      if (!window.fbq) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
        `;
        script.id = scriptId;
        document.head.appendChild(script);

        // Attendre que fbq soit disponible
        await new Promise((resolve) => {
          const checkFbq = () => {
            if (window.fbq) {
              resolve();
            } else {
              setTimeout(checkFbq, 100);
            }
          };
          checkFbq();
        });
      }

      // Initialiser le pixel
      window.fbq('init', pixelId);
      
      console.log(`[TRACKING] Meta Pixel ${mode} initialisé:`, pixelId);

      // Fonction de nettoyage
      const cleanup = () => {
        // Désactiver le pixel (pas de suppression complète pour éviter les erreurs)
        if (window.fbq) {
          try {
            // Désactiver les événements pour ce pixel
            window.fbq('set', 'autoConfig', false, pixelId);
          } catch (error) {
            console.warn('[TRACKING] Erreur désactivation Meta Pixel:', error);
          }
        }
        
        const scriptElement = document.getElementById(scriptId);
        if (scriptElement) {
          scriptElement.remove();
        }
        
        this.injectedScripts.delete(scriptId);
        this.activePixels.delete(`meta-${pixelId}`);
        console.log('[TRACKING] Meta Pixel nettoyé:', pixelId);
      };

      this.injectedScripts.set(scriptId, { cleanup, pixelId, mode });
      this.activePixels.add(`meta-${pixelId}`);

      return cleanup;

    } catch (error) {
      console.error('[TRACKING] Erreur injection Meta Pixel:', error);
      return () => {};
    }
  }

  /**
   * Injecte TikTok Pixel
   */
  async injectTikTokPixel({ pixelId, smartLinkId, mode = 'individual' }) {
    if (!pixelId) {
      console.warn('[TRACKING] TikTok Pixel: pixelId requis');
      return () => {};
    }

    const scriptId = `tiktok-pixel-${pixelId}`;
    
    // Éviter les doublons
    if (this.injectedScripts.has(scriptId)) {
      console.log('[TRACKING] TikTok Pixel déjà injecté:', pixelId);
      return this.injectedScripts.get(scriptId).cleanup;
    }

    try {
      console.log(`[TRACKING] Injection TikTok Pixel ${mode}:`, pixelId);

      // Nettoyer TikTok Pixel global si mode individuel
      if (mode === 'individual') {
        this.cleanupGlobalTikTokPixel();
      }

      // Initialiser ttq
      if (!window.ttq) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          }(window, document, 'ttq');
        `;
        script.id = scriptId;
        document.head.appendChild(script);

        // Attendre que ttq soit disponible
        await new Promise((resolve) => {
          const checkTtq = () => {
            if (window.ttq) {
              resolve();
            } else {
              setTimeout(checkTtq, 100);
            }
          };
          checkTtq();
        });
      }

      // Initialiser le pixel
      window.ttq.load(pixelId);
      window.ttq.page();
      
      console.log(`[TRACKING] TikTok Pixel ${mode} initialisé:`, pixelId);

      // Fonction de nettoyage
      const cleanup = () => {
        // Désactiver le pixel
        if (window.ttq && window.ttq._i && window.ttq._i[pixelId]) {
          delete window.ttq._i[pixelId];
        }
        
        const scriptElement = document.getElementById(scriptId);
        if (scriptElement) {
          scriptElement.remove();
        }
        
        this.injectedScripts.delete(scriptId);
        this.activePixels.delete(`tiktok-${pixelId}`);
        console.log('[TRACKING] TikTok Pixel nettoyé:', pixelId);
      };

      this.injectedScripts.set(scriptId, { cleanup, pixelId, mode });
      this.activePixels.add(`tiktok-${pixelId}`);

      return cleanup;

    } catch (error) {
      console.error('[TRACKING] Erreur injection TikTok Pixel:', error);
      return () => {};
    }
  }

  /**
   * Track événement GA4
   */
  trackGA4Event(eventName, eventData = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
      console.log('[TRACKING] GA4 Event:', eventName, eventData);
    } else {
      console.warn('[TRACKING] GA4 non disponible pour event:', eventName);
    }
  }

  /**
   * Track événement GTM
   */
  trackGTMEvent(eventName, eventData = {}) {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData
      });
      console.log('[TRACKING] GTM Event:', eventName, eventData);
    } else {
      console.warn('[TRACKING] GTM dataLayer non disponible pour event:', eventName);
    }
  }

  /**
   * Track événement Meta Pixel
   */
  trackMetaEvent(eventName, eventData = {}) {
    if (window.fbq) {
      window.fbq('track', eventName, eventData);
      console.log('[TRACKING] Meta Event:', eventName, eventData);
    } else {
      console.warn('[TRACKING] Meta Pixel non disponible pour event:', eventName);
    }
  }

  /**
   * Track événement TikTok Pixel
   */
  trackTikTokEvent(eventName, eventData = {}) {
    if (window.ttq) {
      window.ttq.track(eventName, eventData);
      console.log('[TRACKING] TikTok Event:', eventName, eventData);
    } else {
      console.warn('[TRACKING] TikTok Pixel non disponible pour event:', eventName);
    }
  }

  /**
   * Nettoie les pixels globaux pour éviter les conflits
   */
  cleanupGlobalGA4() {
    const globalGA4Scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
    globalGA4Scripts.forEach(script => {
      if (!script.id.includes('individual')) {
        console.log('[TRACKING] Nettoyage GA4 global:', script.src);
        // Ne pas supprimer complètement mais désactiver
        script.disabled = true;
      }
    });
  }

  cleanupGlobalGTM() {
    const globalGTMScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]');
    globalGTMScripts.forEach(script => {
      if (!script.id.includes('individual')) {
        console.log('[TRACKING] Nettoyage GTM global:', script.src);
        script.disabled = true;
      }
    });
  }

  cleanupGlobalMetaPixel() {
    // Meta Pixel global généralement dans le head
    const globalMetaScripts = document.querySelectorAll('script[src*="connect.facebook.net"]');
    globalMetaScripts.forEach(script => {
      if (!script.id.includes('individual')) {
        console.log('[TRACKING] Désactivation Meta Pixel global');
        script.disabled = true;
      }
    });
  }

  cleanupGlobalTikTokPixel() {
    // TikTok Pixel global
    const globalTikTokScripts = document.querySelectorAll('script[src*="analytics.tiktok.com"]');
    globalTikTokScripts.forEach(script => {
      if (!script.id.includes('individual')) {
        console.log('[TRACKING] Désactivation TikTok Pixel global');
        script.disabled = true;
      }
    });
  }

  /**
   * Nettoie tous les pixels injectés
   */
  cleanupAll() {
    console.log('[TRACKING] Nettoyage complet de tous les pixels');
    
    this.injectedScripts.forEach((scriptInfo, scriptId) => {
      try {
        scriptInfo.cleanup();
      } catch (error) {
        console.warn('[TRACKING] Erreur nettoyage script:', scriptId, error);
      }
    });

    this.injectedScripts.clear();
    this.activePixels.clear();
  }

  /**
   * Obtient les pixels actifs
   */
  getActivePixels() {
    return Array.from(this.activePixels);
  }

  /**
   * Vérifie si un pixel est actif
   */
  isPixelActive(pixelType, pixelId) {
    return this.activePixels.has(`${pixelType}-${pixelId}`);
  }
}

// Instance singleton
const smartLinkTrackingService = new SmartLinkTrackingService();

export default smartLinkTrackingService;