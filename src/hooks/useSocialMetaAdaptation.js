import { useEffect } from 'react';
import { updateMetaTagsForLanguage } from '../utils/multilingualMeta';

/**
 * Hook pour adapter les meta tags selon la source de partage social
 * Détecte les bots sociaux et adapte la langue
 */
export const useSocialMetaAdaptation = () => {
  useEffect(() => {
    // Détecter si c'est un bot social qui accède à la page
    const userAgent = navigator.userAgent || '';
    const isSocialBot = /facebook|twitter|linkedinbot|whatsapp|telegram|discord|slack|bot|crawler|spider|facebookexternalhit|twitterbot/i.test(userAgent);
    
    if (isSocialBot) {
      console.log('🤖 Bot social détecté:', userAgent);
      
      // Détecter la langue depuis l'URL ou les headers
      const urlParams = new URLSearchParams(window.location.search);
      const langFromUrl = urlParams.get('lang');
      const browserLang = navigator.language?.substring(0, 2);
      
      // Priorité: URL > navigateur > français par défaut
      const targetLang = langFromUrl || browserLang || 'fr';
      
      console.log(`🌍 Adaptation meta tags pour bot social en langue: ${targetLang}`);
      updateMetaTagsForLanguage(targetLang);
    } else {
      // Pour les utilisateurs normaux, utiliser la langue du navigateur
      const browserLang = navigator.language?.substring(0, 2) || 'fr';
      updateMetaTagsForLanguage(browserLang);
    }
  }, []);
  
  return null;
};

export default useSocialMetaAdaptation;