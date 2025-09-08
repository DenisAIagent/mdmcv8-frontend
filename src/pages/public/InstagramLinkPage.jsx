import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './InstagramLinkPage.css';

const InstagramLinkPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogArticles();
  }, []);

  const fetchBlogArticles = async () => {
    try {
      const feedUrl = 'https://blog.mdmcmusicads.com/feed/';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Erreur de récupération du flux RSS');
      
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');
      
      const parsedArticles = Array.from(items).slice(0, 10).map(item => {
        // Extraire l'image du content:encoded ou description
        const contentEncoded = item.querySelector('encoded')?.textContent || 
                              item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent || '';
        
        let imageUrl = '/assets/images/logo.png'; // Image par défaut
        
        // Chercher une image dans le contenu
        const imgMatch = contentEncoded.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
        
        // Extraire la description sans HTML
        const description = item.querySelector('description')?.textContent || '';
        const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
        
        return {
          title: item.querySelector('title')?.textContent || 'Sans titre',
          link: item.querySelector('link')?.textContent || '#',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          description: cleanDescription,
          image: imageUrl,
          formattedDate: formatDate(item.querySelector('pubDate')?.textContent || '')
        };
      });
      
      setArticles(parsedArticles);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des articles:', err);
      setError('Impossible de charger les articles');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const mainLinks = [
    {
      title: '🌐 Site Web Officiel',
      url: 'https://www.mdmcmusicads.com',
      description: 'Découvrez nos services de marketing musical',
      isPrimary: true
    },
    {
      title: '🎯 Simulateur de Campagne',
      url: 'https://www.mdmcmusicads.com/#simulator',
      description: 'Estimez les résultats de votre campagne',
      isPrimary: false
    },
    {
      title: '📧 Contact',
      url: 'mailto:contact@mdmcmusicads.com',
      description: 'Parlons de votre projet musical',
      isPrimary: false
    }
  ];

  const socialLinks = [
    {
      platform: 'instagram',
      url: 'https://www.instagram.com/mdmc.musicads/',
      icon: '📸'
    },
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/mdmcmusicads',
      icon: '👍'
    },
    {
      platform: 'youtube',
      url: 'https://www.youtube.com/@mdmcmusicads',
      icon: '▶️'
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/mdmc-music-ads',
      icon: '💼'
    }
  ];

  return (
    <div className="instagram-link-page">
      <div className="ilp-container">
        {/* Header avec logo et bio */}
        <header className="ilp-header">
          <div className="ilp-logo-wrapper">
            <img 
              src="/assets/images/logo.png" 
              alt="MDMC Music Ads" 
              className="ilp-logo"
            />
          </div>
          <h1 className="ilp-title">MDMC Music Ads</h1>
          <p className="ilp-bio">
            🎵 Marketing Musical Digital<br />
            🚀 YouTube, Meta & TikTok Ads<br />
            📈 Faites décoller votre musique
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

        {/* Section Blog */}
        <section className="ilp-blog-section">
          <h2 className="ilp-section-title">📚 Derniers Articles du Blog</h2>
          
          {loading && (
            <div className="ilp-loading">
              <span className="ilp-loading-spinner"></span>
              <p>Chargement des articles...</p>
            </div>
          )}
          
          {error && (
            <div className="ilp-error">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && articles.length > 0 && (
            <div className="ilp-articles-grid">
              {articles.map((article, index) => (
                <a
                  key={index}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ilp-article-card"
                >
                  <div className="ilp-article-image">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      onError={(e) => {
                        e.target.src = '/assets/images/logo.png';
                      }}
                    />
                  </div>
                  <div className="ilp-article-content">
                    <h3 className="ilp-article-title">{article.title}</h3>
                    <p className="ilp-article-date">{article.formattedDate}</p>
                    <p className="ilp-article-description">{article.description}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Réseaux sociaux */}
        <section className="ilp-social-section">
          <h2 className="ilp-section-title">Suivez-nous</h2>
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
          <p>&copy; 2025 MDMC Music Ads - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
};

export default InstagramLinkPage;