import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import '../../assets/styles/service-page.css';

const TikTokPromotionMusicale = () => {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "TikTok Promotion Musicale pour Artistes",
    "description": "Campagnes TikTok spécialisées pour artistes et musiciens. Faites découvrir votre musique à la génération Z avec nos stratégies TikTok optimisées.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "MDMC Music Ads",
      "url": "https://www.mdmcmusicads.com"
    },
    "serviceType": "Marketing Musical TikTok",
    "areaServed": ["France", "Europe", "Canada", "États-Unis"],
    "offers": {
      "@type": "Offer",
      "price": "500",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "500",
        "priceCurrency": "EUR",
        "description": "Budget minimum pour campagne TikTok musicale"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="TikTok Promotion Musicale | MDMC Music Ads - Expert TikTok Ads Artistes"
        description="Spécialiste TikTok pour musiciens. Campagnes TikTok optimisées pour faire découvrir votre musique à la génération Z et créer des tendances virales."
        keywords="TikTok promotion musique, TikTok ads artiste, marketing TikTok musical, promotion TikTok musicien, campagne TikTok streaming, viral TikTok musique, TikTok sounds promotion"
        url="https://www.mdmcmusicads.com/services/tiktok-promotion-musicale"
        canonicalUrl="https://www.mdmcmusicads.com/services/tiktok-promotion-musicale"
        structuredData={serviceSchema}
      />
      
      <Header />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="service-hero-content">
            <h1>TikTok Promotion Musicale</h1>
            <p className="service-hero-description">
              Propulsez votre musique vers la génération Z avec nos campagnes TikTok spécialement conçues pour les artistes.
            </p>
            <div className="service-hero-stats">
              <div className="stat">
                <span className="stat-number">1Md+</span>
                <span className="stat-label">Utilisateurs TikTok actifs</span>
              </div>
              <div className="stat">
                <span className="stat-number">90%</span>
                <span className="stat-label">Découverte musicale sur TikTok</span>
              </div>
            </div>
          </div>
        </div>

        <section className="service-benefits">
          <div className="container">
            <h2>Pourquoi TikTok est essentiel pour la musique</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>🎵 Découverte Musicale</h3>
                <p>TikTok est devenu la première plateforme de découverte musicale pour les jeunes.</p>
              </div>
              <div className="benefit-card">
                <h3>🔥 Potentiel Viral</h3>
                <p>Vos sons peuvent devenir viraux et être utilisés par des millions d'utilisateurs.</p>
              </div>
              <div className="benefit-card">
                <h3>👥 Audience Jeune</h3>
                <p>Atteignez la génération Z, le public le plus actif en streaming musical.</p>
              </div>
              <div className="benefit-card">
                <h3>🚀 Boost Streaming</h3>
                <p>Les tendances TikTok génèrent des millions de streams sur Spotify et Apple Music.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-strategies">
          <div className="container">
            <h2>Nos Stratégies TikTok Musicales</h2>
            <div className="strategies-grid">
              <div className="strategy-card">
                <h3>🎪 Spark Ads</h3>
                <p>Promotion de vos contenus TikTok organiques avec le meilleur engagement pour maximiser leur portée.</p>
              </div>
              <div className="strategy-card">
                <h3>🎬 In-Feed Ads</h3>
                <p>Intégration native de votre musique dans le feed TikTok pour une découverte naturelle.</p>
              </div>
              <div className="strategy-card">
                <h3>🏷️ Branded Hashtag</h3>
                <p>Création de challenges musicaux autour de vos sons pour générer du contenu viral.</p>
              </div>
              <div className="strategy-card">
                <h3>🎵 TopView Ads</h3>
                <p>Positionnement premium pour vos nouveautés musicales dès l'ouverture de l'app.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-results">
          <div className="container">
            <h2>Résultats TikTok de nos Clients</h2>
            <div className="results-stats">
              <div className="result-stat">
                <span className="stat-number">500K+</span>
                <span className="stat-label">Vues moyennes par campagne</span>
              </div>
              <div className="result-stat">
                <span className="stat-number">15%</span>
                <span className="stat-label">Taux d'engagement moyen</span>
              </div>
              <div className="result-stat">
                <span className="stat-number">300%</span>
                <span className="stat-label">Augmentation streams post-TikTok</span>
              </div>
            </div>
          </div>
        </section>

        <section className="service-cta">
          <div className="container">
            <h2>Prêt à conquérir TikTok ?</h2>
            <p>Découvrez comment votre musique peut devenir virale sur TikTok.</p>
            <div className="cta-buttons">
              <Link to="/" className="btn btn-primary">Simulateur TikTok</Link>
              <Link to="/#contact" className="btn btn-secondary">Stratégie Personnalisée</Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default TikTokPromotionMusicale;