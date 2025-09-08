/**
 * 🔐 Page Politique de confidentialité - Vos données, notre responsabilité
 * Route SEO: /ressources/politique-confidentialite
 */

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import './ResourcesPages.css';

const PolitiqueConfidentialite = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('privacy.meta_title', 'Politique de confidentialité - MDMC Music Ads')}</title>
        <meta name="description" content={t('privacy.meta_description', 'Politique de confidentialité et protection des données personnelles MDMC Music Ads')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/politique-confidentialite" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('privacy.title', 'Politique de confidentialité — Vos données, notre responsabilité')}</h1>
            <p className="resource-subtitle">{t('privacy.subtitle', 'Comment nous collectons, utilisons et protégeons vos données')}</p>
          </div>

          <div className="privacy-content">
            <section className="privacy-intro">
              <p>{t('privacy.intro', 'Nous attachons une importance primordiale à la sécurité et à la confidentialité de vos données.')}</p>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.data_collected_title', 'Données collectées')}</h2>
              <ul>
                <li>{t('privacy.data_collected_1', 'Email, nom, société')}</li>
                <li>{t('privacy.data_collected_2', 'Données de navigation')}</li>
                <li>{t('privacy.data_collected_3', 'Objectifs et résultats de campagnes')}</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.purposes_title', 'Finalités')}</h2>
              <ul>
                <li>{t('privacy.purposes_1', 'Optimisation de votre expérience')}</li>
                <li>{t('privacy.purposes_2', 'Suivi de projet')}</li>
                <li>{t('privacy.purposes_3', 'Obligations contractuelles')}</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.storage_title', 'Stockage & sécurité')}</h2>
              <p>{t('privacy.storage_text', 'Serveurs conformes au RGPD, localisés en Europe.')}</p>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.sharing_title', 'Partage des données')}</h2>
              <p>{t('privacy.sharing_text', 'Uniquement avec nos partenaires techniques dans le cadre des campagnes (ex : Google Ads). Aucune revente.')}</p>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.rights_title', 'Droits des utilisateurs')}</h2>
              <p>{t('privacy.rights_text', 'Accès, modification ou suppression via privacy@mdmcmusicads.com ou contact@mdmcmusicads.com')}</p>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.cookies_title', 'Cookies et technologies similaires')}</h2>
              <p>{t('privacy.cookies_text', 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences à tout moment.')}</p>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.retention_title', 'Durée de conservation')}</h2>
              <p>{t('privacy.retention_text', 'Vos données sont conservées le temps nécessaire aux finalités pour lesquelles elles ont été collectées, conformément à la réglementation en vigueur.')}</p>
            </section>

            <section className="privacy-section">
              <h2>{t('privacy.updates_title', 'Modifications de cette politique')}</h2>
              <p>{t('privacy.updates_text', 'Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif.')}</p>
            </section>
          </div>

          <div className="resource-cta">
            <h3>{t('privacy.contact_title', 'Questions sur vos données ?')}</h3>
            <p>{t('privacy.contact_text', 'Pour exercer vos droits ou pour toute question relative à la confidentialité.')}</p>
            <a href="mailto:privacy@mdmcmusicads.com" className="resource-button">
              {t('privacy.contact_button', 'Contacter notre DPO')}
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </HelmetProvider>
  );
};

export default PolitiqueConfidentialite;