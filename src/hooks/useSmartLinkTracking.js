/**
 * Hook de tracking dynamique pour SmartLinks individuels
 * Permet l'injection de pixels personnalisés par SmartLink
 * Supporte GA4, GTM, Meta Pixel, TikTok Pixel avec fallback global
 */

import { useEffect, useRef, useState } from 'react';
import smartLinkTrackingService from '../services/smartLinkTracking.service';

const useSmartLinkTracking = (smartLinkData, options = {}) => {
  const [trackingInitialized, setTrackingInitialized] = useState(false);
  const [activePixels, setActivePixels] = useState({
    ga4: { global: false, individual: false },
    gtm: { global: false, individual: false },
    metaPixel: { global: false, individual: false },
    tiktokPixel: { global: false, individual: false }
  });
  
  const initializationRef = useRef(false);
  const cleanupFunctionsRef = useRef([]);

  const {
    enableFallback = true,
    logEvents = true,
    trackPageView = true,
    trackClicks = true
  } = options;

  /**
   * Initialise le tracking pour un SmartLink
   */
  useEffect(() => {
    if (!smartLinkData || initializationRef.current) return;

    const initializeTracking = async () => {
      try {
        console.log('[TRACKING] Initialisation pour SmartLink:', smartLinkData._id);
        
        const trackingConfig = extractTrackingConfig(smartLinkData);
        
        if (logEvents) {
          console.log('[TRACKING] Configuration extraite:', trackingConfig);
        }

        // Nettoyer les pixels précédents si nécessaire
        cleanup();

        const pixelStatus = {
          ga4: { global: false, individual: false },
          gtm: { global: false, individual: false },
          metaPixel: { global: false, individual: false },
          tiktokPixel: { global: false, individual: false }
        };

        // 1. Google Analytics 4
        if (trackingConfig.individual.ga4) {
          const cleanup = await smartLinkTrackingService.injectGA4({
            measurementId: trackingConfig.individual.ga4,
            smartLinkId: smartLinkData._id,
            mode: 'individual'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.ga4.individual = true;
          
          if (logEvents) {
            console.log('[TRACKING] GA4 individuel injecté:', trackingConfig.individual.ga4);
          }
        } else if (enableFallback && trackingConfig.global.ga4) {
          const cleanup = await smartLinkTrackingService.injectGA4({
            measurementId: trackingConfig.global.ga4,
            smartLinkId: smartLinkData._id,
            mode: 'global_fallback'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.ga4.global = true;
          
          if (logEvents) {
            console.log('[TRACKING] GA4 global (fallback) utilisé:', trackingConfig.global.ga4);
          }
        }

        // 2. Google Tag Manager
        if (trackingConfig.individual.gtm) {
          const cleanup = await smartLinkTrackingService.injectGTM({
            containerId: trackingConfig.individual.gtm,
            smartLinkId: smartLinkData._id,
            mode: 'individual'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.gtm.individual = true;
          
          if (logEvents) {
            console.log('[TRACKING] GTM individuel injecté:', trackingConfig.individual.gtm);
          }
        } else if (enableFallback && trackingConfig.global.gtm) {
          const cleanup = await smartLinkTrackingService.injectGTM({
            containerId: trackingConfig.global.gtm,
            smartLinkId: smartLinkData._id,
            mode: 'global_fallback'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.gtm.global = true;
          
          if (logEvents) {
            console.log('[TRACKING] GTM global (fallback) utilisé:', trackingConfig.global.gtm);
          }
        }

        // 3. Meta Pixel
        if (trackingConfig.individual.metaPixel) {
          const cleanup = await smartLinkTrackingService.injectMetaPixel({
            pixelId: trackingConfig.individual.metaPixel,
            smartLinkId: smartLinkData._id,
            mode: 'individual'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.metaPixel.individual = true;
          
          if (logEvents) {
            console.log('[TRACKING] Meta Pixel individuel injecté:', trackingConfig.individual.metaPixel);
          }
        } else if (enableFallback && trackingConfig.global.metaPixel) {
          const cleanup = await smartLinkTrackingService.injectMetaPixel({
            pixelId: trackingConfig.global.metaPixel,
            smartLinkId: smartLinkData._id,
            mode: 'global_fallback'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.metaPixel.global = true;
          
          if (logEvents) {
            console.log('[TRACKING] Meta Pixel global (fallback) utilisé:', trackingConfig.global.metaPixel);
          }
        }

        // 4. TikTok Pixel
        if (trackingConfig.individual.tiktokPixel) {
          const cleanup = await smartLinkTrackingService.injectTikTokPixel({
            pixelId: trackingConfig.individual.tiktokPixel,
            smartLinkId: smartLinkData._id,
            mode: 'individual'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.tiktokPixel.individual = true;
          
          if (logEvents) {
            console.log('[TRACKING] TikTok Pixel individuel injecté:', trackingConfig.individual.tiktokPixel);
          }
        } else if (enableFallback && trackingConfig.global.tiktokPixel) {
          const cleanup = await smartLinkTrackingService.injectTikTokPixel({
            pixelId: trackingConfig.global.tiktokPixel,
            smartLinkId: smartLinkData._id,
            mode: 'global_fallback'
          });
          cleanupFunctionsRef.current.push(cleanup);
          pixelStatus.tiktokPixel.global = true;
          
          if (logEvents) {
            console.log('[TRACKING] TikTok Pixel global (fallback) utilisé:', trackingConfig.global.tiktokPixel);
          }
        }

        setActivePixels(pixelStatus);
        setTrackingInitialized(true);
        initializationRef.current = true;

        // Track page view automatiquement si activé
        if (trackPageView) {
          trackSmartLinkPageView(smartLinkData, trackingConfig);
        }

        if (logEvents) {
          console.log('[TRACKING] Initialisation terminée. Pixels actifs:', pixelStatus);
        }

      } catch (error) {
        console.error('[TRACKING] Erreur lors de l\'initialisation:', error);
        setTrackingInitialized(false);
      }
    };

    initializeTracking();
  }, [smartLinkData, enableFallback, logEvents, trackPageView]);

  /**
   * Nettoie les pixels injectés
   */
  const cleanup = () => {
    cleanupFunctionsRef.current.forEach(cleanupFn => {
      if (typeof cleanupFn === 'function') {
        try {
          cleanupFn();
        } catch (error) {
          console.warn('[TRACKING] Erreur lors du nettoyage:', error);
        }
      }
    });
    cleanupFunctionsRef.current = [];
  };

  /**
   * Nettoie lors du démontage du composant
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  /**
   * Extrait la configuration de tracking du SmartLink
   */
  const extractTrackingConfig = (smartLinkData) => {
    const trackingIds = smartLinkData?.trackingIds || {};
    
    // Configuration tracking global MDMC (fallback)
    const globalConfig = {
      ga4: 'G-098G18MJ7M', // GA4 global MDMC
      gtm: 'GTM-572GXWPP', // GTM global MDMC
      metaPixel: process.env.REACT_APP_META_PIXEL_ID || null, // Meta global MDMC
      tiktokPixel: process.env.REACT_APP_TIKTOK_PIXEL_ID || null // TikTok global MDMC
    };

    // Configuration tracking individuel (prioritaire)
    const individualConfig = {
      ga4: trackingIds.googleAnalytics || null,
      gtm: trackingIds.googleTagManager || null,
      metaPixel: trackingIds.metaPixel || null,
      tiktokPixel: trackingIds.tiktokPixel || null
    };

    return {
      global: globalConfig,
      individual: individualConfig,
      mode: trackingIds.mode || 'hybrid' // global, individual, hybrid
    };
  };

  /**
   * Track page view pour le SmartLink
   */
  const trackSmartLinkPageView = (smartLinkData, trackingConfig) => {
    const pageViewData = {
      smartlink_id: smartLinkData._id,
      track_title: smartLinkData.trackTitle || smartLinkData.title,
      artist_name: smartLinkData.artistName || smartLinkData.artist?.name,
      page_path: window.location.pathname,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      platforms_count: smartLinkData.platformLinks?.length || 0
    };

    // GA4 Events
    if (activePixels.ga4.individual || activePixels.ga4.global) {
      smartLinkTrackingService.trackGA4Event('smartlink_page_view', pageViewData);
    }

    // GTM Events
    if (activePixels.gtm.individual || activePixels.gtm.global) {
      smartLinkTrackingService.trackGTMEvent('smartlink_page_view', pageViewData);
    }

    // Meta Pixel Events
    if (activePixels.metaPixel.individual || activePixels.metaPixel.global) {
      smartLinkTrackingService.trackMetaEvent('ViewContent', {
        content_name: pageViewData.track_title,
        content_category: 'Music',
        content_ids: [pageViewData.smartlink_id],
        artist_name: pageViewData.artist_name
      });
    }

    // TikTok Pixel Events
    if (activePixels.tiktokPixel.individual || activePixels.tiktokPixel.global) {
      smartLinkTrackingService.trackTikTokEvent('ViewContent', {
        content_name: pageViewData.track_title,
        content_category: 'Music',
        content_id: pageViewData.smartlink_id
      });
    }

    if (logEvents) {
      console.log('[TRACKING] Page view tracked:', pageViewData);
    }
  };

  /**
   * Track platform click
   */
  const trackPlatformClick = (platform, url, additionalData = {}) => {
    if (!trackClicks) return;

    const clickData = {
      smartlink_id: smartLinkData._id,
      platform_name: platform,
      destination_url: url,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    // GA4 Events
    if (activePixels.ga4.individual || activePixels.ga4.global) {
      smartLinkTrackingService.trackGA4Event('platform_click', clickData);
    }

    // GTM Events
    if (activePixels.gtm.individual || activePixels.gtm.global) {
      smartLinkTrackingService.trackGTMEvent('platform_click', clickData);
    }

    // Meta Pixel Events
    if (activePixels.metaPixel.individual || activePixels.metaPixel.global) {
      smartLinkTrackingService.trackMetaEvent('Lead', {
        content_name: smartLinkData.trackTitle || smartLinkData.title,
        content_category: 'Music',
        platform: platform,
        value: 1
      });
    }

    // TikTok Pixel Events
    if (activePixels.tiktokPixel.individual || activePixels.tiktokPixel.global) {
      smartLinkTrackingService.trackTikTokEvent('ClickButton', {
        content_name: smartLinkData.trackTitle || smartLinkData.title,
        content_category: 'Music',
        button_text: platform
      });
    }

    if (logEvents) {
      console.log('[TRACKING] Platform click tracked:', clickData);
    }
  };

  /**
   * Track événement personnalisé
   */
  const trackCustomEvent = (eventName, eventData = {}) => {
    const customData = {
      smartlink_id: smartLinkData._id,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // GA4 Events
    if (activePixels.ga4.individual || activePixels.ga4.global) {
      smartLinkTrackingService.trackGA4Event(eventName, customData);
    }

    // GTM Events
    if (activePixels.gtm.individual || activePixels.gtm.global) {
      smartLinkTrackingService.trackGTMEvent(eventName, customData);
    }

    if (logEvents) {
      console.log('[TRACKING] Custom event tracked:', eventName, customData);
    }
  };

  return {
    // État
    trackingInitialized,
    activePixels,
    
    // Fonctions de tracking
    trackPlatformClick,
    trackCustomEvent,
    
    // Utilitaires
    cleanup,
    
    // Méthodes de statut
    hasIndividualTracking: () => Object.values(activePixels).some(pixel => pixel.individual),
    hasGlobalTracking: () => Object.values(activePixels).some(pixel => pixel.global),
    getActivePixelsList: () => Object.entries(activePixels)
      .filter(([_, status]) => status.individual || status.global)
      .map(([name, status]) => ({
        name,
        mode: status.individual ? 'individual' : 'global'
      }))
  };
};

export default useSmartLinkTracking;