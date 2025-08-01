/**
 * Configuration multilingue des meta tags pour partage sur réseaux sociaux
 * Selon la langue du navigateur/partage: EN, FR, ES, PT
 */

export const multilingualMeta = {
  fr: {
    title: "Marketing Musical | YouTube Ads & Meta Ads pour Artistes | MDMC",
    description: "Agence N°1 marketing musical : +500 artistes accompagnés, +50M vues générées. YouTube Ads, Meta Ads, TikTok Pro. Résultats garantis pour artistes et labels. Devis gratuit.",
    locale: "fr_FR"
  },
  en: {
    title: "Music Marketing | YouTube Ads & Meta Ads for Artists | MDMC",
    description: "Top music marketing agency: +500 artists supported, +50M views generated. YouTube Ads, Meta Ads, TikTok Pro. Guaranteed results for artists and labels. Free quote.",
    locale: "en_US"
  },
  es: {
    title: "Marketing Musical | YouTube Ads y Meta Ads para Artistas | MDMC",
    description: "Agencia N°1 marketing musical: +500 artistas acompañados, +50M visualizaciones generadas. YouTube Ads, Meta Ads, TikTok Pro. Resultados garantizados para artistas y sellos. Presupuesto gratis.",
    locale: "es_ES"
  },
  pt: {
    title: "Marketing Musical | YouTube Ads e Meta Ads para Artistas | MDMC",
    description: "Agência N°1 marketing musical: +500 artistas acompanhados, +50M visualizações geradas. YouTube Ads, Meta Ads, TikTok Pro. Resultados garantidos para artistas e gravadoras. Orçamento grátis.",
    locale: "pt_PT"
  }
};

/**
 * Détecte la langue du navigateur et retourne les meta tags appropriés
 */
export const getMetaForLanguage = (language = null) => {
  // Utiliser la langue passée en paramètre ou détecter automatiquement
  const detectedLang = language || navigator.language?.substring(0, 2) || 'fr';
  
  // Langues supportées
  const supportedLangs = ['fr', 'en', 'es', 'pt'];
  const lang = supportedLangs.includes(detectedLang) ? detectedLang : 'fr';
  
  return multilingualMeta[lang];
};

/**
 * Met à jour les meta tags du document selon la langue
 */
export const updateMetaTagsForLanguage = (language = null) => {
  const meta = getMetaForLanguage(language);
  
  // Mettre à jour le titre
  document.title = meta.title;
  
  // Mettre à jour les meta descriptions
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', meta.description);
  }
  
  // Mettre à jour Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', meta.title);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', meta.description);
  }
  
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', meta.locale);
  }
  
  // Mettre à jour Twitter Cards
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', meta.title);
  }
  
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', meta.description);
  }
  
  // Mettre à jour l'attribut lang du HTML
  document.documentElement.setAttribute('lang', language || 'fr');
  
  console.log(`Meta tags mis à jour pour la langue: ${language || 'auto-détectée'} (${lang})`);
  
  return meta;
};