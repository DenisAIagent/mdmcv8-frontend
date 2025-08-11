/**
 * 📘 Page Glossaire - Comprendre le langage du marketing musical
 * Route SEO: /ressources/glossaire
 */

import React, { useState, useMemo } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ContactModal from '../../../components/common/ContactModal';
import './ResourcesPages.css';

const Glossaire = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('TOUS');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const glossaryData = [
    { term: "A/B Testing", definition: "Méthode de test comparatif entre deux versions d'une campagne publicitaire pour identifier la plus performante. Essentiel pour optimiser les taux de conversion et réduire les coûts d'acquisition.", category: "Optimisation", letter: "A" },
    { term: "Ad Spend", definition: "Budget total investi dans les campagnes publicitaires sur une période donnée. Inclut tous les coûts médias sur YouTube, Meta, TikTok et autres plateformes digitales.", category: "Budget", letter: "A" },
    { term: "Algorithm", definition: "Système automatisé qui détermine la diffusion du contenu sur les plateformes comme YouTube, Spotify, Instagram. Comprendre les algorithmes est crucial pour maximiser la portée organique.", category: "Technique", letter: "A" },
    { term: "Audience Lookalike", definition: "Audience similaire créée automatiquement par les plateformes publicitaires en analysant les caractéristiques de vos fans existants. Permet de toucher de nouveaux auditeurs avec un potentiel d'engagement élevé.", category: "Ciblage", letter: "A" },
    { term: "Awareness", definition: "Notoriété de marque ou d'artiste. Première étape du funnel marketing visant à faire connaître un artiste ou une sortie musicale auprès d'une audience qualifiée.", category: "Objectifs", letter: "A" },
    
    { term: "Brand Safety", definition: "Mesures prises pour protéger l'image d'un artiste en évitant l'association avec du contenu inapproprié lors des campagnes publicitaires. Crucial pour les artistes grand public.", category: "Protection", letter: "B" },
    { term: "Bounce Rate", definition: "Pourcentage de visiteurs qui quittent une page sans interaction. Sur une SmartLink, un taux de rebond élevé peut indiquer un problème d'UX ou de ciblage.", category: "Analytics", letter: "B" },
    
    { term: "CTR (Click-Through Rate)", definition: "Taux de clic, exprimé en pourcentage. Mesure l'efficacité d'une publicité en calculant le ratio clics/impressions. Un CTR élevé indique une créative engageante.", category: "Performance", letter: "C" },
    { term: "CPC (Cost Per Click)", definition: "Coût par clic. Montant payé chaque fois qu'un utilisateur clique sur votre publicité. Métrique clé pour optimiser le budget et évaluer l'efficacité du ciblage.", category: "Coûts", letter: "C" },
    { term: "CPM (Cost Per Mille)", definition: "Coût pour mille impressions. Prix payé pour afficher votre publicité 1000 fois. Particulièrement important pour les campagnes de notoriété et de découverte musicale.", category: "Coûts", letter: "C" },
    { term: "CPV (Cost Per View)", definition: "Coût par vue vidéo. Montant payé lorsqu'un utilisateur regarde votre vidéo publicitaire. Métrique essentielle pour les campagnes de promotion de clips musicaux.", category: "Coûts", letter: "C" },
    { term: "Conversion", definition: "Action souhaitée accomplie par l'utilisateur : écoute, abonnement, achat, inscription newsletter. L'objectif final de toute campagne marketing musical.", category: "Objectifs", letter: "C" },
    { term: "Creative", definition: "Élément visuel ou vidéo de la publicité. Une creative impactante est cruciale pour capter l'attention et générer de l'engagement dans l'univers musical saturé.", category: "Créatif", letter: "C" },
    
    { term: "DSP (Demand-Side Platform)", definition: "Plateforme d'achat programmatique d'espaces publicitaires. Permet d'acheter automatiquement des inventaires publicitaires optimisés pour les objectifs musicaux.", category: "Technique", letter: "D" },
    { term: "Dynamic Ads", definition: "Publicités personnalisées automatiquement selon le comportement de l'utilisateur. Particulièrement efficaces pour promouvoir des catalogues musicaux diversifiés.", category: "Personnalisation", letter: "D" },
    
    { term: "Engagement Rate", definition: "Taux d'engagement calculé par les interactions (likes, partages, commentaires) divisées par la portée. Indicateur clé de la connexion entre l'artiste et son audience.", category: "Performance", letter: "E" },
    { term: "eCPM (Effective CPM)", definition: "CPM effectif calculé en divisant les revenus par les impressions x 1000. Mesure la rentabilité réelle d'un placement publicitaire musical.", category: "Performance", letter: "E" },
    
    { term: "Frequency", definition: "Nombre moyen de fois qu'un utilisateur voit votre publicité. Une fréquence optimale évite la lassitude tout en maximisant la mémorisation musicale.", category: "Exposition", letter: "F" },
    { term: "Funnel Marketing", definition: "Parcours client de la découverte à la conversion. En musique : Awareness → Intérêt → Écoute → Abonnement → Achat/Concert.", category: "Stratégie", letter: "F" },
    
    { term: "Geographic Targeting", definition: "Ciblage géographique permettant de diffuser des publicités dans des zones spécifiques. Essentiel pour promouvoir des tournées ou cibler des marchés musicaux locaux.", category: "Ciblage", letter: "G" },
    
    { term: "Impression", definition: "Affichage d'une publicité sur l'écran d'un utilisateur. Première métrique du funnel publicitaire, base de calcul pour le CPM et la portée.", category: "Mesure", letter: "I" },
    { term: "Interest Targeting", definition: "Ciblage par centres d'intérêt permettant de toucher des audiences passionnées de genres musicaux spécifiques ou d'artistes similaires.", category: "Ciblage", letter: "I" },
    
    { term: "KPI (Key Performance Indicator)", definition: "Indicateur clé de performance. En marketing musical : streams, abonnés, ventes, notoriété, engagement. Essentiels pour mesurer le ROI des campagnes.", category: "Analytics", letter: "K" },
    
    { term: "Lifetime Value (LTV)", definition: "Valeur vie client d'un fan. Calculée sur les achats, streams, concerts sur la durée. Permet d'optimiser les coûts d'acquisition de nouveaux fans.", category: "Valeur", letter: "L" },
    { term: "Lookalike Audience", definition: "Audience similaire basée sur les caractéristiques de vos meilleurs fans. Outil puissant pour étendre votre base de fans avec des profils qualifiés.", category: "Ciblage", letter: "L" },
    
    { term: "Meta Pixel", definition: "Code de suivi Facebook/Instagram permettant de mesurer les conversions et optimiser les campagnes. Indispensable pour tracker les actions post-clic.", category: "Technique", letter: "M" },
    { term: "Multi-Touch Attribution", definition: "Modèle d'attribution considérant tous les points de contact avant conversion. Crucial pour comprendre le parcours complexe des fans de musique.", category: "Attribution", letter: "M" },
    
    { term: "Native Advertising", definition: "Publicité qui s'intègre naturellement au contenu de la plateforme. Format privilégié sur TikTok et Instagram pour promouvoir la musique sans intrusion.", category: "Format", letter: "N" },
    
    { term: "Organic Reach", definition: "Portée naturelle d'un contenu sans promotion payante. Les algorithmes limitant la portée organique, les campagnes payantes deviennent indispensables.", category: "Portée", letter: "O" },
    { term: "Optimization", definition: "Processus d'amélioration continue des campagnes basé sur les données de performance. Clé du succès en marketing musical digital.", category: "Stratégie", letter: "O" },
    
    { term: "Pixel", definition: "Code de suivi placé sur les sites web pour mesurer les actions des utilisateurs. Essentiel pour optimiser les campagnes et calculer le ROAS.", category: "Technique", letter: "P" },
    { term: "Programmatic Advertising", definition: "Achat automatisé d'espaces publicitaires via algorithmes. Permet d'optimiser en temps réel les campagnes musicales selon les performances.", category: "Automatisation", letter: "P" },
    
    { term: "Quality Score", definition: "Note de qualité attribuée par les plateformes publicitaires. Un score élevé réduit les coûts et améliore la diffusion des campagnes musicales.", category: "Qualité", letter: "Q" },
    
    { term: "ROAS (Return On Ad Spend)", definition: "Retour sur investissement publicitaire. Mesure les revenus générés pour chaque euro investi. ROAS = Revenus / Coût publicitaire.", category: "ROI", letter: "R" },
    { term: "Reach", definition: "Portée, nombre d'utilisateurs uniques touchés par votre campagne. Différent des impressions qui comptent les affichages répétés.", category: "Portée", letter: "R" },
    { term: "Retargeting", definition: "Reciblage d'utilisateurs ayant déjà interagi avec votre contenu. Technique efficace pour convertir l'intérêt en streams, abonnements ou ventes.", category: "Reciblage", letter: "R" },
    { term: "Real-Time Bidding (RTB)", definition: "Enchères en temps réel pour l'achat d'espaces publicitaires. Permet d'optimiser automatiquement les coûts selon la valeur des audiences.", category: "Technique", letter: "R" },
    
    { term: "SmartLink", definition: "Page de destination intelligente regroupant toutes les plateformes d'écoute d'un titre. Optimise l'expérience utilisateur et maximise les conversions.", category: "Outil", letter: "S" },
    { term: "Streaming", definition: "Écoute de musique en ligne sans téléchargement. Principal mode de consommation musicale, cœur de cible des campagnes marketing modernes.", category: "Consommation", letter: "S" },
    { term: "Segmentation", definition: "Division de l'audience en groupes homogènes pour personnaliser les messages. Permet d'adapter le contenu selon les genres musicaux préférés.", category: "Ciblage", letter: "S" },
    
    { term: "Tracking", definition: "Suivi des actions utilisateurs via pixels, UTM et analytics. Essentiel pour mesurer l'efficacité des campagnes et optimiser les budgets.", category: "Mesure", letter: "T" },
    { term: "Target Audience", definition: "Audience cible définie selon des critères démographiques, géographiques et comportementaux. Base de toute stratégie marketing musical efficace.", category: "Ciblage", letter: "T" },
    
    { term: "User-Generated Content (UGC)", definition: "Contenu créé par les fans : covers, danses, remix. Puissant levier d'engagement et de viralité pour les artistes sur les réseaux sociaux.", category: "Contenu", letter: "U" },
    { term: "UTM Parameters", definition: "Paramètres de suivi d'URL permettant d'identifier la source du trafic. Indispensables pour mesurer l'efficacité de chaque canal marketing.", category: "Suivi", letter: "U" },
    
    { term: "View-Through Rate (VTR)", definition: "Taux de vues complètes d'une vidéo publicitaire. Métrique clé pour évaluer l'engagement généré par les clips promotionnels.", category: "Vidéo", letter: "V" },
    { term: "Viral Marketing", definition: "Stratégie visant à créer un contenu qui se propage naturellement. Objectif ultime en musique pour maximiser la portée avec un budget limité.", category: "Viralité", letter: "V" },
    
    { term: "YouTube Analytics", definition: "Outils d'analyse de YouTube fournissant des données détaillées sur les performances des vidéos musicales : vues, durée, audience, revenus.", category: "Analytics", letter: "Y" }
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = [...new Set(glossaryData.map(item => item.letter))];
  
  const filteredTerms = useMemo(() => {
    let filtered = glossaryData;
    
    if (selectedLetter !== 'TOUS') {
      filtered = filtered.filter(item => item.letter === selectedLetter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchTerm, selectedLetter]);
  
  const categories = [...new Set(glossaryData.map(item => item.category))];

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('glossaire.meta_title', 'Glossaire - MDMC Music Ads')}</title>
        <meta name="description" content={t('glossaire.meta_description', 'Glossaire complet du marketing musical : CPV, ROAS, SmartLink et tous les termes techniques')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/glossaire" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('glossaire.title', 'Glossaire — Comprendre le langage du marketing musical')}</h1>
            <p className="resource-subtitle">{t('glossaire.subtitle', 'Définitions des termes techniques du marketing digital musical')}</p>
          </div>

          <div className="glossaire-controls">
            <div className="glossaire-search-container">
              <div className="glossaire-search-box">
                <span className="search-icon"></span>
                <input 
                  type="text" 
                  placeholder="Rechercher un terme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glossaire-search-input"
                />
              </div>
            </div>

            <div className="alphabet-filter">
              <button 
                className={`letter-btn ${selectedLetter === 'TOUS' ? 'active' : ''}`}
                onClick={() => setSelectedLetter('TOUS')}
              >
                TOUS
              </button>
              {alphabet.map(letter => (
                <button 
                  key={letter}
                  className={`letter-btn ${selectedLetter === letter ? 'active' : ''} ${!availableLetters.includes(letter) ? 'disabled' : ''}`}
                  onClick={() => availableLetters.includes(letter) && setSelectedLetter(letter)}
                  disabled={!availableLetters.includes(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="glossaire-stats">
              <span className="terms-count">{filteredTerms.length} terme{filteredTerms.length > 1 ? 's' : ''}</span>
              <div className="categories-filter">
                {categories.slice(0, 5).map(category => (
                  <span key={category} className="category-tag">{category}</span>
                ))}
                {categories.length > 5 && <span className="category-more">+{categories.length - 5}</span>}
              </div>
            </div>
          </div>

          <div className="glossaire-content">
            {filteredTerms.length > 0 ? (
              filteredTerms.map((item, index) => (
                <div key={index} className="glossaire-item">
                  <div className="glossaire-header">
                    <h3 className="glossaire-term">{item.term}</h3>
                    <span className="glossaire-category">{item.category}</span>
                  </div>
                  <p className="glossaire-definition">{item.definition}</p>
                </div>
              ))
            ) : (
              <div className="glossaire-no-results">
                <span className="no-results-icon"></span>
                <h3>Aucun terme trouvé</h3>
                <p>Essayez avec d'autres mots-clés ou sélectionnez une autre lettre.</p>
              </div>
            )}
          </div>

          <div className="resource-cta">
            <h3>{t('glossaire.cta_title', 'Besoin d\'explications supplémentaires ?')}</h3>
            <p>{t('glossaire.cta_text', 'Notre équipe peut vous accompagner dans la compréhension de ces concepts et vous aider à les appliquer à votre projet musical.')}</p>
            <button 
              onClick={() => setIsContactModalOpen(true)} 
              className="resource-button"
            >
              {t('glossaire.cta_button', 'Demander un accompagnement')}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Demander un accompagnement"
        context="glossaire"
      />
    </HelmetProvider>
  );
};

export default Glossaire;