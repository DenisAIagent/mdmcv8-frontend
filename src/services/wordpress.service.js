import axios from 'axios';

const WORDPRESS_BLOG_URL = 'https://blog.mdmcmusicads.com';

class WordPressService {
  constructor() {
    this.api = axios.create({
      baseURL: `${WORDPRESS_BLOG_URL}/wp-json/wp/v2`,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async getLatestPosts(limit = 3) {
    try {
      console.log('📝 WordPress: Récupération directe des articles...');
      
      const response = await this.api.get('/posts', {
        params: {
          per_page: limit,
          _embed: true,
          status: 'publish',
          orderby: 'date',
          order: 'desc'
        }
      });

      console.log('✅ WordPress: Articles récupérés avec succès!', response.data.length);
      
      const formattedPosts = response.data.map(post => ({
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        date: post.date,
        link: post.link,
        slug: post.slug,
        featuredImage: this.extractFeaturedImage(post),
        categories: this.extractCategories(post),
        author: this.extractAuthor(post)
      }));

      return {
        success: true,
        data: formattedPosts
      };

    } catch (error) {
      console.error('❌ WordPress: Erreur lors de la récupération:', error.message);
      
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  extractFeaturedImage(post) {
    if (post._embedded && post._embedded['wp:featuredmedia']) {
      const media = post._embedded['wp:featuredmedia'][0];
      return {
        url: media.source_url,
        alt: media.alt_text || post.title.rendered,
        sizes: media.media_details?.sizes || {}
      };
    }
    return null;
  }

  extractCategories(post) {
    if (post._embedded && post._embedded['wp:term']) {
      const terms = post._embedded['wp:term'][0] || [];
      return terms.map(term => ({
        id: term.id,
        name: term.name,
        slug: term.slug
      }));
    }
    return [];
  }

  extractAuthor(post) {
    if (post._embedded && post._embedded.author) {
      const author = post._embedded.author[0];
      return {
        id: author.id,
        name: author.name,
        slug: author.slug
      };
    }
    return null;
  }

  async testConnection() {
    try {
      const response = await this.api.get('/');
      return { 
        success: true, 
        message: 'Connexion WordPress OK',
        blogInfo: {
          name: response.data.name,
          description: response.data.description,
          url: response.data.url
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export default new WordPressService(); 