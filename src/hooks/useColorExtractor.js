/**
 * 🎨 Hook React pour l'extraction de couleur dominante
 * Simplifie l'utilisation du ColorExtractor dans les composants
 */

import { useState, useEffect, useCallback } from 'react';
import colorExtractorService from '../services/colorExtractor.service';

/**
 * Hook pour extraire la couleur dominante d'une image
 * @param {string} imageUrl - URL de l'image à analyser
 * @param {Object} options - Options de configuration
 * @returns {Object} État et fonctions du color extractor
 */
export const useColorExtractor = (imageUrl, options = {}) => {
  const [state, setState] = useState({
    colors: null,
    isLoading: false,
    error: null,
    hasAnalyzed: false
  });

  const {
    autoExtract = true,
    quality = 10,
    crossOrigin = 'anonymous',
    fallbackColor = [255, 107, 53],
    enableCache = true,
    debounceMs = 300
  } = options;

  /**
   * Extrait les couleurs avec gestion d'état
   */
  const extractColors = useCallback(async (url = imageUrl) => {
    if (!url) {
      console.warn('⚠️ useColorExtractor: URL manquante');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const colors = await colorExtractorService.extractDominantColor(url, {
        quality,
        crossOrigin,
        fallbackColor,
        enableCache
      });

      setState({
        colors,
        isLoading: false,
        error: null,
        hasAnalyzed: true
      });

      return colors;

    } catch (error) {
      console.error('❌ useColorExtractor error:', error);
      
      setState({
        colors: null,
        isLoading: false,
        error: error.message,
        hasAnalyzed: true
      });

      throw error;
    }
  }, [imageUrl, quality, crossOrigin, fallbackColor, enableCache]);

  /**
   * Reset l'état
   */
  const reset = useCallback(() => {
    setState({
      colors: null,
      isLoading: false,
      error: null,
      hasAnalyzed: false
    });
  }, []);

  /**
   * Auto-extraction avec debounce
   */
  useEffect(() => {
    if (!autoExtract || !imageUrl) return;

    const timeoutId = setTimeout(() => {
      extractColors();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [imageUrl, autoExtract, extractColors, debounceMs]);

  return {
    // État
    colors: state.colors,
    isLoading: state.isLoading,
    error: state.error,
    hasAnalyzed: state.hasAnalyzed,
    
    // Actions
    extractColors,
    reset,
    
    // Utilitaires
    isError: !!state.error,
    isSuccess: !state.isLoading && !state.error && !!state.colors,
    isEmpty: !state.isLoading && !state.error && !state.colors,
    
    // Couleurs prêtes à utiliser
    primaryColor: state.colors?.primary?.rgb,
    backgroundColor: state.colors?.background?.medium,
    gradientBackground: state.colors?.gradients?.blur,
    textColor: state.colors?.metadata?.contrast?.primary,
    isLightTheme: state.colors?.metadata?.isLight
  };
};

/**
 * Hook simplifié pour obtenir juste la couleur de background
 * @param {string} imageUrl - URL de l'image
 * @returns {Object} Background color data
 */
export const useBackgroundColor = (imageUrl, intensity = 'medium') => {
  const { colors, isLoading, error } = useColorExtractor(imageUrl);

  return {
    backgroundColor: colors?.background?.[intensity] || 'rgba(255, 107, 53, 0.3)',
    gradientBackground: colors?.gradients?.blur || 'linear-gradient(135deg, rgba(255, 107, 53, 0.6) 0%, rgba(255, 107, 53, 0.2) 50%, rgba(255, 107, 53, 0.4) 100%)',
    isLoading,
    error,
    hasColor: !!colors
  };
};

/**
 * Hook pour générer des styles CSS dynamiques
 * @param {string} imageUrl - URL de l'image
 * @param {Object} styleOptions - Options de style
 * @returns {Object} Styles CSS prêts à utiliser
 */
export const useDynamicStyles = (imageUrl, styleOptions = {}) => {
  const { colors, isLoading } = useColorExtractor(imageUrl);
  
  const {
    backgroundOpacity = 0.3,
    blurAmount = '20px',
    gradientType = 'blur',
    enableTransition = true
  } = styleOptions;

  const generateStyles = useCallback(() => {
    if (!colors) return {};

    const baseStyles = {
      transition: enableTransition ? 'all 0.8s ease-in-out' : 'none',
    };

    return {
      // Background dynamique
      dynamicBackground: {
        ...baseStyles,
        background: colors.gradients[gradientType],
        backdropFilter: `blur(${blurAmount})`,
      },
      
      // Overlay avec couleur dominante
      colorOverlay: {
        ...baseStyles,
        backgroundColor: colors.background.medium,
      },
      
      // Texte avec contraste optimal
      dynamicText: {
        ...baseStyles,
        color: colors.metadata.contrast.primary,
      },
      
      // Accent avec couleur primaire
      accent: {
        ...baseStyles,
        backgroundColor: colors.primary.rgb,
        borderColor: colors.primary.rgb,
      }
    };
  }, [colors, backgroundOpacity, blurAmount, gradientType, enableTransition]);

  return {
    styles: generateStyles(),
    isLoading,
    hasStyles: !!colors,
    colors
  };
};

export default useColorExtractor;