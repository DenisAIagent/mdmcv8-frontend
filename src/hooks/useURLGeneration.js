/**
 * 🔗 Hook React pour la génération d'URLs et tracking
 * Intègre URLs propres, UTM params, QR codes et analytics
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import urlGeneratorService from '../services/urlGenerator.service';

/**
 * Hook principal pour la génération d'URLs
 */
export const useURLGeneration = (smartLinkData, options = {}) => {
  const [urls, setUrls] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [socialMetadata, setSocialMetadata] = useState(null);

  const {
    autoGenerate = true,
    format = 'artist',
    campaign = null,
    enableMultiChannel = true
  } = options;

  // Génération automatique des URLs
  useEffect(() => {
    if (autoGenerate && smartLinkData?.smartLink && smartLinkData?.artist) {
      generateURLs();
    }
  }, [smartLinkData, autoGenerate, format, campaign]);

  const generateURLs = useCallback(async () => {
    if (!smartLinkData?.smartLink || !smartLinkData?.artist) return;

    setIsGenerating(true);
    
    try {
      // URL principale
      const mainURL = urlGeneratorService.generateCleanURL(smartLinkData, {
        format,
        campaign,
        source: 'direct',
        medium: 'smartlink'
      });

      // URLs multi-canaux si activé
      let multiChannelURLs = {};
      if (enableMultiChannel) {
        multiChannelURLs = urlGeneratorService.generateMultiChannelURLs(smartLinkData, campaign);
      }

      // Métadonnées sociales
      const metadata = urlGeneratorService.generateSocialMetadata(smartLinkData, mainURL.url);

      setUrls({
        main: mainURL,
        channels: multiChannelURLs
      });
      
      setSocialMetadata(metadata);
    } catch (error) {
      console.error('Erreur génération URLs:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [smartLinkData, format, campaign, enableMultiChannel]);

  // Génération d'URL personnalisée
  const generateCustomURL = useCallback((customOptions = {}) => {
    if (!smartLinkData?.smartLink || !smartLinkData?.artist) return null;

    return urlGeneratorService.generateCleanURL(smartLinkData, {
      format,
      campaign,
      ...customOptions
    });
  }, [smartLinkData, format, campaign]);

  // Génération de QR code
  const generateQRCode = useCallback((url = null, qrOptions = {}) => {
    const targetUrl = url || urls.main?.url;
    if (!targetUrl) return null;

    return urlGeneratorService.generateQRCodeURL(targetUrl, qrOptions);
  }, [urls.main?.url]);

  // Tracking d'un clic
  const trackClick = useCallback((url, additionalData = {}) => {
    const analyticsData = urlGeneratorService.generateAnalyticsData(url, additionalData);
    
    // Envoyer à votre service d'analytics
    if (window.gtag) {
      window.gtag('event', 'smartlink_click', {
        'custom_parameter_url': url,
        'custom_parameter_utm_source': analyticsData.utm_params.utm_source,
        'custom_parameter_utm_medium': analyticsData.utm_params.utm_medium,
        'custom_parameter_utm_campaign': analyticsData.utm_params.utm_campaign
      });
    }

    return analyticsData;
  }, []);

  return {
    urls,
    socialMetadata,
    isGenerating,
    generateURLs,
    generateCustomURL,
    generateQRCode,
    trackClick,
    // Méthodes utilitaires
    copyToClipboard: (url) => navigator.clipboard?.writeText(url),
    getShortestURL: () => urls.main?.shortUrl || urls.main?.url,
    getQRCodeURL: () => urls.main?.qrCode
  };
};

/**
 * Hook pour le tracking avancé des clics
 */
export const useClickTracking = (smartLinkData) => {
  const [clickStats, setClickStats] = useState({
    total: 0,
    bySource: {},
    byMedium: {},
    recent: []
  });

  const trackClick = useCallback((url, platform = null, additionalData = {}) => {
    const analyticsData = urlGeneratorService.generateAnalyticsData(url, {
      platform,
      smartlink_id: smartLinkData?.smartLink?._id,
      artist_id: smartLinkData?.artist?._id,
      ...additionalData
    });

    // Mettre à jour les stats locales
    setClickStats(prev => ({
      total: prev.total + 1,
      bySource: {
        ...prev.bySource,
        [analyticsData.utm_params.utm_source]: (prev.bySource[analyticsData.utm_params.utm_source] || 0) + 1
      },
      byMedium: {
        ...prev.byMedium,
        [analyticsData.utm_params.utm_medium]: (prev.byMedium[analyticsData.utm_params.utm_medium] || 0) + 1
      },
      recent: [analyticsData, ...prev.recent.slice(0, 9)] // Garder les 10 derniers
    }));

    // Envoyer à l'API backend pour persistance
    fetch('/api/v1/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    }).catch(error => console.warn('Analytics tracking failed:', error));

    return analyticsData;
  }, [smartLinkData]);

  const getTopSources = useCallback((limit = 5) => {
    return Object.entries(clickStats.bySource)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([source, count]) => ({ source, count }));
  }, [clickStats.bySource]);

  const getTopMediums = useCallback((limit = 5) => {
    return Object.entries(clickStats.byMedium)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([medium, count]) => ({ medium, count }));
  }, [clickStats.byMedium]);

  return {
    clickStats,
    trackClick,
    getTopSources,
    getTopMediums,
    resetStats: () => setClickStats({ total: 0, bySource: {}, byMedium: {}, recent: [] })
  };
};

/**
 * Hook pour les paramètres UTM dans l'URL actuelle
 */
export const useUTMParams = () => {
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => {
    const currentUrl = window.location.href;
    const params = urlGeneratorService.parseUTMParams(currentUrl);
    setUtmParams(params);

    // Nettoyer l'URL des paramètres UTM après extraction (optionnel)
    if (Object.keys(params).length > 0) {
      const cleanUrl = urlGeneratorService.validateAndCleanURL(currentUrl);
      // window.history.replaceState({}, '', cleanUrl); // Décommenter si souhaité
    }
  }, []);

  return {
    utmParams,
    hasUTM: Object.keys(utmParams).length > 0,
    source: utmParams.utm_source,
    medium: utmParams.utm_medium,
    campaign: utmParams.utm_campaign,
    term: utmParams.utm_term,
    content: utmParams.utm_content
  };
};

/**
 * Hook pour la génération de QR codes
 */
export const useQRCode = (url, options = {}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    size = 200,
    format = 'png',
    errorCorrection = 'M',
    autoGenerate = true
  } = options;

  useEffect(() => {
    if (autoGenerate && url) {
      generateQRCode();
    }
  }, [url, autoGenerate, size, format, errorCorrection]);

  const generateQRCode = useCallback(async () => {
    if (!url) return;

    setIsGenerating(true);
    try {
      const qrUrl = urlGeneratorService.generateQRCodeURL(url, {
        size,
        format,
        errorCorrection
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Erreur génération QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [url, size, format, errorCorrection]);

  const downloadQRCode = useCallback(async (filename = 'qrcode') => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur téléchargement QR code:', error);
    }
  }, [qrCodeUrl, format]);

  return {
    qrCodeUrl,
    isGenerating,
    generateQRCode,
    downloadQRCode
  };
};

/**
 * Hook pour les métadonnées sociales
 */
export const useSocialMetadata = (smartLinkData, url = null) => {
  const metadata = useMemo(() => {
    if (!smartLinkData?.smartLink || !smartLinkData?.artist) return null;
    
    const targetUrl = url || window.location.href;
    return urlGeneratorService.generateSocialMetadata(smartLinkData, targetUrl);
  }, [smartLinkData, url]);

  const updateMetaTags = useCallback(() => {
    if (!metadata) return;

    // Mettre à jour les meta tags Open Graph
    Object.entries(metadata.og).forEach(([property, content]) => {
      if (content) {
        let tag = document.querySelector(`meta[property="og:${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', `og:${property}`);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      }
    });

    // Mettre à jour les meta tags Twitter
    Object.entries(metadata.twitter).forEach(([name, content]) => {
      if (content) {
        let tag = document.querySelector(`meta[name="twitter:${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', `twitter:${name}`);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      }
    });

    // Ajouter le JSON-LD
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (scriptTag) {
      scriptTag.textContent = JSON.stringify(metadata.jsonLd);
    } else {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.textContent = JSON.stringify(metadata.jsonLd);
      document.head.appendChild(scriptTag);
    }
  }, [metadata]);

  return {
    metadata,
    updateMetaTags
  };
};