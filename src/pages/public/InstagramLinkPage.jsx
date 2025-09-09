import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import wordpressService from '../../services/wordpress.service';
import newsletterService from '../../services/newsletter.service';
import CalendlyExpertSelector from '../../components/features/calendly/CalendlyExpertSelector';
import './InstagramLinkPage.css';

// Composant Newsletter Form avec API Brevo
const NewsletterForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const result = await newsletterService.subscribe(email, 'Instagram Links Page');
      
      if (result.success) {
        setStatus('success');
        setEmail('');
        console.log('✅ Newsletter: Inscription réussie');
      } else {
        setStatus('error');
        console.error('❌ Newsletter: Erreur inscription', result.message);
      }
    } catch (error) {
      console.error('❌ Newsletter: Erreur inattendue', error);
      setStatus('error');
    }
  };

  return (
    <div className="newsletter-form-wrapper">
      <form onSubmit={handleSubmit} className="newsletter-form">
        <div className="newsletter-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            disabled={status === 'loading'}
            className="newsletter-input"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="newsletter-submit"
          >
            {status === 'loading' ? 'Inscription...' : "S'abonner"}
          </button>
        </div>

        {status === 'success' && (
          <div className="newsletter-success">
            Merci ! Vous êtes inscrit(e) à notre newsletter.
          </div>
        )}

        {status === 'error' && (
          <div className="newsletter-error">
            Une erreur est survenue. Veuillez réessayer.
          </div>
        )}
      </form>
    </div>
  );
};

const InstagramLinkPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fonction pour nettoyer le HTML et extraire le texte
  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Supprimer les balises HTML et décoder les entités HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📰 InstagramLinks: Chargement articles depuis WordPress REST API...');
      
      const response = await wordpressService.getLatestPosts(3);
      
      if (response.success && response.data.length > 0) {
        setArticles(response.data);
        setRetryCount(0);
        console.log(`✅ InstagramLinks: ${response.data.length} articles chargés depuis WordPress REST API`);
        
        if (response.warning) {
          console.warn(`⚠️ InstagramLinks: ${response.warning}`);
        }
      } else {
        throw new Error(response.error || 'Aucun article trouvé');
      }
      
    } catch (err) {
      console.error('❌ InstagramLinks: Erreur chargement articles', err);
      setError(err.message);
      setArticles([]); // En cas d'échec total, affichage vide
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      console.log(`🔄 Articles: Tentative ${newRetryCount}...`);
      
      // WordPress API n'a pas de cache à vider
      
      loadArticles();
    }
  };

  const mainLinks = [
    {
      title: t('instagramLinks.simulatorButton.title'),
      url: 'https://www.mdmcmusicads.com/#simulator',
      description: t('instagramLinks.simulatorButton.description'),
      isPrimary: true
    }
  ];

  const socialLinks = [
    {
      platform: 'instagram',
      url: 'https://www.instagram.com/mdmc.musicads/',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/mdmcmusicads',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/mdmc-music-ads',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="instagram-link-page">
      <div className="ilp-container">
        {/* Header avec logo et bio */}
        <header className="ilp-header">
          <div className="ilp-logo-wrapper">
            <img 
              src="/assets/images/logo-picto.png" 
              alt="MDMC Music Ads" 
              className="ilp-logo"
            />
          </div>
          <h1 className="ilp-title">{t('instagramLinks.title')}</h1>
          <p className="ilp-bio">
            {t('instagramLinks.bio.line1')}<br />
            {t('instagramLinks.bio.line2')}<br />
            {t('instagramLinks.bio.line3')}
          </p>
        </header>

        {/* Liens principaux */}
        <section className="ilp-main-links">
          {mainLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`ilp-link-button ${link.isPrimary ? 'ilp-primary' : ''}`}
            >
              <span className="ilp-link-title">{link.title}</span>
              <span className="ilp-link-description">{link.description}</span>
            </a>
          ))}
        </section>

        {/* Section Newsletter - Formulaire custom avec API Brevo */}
        <section className="ilp-main-links">
          <div className="ilp-link-button ilp-newsletter-link">
            <span className="ilp-link-title">{t('instagramLinks.newsletter.title')}</span>
            <span className="ilp-link-description">{t('instagramLinks.newsletter.subtitle')}</span>
            <NewsletterForm />
          </div>
        </section>

        {/* Section Calendly - Prise de rendez-vous avec choix d'expert */}
        <section className="ilp-main-links">
          <div className="ilp-link-button ilp-calendly-section">
            <span className="ilp-link-title">Prendre rendez-vous</span>
            <span className="ilp-link-description">Échangez avec nos experts en publicité musicale</span>
            <CalendlyExpertSelector 
              displayType="modal"
              onScheduled={(data) => {
                console.log('RDV programmé depuis Instagram Links:', data);
              }}
            />
          </div>
        </section>

        {/* Section Blog avec service RSS avancé */}
        <section className="ilp-blog-section">
          
          {loading && (
            <div className="ilp-loading">
              <span className="ilp-loading-spinner"></span>
              <p>{t('instagramLinks.blogSection.loadingMessage')}</p>
            </div>
          )}
          
          {error && !loading && articles.length === 0 && (
            <div className="ilp-error">
              <p>{t('instagramLinks.blogSection.errorMessage')}</p>
              <button 
                onClick={handleRetry} 
                className="ilp-retry-button"
                disabled={retryCount >= 3}
              >
                {retryCount >= 3 ? 'Limite atteinte' : `Réessayer (${retryCount}/3)`}
              </button>
            </div>
          )}
          
          {!loading && articles.length > 0 && (
            <div className="ilp-articles-grid">
              {articles.map((article, index) => (
                <a
                  key={article.id || index}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ilp-article-card"
                >
                  {(article.featuredImage?.url || article.image) && (
                    <div className="ilp-article-image">
                      <img 
                        src={article.featuredImage?.url || article.image} 
                        alt={article.featuredImage?.alt || article.title}
                        loading="lazy"
                        onError={(e) => {
                          console.warn(`⚠️ Erreur image article ${index + 1}:`, article.featuredImage?.url || article.image);
                          e.target.src = '/assets/images/logo.png';
                        }}
                      />
                    </div>
                  )}
                  <div className="ilp-article-content">
                    <h3 className="ilp-article-title">{stripHtmlTags(article.title)}</h3>
                    <p className="ilp-article-description">
                      {stripHtmlTags(article.excerpt || article.description || t('instagramLinks.blogSection.fallbackDescription'))}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Réseaux sociaux */}
        <section className="ilp-social-section">
          <h2 className="ilp-section-title">{t('instagramLinks.socialSection.title')}</h2>
          <div className="ilp-social-links">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ilp-social-link ilp-${social.platform}`}
                aria-label={social.platform}
              >
                <span className="ilp-social-icon">{social.icon}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="ilp-footer">
          <p>{t('instagramLinks.footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
};

export default InstagramLinkPage;