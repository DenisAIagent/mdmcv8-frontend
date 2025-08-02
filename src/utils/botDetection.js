// src/utils/botDetection.js

import axios from 'axios';
import API_CONFIG from '../config/api.config.server.js';

/**
 * Détecte si l'User-Agent correspond à un bot de réseau social
 * @param {string} userAgent - L'User-Agent de la requête
 * @returns {boolean} - True si c'est un bot social
 */
export const isSocialBot = (userAgent) => {
  if (!userAgent) return false;
  
  const botPatterns = [
    // Facebook bots
    'facebookexternalhit',
    'Facebot',
    'facebook',
    
    // Twitter/X bots
    'Twitterbot',
    'twitterbot',
    'twitter',
    
    // LinkedIn bot
    'LinkedInBot',
    'linkedinbot',
    
    // WhatsApp
    'WhatsApp',
    'whatsapp',
    
    // Telegram
    'TelegramBot',
    'telegram',
    
    // Discord
    'Discordbot',
    'discord',
    
    // Slack
    'Slackbot',
    'slack',
    
    // Autres bots génériques
    'bot',
    'crawler',
    'spider',
    'scraper'
  ];
  
  const lowerUserAgent = userAgent.toLowerCase();
  return botPatterns.some(pattern => lowerUserAgent.includes(pattern.toLowerCase()));
};

/**
 * Récupère les données d'un SmartLink depuis l'API backend
 * @param {string} artistSlug - Le slug de l'artiste
 * @param {string} trackSlug - Le slug du track
 * @returns {Promise<Object|null>} - Les données du SmartLink ou null en cas d'erreur
 */
export const fetchSmartLinkData = async (artistSlug, trackSlug) => {
  try {
    console.log(`🔍 Fetching SmartLink data for: ${artistSlug}/${trackSlug}`);
    
    // Configuration timeout spécifique pour les bots (5 secondes max)
    const axiosConfig = {
      timeout: 5000,
      headers: {
        'User-Agent': 'MDMC-Bot-Middleware/1.0',
        ...API_CONFIG.DEFAULT_HEADERS
      }
    };
    
    // Tentative sur l'endpoint principal
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/smartlinks/${artistSlug}/${trackSlug}`,
      axiosConfig
    );
    
    if (response.data && response.data.success) {
      const smartlink = response.data.data;
      
      return {
        trackTitle: smartlink.trackTitle || smartlink.title || 'Track',
        artistName: smartlink.artistName || smartlink.artist?.name || 'Artist',
        coverImageUrl: smartlink.coverImageUrl || smartlink.artwork || null,
        description: smartlink.description || `Écouter ${smartlink.trackTitle || 'cette track'} de ${smartlink.artistName || 'cet artiste'} sur toutes les plateformes de streaming`,
        platforms: smartlink.platforms || [],
        customTitle: smartlink.customTitle || null,
        customDescription: smartlink.customDescription || null
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Error fetching SmartLink data:', {
      artistSlug,
      trackSlug,
      error: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    
    return null;
  }
};

/**
 * Génère les meta tags pour le partage social
 * @param {Object} smartlinkData - Les données du SmartLink
 * @param {string} currentUrl - L'URL actuelle de la page
 * @returns {string} - Les meta tags HTML
 */
export const generateSocialMetaTags = (smartlinkData, currentUrl) => {
  if (!smartlinkData) {
    return generateFallbackMetaTags(currentUrl);
  }
  
  const {
    trackTitle,
    artistName,
    coverImageUrl,
    description,
    customTitle,
    customDescription
  } = smartlinkData;
  
  const title = customTitle || `${trackTitle} - ${artistName}`;
  const desc = customDescription || description;
  const image = coverImageUrl || 'https://mdmcmusicads.com/og-image.jpg';
  
  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="MDMC SmartLinks">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${currentUrl}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(desc)}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:site" content="@MDMCMusicAds">
    
    <!-- Music specific meta -->
    <meta property="music:musician" content="${escapeHtml(artistName)}">
    <meta property="music:song" content="${escapeHtml(trackTitle)}">
    
    <!-- General meta -->
    <meta name="description" content="${escapeHtml(desc)}">
    <meta name="keywords" content="musique, streaming, ${escapeHtml(artistName)}, ${escapeHtml(trackTitle)}, smartlink">
  `;
};

/**
 * Génère les meta tags de fallback en cas d'erreur
 * @param {string} currentUrl - L'URL actuelle
 * @returns {string} - Les meta tags HTML de fallback
 */
export const generateFallbackMetaTags = (currentUrl) => {
  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:title" content="MDMC Music Ads - SmartLinks">
    <meta property="og:description" content="Découvrez cette musique sur toutes les plateformes de streaming avec MDMC SmartLinks">
    <meta property="og:image" content="https://mdmcmusicads.com/og-image.jpg">
    <meta property="og:site_name" content="MDMC SmartLinks">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${currentUrl}">
    <meta name="twitter:title" content="MDMC Music Ads - SmartLinks">
    <meta name="twitter:description" content="Découvrez cette musique sur toutes les plateformes de streaming">
    <meta name="twitter:image" content="https://mdmcmusicads.com/og-image.jpg">
    <meta name="twitter:site" content="@MDMCMusicAds">
  `;
};

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