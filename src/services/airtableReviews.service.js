// src/services/airtableReviews.service.js
class AirtableReviewsService {
  constructor() {
    // Variables d'environnement sécurisées
    this.baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    this.tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Reviews';
    this.apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableName}`;
    
    // Validation des variables d'environnement
    if (!this.baseId || !this.apiKey) {
      console.warn('⚠️ Airtable: Variables d\'environnement manquantes');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
      console.log('✅ Airtable Service initialized:', { 
        baseId: this.baseId.substring(0, 8) + '***',
        tableName: this.tableName 
      });
    }

    // Headers réutilisables
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getApprovedReviews() {
    // Si pas configuré, retourner les données de fallback
    if (!this.isConfigured) {
      console.log('🔄 Configuration manquante, utilisation du fallback');
      return this.getFallbackReviews();
    }

    try {
      console.log('🔍 Airtable: Récupération des avis approuvés...');
      
      // URL avec filtres et tri
      const params = new URLSearchParams({
        filterByFormula: "AND({Status} = 'Approved', {Rating} > 0)",
        sort: JSON.stringify([
          { field: 'Featured', direction: 'desc' },
          { field: 'Submitted At', direction: 'desc' }
        ]),
        maxRecords: '50'
      });

      const url = `${this.baseUrl}?${params.toString()}`;
      
      // Requête avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const reviewsCount = data.records?.length || 0;
      
      console.log('✅ Airtable: Avis récupérés avec succès', { 
        count: reviewsCount,
        hasOffset: !!data.offset 
      });
      
      if (reviewsCount === 0) {
        console.log('ℹ️ Aucun avis approuvé trouvé, utilisation du fallback');
        return this.getFallbackReviews();
      }

      return this.formatReviews(data.records);
      
    } catch (error) {
      console.warn('⚠️ Airtable: Erreur lors de la récupération', {
        error: error.message,
        name: error.name
      });
      
      // Fallback en cas d'erreur
      return this.getFallbackReviews();
    }
  }

  async submitReview(reviewData) {
    if (!this.isConfigured) {
      return {
        success: true,
        message: 'Merci pour votre avis ! (Mode développement)',
        id: `dev_${Date.now()}`
      };
    }

    try {
      console.log('📝 Airtable: Soumission nouvel avis...', { 
        name: reviewData.name,
        rating: reviewData.rating 
      });
      
      const record = {
        fields: {
          'Name': reviewData.name?.trim() || 'Anonyme',
          'Email': reviewData.email?.trim() || '',
          'Company': reviewData.company?.trim() || '',
          'Website': reviewData.website?.trim() || '',
          'Rating': parseInt(reviewData.rating) || 5,
          'Message': reviewData.message?.trim() || '',
          'Status': 'Pending',
          'Featured': false,
          'Source': 'Website Form',
          'Submitted At': new Date().toISOString()
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Airtable: Avis soumis avec succès', { id: result.id });
      
      return {
        success: true,
        message: 'Merci pour votre avis ! Il sera publié après modération.',
        id: result.id
      };
      
    } catch (error) {
      console.error('❌ Airtable: Échec de soumission', error);
      return {
        success: false,
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        error: error.message
      };
    }
  }

  formatReviews(records) {
    return records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        name: fields.Name || 'Client anonyme',
        company: fields.Company || '',
        rating: parseInt(fields.Rating) || 5,
        comment: fields.Message || '',
        featured: fields.Featured || false,
        avatar: this.generateAvatar(fields.Name, fields.Email),
        submittedAt: fields['Submitted At'] || new Date().toISOString(),
        source: fields.Source || 'Airtable',
        status: fields.Status || 'Approved',
        // Données calculées
        initials: this.getInitials(fields.Name),
        timeAgo: this.getTimeAgo(fields['Submitted At'])
      };
    });
  }

  generateAvatar(name, email) {
    // Si email présent, utiliser Gravatar
    if (email) {
      const hash = this.md5(email.toLowerCase().trim());
      return `https://www.gravatar.com/avatar/${hash}?s=64&d=identicon&r=pg`;
    }
    
    // Sinon, avatar Unsplash avec seed basé sur le nom
    const seed = name ? name.toLowerCase().replace(/\s+/g, '') : 'default';
    const imageIds = [
      'photo-1494790108755-2616b612b641', // Femme souriante
      'photo-1472099645785-5658abf4ff4e', // Homme professionnel
      'photo-1438761681033-6461ffad8d80', // Femme professionnelle
      'photo-1507003211169-0a1dd7228f2d', // Homme décontracté
      'photo-1534528741775-53994a69daeb'  // Femme créative
    ];
    
    const imageIndex = this.hashCode(seed) % imageIds.length;
    return `https://images.unsplash.com/${imageIds[imageIndex]}?w=64&h=64&fit=crop&crop=face`;
  }

  getInitials(name) {
    if (!name) return 'AN';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getTimeAgo(dateString) {
    if (!dateString) return 'Récemment';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Aujourd\'hui';
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
      if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
      return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
    } catch {
      return 'Récemment';
    }
  }

  // Utilitaires
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  md5(str) {
    // Implémentation MD5 simplifiée pour Gravatar
    // En production, utilise crypto-js ou une vraie lib MD5
    return btoa(str).replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 32);
  }

  getFallbackReviews() {
    console.log('🔄 Airtable: Utilisation des données de fallback - vrais témoignages clients');
    return [
      {
        id: 'IF',
        name: "Isabelle Fontan",
        company: "MOX Musique",
        rating: 5,
        comment: "Denis est un professionnel fiable, sérieux, réactif et surtout efficace. Nous avons travaillé ensemble sur de nombreuses campagnes, il a su me conseiller au mieux et je suis très satisfaite des résultats que nous avons obtenus. C'est l'expert Google Ads qui sera à l'écoute de votre problématique !",
        featured: true,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b641?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2023-02-03T10:00:00Z",
        source: "Google Reviews",
        initials: "IF",
        timeAgo: "Février 2023",
        usage: "Fallback chanson / adultes / profils exigeants"
      },
      {
        id: 'FT',
        name: "Fred Tavernier",
        company: "Try & Dye Records",
        rating: 5,
        comment: "Cela fait maintenant quelques années que nous travaillons avec Denis pour la gestion de nos campagnes promotionnelles autour de la sortie des vidéoclips de nos artistes, notamment OUTED, et nous sommes très contents du résultat. La communication et les échanges sont efficaces et rapides et les résultats au rendez-vous. Denis est à l'écoute de nos besoins et sait réagir en conséquence en fonction des budgets.",
        featured: true,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2023-02-03T14:30:00Z",
        source: "LinkedIn",
        initials: "FT",
        timeAgo: "Février 2023",
        usage: "Fallback rock / indé / label"
      },
      {
        id: 'TB',
        name: "Tania Barros",
        company: "Où sortir à Lisbonne",
        rating: 5,
        comment: "Super travail de Denis. J'aime beaucoup travailler avec lui. Il est disponible et très pro. Je recommande les yeux fermés !",
        featured: false,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2023-02-03T09:15:00Z",
        source: "Facebook",
        initials: "TB",
        timeAgo: "Février 2023",
        usage: "Fallback B2B / événementiel / local"
      },
      {
        id: 'ML',
        name: "Manon L'Huillier",
        company: "MLH Promotion",
        rating: 5,
        comment: "Un travail efficace sur chaque collaboration. Denis a su être à l'écoute de nos attentes et nous proposer des stratégies adaptées aux deadlines et aux budgets imposés.",
        featured: false,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2019-07-09T11:20:00Z",
        source: "Google Reviews",
        initials: "ML",
        timeAgo: "Juillet 2019",
        usage: "Fallback label / chanson française / promo rapide"
      }
    ];
  }

  // Test de connexion Airtable
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Configuration manquante' };
    }

    try {
      const response = await fetch(`${this.baseUrl}?maxRecords=1`, {
        method: 'GET',
        headers: this.headers
      });

      return {
        success: response.ok,
        status: response.status,
        configured: this.isConfigured
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        configured: this.isConfigured
      };
    }
  }
}

// Instance exportée
export default new AirtableReviewsService();
