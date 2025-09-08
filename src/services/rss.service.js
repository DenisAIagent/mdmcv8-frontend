// src/services/rss.service.js
class RSSService {
  constructor() {
    this.RSS_URL = 'https://blog.mdmcmusicads.com/feed/';
    // Utiliser AllOrigins comme proxy CORS gratuit et fiable
    this.CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  }

  async getLatestArticles(limit = 3) {
    try {
      console.log('📡 RSS: Récupération du flux WordPress...');
      
      // Construction de l'URL avec le proxy CORS
      const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(this.RSS_URL)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, application/rss+xml, text/xml',
        },
        // Timeout de 15 secondes
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const xmlText = await response.text();
      console.log('✅ RSS: Flux XML récupéré, taille:', xmlText.length, 'caractères');

      // Vérifier que ce n'est pas une réponse d'erreur HTML
      if (xmlText.includes('<html') || xmlText.includes('<!DOCTYPE')) {
        throw new Error('Réponse HTML au lieu de XML - problème de CORS ou URL incorrecte');
      }

      // Parser le XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Vérifier les erreurs de parsing XML
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.error('❌ RSS: Erreur de parsing XML:', parseError.textContent);
        throw new Error('Erreur de parsing XML: ' + parseError.textContent);
      }

      // Extraire les articles
      const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, limit);
      
      if (items.length === 0) {
        console.warn('⚠️ RSS: Aucun article trouvé dans le flux');
        throw new Error('Aucun article trouvé dans le flux RSS');
      }

      const articles = items.map((item, index) => this.parseRSSItem(item, index));
      
      console.log('✅ RSS: Articles parsés avec succès', { 
        count: articles.length,
        titles: articles.map(a => a.title.substring(0, 30) + '...')
      });
      
      return {
        success: true,
        data: articles,
        source: 'RSS Feed',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ RSS: Erreur lors de la récupération:', error);
      
      // Gestion spécifique des erreurs
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout - Le flux RSS met trop de temps à répondre';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Problème de CORS - Impossible d\'accéder au flux RSS';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Erreur réseau - Vérifiez votre connexion internet';
      }
      
      return {
        success: false,
        error: errorMessage,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  parseRSSItem(item, index) {
    // Extraction des données de base
    const title = this.getTextContent(item, 'title') || `Article ${index + 1}`;
    const link = this.getTextContent(item, 'link') || 'https://blog.mdmcmusicads.com';
    const description = this.getTextContent(item, 'description') || '';
    const pubDate = this.getTextContent(item, 'pubDate');
    
    // Extraction de l'auteur (plusieurs formats possibles)
    const creator = this.getTextContent(item, 'dc:creator') || 
                   this.getTextContent(item, 'author') || 
                   'MDMC Team';

    // Extraction intelligente de l'image
    const imageUrl = this.extractImageFromItem(item, index);

    // Nettoyage et formatage
    const cleanDescription = this.cleanDescription(description);
    const formattedDate = this.formatDate(pubDate);

    return {
      id: `rss-${Date.now()}-${index}`,
      title: this.cleanText(title),
      excerpt: cleanDescription,
      link: link,
      image: imageUrl,
      date: formattedDate,
      author: this.cleanText(creator),
      source: 'WordPress RSS'
    };
  }

  extractImageFromItem(item, index) {
    let imageUrl = null;

    // 1. Chercher dans le contenu encodé (content:encoded)
    const contentEncoded = this.getTextContent(item, 'content:encoded');
    if (contentEncoded) {
      const imgMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
        console.log(`🖼️ RSS: Image trouvée dans content:encoded pour l'article ${index + 1}`);
      }
    }

    // 2. Chercher dans la description si pas trouvé
    if (!imageUrl) {
      const description = this.getTextContent(item, 'description');
      if (description) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
          console.log(`🖼️ RSS: Image trouvée dans description pour l'article ${index + 1}`);
        }
      }
    }

    // 3. Chercher dans les enclosures
    if (!imageUrl) {
      const enclosure = item.querySelector('enclosure[type^="image"]');
      if (enclosure) {
        imageUrl = enclosure.getAttribute('url');
        console.log(`🖼️ RSS: Image trouvée dans enclosure pour l'article ${index + 1}`);
      }
    }

    // 4. Chercher dans les namespaces media
    if (!imageUrl) {
      const mediaContent = item.querySelector('media\\:content[medium="image"], media\\:thumbnail');
      if (mediaContent) {
        imageUrl = mediaContent.getAttribute('url');
        console.log(`🖼️ RSS: Image trouvée dans media namespace pour l'article ${index + 1}`);
      }
    }

    // 5. Fallback avec images marketing musical thématiques
    if (!imageUrl) {
      const marketingImages = [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80', // Music marketing
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80', // Analytics
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80'  // Technology
      ];
      
      imageUrl = marketingImages[index % marketingImages.length];
      console.log(`🔄 RSS: Image thématique utilisée pour l'article ${index + 1}`);
    }

    return imageUrl;
  }

  getTextContent(item, selector) {
    try {
      // Gestion des namespaces XML
      if (selector.includes(':')) {
        const elements = item.getElementsByTagName(selector);
        if (elements.length > 0) {
          return elements[0].textContent.trim();
        }
      }
      
      const element = item.querySelector(selector);
      return element ? element.textContent.trim() : null;
    } catch (error) {
      console.warn(`⚠️ RSS: Erreur extraction ${selector}:`, error.message);
      return null;
    }
  }

  cleanDescription(description) {
    if (!description) return 'Découvrez cet article sur notre blog pour en apprendre davantage...';
    
    try {
      // Enlever les balises HTML
      let cleaned = description.replace(/<[^>]*>/g, '');
      
      // Décoder les entités HTML communes
      const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' ',
        '&hellip;': '...',
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&rdquo;': '"',
        '&ldquo;': '"'
      };
      
      Object.entries(entities).forEach(([entity, char]) => {
        cleaned = cleaned.replace(new RegExp(entity, 'g'), char);
      });
      
      // Nettoyer les espaces multiples
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      // Limiter la longueur et ajouter des points de suspension si nécessaire
      if (cleaned.length > 150) {
        cleaned = cleaned.substring(0, 147) + '...';
      }
      
      return cleaned || 'Découvrez cet article sur notre blog...';
    } catch (error) {
      console.warn('⚠️ RSS: Erreur nettoyage description:', error.message);
      return 'Découvrez cet article sur notre blog...';
    }
  }

  cleanText(text) {
    if (!text) return '';
    
    try {
      // Décoder les entités HTML basiques
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
      if (isNaN(date.getTime())) {
        throw new Error('Date invalide');
      }
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      console.warn('⚠️ RSS: Erreur formatage date:', error.message);
      return new Date().toLocaleDateString('fr-FR');
    }
  }

  async testConnection() {
    try {
      console.log('🔍 RSS: Test de connexion...');
      
      const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(this.RSS_URL)}`;
      const response = await fetch(proxyUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      const result = {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Flux RSS accessible' : `Erreur HTTP ${response.status}`
      };
      
      console.log('🔍 RSS: Test terminé:', result);
      return result;
      
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        message: 'Impossible de tester le flux RSS'
      };
      
      console.log('🔍 RSS: Test échoué:', result);
      return result;
    }
  }
}

export default new RSSService();
