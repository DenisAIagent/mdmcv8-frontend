/**
 * 🌐 Hook pour gestion thème dark/light
 * Auto-detection + toggle manuel + persistance
 */

import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'mdmc-theme-preference';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || THEMES.AUTO;
    } catch {
      return THEMES.AUTO;
    }
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === 'undefined') return THEMES.LIGHT;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    if (themeMode === THEMES.AUTO) {
      return systemTheme;
    }
    return themeMode;
  });

  // 🎯 Détection des changements système
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
      setSystemTheme(newSystemTheme);
      
      // Si mode auto, appliquer le thème système
      if (themeMode === THEMES.AUTO) {
        setCurrentTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [themeMode]);

  // 🎯 Application du thème sur le document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.toggle('dark-theme', currentTheme === THEMES.DARK);
    document.documentElement.classList.toggle('light-theme', currentTheme === THEMES.LIGHT);
  }, [currentTheme]);

  // 🎯 Persistance du choix utilisateur
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, [themeMode]);

  // 🎯 Mise à jour du thème actuel quand le mode change
  useEffect(() => {
    if (themeMode === THEMES.AUTO) {
      setCurrentTheme(systemTheme);
    } else {
      setCurrentTheme(themeMode);
    }
  }, [themeMode, systemTheme]);

  // 🎛️ Fonctions de contrôle
  const setTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemeMode(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (themeMode === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
    } else if (themeMode === THEMES.DARK) {
      setTheme(THEMES.LIGHT);
    } else {
      // Si auto, basculer vers le contraire du thème système
      setTheme(systemTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
    }
  }, [themeMode, systemTheme, setTheme]);

  const resetToAuto = useCallback(() => {
    setTheme(THEMES.AUTO);
  }, [setTheme]);

  return {
    // États
    currentTheme,
    themeMode,
    systemTheme,
    isAuto: themeMode === THEMES.AUTO,
    isDark: currentTheme === THEMES.DARK,
    isLight: currentTheme === THEMES.LIGHT,
    
    // Actions
    setTheme,
    toggleTheme,
    resetToAuto,
    
    // Constantes
    THEMES
  };
};

export default useTheme;