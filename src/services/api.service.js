// src/services/api.service.js - Version Complète Finale

import API_CONFIG from '../config/api.config.js';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

console.log('🔧 API Service Config:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

// Service API MDMC - Version Production

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      };

      // Si BYPASS_AUTH est activé, ajouter un token de développement
      const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
      if (bypassAuth) {
        headers['Authorization'] = 'Bearer dev-bypass-token';
        console.log('🔓 API Request: Bypass auth activé');
      }

      const config = {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: controller.signal,
        ...options
      };

      console.log('📤 API Request:', {
        method: config.method,
        url: `${this.baseURL}${endpoint}`,
        headers: config.headers
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);

      console.log('📥 API Response:', {
        status: response.status,
        url: `${this.baseURL}${endpoint}`
      });

      if (!response.ok) {
        // Essayer de récupérer le message d'erreur du backend
        try {
          const errorData = await response.json();
          console.error('🔍 DEBUG - Erreur backend complète:', errorData);
          const errorMessage = errorData.error || errorData.message || response.statusText;
          throw new Error(`${response.status}: ${errorMessage}`);
        } catch (parseError) {
          console.error('🔍 DEBUG - Impossible de parser l\'erreur backend:', parseError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Délai d\'attente dépassé');
      }
      
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  // SERVICE REVIEWS - Avec fallback car données marketing importantes
  reviews = {
    getReviews: async (params = {}) => {
      try {
        console.log('🔍 Reviews: Chargement via API...', params);
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/reviews${queryString ? `?${queryString}` : ''}`;
        
        const response = await this.request(endpoint);
        return response;
      } catch (error) {
        console.error('❌ Reviews: Erreur API:', error);
        throw error;
      }
    },

    createReview: async (reviewData) => {
      try {
        console.log('📤 Reviews: Soumission via API...', reviewData);
        return await this.request('/reviews', {
          method: 'POST',
          body: JSON.stringify(reviewData)
        });
      } catch (error) {
        console.error('❌ Reviews: Erreur soumission:', error);
        throw error;
      }
    }
  };

  // SERVICE AUTH
  auth = {
    getMe: async () => {
      try {
        console.log('🔐 Auth: Vérification statut utilisateur...');
        return await this.request('/auth/me');
      } catch (error) {
        console.warn('🔐 Auth: Non authentifié');
        return { success: false, error: 'Non authentifié' };
      }
    },

    login: async (credentials) => {
      try {
        console.log('🔐 Auth: Tentative de connexion...', { email: credentials.email });
        return await this.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
      } catch (error) {
        console.error('🔐 Auth: Erreur de connexion', error);
        throw error;
      }
    },

    logout: async () => {
      try {
        console.log('🔐 Auth: Déconnexion...');
        return await this.request('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.warn('🔐 Auth: Déconnexion locale forcée');
        return { success: true };
      }
    }
  };

  // SERVICE WORDPRESS
  wordpress = {
    getPosts: async (limit = 3) => {
      try {
        console.log('📝 WordPress: Récupération articles...', { limit });
        return await this.request(`/wordpress/posts?limit=${limit}`);
      } catch (error) {
        console.warn('📝 WordPress: API indisponible');
        throw error;
      }
    }
  };

  // SERVICE ARTISTS - Sans fallback, 404 si pas de données
  artists = {
    getArtists: async () => {
      console.log('👨‍🎤 Artists: Récupération liste artistes...');
      return await this.request('/artists');
    },

    getAllArtists: async () => {
      console.log('👨‍🎤 Artists: Récupération liste artistes (getAllArtists)...');
      return await this.request('/artists');
    },

    create: async (artistData) => {
      console.log('👨‍🎤 Artists: Création artiste...', artistData);
      return await this.request('/artists', {
        method: 'POST',
        body: JSON.stringify(artistData)
      });
    }
  };

  // SERVICE SMARTLINKS 
  smartlinks = {
    getAll: async () => {
      console.log('🔗 SmartLinks: Récupération liste...');
      return await this.request('/smartlinks');
    },

    create: async (smartlinkData) => {
      console.log('🔗 SmartLinks: Création...', smartlinkData);
      return await this.request('/smartlinks', {
        method: 'POST',
        body: JSON.stringify(smartlinkData)
      });
    },

    update: async (id, smartlinkData) => {
      console.log('🔗 SmartLinks: Mise à jour...', { id, smartlinkData });
      return await this.request(`/smartlinks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(smartlinkData)
      });
    },

    getById: async (id) => {
      console.log('🔗 SmartLinks: Récupération par ID...', id);
      return await this.request(`/smartlinks/${id}`);
    },

    getBySlugs: async (artistSlug, trackSlug) => {
      console.log('🔗 SmartLinks: Récupération par slugs...', { artistSlug, trackSlug });
      return await this.request(`/smartlinks/public/${artistSlug}/${trackSlug}`);
    },

    deleteById: async (id) => {
      console.log('🔗 SmartLinks: Suppression...', id);
      return await this.request(`/smartlinks/${id}`, {
        method: 'DELETE'
      });
    },

fetchPlatformLinks: async (sourceUrl, userCountry = 'FR') => {
  console.log('🔗 SmartLinks: Récupération liens plateformes...', { sourceUrl, userCountry });
  return await this.request('/smartlinks/fetch-platform-links', {
    method: 'POST',
    body: JSON.stringify({ sourceUrl, userCountry })
  });
}
  };

  // SERVICE MUSIC PLATFORM - Sans fallback
  musicPlatform = {
    fetchLinksFromSourceUrl: async (sourceUrl) => {
      console.log('🎵 MusicPlatform: Récupération liens...', sourceUrl);
      return await this.request('/music-platform/fetch-links', {
        method: 'POST',
        body: JSON.stringify({ sourceUrl })
      });
    }
  };

  // SERVICE SIMULATOR - Connexion n8n
  submitSimulatorResults = async (simulatorData) => {
    try {
      console.log('🎯 Simulator: Envoi vers n8n...', simulatorData);
      
      // URL du webhook n8n Railway
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n-production-de00.up.railway.app/webhook/music-simulator-lead';
      
      // Formatage des données pour le workflow n8n (avec inscription Brevo + email notification)
      const n8nPayload = {
        // Données principales
        artist_name: simulatorData.artistName,
        email: simulatorData.email,
        budget: parseInt(simulatorData.budget),
        target_zone: simulatorData.platform, // meta, youtube, tiktok
        zone_cible: simulatorData.country,   // usa, europe, canada...
        campaign_type: simulatorData.campaignType,
        views: simulatorData.views,
        cpv: simulatorData.cpv,
        reach: simulatorData.reach,
        source: 'simulator_web',
        timestamp: new Date().toISOString(),
        platform: simulatorData.platform,
        name: simulatorData.artistName,
        
        // Actions à déclencher dans n8n
        actions: {
          brevo_newsletter: true,  // Inscrire dans la newsletter Brevo
          email_notification: true, // Envoyer email de notification à Denis
          lead_source: 'simulateur_web' // Source du lead pour suivi
        },
        
        // Données enrichies pour Brevo
        brevo_attributes: {
          PRENOM: simulatorData.artistName,
          BUDGET_ESTIME: parseInt(simulatorData.budget),
          PLATEFORME_INTERESSE: simulatorData.platform,
          ZONE_CIBLE: simulatorData.country,
          TYPE_CAMPAGNE: simulatorData.campaignType,
          VUES_ESTIMEES: simulatorData.views,
          SOURCE_INSCRIPTION: 'Simulateur MDMC'
        }
      };

      console.log('📤 Simulator: Payload n8n:', n8nPayload);

      // Requête vers n8n Railway
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(n8nPayload),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`n8n Webhook Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Simulator: Lead envoyé à n8n avec succès:', result);
      
      return {
        success: true,
        message: 'Lead traité avec succès',
        leadId: result.leadId || `LEAD_${Date.now()}`,
        data: result
      };

    } catch (error) {
      console.error('❌ Simulator: Erreur envoi n8n:', error);
      throw error;
    }
  };

  // SERVICE ANALYTICS - Statistiques dashboard
  analytics = {
    getDashboardStats: async () => {
      console.log('📊 Analytics: Récupération statistiques dashboard...');
      return await this.request('/analytics/dashboard');
    },

    getGlobalStats: async (params = {}) => {
      console.log('📊 Analytics: Récupération statistiques globales...', params);
      const query = new URLSearchParams(params).toString();
      return await this.request(`/analytics/global${query ? `?${query}` : ''}`);
    },

    getSmartLinkStats: async (id, params = {}) => {
      console.log('📊 Analytics: Récupération statistiques SmartLink...', id);
      const query = new URLSearchParams(params).toString();
      return await this.request(`/analytics/smartlink/${id}${query ? `?${query}` : ''}`);
    },

    getArtistStats: async (id, params = {}) => {
      console.log('📊 Analytics: Récupération statistiques artiste...', id);
      const query = new URLSearchParams(params).toString();
      return await this.request(`/analytics/artist/${id}${query ? `?${query}` : ''}`);
    }
  };
}

// Instance singleton
const apiService = new ApiService();

// Gestion globale des erreurs non capturées
window.addEventListener('unhandledrejection', (event) => {
  console.warn('🔧 Promise non gérée:', event.reason);
  event.preventDefault();
});

// Export par défaut compatible avec votre code existant
export default apiService;
