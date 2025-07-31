/**
 * 📋 Contenu pour la modal légale
 * Composants de contenu sans Header/Footer pour affichage modal
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

export const FAQContent = () => {
  const { t } = useTranslation();

  return (
    <div className="faq-content">
      <div className="faq-item">
        <h2>{t('faq.question_1', '1. Qui êtes-vous ?')}</h2>
        <div className="faq-answer">
          <p>{t('faq.answer_1_p1', 'Nous sommes MDMC Music Ads, une agence indépendante fondée en 2018 par un ancien salarié de Google, également ex-attaché de presse musique en France.')}</p>
          <p>{t('faq.answer_1_p2', 'Notre ADN repose sur la jonction entre la culture musicale et la maîtrise avancée des outils publicitaires numériques. Depuis plus de 6 ans, nous accompagnons des artistes, labels, festivals, agences et porteurs de projets créatifs en France, en Europe et en Amérique du Nord.')}</p>
          <p>{t('faq.answer_1_p3', 'Nos campagnes s\'appuient sur :')}</p>
          <ul>
            <li>{t('faq.answer_1_li1', 'une expertise technique pointue en YouTube Ads, Meta, TikTok & tracking,')}</li>
            <li>{t('faq.answer_1_li2', 'une compréhension fine des enjeux artistiques, culturels et commerciaux,')}</li>
            <li>{t('faq.answer_1_li3', 'une culture du résultat : notoriété, abonnés, vues ciblées, engagement et ventes.')}</li>
          </ul>
          <p>{t('faq.answer_1_p4', 'Nous plaçons l\'humain, la transparence et l\'impact au cœur de chaque collaboration. Chaque campagne est conçue comme un levier de croissance réelle et durable pour les artistes et structures que nous accompagnons.')}</p>
        </div>
      </div>

      <div className="faq-item">
        <h2>{t('faq.question_2', '2. Quels services proposez-vous ?')}</h2>
        <div className="faq-answer">
          <p>{t('faq.answer_2', 'Campagnes YouTube Ads, Meta, TikTok, analyse de données et consulting stratégique.')}</p>
        </div>
      </div>

      <div className="faq-item">
        <h2>{t('faq.question_3', '3. Combien coûte une campagne ?')}</h2>
        <div className="faq-answer">
          <p>{t('faq.answer_3', 'Le coût dépend de vos objectifs, de la durée de la campagne et du budget média souhaité. Utilisez notre simulateur pour obtenir une estimation personnalisée.')}</p>
        </div>
      </div>

      <div className="faq-item">
        <h2>{t('faq.question_4', '4. Comment puis-je mesurer les résultats ?')}</h2>
        <div className="faq-answer">
          <p>{t('faq.answer_4', 'Vous avez accès à un tableau de bord complet, incluant vues, abonnés, conversions, ROAS, etc. Des bilans peuvent être fournis à chaque étape.')}</p>
        </div>
      </div>

      <div className="faq-item">
        <h2>{t('faq.question_5', '5. Travaillez-vous avec tous les styles musicaux ?')}</h2>
        <div className="faq-answer">
          <p>{t('faq.answer_5', 'Oui. Du hip-hop à la musique classique, nous adaptons nos campagnes à chaque univers artistique.')}</p>
        </div>
      </div>

      <div className="faq-item">
        <h2>{t('faq.question_6', '6. Est-ce que vous garantissez les résultats ?')}</h2>
        <div className="faq-answer">
          <p>{t('faq.answer_6', 'Non. Nous garantissons une méthode éprouvée et une optimisation continue, mais les résultats dépendent aussi de votre contenu, ciblage et budget.')}</p>
        </div>
      </div>
    </div>
  );
};

export const GlossaireContent = () => {
  const { t } = useTranslation();

  return (
    <div className="glossaire-content">
      <div className="glossaire-item">
        <h3>{t('glossaire.term_cpv', 'CPV (Coût par Vue)')}</h3>
        <p>{t('glossaire.def_cpv', 'Montant payé chaque fois qu\'un internaute visionne votre vidéo sponsorisée.')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_roas', 'ROAS (Return On Ad Spend)')}</h3>
        <p>{t('glossaire.def_roas', 'Retour sur investissement publicitaire.')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_smartlink', 'SmartLink')}</h3>
        <p>{t('glossaire.def_smartlink', 'Lien unique regroupant vos plateformes de streaming, réseaux et boutique.')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_lookalike', 'Lookalike Audience')}</h3>
        <p>{t('glossaire.def_lookalike', 'Audience similaire à la vôtre, générée automatiquement.')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_ab_testing', 'A/B Testing')}</h3>
        <p>{t('glossaire.def_ab_testing', 'Test comparatif pour améliorer les performances.')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_retargeting', 'Retargeting')}</h3>
        <p>{t('glossaire.def_retargeting', 'Reciblage d\'utilisateurs ayant déjà interagi avec vous.')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_conversion', 'Conversion')}</h3>
        <p>{t('glossaire.def_conversion', 'Objectif atteint (abonnement, achat, vue complète, etc.).')}</p>
      </div>

      <div className="glossaire-item">
        <h3>{t('glossaire.term_tracking', 'Tracking')}</h3>
        <p>{t('glossaire.def_tracking', 'Mesure des actions utilisateurs via pixels, balises ou événements.')}</p>
      </div>
    </div>
  );
};

// Ajout des autres contenus si nécessaire...
export default { FAQContent, GlossaireContent };