/**
 * ⚖️ Page Mentions légales - Informations juridiques
 * Route SEO: /ressources/mentions-legales
 */

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import './ResourcesPages.css';

const MentionsLegales = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('mentions.meta_title', 'Mentions légales - MDMC Music Ads')}</title>
        <meta name="description" content={t('mentions.meta_description', 'Mentions légales et informations juridiques de MDMC Music Ads')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/mentions-legales" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('mentions.title', 'Mentions légales — Informations juridiques')}</h1>
            <p className="resource-subtitle">{t('mentions.subtitle', 'Informations légales et réglementaires')}</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2>{t('mentions.editor_title', 'Éditeur du site')}</h2>
              <div className="legal-info">
                <p><strong>MDMC OÜ</strong></p>
                <p>{t('mentions.address', 'Harju maakond, Tallinn, Lasnamäe linnaosa, Sepapaja tn 6, 15551 Tallinn — Estonie')}</p>
                <p>{t('mentions.vat', 'TVA : EE102477612')}</p>
                <p><a href="mailto:contact@mdmcmusicads.com">contact@mdmcmusicads.com</a></p>
              </div>
            </section>

            <section className="legal-section">
              <h2>{t('mentions.director_title', 'Directeur de publication')}</h2>
              <div className="legal-info">
                <p>{t('mentions.director_name', 'Denis Adam')}</p>
              </div>
            </section>

            <section className="legal-section">
              <h2>{t('mentions.hosting_title', 'Hébergeur')}</h2>
              <div className="legal-info">
                <p><strong>Railway</strong> (<a href="https://railway.app" target="_blank" rel="noopener noreferrer">https://railway.app</a>)</p>
                <p>{t('mentions.hosting_location', 'Serveurs localisés en Europe')}</p>
              </div>
            </section>

            <section className="legal-section">
              <h2>{t('mentions.development_title', 'Développement & design')}</h2>
              <div className="legal-info">
                <p>{t('mentions.development_team', 'Équipe fondatrice — MDMC')}</p>
              </div>
            </section>

            <section className="legal-section">
              <h2>{t('mentions.intellectual_property_title', 'Propriété intellectuelle')}</h2>
              <div className="legal-info">
                <p>{t('mentions.intellectual_property_text', 'L\'ensemble de ce site relève de la législation française et internationale sur le droit d\'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.')}</p>
              </div>
            </section>

            <section className="legal-section">
              <h2>{t('mentions.liability_title', 'Responsabilité')}</h2>
              <div className="legal-info">
                <p>{t('mentions.liability_text', 'Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l\'année, mais peut toutefois contenir des inexactitudes ou des omissions.')}</p>
              </div>
            </section>
          </div>

          <div className="resource-cta">
            <h3>{t('mentions.contact_title', 'Questions juridiques ?')}</h3>
            <p>{t('mentions.contact_text', 'Pour toute question relative aux mentions légales, contactez-nous.')}</p>
            <a href="mailto:contact@mdmcmusicads.com" className="resource-button">
              {t('mentions.contact_button', 'Nous contacter')}
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </HelmetProvider>
  );
};

export default MentionsLegales;