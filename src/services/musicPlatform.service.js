import apiService from "./api.service";

const musicPlatformService = {
  /**
   * Récupère les liens cross-platform via Odesli API
   * @param {string} sourceUrl - URL Spotify/Apple/YouTube ou ISRC/UPC
   * @param {string} userCountry - Code pays (FR, US, etc.)
   * @returns {Promise<Object>} Données formatées pour l'interface
   */
  async fetchLinksFromSourceUrl(sourceUrl, userCountry = 'FR') {
    // Validation service disponible
    if (!apiService?.smartlinks?.fetchPlatformLinks) {
      console.error("ERREUR: Service smartlinks non configuré");
      throw new Error("Service smartlinks non configuré correctement");
    }

    console.log(`🔍 Frontend: Récupération liens pour: ${sourceUrl} (${userCountry})`);
    
    try {
      // Préparation de l'input
      let cleanSourceUrl = sourceUrl.trim();
      
      // Nettoyage URLs Spotify (suppression paramètres)
      if (cleanSourceUrl.includes('?') && cleanSourceUrl.includes('spotify.com')) {
        cleanSourceUrl = cleanSourceUrl.split('?')[0];
        console.log("🧹 URL Spotify nettoyée:", cleanSourceUrl);
      }
      
      // Appel API backend avec Odesli
      const response = await apiService.smartlinks.fetchPlatformLinks(cleanSourceUrl, userCountry);
      
      console.log("📥 Réponse Odesli reçue:", response);

      if (response?.success && response?.data) {
        const data = response.data;
        
        // Traitement des liens de plateformes (Odesli retourne linksByPlatform)
        const links = data.linksByPlatform || data.links || {};
        const hasLinks = typeof links === 'object' && !Array.isArray(links) && Object.keys(links).length > 0;
        
        if (hasLinks) {
          // Nettoyage et formatage des liens
          const cleanedLinks = {};
          Object.entries(links).forEach(([platform, linkData]) => {
            if (linkData && typeof linkData === 'object' && linkData.url) {
              // Extraire l'URL principale, nettoyer
              cleanedLinks[platform] = linkData.url.replace(/;$/, '');
            } else if (typeof linkData === 'string') {
              // Format simple: plateforme -> URL
              cleanedLinks[platform] = linkData.replace(/;$/, '');
            }
          });
          
          console.log(`✅ ${Object.keys(cleanedLinks).length} plateformes récupérées:`, Object.keys(cleanedLinks));
          
          return {
            success: true,
            data: {
              // Métadonnées principales (compatibilité Odesli)
              title: data.title || "",
              artist: data.artist || data.artistName || "",
              album: data.album || data.albumName || "",
              artwork: data.artwork || data.thumbnailUrl || "",
              isrc: data.isrc || "",
              type: data.type || "song",
              duration: data.duration,
              releaseDate: data.releaseDate,
              
              // Liens formatés pour l'UI
              linksByPlatform: cleanedLinks,
              
              // Données enrichies Odesli
              alternativeArtworks: data.alternativeArtworks || [],
              pageUrl: data.pageUrl,
              entityId: data.entityId,
              apiProvider: data.apiProvider,
              inputType: data.inputType,
              userCountry: data.userCountry
            }
          };
        } else {
          console.warn("⚠️ Aucun lien trouvé dans la réponse");
          return {
            success: false,
            error: "Aucune plateforme trouvée pour ce contenu.",
            data: null
          };
        }
      } else {
        const errorMessage = response?.error || response?.message || "Réponse API invalide";
        console.error("❌ Réponse backend invalide:", response);
        return {
          success: false,
          error: errorMessage,
          data: null
        };
      }
      
    } catch (error) {
      console.error("❌ Erreur service musicPlatform:", error);
      
      // Gestion d'erreurs spécifiques
      let errorMessage = "Erreur lors de la récupération des liens musicaux.";
      
      if (error.response?.status === 404) {
        errorMessage = "Contenu non trouvé. Vérifiez l'URL ou l'ISRC.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Format d'URL ou ISRC invalide.";
      } else if (error.response?.status === 429) {
        errorMessage = "Trop de requêtes. Réessayez dans quelques minutes.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Valide le format d'input utilisateur
   * @param {string} input - URL ou code à valider
   * @returns {Object} Résultat de validation
   */
  validateInput(input) {
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return { valid: false, error: "URL ou ISRC requis" };
    }

    const cleanInput = input.trim();

    // ISRC: 12 caractères alphanumériques
    if (/^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/.test(cleanInput)) {
      return { valid: true, type: 'isrc', value: cleanInput };
    }

    // UPC/EAN: 12-13 chiffres
    if (/^[0-9]{12,13}$/.test(cleanInput)) {
      return { valid: true, type: 'upc', value: cleanInput };
    }

    // URLs supportées
    const urlPatterns = [
      { pattern: /open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+/, type: 'spotify' },
      { pattern: /music\.apple\.com\/[a-z]{2}\//, type: 'apple_music' },
      { pattern: /music\.youtube\.com\/watch/, type: 'youtube_music' },
      { pattern: /deezer\.com\/(track|album|playlist)\/[0-9]+/, type: 'deezer' },
      { pattern: /^https?:\/\//, type: 'url' }
    ];

    for (const { pattern, type } of urlPatterns) {
      if (pattern.test(cleanInput)) {
        return { valid: true, type, value: cleanInput };
      }
    }

    return { 
      valid: false, 
      error: "Format non supporté. Utilisez: URL Spotify/Apple Music/YouTube Music/Deezer, ISRC ou UPC." 
    };
  },

  /**
   * Détecte les formats supportés et fournit des exemples
   * @returns {Array} Liste des formats supportés avec exemples
   */
  getSupportedFormats() {
    return [
      {
        type: 'Spotify URL',
        example: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
        description: 'Lien direct vers un titre Spotify'
      },
      {
        type: 'Apple Music URL',
        example: 'https://music.apple.com/us/album/bohemian-rhapsody/...',
        description: 'Lien direct vers Apple Music'
      },
      {
        type: 'YouTube Music URL',
        example: 'https://music.youtube.com/watch?v=fJ9rUzIMcZQ',
        description: 'Lien direct vers YouTube Music'
      },
      {
        type: 'Deezer URL',
        example: 'https://deezer.com/track/123456789',
        description: 'Lien direct vers Deezer'
      },
      {
        type: 'ISRC',
        example: 'GBUM71507609',
        description: 'Code ISRC international (12 caractères)'
      },
      {
        type: 'UPC/EAN',
        example: '050087246235',
        description: 'Code produit universel (12-13 chiffres)'
      }
    ];
  }
};

export default musicPlatformService;
