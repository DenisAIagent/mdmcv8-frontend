import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gtm from '../services/googleTagManager.service';

/**
 * Hook personnalisé pour tracking des pages virtuelles dans SPA
 * Résout le problème d'tracking analytics avec HashRouter
 * 
 * AMÉLIORATION SEO CRITIQUE:
 * - Virtual pageviews pour GTM/GA4 dans SPA
 * - Tracking pages HashRouter /#/ 
 * - Performance monitoring par page
 * - Scroll tracking avancé
 */
const usePageTracking = (pageTitle = null, pageCategory = 'general') => {
  const location = useLocation();
  const previousPath = useRef(null);
  const pageStartTime = useRef(Date.now());
  const scrollDepthSent = useRef(new Set());

  // Virtual pageview pour chaque changement de route
  useEffect(() => {
    const currentPath = location.pathname + location.hash;
    
    // Éviter les doublons de tracking
    if (previousPath.current === currentPath) return;
    
    // Nettoyer les trackers précédents
    scrollDepthSent.current.clear();
    pageStartTime.current = Date.now();
    
    // Construction des données de page
    const pageData = {
      page_path: currentPath,
      page_location: window.location.href,
      page_title: pageTitle || document.title,
      page_category: pageCategory,
      hash_route: location.hash || 'none',
      referrer: document.referrer || 'direct'
    };

    // 🎯 VIRTUAL PAGEVIEW - CRITIQUE POUR SPA
    gtm.sendEvent('page_view', {
      event_category: 'navigation',
      event_label: 'virtual_pageview',
      ...pageData,
      timestamp: Date.now(),
      user_agent: navigator.userAgent
    });

    // Tracking spécialisé par type de page
    if (currentPath.includes('/services/')) {
      const serviceName = currentPath.replace('/services/', '').replace('/', '');
      gtm.trackServicePageView(serviceName);
    }

    if (currentPath.includes('/smartlinks/')) {
      gtm.sendEvent('smartlink_page_view', {
        event_category: 'smartlink',
        event_label: 'page_view',
        ...pageData
      });
    }

    console.log('📊 Virtual pageview envoyé:', pageData);
    previousPath.current = currentPath;

  }, [location, pageTitle, pageCategory]);

  // Tracking advanced de scroll par paliers
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      // Paliers de scroll à tracker: 25%, 50%, 75%, 90%
      const thresholds = [25, 50, 75, 90];
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !scrollDepthSent.current.has(threshold)) {
          scrollDepthSent.current.add(threshold);
          
          gtm.trackScrollDepth(threshold);
          
          // Event spécialisé pour pages critiques
          if (location.pathname === '/' && threshold === 50) {
            gtm.sendEvent('homepage_engagement', {
              event_category: 'engagement',
              event_label: 'scroll_50_percent',
              value: 1
            });
          }
        }
      });
    };

    const throttledHandleScroll = throttle(handleScroll, 500);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [location]);

  // Tracking temps passé sur page avant navigation
  useEffect(() => {
    return () => {
      const timeSpent = Math.round((Date.now() - pageStartTime.current) / 1000);
      
      if (timeSpent > 5) { // Seulement si > 5 secondes
        gtm.trackTimeOnPage(timeSpent);
        
        // Engagement supplémentaire pour homepage
        if (previousPath.current === '/' && timeSpent > 30) {
          gtm.sendEvent('homepage_quality_time', {
            event_category: 'engagement',
            event_label: 'time_over_30s',
            value: timeSpent
          });
        }
      }
    };
  }, [location]);

  // Performance tracking de la page
  useEffect(() => {
    const trackPerformance = () => {
      // Core Web Vitals automatiques
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            gtm.sendEvent('core_web_vitals', {
              event_category: 'performance',
              event_label: 'FCP',
              value: Math.round(entry.startTime),
              page_path: location.pathname + location.hash
            });
          });
        }).observe({ entryTypes: ['paint'] });
      }
    };

    const timeoutId = setTimeout(trackPerformance, 1000);
    return () => clearTimeout(timeoutId);
  }, [location]);

  return {
    trackCustomEvent: (eventName, eventData = {}) => {
      gtm.sendEvent(eventName, {
        ...eventData,
        page_path: location.pathname + location.hash,
        timestamp: Date.now()
      });
    },
    
    trackFormSubmission: (formType = 'contact') => {
      gtm.trackContactFormSubmit(formType);
      
      // Event de conversion spécial
      gtm.sendEvent('form_conversion', {
        event_category: 'conversion',
        event_label: formType,
        form_type: formType,
        page_path: location.pathname + location.hash,
        value: 1
      });
    },
    
    trackEngagement: (action, value = 1) => {
      gtm.sendEvent('page_engagement', {
        event_category: 'engagement',
        event_label: action,
        page_path: location.pathname + location.hash,
        value: value
      });
    }
  };
};

// Utilitaire throttle pour performance
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export default usePageTracking;