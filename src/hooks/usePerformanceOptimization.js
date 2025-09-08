 // hooks/usePerformanceOptimization.js
import { useEffect, useCallback, useState, useRef } from 'react';

// Performance monitoring hook
export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState({});
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Vérifier le support des APIs Performance
    const supported = 'PerformanceObserver' in window && 'performance' in window;
    setIsSupported(supported);

    if (!supported) {
      console.warn('Performance APIs not supported in this browser');
      return;
    }

    // Observer pour LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      setMetrics(prev => ({
        ...prev,
        lcp: {
          value: lastEntry.startTime,
          rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
          element: lastEntry.element?.tagName || 'unknown'
        }
      }));
    });

    // Observer pour FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        setMetrics(prev => ({
          ...prev,
          fid: {
            value: entry.processingStart - entry.startTime,
            rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                   entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor'
          }
        }));
      });
    });

    // Observer pour CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics(prev => ({
            ...prev,
            cls: {
              value: clsValue,
              rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
            }
          }));
        }
      });
    });

    // Observer pour INP (Interaction to Next Paint)
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.interactionId) {
          setMetrics(prev => ({
            ...prev,
            inp: {
              value: entry.duration,
              rating: entry.duration < 200 ? 'good' : entry.duration < 500 ? 'needs-improvement' : 'poor'
            }
          }));
        }
      });
    });

    // Démarrer les observers
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
      // INP est plus récent, vérifier la compatibilité
      if ('PerformanceEventTiming' in window) {
        inpObserver.observe({ entryTypes: ['event'] });
      }
    } catch (error) {
      console.warn('Some performance observers not supported:', error);
    }

    // Cleanup
    return () => {
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
      inpObserver?.disconnect();
    };
  }, []);

  // Fonction pour reporter les métriques (vers Analytics, Sentry, etc.)
  const reportMetrics = useCallback((customMetrics = {}) => {
    const allMetrics = { ...metrics, ...customMetrics };
    
    // Envoyer vers votre service d'analytics
    if (window.gtag) {
      Object.entries(allMetrics).forEach(([name, data]) => {
        if (data?.value !== undefined) {
          window.gtag('event', 'core_web_vitals', {
            custom_parameter_1: name,
            custom_parameter_2: data.value,
            custom_parameter_3: data.rating
          });
        }
      });
    }

    // Logs pour debug
    console.table(allMetrics);
  }, [metrics]);

  return {
    metrics,
    isSupported,
    reportMetrics
  };
};

// Hook pour préchargement intelligent des ressources
export const useResourcePreloading = () => {
  const preloadFont = useCallback((fontUrl, fontDisplay = 'swap') => {
    if (document.querySelector(`link[href="${fontUrl}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = fontUrl;
    link.style.fontDisplay = fontDisplay;
    
    document.head.appendChild(link);
  }, []);

  const preloadImage = useCallback((imageUrl, priority = false) => {
    if (document.querySelector(`link[href="${imageUrl}"]`)) return;

    const link = document.createElement('link');
    link.rel = priority ? 'preload' : 'prefetch';
    link.as = 'image';
    link.href = imageUrl;
    
    document.head.appendChild(link);
  }, []);

  const preloadRoute = useCallback((routePath) => {
    // Précharge les chunks JavaScript pour une route
    import(/* webpackChunkName: "route-[request]" */ `../pages/${routePath}.jsx`)
      .catch(err => console.warn('Failed to preload route:', routePath, err));
  }, []);

  return {
    preloadFont,
    preloadImage,
    preloadRoute
  };
};

// Hook pour optimisation des images (lazy loading + WebP)
export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState(false);

  useEffect(() => {
    // Détecter le support WebP
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      setIsWebPSupported(dataURL.indexOf('data:image/webp') === 0);
    };

    checkWebPSupport();
  }, []);

  const optimizeImageSrc = useCallback((src, width, quality = 85) => {
    if (!src) return src;

    // Si WebP supporté et pas déjà WebP
    if (isWebPSupported && !src.includes('.webp')) {
      const extension = src.split('.').pop();
      const baseSrc = src.replace(`.${extension}`, '');
      return `${baseSrc}.webp`;
    }

    return src;
  }, [isWebPSupported]);

  const generateSrcSet = useCallback((baseSrc, sizes = [480, 768, 1024, 1200]) => {
    return sizes
      .map(size => `${optimizeImageSrc(baseSrc, size)} ${size}w`)
      .join(', ');
  }, [optimizeImageSrc]);

  return {
    isWebPSupported,
    optimizeImageSrc,
    generateSrcSet
  };
};

// Hook pour monitoring des re-renders (dev only)
export const useRenderOptimization = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    if (import.meta.env.DEV) {
      renderCount.current += 1;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime.current;
      
      console.log(`🔄 ${componentName} render #${renderCount.current} (+${timeSinceLastRender}ms)`);
      
      if (renderCount.current > 10) {
        console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times - check for unnecessary re-renders`);
      }
      
      lastRenderTime.current = now;
    }
  });

  return {
    renderCount: renderCount.current
  };
};

// Export par défaut pour faciliter l'import
export default {
  usePerformanceOptimization,
  useResourcePreloading,
  useImageOptimization,
  useRenderOptimization
};
