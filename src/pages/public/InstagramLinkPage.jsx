import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './InstagramLinkPage.css';

// Configuration du blog MDMC
const BLOG_CONFIG = {
  BASE_URL: 'https://blog.mdmcmusicads.com',
  RSS_URL: 'https://blog.mdmcmusicads.com/feed/',
  // Proxys CORS avec fallback pour robustesse
  CORS_PROXIES: [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ],
  TIMEOUT: 15000,
};

// Service RSS intégré - identique à Articles.jsx
class RSSService {
  async getLatestArticles(limit = 10) {
    console.log('📰 RSS: Récupération directe depuis blog MDMC...', BLOG_CONFIG.RSS_URL);
    
    // Essayer chaque proxy CORS jusqu'à ce qu'un fonctionne
    for (let i = 0; i < BLOG_CONFIG.CORS_PROXIES.length; i++) {
      const proxy = BLOG_CONFIG.CORS_PROXIES[i];
      try {
        console.log(`🔄 RSS: Tentative ${i + 1}/${BLOG_CONFIG.CORS_PROXIES.length} - ${proxy}`);
        
        const proxyUrl = `${proxy}${encodeURIComponent(BLOG_CONFIG.RSS_URL)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/xml, application/rss+xml, text/xml' },
          signal: AbortSignal.timeout(BLOG_CONFIG.TIMEOUT)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur proxy CORS: ${response.status}`);
        }

        const xmlText = await response.text();
        console.log(`✅ RSS: Flux récupéré via proxy ${i + 1}`);

        if (xmlText.includes('<html') || xmlText.includes('<!DOCTYPE')) {
          throw new Error('Réponse HTML au lieu de XML');
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error('Flux RSS invalide');
        }

        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, limit);
        
        if (items.length === 0) {
          throw new Error('Aucun article trouvé dans le flux RSS');
        }

        const articles = items.map((item, index) => this.parseRSSItem(item, index));
        
        console.log('✅ RSS: Articles parsés avec succès', { count: articles.length, proxy: i + 1 });
        
        return {
          success: true,
          data: articles
        };

      } catch (error) {
        console.warn(`⚠️ RSS: Proxy ${i + 1} échoué:`, error.message);
        
        // Si c'est le dernier proxy, on retourne l'erreur
        if (i === BLOG_CONFIG.CORS_PROXIES.length - 1) {
          console.error('❌ RSS: Tous les proxys ont échoué');
          return {
            success: false,
            error: `Tous les proxys CORS ont échoué. Dernière erreur: ${error.message}`,
            data: []
          };
        }
        
        // Sinon, on continue avec le proxy suivant
        continue;
      }
    }
  }

  parseRSSItem(item, index) {
    const title = this.getTextContent(item, 'title') || `Article ${index + 1}`;
    const link = this.getTextContent(item, 'link') || BLOG_CONFIG.BASE_URL;
    const description = this.getTextContent(item, 'description') || '';
    const pubDate = this.getTextContent(item, 'pubDate');
    const creator = this.getTextContent(item, 'dc:creator') || 'MDMC Team';

    const imageUrl = this.extractImage(item, index);
    const cleanDescription = this.cleanDescription(description);
    const formattedDate = this.formatDate(pubDate);

    return {
      id: `rss-${Date.now()}-${index}`,
      title: this.cleanText(title),
      excerpt: cleanDescription,
      link: link,
      image: imageUrl,
      date: formattedDate,
      author: this.cleanText(creator)
    };
  }

  extractImage(item, index) {
    console.log('🔍 Extraction image de couverture pour article', index);
    
    // 1. PRIORITÉ: Image de couverture WordPress (Featured Image)
    // Chercher dans media:content (WordPress RSS media)
    const mediaContents = Array.from(item.querySelectorAll('media\\:content, media\\:thumbnail'));
    for (const mediaContent of mediaContents) {
      const url = mediaContent.getAttribute('url');
      const medium = mediaContent.getAttribute('medium');
      if (url && (medium === 'image' || url.match(/\.(jpg|jpeg|png|webp|gif)$/i))) {
        console.log('🖼️ Image de couverture trouvée dans media:content:', url);
        return url;
      }
    }

    // 2. Enclosure (WordPress RSS Featured Image)
    const enclosures = Array.from(item.querySelectorAll('enclosure'));
    for (const enclosure of enclosures) {
      const type = enclosure.getAttribute('type');
      const url = enclosure.getAttribute('url');
      if (type && type.startsWith('image/') && url) {
        console.log('🖼️ Image de couverture trouvée dans enclosure:', url);
        return url;
      }
    }

    // 3. WordPress Featured Image dans content:encoded
    const contentEncoded = this.getTextContent(item, 'content:encoded');
    if (contentEncoded) {
      const patterns = [
        /<img[^>]*fetchpriority=["']high["'][^>]+src=["']([^"']+)[^>]*>/i,
        /<img[^>]*class="[^"]*wp-image[^"]*"[^>]+src=["']([^"']+)[^>]*>/i,
        /<img[^>]+src=["']([^"']*wp-content[^"']*\.(jpg|jpeg|png|webp|gif))[^>]*>/i,
        /<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp|gif))[^>]*>/i
      ];
      
      for (const pattern of patterns) {
        const imgMatch = contentEncoded.match(pattern);
        if (imgMatch && imgMatch[1]) {
          console.log('🖼️ Image de couverture trouvée dans content:encoded:', imgMatch[1]);
          return imgMatch[1];
        }
      }
    }

    console.log('❌ Aucune image de couverture trouvée pour l\'article', index);
    return null;
  }

  getTextContent(item, selector) {
    try {
      if (selector.includes(':')) {
        const elements = item.getElementsByTagName(selector);
        if (elements.length > 0) {
          return elements[0].textContent.trim();
        }
      }
      const element = item.querySelector(selector);
      return element ? element.textContent.trim() : null;
    } catch (error) {
      return null;
    }
  }

  cleanDescription(description) {
    if (!description) return 'Découvrez cet article sur notre blog...';
    
    let cleaned = description.replace(/<[^>]*>/g, '');
    
    const entities = {
      '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
      '&#39;': "'", '&nbsp;': ' ', '&hellip;': '...'
    };
    
    Object.entries(entities).forEach(([entity, char]) => {
      cleaned = cleaned.replace(new RegExp(entity, 'g'), char);
    });
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 147) + '...';
    }
    
    return cleaned || 'Découvrez cet article sur notre blog...';
  }

  cleanText(text) {
    if (!text) return '';
    try {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = text;
      return textArea.value.trim();
    } catch (error) {
      return text.trim();
    }
  }

  formatDate(pubDate) {
    if (!pubDate) return new Date().toLocaleDateString('fr-FR');
    try {
      const date = new Date(pubDate);
      return isNaN(date.getTime()) ? new Date().toLocaleDateString('fr-FR') : date.toLocaleDateString('fr-FR');
    } catch (error) {
      return new Date().toLocaleDateString('fr-FR');
    }
  }
}

// Instance du service RSS
const rssService = new RSSService();

const InstagramLinkPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await rssService.getLatestArticles(3);
      
      if (response.success && response.data.length > 0) {
        setArticles(response.data);
        console.log('✅ Articles: Chargés depuis blog MDMC avec succès');
      } else {
        throw new Error(response.error || 'Aucun article trouvé');
      }
      
    } catch (err) {
      console.error('❌ Articles: Erreur blog MDMC', err);
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };


  const mainLinks = [
    {
      title: 'Simulateur de Campagne',
      url: 'https://www.mdmcmusicads.com/#simulator',
      description: 'Estimez les résultats de votre campagne',
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
              src="/assets/images/logo.png" 
              alt="MDMC Music Ads" 
              className="ilp-logo"
            />
          </div>
          <h1 className="ilp-title">MDMC Music Ads</h1>
          <p className="ilp-bio">
            Marketing Musical Digital<br />
            YouTube, Meta & TikTok Ads<br />
            Faites décoller votre musique
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
                    <p className="ilp-article-description">{article.excerpt || article.description || "Découvrez cet article passionnant sur notre blog..."}</p>
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