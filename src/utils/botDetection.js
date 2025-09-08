// src/utils/botDetection.js

import axios from 'axios';
import API_CONFIG from '../config/api.config.server.js';

/**
 * Détecte si l'User-Agent correspond à un bot de réseau social
 * @param {string} userAgent - L'User-Agent de la requête
 * @returns {object} - Objet avec détails de détection
 */
export const isSocialBot = (userAgent) => {
  if (!userAgent) {
    console.log('🔍 Bot Detection: No User-Agent provided');
    return { isBot: false, confidence: 0, detectedPlatform: null, userAgent: null };
  }
  
  const botPatterns = [
    // Facebook bots - Patterns précis
    { pattern: 'facebookexternalhit', platform: 'Facebook', confidence: 100 },
    { pattern: 'Facebot', platform: 'Facebook', confidence: 95 },
    { pattern: 'facebook-scraper', platform: 'Facebook', confidence: 90 },
    
    // Twitter/X bots - Patterns spécifiques
    { pattern: 'Twitterbot', platform: 'Twitter', confidence: 100 },
    { pattern: 'twitter-cards-processor', platform: 'Twitter', confidence: 95 },
    
    // LinkedIn bot
    { pattern: 'LinkedInBot', platform: 'LinkedIn', confidence: 100 },
    { pattern: 'linkedin', platform: 'LinkedIn', confidence: 70 },
    
    // WhatsApp
    { pattern: 'WhatsApp', platform: 'WhatsApp', confidence: 100 },
    { pattern: 'whatsapp', platform: 'WhatsApp', confidence: 85 },
    
    // Telegram
    { pattern: 'TelegramBot', platform: 'Telegram', confidence: 100 },
    { pattern: 'telegram', platform: 'Telegram', confidence: 80 },
    
    // Discord
    { pattern: 'Discordbot', platform: 'Discord', confidence: 100 },
    { pattern: 'discord', platform: 'Discord', confidence: 75 },
    
    // Slack
    { pattern: 'Slackbot', platform: 'Slack', confidence: 100 },
    { pattern: 'slack', platform: 'Slack', confidence: 80 },
    
    // Autres bots de partage
    { pattern: 'MessengerBot', platform: 'Messenger', confidence: 95 },
    { pattern: 'SkypeUriPreview', platform: 'Skype', confidence: 95 },
    { pattern: 'ViberBot', platform: 'Viber', confidence: 95 },
    { pattern: 'Signal-Desktop', platform: 'Signal', confidence: 90 },
    
    // Bots génériques avec confiance moindre
    { pattern: 'bot', platform: 'Generic Bot', confidence: 60 },
    { pattern: 'crawler', platform: 'Crawler', confidence: 50 },
    { pattern: 'spider', platform: 'Spider', confidence: 50 },
    { pattern: 'scraper', platform: 'Scraper', confidence: 45 }
  ];
  
  const lowerUserAgent = userAgent.toLowerCase();
  
  // Chercher la meilleure correspondance
  let bestMatch = null;
  let highestConfidence = 0;
  
  for (const { pattern, platform, confidence } of botPatterns) {
    if (lowerUserAgent.includes(pattern.toLowerCase())) {
      if (confidence > highestConfidence) {
        bestMatch = { pattern, platform, confidence };
        highestConfidence = confidence;
      }
    }
  }
  
  const isBot = highestConfidence >= 60; // Seuil de confiance
  
  const result = {
    isBot,
    confidence: highestConfidence,
    detectedPlatform: bestMatch?.platform || null,
    matchedPattern: bestMatch?.pattern || null,
    userAgent: userAgent.substring(0, 200), // Limiter la longueur pour les logs
    timestamp: new Date().toISOString()
  };
  
  // Logs détaillés pour debug
  console.log(`🤖 Bot Detection Result:`, {
    ...result,
    analysis: isBot ? 'SOCIAL BOT DETECTED' : 'HUMAN USER',
    reason: bestMatch ? `Matched pattern: ${bestMatch.pattern}` : 'No bot patterns matched'
  });
  
  return result;
};

/**
 * Récupère les données d'un SmartLink depuis l'API backend avec fallbacks robustes
 * @param {string} artistSlug - Le slug de l'artiste
 * @param {string} trackSlug - Le slug du track
 * @returns {Promise<Object|null>} - Les données du SmartLink ou null en cas d'erreur
 */
export const fetchSmartLinkData = async (artistSlug, trackSlug) => {
  const startTime = Date.now();
  console.log(`🔍 Starting SmartLink data fetch for: ${artistSlug}/${trackSlug}`);
  
  try {
    // Configuration timeout spécifique pour les bots (5 secondes max)
    const axiosConfig = {
      timeout: 5000,
      headers: {
        'User-Agent': 'MDMC-Bot-Middleware/1.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        ...API_CONFIG.DEFAULT_HEADERS
      }
    };
    
    // URLs de fallback à essayer dans l'ordre
    const apiUrls = [
      `${API_CONFIG.BASE_URL}/smartlinks/${artistSlug}/${trackSlug}`,
      `https://api.mdmcmusicads.com/api/v1/smartlinks/${artistSlug}/${trackSlug}`,
      `https://mdmcv4-backend-production-b615.up.railway.app/api/v1/smartlinks/${artistSlug}/${trackSlug}`
    ];
    
    let lastError = null;
    
    for (let i = 0; i < apiUrls.length; i++) {
      const url = apiUrls[i];
      const attemptStart = Date.now();
      
      try {
        console.log(`🚀 Attempt ${i + 1}/${apiUrls.length}: ${url}`);
        
        const response = await axios.get(url, axiosConfig);
        const responseTime = Date.now() - attemptStart;
        
        console.log(`⚡ API Response (${responseTime}ms):`, {
          status: response.status,
          dataSize: JSON.stringify(response.data).length,
          hasSuccess: !!response.data?.success,
          hasData: !!response.data?.data
        });
        
        if (response.data && response.data.success && response.data.data) {
          const smartlink = response.data.data;
          const totalTime = Date.now() - startTime;
          
          // Traitement robuste des données avec fallbacks
          const processedData = {
            trackTitle: smartlink.trackTitle || smartlink.title || smartlink.name || `Track ${trackSlug}`,
            artistName: smartlink.artistName || smartlink.artist?.name || smartlink.artist || `Artist ${artistSlug}`,
            coverImageUrl: smartlink.coverImageUrl || smartlink.artwork || smartlink.image || null,
            description: smartlink.description || smartlink.customDescription || `Écoutez ${smartlink.trackTitle || smartlink.title || trackSlug} de ${smartlink.artistName || smartlink.artist?.name || artistSlug} sur toutes les plateformes de streaming`,
            platforms: smartlink.platforms || smartlink.platformLinks || [],
            customTitle: smartlink.customTitle || null,
            customDescription: smartlink.customDescription || null,
            smartLinkId: smartlink._id || smartlink.id || null,
            isPublic: smartlink.isPublic !== false, // Default to true
            createdAt: smartlink.createdAt || null
          };
          
          console.log(`✅ SmartLink data successfully retrieved (${totalTime}ms total):`, {
            trackTitle: processedData.trackTitle,
            artistName: processedData.artistName,
            hasCoverImage: !!processedData.coverImageUrl,
            platformCount: processedData.platforms.length,
            apiUrl: url,
            attempt: i + 1
          });
          
          return processedData;
        } else {
          console.warn(`⚠️ API returned success=false or no data:`, response.data);
          lastError = new Error(`API returned invalid response structure`);
        }
        
      } catch (apiError) {
        const responseTime = Date.now() - attemptStart;
        lastError = apiError;
        
        console.warn(`❌ API attempt ${i + 1} failed (${responseTime}ms):`, {
          url,
          error: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          isTimeout: apiError.code === 'ECONNABORTED',
          isNetworkError: !apiError.response
        });
        
        // Si ce n'est pas la dernière tentative, continuer
        if (i < apiUrls.length - 1) {
          console.log(`⏳ Trying next API endpoint...`);
          continue;
        }
      }
    }
    
    // Toutes les tentatives ont échoué
    const totalTime = Date.now() - startTime;
    console.error(`❌ All API attempts failed (${totalTime}ms total):`, {
      artistSlug,
      trackSlug,
      lastError: lastError?.message,
      attemptsCount: apiUrls.length
    });
    
    return null;
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Unexpected error in fetchSmartLinkData (${totalTime}ms):`, {
      artistSlug,
      trackSlug,
      error: error.message,
      stack: error.stack?.split('\n')[0] // Premier ligne de la stack pour debug
    });
    
    return null;
  }
};

/**
 * Validation stricte de l'URL d'image Odesli
 * @param {string} imageUrl - L'URL de l'image à valider
 * @returns {Promise<boolean>} - True si l'image est accessible
 */
const validateImageUrl = async (imageUrl) => {
  if (!imageUrl) return false;
  
  try {
    console.log('🔍 Validation image URL:', imageUrl);
    const response = await fetch(imageUrl, { method: 'HEAD', timeout: 3000 });
    const isValid = response.ok && response.headers.get('content-type')?.startsWith('image/');
    console.log('📸 Image validation:', { url: imageUrl, valid: isValid, status: response.status });
    return isValid;
  } catch (error) {
    console.log('❌ Image inaccessible:', imageUrl, error.message);
    return false;
  }
};

/**
 * Génère les meta tags SEULEMENT avec les vraies données Odesli - AUCUN FALLBACK
 * @param {Object} smartlinkData - Les données du SmartLink
 * @param {string} currentUrl - L'URL actuelle de la page
 * @param {Object} options - Options pour la génération
 * @returns {string} - Les meta tags HTML ou chaîne vide si données insuffisantes
 */
export const generateSocialMetaTags = (smartlinkData, currentUrl, options = {}) => {
  const { artistSlug, trackSlug } = options;
  
  console.log(`🏷️ STRICT Meta tags generation (NO FALLBACKS):`, {
    hasSmartlinkData: !!smartlinkData,
    currentUrl,
    artistSlug,
    trackSlug
  });
  
  // VÉRIFICATION STRICTE - Pas de fallback si données manquantes
  if (!smartlinkData) {
    console.log(`❌ NO SmartLink data - NO meta tags generated`);
    return '';
  }
  
  const {
    trackTitle,
    artistName,
    coverImageUrl,
    description,
    customTitle,
    customDescription
  } = smartlinkData;
  
  // VÉRIFICATION STRICTE - Toutes les données critiques doivent être présentes
  if (!coverImageUrl || !trackTitle || !artistName) {
    console.log(`❌ INCOMPLETE data - NO meta tags generated:`, {
      hasImage: !!coverImageUrl,
      hasTitle: !!trackTitle,
      hasArtist: !!artistName,
      imageUrl: coverImageUrl
    });
    return '';
  }
  
  // Construction SEULEMENT avec vraies données
  const title = customTitle || `${trackTitle} - ${artistName}`;
  const desc = customDescription || 
               description ||
               `Écoutez ${trackTitle} de ${artistName} sur toutes les plateformes de streaming`;
  
  console.log(`✅ REAL data meta tags generation:`, {
    title: title.substring(0, 50) + '...',
    description: desc.substring(0, 80) + '...',
    imageUrl: coverImageUrl,
    source: 'odesli_api'
  });
  
  return `
    <!-- Open Graph / Facebook - REAL DATA ONLY -->
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${escapeHtml(currentUrl)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${escapeHtml(coverImageUrl)}">
    <meta property="og:image:secure_url" content="${escapeHtml(coverImageUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:site_name" content="MDMC SmartLinks">
    <meta property="og:locale" content="fr_FR">
    
    <!-- Twitter - REAL DATA ONLY -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${escapeHtml(currentUrl)}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(desc)}">
    <meta name="twitter:image" content="${escapeHtml(coverImageUrl)}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:site" content="@MDMCMusicAds">
    <meta name="twitter:creator" content="@MDMCMusicAds">
    
    <!-- Music specific meta - REAL DATA ONLY -->
    <meta property="music:song" content="${escapeHtml(trackTitle)}">
    <meta property="music:musician" content="${escapeHtml(artistName)}">
    <meta property="music:creator" content="MDMC Music Ads">
    
    <!-- LinkedIn - REAL DATA ONLY -->
    <meta property="article:author" content="MDMC Music Ads">
    <meta property="article:publisher" content="MDMC Music Ads">
    
    <!-- WhatsApp / Telegram - REAL DATA ONLY -->
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    
    <!-- General meta - REAL DATA ONLY -->
    <meta name="description" content="${escapeHtml(desc)}">
    <meta name="keywords" content="musique, streaming, ${escapeHtml(artistName)}, ${escapeHtml(trackTitle)}, smartlink, MDMC">
    <meta name="author" content="MDMC Music Ads">
    <meta name="robots" content="index, follow">
    
    <!-- Dublin Core - REAL DATA ONLY -->
    <meta name="DC.title" content="${escapeHtml(title)}">
    <meta name="DC.description" content="${escapeHtml(desc)}">
    <meta name="DC.creator" content="MDMC Music Ads">
    <meta name="DC.subject" content="Musique, Streaming">
  `;
};

/**
 * SUPPRIMÉ - Plus de fonction de fallback
 * Si les données réelles ne sont pas disponibles, aucun meta tag n'est généré
 */

/**
 * Échappe les caractères HTML dangereux
 * @param {string} unsafe - Le texte à sécuriser
 * @returns {string} - Le texte sécurisé
 */
export const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Injecte les meta tags dans le HTML
 * @param {string} html - Le HTML original
 * @param {string} metaTags - Les meta tags à injecter
 * @returns {string} - Le HTML modifié
 */
export const injectMetaTags = (html, metaTags) => {
  // Supprimer les anciens meta tags Open Graph et Twitter
  let modifiedHtml = html
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+property="music:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="keywords"[^>]*>/gi, '');
  
  // Injecter les nouveaux meta tags dans le <head>
  const headCloseIndex = modifiedHtml.indexOf('</head>');
  if (headCloseIndex !== -1) {
    modifiedHtml = 
      modifiedHtml.slice(0, headCloseIndex) +
      metaTags +
      modifiedHtml.slice(headCloseIndex);
  }
  
  return modifiedHtml;
};