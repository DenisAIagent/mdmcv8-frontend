import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import facebookPixel from '../../services/facebookPixel.service';
import gtm from '../../services/googleTagManager.service';
import usePageTracking from '../../hooks/usePageTracking';
import '../../assets/styles/service-page.css';

const YouTubeAdsMusique = () => {
  // 📊 TRACKING CRITIQUE : Virtual pageviews pour page service
  const { trackFormSubmission, trackEngagement } = usePageTracking(
    "YouTube Ads Musique - Promotion Professionnelle Artistes | MDMC",
    "service_page"
  );

  useEffect(() => {
    const serviceName = 'YouTube Ads Musique';
    facebookPixel.trackServicePageView(serviceName);
    gtm.trackServicePageView(serviceName);
    
    // Track service page loaded
    trackEngagement('service_page_loaded', 1);
  }, [trackEngagement]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Publicité YouTube pour Artistes et Musiciens",
    "description": "Campagnes publicitaires YouTube optimisées pour augmenter vos streams, découvrir votre audience et promouvoir votre musique auprès de fans potentiels.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "MDMC Music Ads",
      "url": "https://www.mdmcmusicads.com"
    },
    "serviceType": "Marketing Musical",
    "areaServed": ["France", "Europe", "Canada", "États-Unis"],
    "offers": {
      "@type": "Offer",
      "price": "500",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "500",
        "priceCurrency": "EUR",
        "description": "Budget minimum pour campagne YouTube Ads musicale"
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog", 
      "name": "Services YouTube Ads Musique",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "YouTube Ads Discovery",
            "description": "Promotion de vos clips musicaux dans les recommandations YouTube"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "YouTube Shorts Ads",
            "description": "Campagnes spécialisées pour vos contenus courts musicaux"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Audience Musicale Ciblée", 
            "description": "Ciblage précis d'audiences par genre musical et habitudes d'écoute"
          }
        }
      ]
    }
  };

  return (
    <>
      <SEOHead
        title="Publicité YouTube pour Artistes | MDMC Music Ads - Expert YouTube Ads Musique"
        description="Spécialiste publicité YouTube pour musiciens. Augmentez vos streams, découvrez votre audience et boostez votre carrière musicale avec nos campagnes YouTube Ads optimisées."
        keywords="publicité YouTube musique, YouTube ads artiste, promotion YouTube musical, campagne YouTube clip, marketing YouTube musicien, augmenter vues YouTube musique, YouTube ads streaming"
        url="https://www.mdmcmusicads.com/services/youtube-ads-musique"
        canonicalUrl="https://www.mdmcmusicads.com/services/youtube-ads-musique"
        structuredData={serviceSchema}
      />
      
      <Header />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="service-hero-content">
            <h1>Publicité YouTube pour Artistes</h1>
            <p className="service-hero-description">
              Boostez votre carrière musicale avec nos campagnes YouTube Ads spécialement conçues pour les artistes et musiciens.
            </p>
            <div className="service-hero-stats">
              <div className="stat">
                <span className="stat-number">+300%</span>
                <span className="stat-label">Augmentation moyenne des streams</span>
              </div>
              <div className="stat">
                <span className="stat-number">0,02€</span>
                <span className="stat-label">Coût par vue optimisé</span>
              </div>
            </div>
          </div>
        </div>

        <section className="service-benefits">
          <div className="container">
            <h2>Pourquoi YouTube Ads pour votre musique ?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>🎯 Audience Musicale Précise</h3>
                <p>Ciblage par genre musical, habitudes d'écoute et démographie pour atteindre vos fans potentiels.</p>
              </div>
              <div className="benefit-card">
                <h3>📈 Augmentation des Streams</h3>
                <p>Conversion optimisée vers Spotify, Apple Music et autres plateformes de streaming.</p>
              </div>
              <div className="benefit-card">
                <h3>🎵 Formats Adaptés</h3>
                <p>YouTube Shorts, In-Stream, Discovery - nous choisissons le meilleur format pour votre contenu.</p>
              </div>
              <div className="benefit-card">
                <h3>📊 Analytics Détaillés</h3>
                <p>Suivi précis de vos performances et optimisation continue de vos campagnes.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-process">
          <div className="container">
            <h2>Notre Processus YouTube Ads</h2>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <h3>Analyse de votre Musique</h3>
                <p>Étude de votre genre, audience actuelle et objectifs de promotion.</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h3>Stratégie Personnalisée</h3>
                <p>Création d'une stratégie YouTube Ads adaptée à votre style musical.</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h3>Création des Campagnes</h3>
                <p>Configuration technique et lancement de vos campagnes YouTube.</p>
              </div>
              <div className="process-step">
                <div className="step-number">4</div>
                <h3>Optimisation Continue</h3>
                <p>Suivi quotidien et ajustements pour maximiser vos résultats.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-cta">
          <div className="container">
            <h2>Prêt à booster votre musique sur YouTube ?</h2>
            <p>Découvrez le potentiel de votre musique avec notre simulateur gratuit.</p>
            <div className="cta-buttons">
              <Link to="/" className="btn btn-primary">Simulateur Gratuit</Link>
              <Link to="/#contact" className="btn btn-secondary">Nous Contacter</Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default YouTubeAdsMusique;