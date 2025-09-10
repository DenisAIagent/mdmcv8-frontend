import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../../assets/styles/footer.css';

const Footer = ({ openSimulator }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [newsletter, setNewsletter] = useState({ email: '', status: null });
  
  const handleSimulatorClick = () => {
    if (openSimulator && typeof openSimulator === 'function') {
      openSimulator();
    } else {
      console.warn('openSimulator is not a valid function');
    }
  };

  // Gestion fallback logo si image manquante
  const handleLogoError = (e) => {
    e.target.style.display = 'none';
    e.target.nextElementSibling.style.display = 'block';
  };

  // Gestion fallback badge Google si CDN indisponible
  const handleBadgeError = (e) => {
    e.target.style.display = 'none';
    e.target.nextElementSibling.style.display = 'inline-block';
  };

  // Gestion newsletter
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletter(prev => ({ ...prev, status: 'loading' }));
    
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'newsletter_signup', {
        event_category: 'engagement',
        event_label: 'footer_newsletter',
        value: 10
      });
    }

    // Simulation d'envoi (remplacer par vraie API)
    setTimeout(() => {
      setNewsletter({ email: '', status: 'success' });
      setTimeout(() => setNewsletter(prev => ({ ...prev, status: null })), 3000);
    }, 1000);
  };


  return (
    <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <a href="#hero" aria-label="MDMC - Retour à l'accueil">
              <img 
                src="/assets/images/logo.png" 
                alt="MDMC Logo" 
                onError={handleLogoError}
              />
              <span 
                style={{ display: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}
                aria-hidden="true"
              >
                MDMC
              </span>
            </a>
            <p>{t('footer.logo_p')}</p>
            <div className="google-partner">
              <a 
                href="https://www.google.com/partners/agency?id=3215385696" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={t('contact.partner_google_aria_label')}
              >
                <img 
                  src="https://www.gstatic.com/partners/badge/images/2024/PartnerBadgeClickable.svg" 
                  alt={t('contact.partners.google_badge_alt')} 
                  loading="lazy"
                  onError={handleBadgeError}
                />
                <span 
                  style={{ 
                    display: 'none', 
                    padding: '8px 12px', 
                    background: '#4285f4', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  Google Partner
                </span>
              </a>
            </div>
            
            {/* Note Google 5 étoiles */}
            <div className="google-rating">
              <div className="rating-stars">
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
              </div>
              <p className="rating-text">
                <strong>5.0/5</strong> sur Google
              </p>
              <p className="rating-subtitle">{t('contact.google_rating.description')}</p>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>{t('footer.nav_title')}</h4>
              <ul>
                <li><a href="#hero">{t('footer.nav_home')}</a></li>
                <li><a href="#services">{t('nav.services')}</a></li>
                <li><a href="#about">{t('nav.about')}</a></li>
                <li><a href="#articles">{t('nav.articles')}</a></li>
                <li><a href="#contact">{t('nav.contact')}</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>{t('footer.resources_title')}</h4>
              <ul>
                <li><a href="https://blog.mdmcmusicads.com" target="_blank" rel="noopener noreferrer">{t('footer.resources_blog')}</a></li>
                <li>
                  <button 
                    type="button" 
                    className="btn-link-style" 
                    onClick={handleSimulatorClick}
                  >
                    {t('footer.resources_simulator')}
                  </button>
                </li>
                <li><Link to="/ressources/faq">{t('footer.resources_faq')}</Link></li>
                <li><Link to="/ressources/glossaire">{t('footer.resources_glossary')}</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>{t('footer.legal_title')}</h4>
              <ul>
                <li><a href="/politique-confidentialite.html" target="_blank">{t('footer.legal_privacy')}</a></li>
                <li><a href="/conditions-generales.html" target="_blank">{t('footer.legal_terms')}</a></li>
                <li><a href="/mentions-legales.html" target="_blank">{t('footer.legal_mentions')}</a></li>
                <li><a href="/cookies.html" target="_blank">{t('footer.legal_cookies')}</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section Newsletter */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h4>Newsletter Marketing Musical</h4>
            <p>Recevez nos conseils exclusifs, études de cas et nouvelles stratégies</p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="votre-email@exemple.com"
                value={newsletter.email}
                onChange={(e) => setNewsletter(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={newsletter.status === 'loading'}
              />
              <button 
                type="submit" 
                disabled={newsletter.status === 'loading'}
                className={newsletter.status === 'loading' ? 'loading' : ''}
              >
                {newsletter.status === 'loading' ? 'Inscription...' : 'S\'abonner'}
              </button>
            </form>
            {newsletter.status === 'success' && (
              <div className="newsletter-success">
                Inscription réussie ! Vérifiez votre boîte mail.
              </div>
            )}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} {t('footer.copyright')}</p>
        </div>
      </footer>
  );
};

export default Footer;