// src/services/featurable.service.js
class FeaturableService {
  constructor() {
    this.widgetId = 'e5383027-5079-48d2-910c-cd67dc85b476';
    this.baseUrl = 'https://featurable.com/api/v1/widgets';
  }

  async getReviews() {
    try {
      console.log('📊 Récupération des avis Google My Business via Featurable...');
      
      const response = await fetch(`${this.baseUrl}/${this.widgetId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Données Featurable reçues:', data);

      // Transformer les données pour correspondre au format attendu par le composant Reviews
      const transformedReviews = this.transformReviews(data);
      
      console.log('🔄 Avis transformés:', { count: transformedReviews.length });
      return transformedReviews;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des avis Featurable:', error);
      
      if (error.message.includes('Content Security Policy')) {
        throw new Error('Problème de sécurité (CSP) - Rechargez la page');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Connexion impossible à Featurable - Vérifiez votre connexion internet');
      } else {
        throw new Error(`Impossible de récupérer les avis: ${error.message}`);
      }
    }
  }

  transformReviews(data) {
    try {
      // Vérifier que nous avons bien reçu des données avec des avis
      if (!data || !data.reviews || !Array.isArray(data.reviews)) {
        console.warn('⚠️ Structure de données Featurable inattendue:', data);
        return [];
      }

      const reviews = data.reviews;
      console.log('🔄 Transformation de', reviews.length, 'avis Google My Business');

      return reviews.map((review, index) => {
        // Générer des initiales à partir du nom
        const getInitials = (name) => {
          if (!name) return '?';
          return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
        };

        // Calculer le temps écoulé
        const getTimeAgo = (dateString) => {
          if (!dateString) return 'Récemment';
          
          try {
            const reviewDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - reviewDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return "Aujourd'hui";
            if (diffDays === 1) return 'Il y a 1 jour';
            if (diffDays < 7) return `Il y a ${diffDays} jours`;
            if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
            if (diffDays < 365) return `Il y a ${Math.ceil(diffDays / 30)} mois`;
            return `Il y a ${Math.ceil(diffDays / 365)} ans`;
          } catch (error) {
            return 'Récemment';
          }
        };

        // Nettoyer le commentaire (enlever la traduction Google)
        const cleanComment = (comment) => {
          if (!comment) return 'Excellent service !';
          
          // Supprimer la partie "(Translated by Google)" et ce qui suit
          const translationIndex = comment.indexOf('(Translated by Google)');
          if (translationIndex !== -1) {
            return comment.substring(0, translationIndex).trim();
          }
          
          return comment.trim();
        };

        // Transformer l'avis au format attendu
        const transformedReview = {
          id: review.reviewId || `featurable-${index}`,
          name: review.reviewer?.displayName || 'Client anonyme',
          initials: getInitials(review.reviewer?.displayName),
          company: null, // Google My Business ne fournit généralement pas cette info
          rating: review.starRating || 5,
          comment: cleanComment(review.comment),
          timeAgo: getTimeAgo(review.createTime),
          source: 'Google My Business',
          featured: review.starRating >= 5, // Marquer les 5 étoiles comme vedettes
          avatar: review.reviewer?.profilePhotoUrl || null
        };

        console.log('✅ Avis transformé:', {
          name: transformedReview.name,
          rating: transformedReview.rating,
          timeAgo: transformedReview.timeAgo
        });

        return transformedReview;
      });

    } catch (error) {
      console.error('❌ Erreur lors de la transformation des avis:', error);
      return [];
    }
  }

  async testConnection() {
    try {
      console.log('🔧 Test de connexion Featurable...');
      
      const response = await fetch(`${this.baseUrl}/${this.widgetId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        widgetId: this.widgetId
      };

      if (response.ok) {
        console.log('✅ Connexion Featurable réussie');
      } else {
        console.log('❌ Connexion Featurable échouée:', result);
      }

      return result;

    } catch (error) {
      console.error('❌ Erreur test connexion Featurable:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Content Security Policy')) {
        errorMessage = 'Problème de sécurité (CSP) - Rechargez la page';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Connexion impossible à Featurable';
      }
      
      return {
        success: false,
        error: errorMessage,
        widgetId: this.widgetId
      };
    }
  }

  // Méthode pour obtenir les statistiques
  async getStats() {
    try {
      const reviews = await this.getReviews();
      
      const stats = {
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 
          ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
          : '5.0',
        featuredCount: reviews.filter(review => review.featured).length,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        }
      };

      return stats;
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      return null;
    }
  }
}

// Export d'une instance unique
const featurableService = new FeaturableService();
export default featurableService;