/**
 *  Page FAQ - Réponses claires à vos questions fréquentes
 * Route SEO: /ressources/faq
 */

import React, { useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ContactModal from '../../../components/common/ContactModal';
import './ResourcesPages.css';

const FAQ = () => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const toggleItem = (index) => {
    setActiveItem(activeItem === index ? null : index);
  };

  const faqData = [
    {
      question: "Qui êtes-vous ?",
      answer: {
        intro: "Nous sommes MDMC Music Ads, une agence indépendante fondée en 2018 par un ancien salarié de Google, également ex-attaché de presse musique en France.",
        points: [
          " Une expertise technique pointue en YouTube Ads, Meta, TikTok & tracking",
          " Une compréhension fine des enjeux artistiques, culturels et commerciaux",
          " Une culture du résultat : notoriété, abonnés, vues ciblées, engagement et ventes"
        ],
        conclusion: "Nous plaçons l'humain, la transparence et l'impact au cœur de chaque collaboration. Chaque campagne est conçue comme un levier de croissance réelle et durable pour les artistes et structures que nous accompagnons."
      },
      category: "Présentation"
    },
    {
      question: "Quels services proposez-vous exactement ?",
      answer: {
        intro: "Nous offrons une gamme complète de services marketing digital spécialisés pour l'industrie musicale :",
        points: [
          "**Campagnes YouTube Ads** : Promotion de clips, augmentation d'abonnés, ciblage précis",
          "**Meta Ads (Facebook/Instagram)** : Awareness, engagement, conversion streaming",
          "**TikTok Promotion** : Viralité, découverte, audience jeune",
          "**Analytics & Reporting** : Tableaux de bord détaillés, insights stratégiques",
          "**Consulting Stratégique** : Audit, recommandations, planification campagnes",
          "**SmartLinks** : Pages de destination optimisées pour la conversion"
        ],
        conclusion: "Chaque service s'adapte à vos objectifs spécifiques et à votre budget."
      },
      category: "Services"
    },
    {
      question: "Combien coûte une campagne ? Comment établissez-vous vos tarifs ?",
      answer: {
        intro: "Nos tarifs sont personnalisés selon chaque projet et s'adaptent à vos objectifs spécifiques :",
        points: [
          "**Approche sur-mesure** : Chaque campagne est unique, les tarifs sont adaptés",
          "**Facteurs considérés** : Complexité, durée, plateformes, objectifs et budget",
          "**Transparence totale** : Devis détaillé avant tout engagement",
          "**Audit gratuit** : Évaluation de vos besoins sans engagement",
          "**Flexibilité** : Solutions adaptées aux budgets de tous les artistes"
        ],
        conclusion: "Contactez-nous pour un devis personnalisé ou utilisez notre simulateur pour une première estimation."
      },
      category: "Tarifs"
    },
    {
      question: "Comment mesurer et suivre les résultats de mes campagnes ?",
      answer: {
        intro: "Transparence totale sur vos performances via les dashboards des plateformes publicitaires :",
        points: [
          "**Dashboards natifs** : Google Ads, Meta Business Manager, TikTok Ads Manager",
          "**Rapports hebdomadaires** : Analyse détaillée des performances consolidées",
          "**KPIs personnalisés** : Métriques adaptées à vos objectifs musicaux",
          "**Accès direct aux comptes** : Transparence complète sur vos campagnes",
          "**Optimisations continues** : Ajustements basés sur les données des plateformes"
        ],
        conclusion: "Vous gardez le contrôle total avec une visibilité complète sur chaque euro investi via les outils officiels."
      },
      category: "Suivi"
    },
    {
      question: "Travaillez-vous avec tous les styles musicaux ?",
      answer: {
        intro: "Absolument ! Notre expertise s'adapte à tous les univers musicaux :",
        points: [
          "**Hip-Hop/Rap** : Stratégies virales, targeting urbain",
          "**Rock/Metal** : Communautés passionnées, événementiel",
          "**Électro/House** : Plateformes spécialisées, festival marketing",
          "**Jazz/Classique** : Audiences de niche, contenus éducatifs",
          "**Musiques du monde** : Ciblage géographique et culturel",
          "**Pop/Variété** : Mass market, multi-plateformes"
        ],
        conclusion: "Chaque genre musical a ses codes, son audience et ses plateformes privilégiées. Nous maîtrisons ces spécificités."
      },
      category: "Styles musicaux"
    },
    {
      question: "Garantissez-vous les résultats ? Quels sont vos engagements ?",
      answer: {
        intro: "Nous ne promettons pas de miracles, mais nous garantissons :",
        points: [
          " **Méthodologie éprouvée** : 6 ans d'expérience, +500 campagnes",
          " **Optimisation continue** : Tests A/B, ajustements quotidiens",
          " **Transparence totale** : Accès complet aux données et comptes",
          " **Ciblage précis** : Audiences qualifiées, pas de trafic générique",
          " **Support dédié** : Contact direct avec votre chargé de campagne",
          " **Conseils stratégiques** : Recommandations pour optimiser votre contenu"
        ],
        conclusion: "Les résultats dépendent de la qualité de votre contenu, de votre budget et de votre marché. Nous maximisons votre potentiel."
      },
      category: "Garanties"
    },
    {
      question: "Combien de temps faut-il pour voir les premiers résultats ?",
      answer: {
        intro: "Les délais varient selon vos objectifs :",
        points: [
          " **Premiers résultats** : 24-48h après lancement",
          " **Optimisation complète** : 7-14 jours pour stabiliser les performances",
          " **Résultats significatifs** : 1-2 mois pour une croissance durable",
          " **Analyse complète** : 3 mois pour évaluer l'impact global"
        ],
        conclusion: "Patience et constance sont clés dans le marketing musical. Nous optimisons en continu pour accélérer vos résultats."
      },
      category: "Délais"
    },
    {
      question: "Comment se déroule l'onboarding et le suivi des campagnes ?",
      answer: {
        intro: "Un processus structuré pour votre réussite :",
        points: [
          " **Audit gratuit** : Analyse de votre situation actuelle (30-45 min)",
          " **Brief détaillé** : Définition des objectifs, cibles, budget",
          " **Stratégie personnalisée** : Plan de campagne adapté à vos besoins",
          " **Lancement rapide** : Mise en ligne sous 48-72h",
          " **Suivi hebdomadaire** : Points réguliers sur les performances",
          " **Optimisations** : Ajustements basés sur les résultats"
        ],
        conclusion: "Vous êtes accompagné(e) à chaque étape avec un contact privilégié."
      },
      category: "Processus"
    },
    {
      question: "Puis-je garder le contrôle de mes comptes publicitaires ?",
      answer: {
        intro: "Transparence et contrôle total pour vous :",
        points: [
          " **Propriété des comptes** : Vos comptes, vos données, vos accès",
          " **Accès partagé** : Nous travaillons avec vos permissions",
          " **Visibilité complète** : Vous voyez tout en temps réel",
          " **Historique préservé** : Toutes vos données restent chez vous",
          " **Liberté totale** : Vous pouvez arrêter à tout moment"
        ],
        conclusion: "Vous restez propriétaire de vos actifs digitaux. Nous sommes vos partenaires, pas vos intermédiaires."
      },
      category: "Contrôle"
    },
    {
      question: "Que se passe-t-il si je ne suis pas satisfait(e) des résultats ?",
      answer: {
        intro: "Votre satisfaction est notre priorité :",
        points: [
          " **Communication ouverte** : Discussion immédiate des problèmes",
          " **Plan d'amélioration** : Ajustements stratégiques rapides",
          " **Analyse détaillée** : Identification des points de blocage",
          " **Solutions alternatives** : Nouvelles approches si nécessaire",
          " **Engagement qualité** : Nous travaillons jusqu'à votre satisfaction"
        ],
        conclusion: "Notre réputation se construit sur vos succès. Nous trouvons toujours des solutions."
      },
      category: "Satisfaction"
    }
  ];

  const filteredFAQ = faqData.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.intro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('faq.meta_title', 'FAQ - MDMC Music Ads')}</title>
        <meta name="description" content={t('faq.meta_description', 'Réponses aux questions fréquentes sur nos services de marketing musical')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/faq" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('faq.title', 'FAQ — Réponses claires à vos questions fréquentes')}</h1>
            <p className="resource-subtitle">{t('faq.subtitle', 'Trouvez rapidement les réponses à vos questions sur nos services')}</p>
          </div>

          <div className="faq-search-section">
            <div className="faq-search-container">
              <div className="faq-search-box">
                <span className="search-icon"></span>
                <input 
                  type="text" 
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="faq-search-input"
                />
              </div>
              <div className="faq-categories">
                {categories.map(category => (
                  <span key={category} className="faq-category-tag">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="faq-content">
            <div className="faq-stats">
              <span className="faq-count">{filteredFAQ.length} question{filteredFAQ.length > 1 ? 's' : ''} trouvée{filteredFAQ.length > 1 ? 's' : ''}</span>
            </div>
            
            {filteredFAQ.map((item, index) => (
              <div key={index} className={`faq-item ${activeItem === index ? 'active' : ''}`}>
                <div className="faq-question" onClick={() => toggleItem(index)}>
                  <h2>{item.question}</h2>
                  <div className="faq-toggle">
                    <span className="faq-category-label">{item.category}</span>
                    <span className={`faq-arrow ${activeItem === index ? 'active' : ''}`}>▼</span>
                  </div>
                </div>
                <div className={`faq-answer ${activeItem === index ? 'active' : ''}`}>
                  <div className="faq-answer-content">
                    <p className="faq-intro">{item.answer.intro}</p>
                    {item.answer.points && (
                      <ul className="faq-points">
                        {item.answer.points.map((point, idx) => (
                          <li key={idx} dangerouslySetInnerHTML={{__html: point}} />
                        ))}
                      </ul>
                    )}
                    {item.answer.conclusion && (
                      <p className="faq-conclusion">{item.answer.conclusion}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFAQ.length === 0 && (
              <div className="faq-no-results">
                <span className="no-results-icon">🤔</span>
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez avec d'autres mots-clés ou contactez-nous directement.</p>
              </div>
            )}
          </div>

          <div className="resource-cta">
            <h3>{t('faq.cta_title', 'Vous avez d\'autres questions ?')}</h3>
            <p>{t('faq.cta_text', 'Notre équipe peut vous accompagner et répondre à vos questions spécifiques sur le marketing musical.')}</p>
            <button 
              onClick={() => setIsContactModalOpen(true)} 
              className="resource-button"
            >
              {t('faq.cta_button', 'Poser une question')}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Poser une question"
        context="faq"
      />
    </HelmetProvider>
  );
};

export default FAQ;