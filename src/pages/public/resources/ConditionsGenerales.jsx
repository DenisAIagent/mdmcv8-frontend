/**
 * 📄 Page Conditions générales - Ce qui encadre nos services
 * Route SEO: /ressources/conditions-generales
 */

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import './ResourcesPages.css';

const ConditionsGenerales = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('cgu.meta_title', 'Conditions générales - MDMC Music Ads')}</title>
        <meta name="description" content={t('cgu.meta_description', 'Conditions générales d\'utilisation des services MDMC Music Ads')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/conditions-generales" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('cgu.title', 'Conditions générales — Ce qui encadre nos services')}</h1>
            <p className="resource-subtitle">{t('cgu.subtitle', 'Conditions d\'utilisation de nos services et du site web')}</p>
          </div>

          <div className="cgu-content">
            <section className="cgu-section">
              <h2>{t('cgu.article_1_title', '1. Objet')}</h2>
              <p>{t('cgu.article_1_text', 'Ces CGU définissent les règles d\'utilisation du site et des services MDMC.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_2_title', '2. Services')}</h2>
              <p>{t('cgu.article_2_text', 'Conseil, stratégie publicitaire, consulting, analyse de performance.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_3_title', '3. Commande')}</h2>
              <p>{t('cgu.article_3_text', 'Toute commande fait l\'objet d\'un devis ou accord écrit. Le paiement valide le lancement.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_4_title', '4. Paiement')}</h2>
              <p>{t('cgu.article_4_text', 'Le paiement est dû en amont. Aucun remboursement une fois la campagne lancée, sauf erreur avérée.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_5_title', '5. Propriété')}</h2>
              <p>{t('cgu.article_5_text', 'Tous les éléments livrés restent la propriété de MDMC, sauf mention contractuelle.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_6_title', '6. Responsabilité')}</h2>
              <p>{t('cgu.article_6_text', 'MDMC s\'engage à mettre en œuvre tous les moyens nécessaires pour atteindre les objectifs convenus, sans garantie de résultat.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_7_title', '7. Données personnelles')}</h2>
              <p>{t('cgu.article_7_text', 'Le traitement des données personnelles est régi par notre politique de confidentialité.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_8_title', '8. Résiliation')}</h2>
              <p>{t('cgu.article_8_text', 'Chaque partie peut résilier le contrat avec un préavis de 30 jours, sous réserve du respect des engagements en cours.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_9_title', '9. Litige')}</h2>
              <p>{t('cgu.article_9_text', 'À défaut d\'accord amiable, juridiction compétente : Estonie.')}</p>
            </section>

            <section className="cgu-section">
              <h2>{t('cgu.article_10_title', '10. Modification des CGU')}</h2>
              <p>{t('cgu.article_10_text', 'Ces conditions peuvent être modifiées à tout moment. Les nouvelles conditions s\'appliquent dès leur publication.')}</p>
            </section>

            <section className="cgu-contact">
              <h2>{t('cgu.contact_title', 'Contact')}</h2>
              <p><a href="mailto:contact@mdmcmusicads.com">contact@mdmcmusicads.com</a></p>
            </section>
          </div>

          <div className="resource-cta">
            <h3>{t('cgu.questions_title', 'Questions sur nos conditions ?')}</h3>
            <p>{t('cgu.questions_text', 'Notre équipe juridique peut clarifier tous les points de nos conditions générales.')}</p>
            <a href="mailto:contact@mdmcmusicads.com" className="resource-button">
              {t('cgu.questions_button', 'Poser une question')}
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </HelmetProvider>
  );
};

export default ConditionsGenerales;