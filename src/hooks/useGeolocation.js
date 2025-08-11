/**
 * 🌍 Hook React pour la géolocalisation et le filtrage territorial
 * Simplifie l'utilisation du service de géolocalisation dans les composants
 */

import { useState, useEffect, useCallback } from 'react';
import geolocationService from '../services/geolocation.service';

/**
 * Hook principal pour la géolocalisation
 * @param {Object} options - Options de configuration
 * @returns {Object} État et fonctions de géolocalisation
 */
export const useGeolocation = (options = {}) => {
  const [state, setState] = useState({
    location: null,
    isLoading: false,
    error: null,
    hasDetected: false
  });

  const {
    autoDetect = true,
    enableCache = true
  } = options;

  /**
   * Détecte la localisation de l'utilisateur
   */
  const detectLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const location = await geolocationService.detectUserLocation();
      
      setState({
        location,
        isLoading: false,
        error: null,
        hasDetected: true
      });

      return location;

    } catch (error) {
      console.error('❌ useGeolocation error:', error);
      
      setState({
        location: null,
        isLoading: false,
        error: error.message,
        hasDetected: true
      });

      throw error;
    }
  }, []);

  /**
   * Force une nouvelle détection
   */
  const refreshLocation = useCallback(async () => {
    return await geolocationService.refreshLocation().then(location => {
      setState({
        location,
        isLoading: false,
        error: null,
        hasDetected: true
      });
      return location;
    });
  }, []);

  /**
   * Reset l'état
   */
  const reset = useCallback(() => {
    setState({
      location: null,
      isLoading: false,
      error: null,
      hasDetected: false
    });
    if (!enableCache) {
      geolocationService.clearCache();
    }
  }, [enableCache]);

  /**
   * Auto-détection au montage
   */
  useEffect(() => {
    if (autoDetect) {
      detectLocation();
    }
  }, [autoDetect, detectLocation]);

  return {
    // État
    location: state.location,
    isLoading: state.isLoading,
    error: state.error,
    hasDetected: state.hasDetected,
    
    // Actions
    detectLocation,
    refreshLocation,
    reset,
    
    // Utilitaires
    isError: !!state.error,
    isSuccess: !state.isLoading && !state.error && !!state.location,
    isEmpty: !state.isLoading && !state.error && !state.location,
    
    // Données rapides
    countryCode: state.location?.countryCode,
    country: state.location?.country,
    city: state.location?.city,
    timezone: state.location?.timezone
  };
};

/**
 * Hook pour filtrer les plateformes par territoire
 * @param {Array} platforms - Liste des plateformes à filtrer
 * @param {Object} options - Options de configuration
 * @returns {Object} Plateformes filtrées et informations
 */
export const useTerritorialFilter = (platforms = [], options = {}) => {
  const { location, isLoading: locationLoading } = useGeolocation(options);
  const [filteredData, setFilteredData] = useState({
    filtered: platforms,
    available: [],
    country: null,
    total: platforms.length,
    kept: platforms.length,
    isFiltered: false
  });

  const filterPlatforms = useCallback(async (platformList = platforms, countryCode = null) => {
    if (!platformList || platformList.length === 0) {
      return {
        filtered: [],
        available: [],
        country: countryCode,
        total: 0,
        kept: 0,
        isFiltered: false
      };
    }

    try {
      const result = await geolocationService.filterPlatformsByTerritory(platformList, countryCode);
      setFilteredData({
        ...result,
        isFiltered: true
      });
      return result;
    } catch (error) {
      console.error('❌ Erreur filtrage territorial:', error);
      return {
        filtered: platformList,
        available: [],
        country: countryCode,
        total: platformList.length,
        kept: platformList.length,
        isFiltered: false
      };
    }
  }, [platforms]);

  /**
   * Auto-filtrage quand la localisation est détectée
   */
  useEffect(() => {
    if (location?.countryCode && platforms.length > 0) {
      filterPlatforms(platforms, location.countryCode);
    }
  }, [location?.countryCode, platforms, filterPlatforms]);

  return {
    // Données filtrées
    ...filteredData,
    
    // État
    isLoading: locationLoading,
    location,
    
    // Actions
    filterPlatforms,
    
    // Utilitaires
    hasFiltered: filteredData.isFiltered,
    filterRatio: filteredData.total > 0 ? (filteredData.kept / filteredData.total) : 1,
    removedCount: filteredData.total - filteredData.kept
  };
};

/**
 * Hook simplifié pour vérifier la disponibilité d'un service
 * @param {string} serviceName - Nom du service à vérifier
 * @returns {Object} Disponibilité du service
 */
export const useServiceAvailability = (serviceName) => {
  const { location, isLoading } = useGeolocation();
  
  const isAvailable = location?.countryCode ? 
    geolocationService.isServiceAvailable(serviceName, location.countryCode) : 
    true; // Par défaut disponible si pas de géolocalisation

  return {
    isAvailable,
    isLoading,
    countryCode: location?.countryCode,
    reason: isAvailable ? null : `${serviceName} n'est pas disponible en ${location?.country || 'ce pays'}`
  };
};

/**
 * Hook pour obtenir les services disponibles dans le pays actuel
 * @returns {Object} Liste des services disponibles
 */
export const useAvailableServices = () => {
  const { location, isLoading } = useGeolocation();
  
  const availableServices = location?.countryCode ?
    geolocationService.getCountryServices(location.countryCode) :
    [];

  return {
    services: availableServices,
    isLoading,
    countryCode: location?.countryCode,
    country: location?.country,
    count: availableServices.length
  };
};

export default useGeolocation;