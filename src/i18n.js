// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Pas besoin de 'Backend' car on charge tout depuis les ressources locales

// Importer TOUTES les traductions depuis les fichiers JS locaux
import frTranslations from './locales/fr.js';
import enTranslations from './locales/en.js'; // Assurez-vous que ce fichier existe
import esTranslations from './locales/es.js'; // Assurez-vous que ce fichier existe
import ptTranslations from './locales/pt.js'; // Assurez-vous que ce fichier existe

i18n
  // Module react-i18next
  .use(initReactI18next)
  // Détection automatique de la langue
  .use(LanguageDetector)
  // Initialisation
  .init({
    // Ressources préchargées avec TOUTES les langues
    resources: {
      fr: { translation: frTranslations },
      en: { translation: enTranslations }, // Ajout EN
      es: { translation: esTranslations }, // Ajout ES
      pt: { translation: ptTranslations }  // Ajout PT
    },

    // Langue par défaut si la détection échoue ou si la langue n'est pas supportée
    fallbackLng: 'fr',

    // IMPORTANT: La ligne 'lng: 'fr',' DOIT rester commentée ou supprimée
    // pour que la détection automatique fonctionne (Option B).
    // lng: 'fr',

    // Détection de la langue
    detection: {
      // Ordre des méthodes de détection
      order: ['navigator', 'querystring', 'cookie', 'localStorage', 'htmlTag', 'path', 'subdomain'],
      // Cache la langue détectée
      caches: ['cookie', 'localStorage'],
      // Nom du cookie / localStorage
      lookupCookie: 'i18next_lng',
      lookupLocalStorage: 'i18nextLng',
      // Paramètre d'URL (?lang=...)
      lookupQuerystring: 'lang',
      // Optionnel: vérifier si la langue détectée est dans une liste restreinte
      // checkWhitelist: true,
      // whitelist: ['fr', 'en', 'es', 'pt']
    },

    // Permet l'utilisation de clés imbriquées (ex: nav.home)
    keySeparator: '.',

    // Namespace par défaut
    defaultNS: 'translation',

    // Interpolation
    interpolation: {
      escapeValue: false // React s'en charge déjà
    },

    // Debug (activé uniquement en développement)
    debug: process.env.NODE_ENV === 'development',

    // Réagir aux changements de langue
    react: {
      useSuspense: true,
    }
  });

// Fonction pour mettre à jour les balises meta (inchangée)
export const updateMetaTags = (t) => {
  try {
    document.title = t('meta_title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('meta_description'));
    }
    // ... (autres mises à jour meta si nécessaire, ex: OG, Twitter) ...
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('meta_title'));
    }
    if (ogDescription) {
      ogDescription.setAttribute('content', t('meta_description'));
    }
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', t('meta_title'));
    }
    if (twitterDescription) {
      twitterDescription.setAttribute('content', t('meta_description'));
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des meta tags:', error);
  }
};

// Écouteurs d'événements (inchangés, avec vérification)
i18n.on('initialized', () => {
  if (typeof i18n.t === 'function') {
    updateMetaTags(i18n.t.bind(i18n));
  }
});

i18n.on('languageChanged', (lng) => {
  if (typeof i18n.t === 'function') {
    updateMetaTags(i18n.t.bind(i18n));
  }
  // Optionnel: stocker la langue choisie par l'utilisateur si différent du détecté
  // if (i18n.services.languageDetector) {
  //   i18n.services.languageDetector.cacheUserLanguage(lng);
  // }
});

export default i18n;
