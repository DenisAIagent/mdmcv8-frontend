import { useEffect } from 'react';
import { updateMetaTagsForLanguage } from '../utils/multilingualMeta';

/**
 * Hook pour adapter les meta tags selon la source de partage social
 * Détecte les bots sociaux et adapte la langue
 */
export const useSocialMetaAdaptation = () => {
  useEffect(() => {
    // Cache la détection pour éviter les recalculs
    const cacheKey = 'mdmc_lang_detection';
    const cachedLang = localStorage.getItem(cacheKey);
    
    // Détecter si c'est un bot social qui accède à la page
    const userAgent = navigator.userAgent || '';
    const isSocialBot = /facebook|twitter|linkedinbot|whatsapp|telegram|discord|slack|bot|crawler|spider|facebookexternalhit|twitterbot/i.test(userAgent);
    
    if (isSocialBot) {
      console.log('Bot social détecté:', userAgent);
      
      // Détecter la langue depuis l'URL ou les headers
      const urlParams = new URLSearchParams(window.location.search);
      const langFromUrl = urlParams.get('lang');
      const browserLang = navigator.language?.substring(0, 2);
      
      // Priorité: URL > cache > navigateur > français par défaut
      const targetLang = langFromUrl || cachedLang || browserLang || 'fr';
      
      console.log(`Adaptation meta tags pour bot social en langue: ${targetLang}`);
      updateMetaTagsForLanguage(targetLang);
      
      // Sauvegarder en cache si pas déjà fait
      if (!cachedLang && targetLang) {
        localStorage.setItem(cacheKey, targetLang);
      }
    } else {
      // Pour les utilisateurs normaux, utiliser le cache ou détecter
      const browserLang = navigator.language?.substring(0, 2) || 'fr';
      const targetLang = cachedLang || browserLang;
      
      updateMetaTagsForLanguage(targetLang);
      
      // Sauvegarder en cache
      if (!cachedLang) {
        localStorage.setItem(cacheKey, targetLang);
      }
    }
  }, []);
  
  return null;
};

export default useSocialMetaAdaptation;