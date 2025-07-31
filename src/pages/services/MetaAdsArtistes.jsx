import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import '../../assets/styles/service-page.css';

const MetaAdsArtistes = () => {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Meta Ads pour Artistes - Facebook Instagram Publicité Musicale",
    "description": "Campagnes publicitaires Facebook et Instagram spécialisées pour artistes et musiciens. Promotion efficace de votre musique sur les réseaux sociaux.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "MDMC Music Ads",
      "url": "https://www.mdmcmusicads.com"
    },
    "serviceType": "Marketing Musical Meta",
    "areaServed": ["France", "Europe", "Canada", "États-Unis"],
    "offers": {
      "@type": "Offer",
      "price": "500",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "500",
        "priceCurrency": "EUR",
        "description": "Budget minimum pour campagne Meta Ads musicale"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Meta Ads pour Artistes | MDMC Music Ads - Facebook Instagram Publicité Musicale"
        description="Expert Meta Ads pour musiciens. Campagnes Facebook et Instagram optimisées pour promouvoir votre musique, augmenter vos fans et booster vos streams."
        keywords="Meta ads artiste, Facebook ads musique, Instagram ads musicien, publicité Facebook musique, promotion Instagram musical, campagne Meta streaming, marketing Facebook artiste"
        url="https://www.mdmcmusicads.com/services/meta-ads-artistes" 
        canonicalUrl="https://www.mdmcmusicads.com/services/meta-ads-artistes"
        structuredData={serviceSchema}
      />
      
      <Header />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="service-hero-content">
            <h1>Meta Ads pour Artistes</h1>
            <p className="service-hero-description">
              Développez votre communauté musicale sur Facebook et Instagram avec nos campagnes Meta Ads spécialisées.
            </p>
            <div className="service-hero-stats">
              <div className="stat">
                <span className="stat-number">2.9Md</span>
                <span className="stat-label">Utilisateurs Facebook actifs</span>
              </div>
              <div className="stat">
                <span className="stat-number">1.5€</span>
                <span className="stat-label">CPM moyen Europe</span>
              </div>
            </div>
          </div>
        </div>

        <section className="service-benefits">
          <div className="container">
            <h2>Meta Ads : L'outil parfait pour les musiciens</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>👥 Communauté Engagée</h3>
                <p>Créez une base de fans loyaux sur Facebook et Instagram grâce à nos campagnes ciblées.</p>
              </div>
              <div className="benefit-card">
                <h3>🎨 Formats Créatifs</h3>
                <p>Stories, Reels, posts - exploitez tous les formats pour promouvoir votre musique.</p>
              </div>
              <div className="benefit-card">
                <h3>🌍 Portée Internationale</h3>
                <p>Touchez vos fans partout dans le monde avec un ciblage géographique précis.</p>
              </div>
              <div className="benefit-card">
                <h3>💰 Budget Flexible</h3>
                <p>Campagnes adaptées à tous les budgets, du musicien indépendant au label.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-features">
          <div className="container">
            <h2>Nos Services Meta Ads Musicaux</h2>
            <div className="features-list">
              <div className="feature-item">
                <h3>🎵 Promotion de Singles</h3>
                <p>Campagnes spécialisées pour faire découvrir vos nouveaux titres à une audience qualifiée.</p>
              </div>
              <div className="feature-item">
                <h3>🎤 Construction d'Audience</h3>
                <p>Développement stratégique de votre communauté de fans sur les réseaux sociaux.</p>
              </div>
              <div className="feature-item">
                <h3>🎪 Promotion d'Événements</h3>
                <p>Augmentez la visibilité de vos concerts et événements musicaux.</p>
              </div>
              <div className="feature-item">
                <h3>💿 Lancement d'Albums</h3>
                <p>Campagnes complètes pour maximiser l'impact de vos sorties d'albums.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-cta">
          <div className="container">
            <h2>Développez votre présence sur Meta</h2>
            <p>Testez le potentiel de votre musique sur Facebook et Instagram.</p>
            <div className="cta-buttons">
              <Link to="/" className="btn btn-primary">Simulateur Gratuit</Link>
              <Link to="/#contact" className="btn btn-secondary">Consultation Expert</Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default MetaAdsArtistes;