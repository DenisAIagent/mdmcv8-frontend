/**
 * 🍪 Page Cookies - Pour une navigation maîtrisée
 * Route SEO: /ressources/cookies
 */

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import './ResourcesPages.css';

const Cookies = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('cookies.meta_title', 'Politique des cookies - MDMC Music Ads')}</title>
        <meta name="description" content={t('cookies.meta_description', 'Politique d\'utilisation des cookies et gestion de vos préférences')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/cookies" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('cookies.title', 'Cookies — Pour une navigation maîtrisée')}</h1>
            <p className="resource-subtitle">{t('cookies.subtitle', 'Comment nous utilisons les cookies et comment les gérer')}</p>
          </div>

          <div className="cookies-content">
            <section className="cookies-intro">
              <p>{t('cookies.intro', 'Les cookies sont de petits fichiers texte stockés sur votre appareil pour améliorer votre expérience de navigation.')}</p>
            </section>

            <section className="cookies-section">
              <h2>{t('cookies.utilization_title', 'Utilisation')}</h2>
              <ul>
                <li>{t('cookies.utilization_1', 'Cookies essentiels')}</li>
                <li>{t('cookies.utilization_2', 'Analyse d\'audience (Plausible)')}</li>
                <li>{t('cookies.utilization_3', 'Publicité (Meta, Google)')}</li>
              </ul>
            </section>

            <section className="cookies-section">
              <h2>{t('cookies.types_title', 'Types de cookies utilisés')}</h2>
              
              <div className="cookie-type">
                <h3>{t('cookies.essential_title', 'Cookies essentiels')}</h3>
                <p>{t('cookies.essential_text', 'Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.')}</p>
                <ul>
                  <li>{t('cookies.essential_session', 'Gestion de session')}</li>
                  <li>{t('cookies.essential_preferences', 'Préférences de langue')}</li>
                  <li>{t('cookies.essential_security', 'Sécurité et authentification')}</li>
                </ul>
              </div>

              <div className="cookie-type">
                <h3>{t('cookies.analytics_title', 'Cookies analytiques')}</h3>
                <p>{t('cookies.analytics_text', 'Nous aident à comprendre comment vous utilisez notre site.')}</p>
                <ul>
                  <li>{t('cookies.analytics_plausible', 'Plausible Analytics (respectueux de la vie privée)')}</li>
                  <li>{t('cookies.analytics_performance', 'Mesure des performances')}</li>
                </ul>
              </div>

              <div className="cookie-type">
                <h3>{t('cookies.marketing_title', 'Cookies publicitaires')}</h3>
                <p>{t('cookies.marketing_text', 'Utilisés pour personnaliser les publicités et mesurer leur efficacité.')}</p>
                <ul>
                  <li>{t('cookies.marketing_meta', 'Meta Pixel (Facebook, Instagram)')}</li>
                  <li>{t('cookies.marketing_google', 'Google Ads et Google Analytics')}</li>
                  <li>{t('cookies.marketing_tiktok', 'TikTok Pixel')}</li>
                </ul>
              </div>
            </section>

            <section className="cookies-section">
              <h2>{t('cookies.duration_title', 'Durée')}</h2>
              <p>{t('cookies.duration_text', 'Max. 13 mois')}</p>
            </section>

            <section className="cookies-section">
              <h2>{t('cookies.consent_title', 'Consentement')}</h2>
              <p>{t('cookies.consent_text', 'Modifiable à tout moment via le bandeau ou sur demande à privacy@mdmcmusicads.com / contact@mdmcmusicads.com')}</p>
            </section>

            <section className="cookies-section">
              <h2>{t('cookies.management_title', 'Gestion des cookies')}</h2>
              <div className="cookie-management">
                <h4>{t('cookies.browser_settings_title', 'Paramètres de navigateur')}</h4>
                <p>{t('cookies.browser_settings_text', 'Vous pouvez configurer votre navigateur pour refuser les cookies :')}</p>
                <ul>
                  <li><strong>Chrome :</strong> {t('cookies.chrome_settings', 'Paramètres > Confidentialité et sécurité > Cookies')}</li>
                  <li><strong>Firefox :</strong> {t('cookies.firefox_settings', 'Paramètres > Vie privée et sécurité > Cookies')}</li>
                  <li><strong>Safari :</strong> {t('cookies.safari_settings', 'Préférences > Confidentialité > Cookies')}</li>
                </ul>
              </div>
            </section>

            <section className="cookies-section">
              <h2>{t('cookies.opt_out_title', 'Liens de désactivation')}</h2>
              <ul>
                <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">{t('cookies.opt_out_aboutads', 'Digital Advertising Alliance')}</a></li>
                <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">{t('cookies.opt_out_youronlinechoices', 'Your Online Choices')}</a></li>
                <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">{t('cookies.opt_out_google', 'Google Analytics Opt-out')}</a></li>
              </ul>
            </section>
          </div>

          <div className="resource-cta">
            <h3>{t('cookies.contact_title', 'Questions sur les cookies ?')}</h3>
            <p>{t('cookies.contact_text', 'Pour toute question concernant notre utilisation des cookies.')}</p>
            <a href="mailto:privacy@mdmcmusicads.com" className="resource-button">
              {t('cookies.contact_button', 'Nous contacter')}
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </HelmetProvider>
  );
};

export default Cookies;