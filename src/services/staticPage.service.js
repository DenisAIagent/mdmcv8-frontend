// src/services/staticPage.service.js
// Service pour gérer les pages statiques via l'API backend

import apiService from './api.service.js';

class StaticPageService {
  /**
   * Génère une page statique via l'API backend
   * @param {Object} smartlinkData - Données du SmartLink
   * @returns {Promise<Object>} - Résultat de la génération
   */
  async generateStaticPage(smartlinkData) {
    try {
      console.log('📄 Génération page statique pour:', smartlinkData.shortId);
      
      const response = await apiService.post('/static-pages/generate', {
        smartlinkId: smartlinkData._id,
        shortId: smartlinkData.shortId,
        trackTitle: smartlinkData.trackTitle,
        artistName: smartlinkData.artistName,
        coverImageUrl: smartlinkData.coverImageUrl,
        description: smartlinkData.description || smartlinkData.customDescription
      });
      
      if (response.data && response.data.success) {
        console.log('✅ Page statique générée:', response.data.url);
        return {
          success: true,
          url: response.data.url,
          filePath: response.data.filePath
        };
      } else {
        console.error('❌ Échec génération page statique:', response.data);
        return {
          success: false,
          error: response.data?.message || 'Erreur inconnue'
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur service page statique:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Régénère toutes les pages statiques
   * @returns {Promise<Object>} - Résultat de la régénération
   */
  async regenerateAllPages() {
    try {
      console.log('🔄 Régénération de toutes les pages statiques...');
      
      const response = await apiService.post('/static-pages/regenerate-all');
      
      if (response.data && response.data.success) {
        console.log(`✅ ${response.data.generated} pages régénérées`);
        return {
          success: true,
          generated: response.data.generated,
          failed: response.data.failed || 0
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Erreur régénération'
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur régénération:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Supprime une page statique
   * @param {string} shortId - ID court du SmartLink
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  async deleteStaticPage(shortId) {
    try {
      console.log('🗑️ Suppression page statique:', shortId);
      
      const response = await apiService.delete(`/static-pages/${shortId}`);
      
      if (response.data && response.data.success) {
        console.log('✅ Page statique supprimée');
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Erreur suppression'
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression page statique:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Valide qu'une page statique existe et fonctionne
   * @param {string} shortId - ID court du SmartLink
   * @returns {Promise<Object>} - Résultat de la validation
   */
  async validateStaticPage(shortId) {
    try {
      const url = `https://www.mdmcmusicads.com/sl/${shortId}.html`;
      
      // Test d'accès direct
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        console.log('✅ Page statique accessible:', url);
        return {
          success: true,
          url,
          status: response.status
        };
      } else {
        console.warn('⚠️ Page statique inaccessible:', response.status);
        return {
          success: false,
          url,
          status: response.status,
          error: `HTTP ${response.status}`
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur validation page statique:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export de l'instance
const staticPageService = new StaticPageService();
export default staticPageService;