 import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.jsx';

  // Styles globaux et i18n
  import './index.css';
  import './i18n.js';

  // Importations pour Material-UI Theme
  import { ThemeProvider } from '@mui/material/styles';
  import CssBaseline from '@mui/material/CssBaseline';
  import theme from './theme/theme';

  // Importations pour React Toastify
  import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

  // SEO avec React Helmet Async
  import { HelmetProvider } from 'react-helmet-async';

  // Performance monitoring
  import { usePerformanceOptimization, useResourcePreloading } from
  './hooks/usePerformanceOptimization';

  // TanStack Query pour la gestion des données
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

  // Forcer la langue française
  import i18n from 'i18next';
  i18n.changeLanguage('fr');

  // Configuration TanStack Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });

  // Préchargement des ressources critiques
  const preloadCriticalResources = () => {
    // Préchargement des fonts avec font-display: swap
    const preloadFont = (url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = url;
      document.head.appendChild(link);
    };

    // Préchargement des fonts Google
    preloadFont('https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2');
    preloadFont('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyf.woff2');

    // Préchargement d'images critiques
    const preloadImage = (url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    };

    // Ajoutez vos images critiques ici
    // preloadImage('/assets/images/hero-bg.webp');
    // preloadImage('/assets/images/logo.webp');
  };

  // Performance observer pour Core Web Vitals
  const initPerformanceMonitoring = () => {
    // Monitoring LCP, FID, CLS automatique
    if ('PerformanceObserver' in window) {
      // LCP Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        // Envoyer vers Analytics
        if (window.gtag) {
          window.gtag('event', 'core_web_vitals', {
            name: 'LCP',
            value: lastEntry.startTime,
            event_category: 'Performance'
          });
        }

        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS Observer
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;

            if (window.gtag) {
              window.gtag('event', 'core_web_vitals', {
                name: 'CLS',
                value: clsValue,
                event_category: 'Performance'
              });
            }

            console.log('CLS:', clsValue);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  };

  // Optimisations au démarrage
  const initOptimizations = () => {
    // Préchargement ressources
    preloadCriticalResources();

    // Performance monitoring
    initPerformanceMonitoring();

    // DNS préfetching pour domaines externes
    const prefetchDNS = (domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    };

    prefetchDNS('//fonts.googleapis.com');
    prefetchDNS('//fonts.gstatic.com');
    prefetchDNS('//api.mdmcmusicads.com');

    // Lazy loading native pour les images
    if ('loading' in HTMLImageElement.prototype) {
      document.documentElement.classList.add('native-lazy-loading');
    }
  };

  // Skip link pour l'accessibilité
  const SkipLink = () => (
    <a href="#main-content" className="skip-link">
      Aller au contenu principal
    </a>
  );

  // App wrapper avec optimisations
  const OptimizedApp = () => {
    React.useEffect(() => {
      initOptimizations();
    }, []);

    return (
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <SkipLink />
              <main id="main-content">
                <App />
              </main>
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                toastClassName="custom-toast"
                bodyClassName="custom-toast-body"
              />
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </ThemeProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );
  };

  // Démarrage optimisé avec gestion d'erreur
  const startApp = () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));

    try {
      root.render(<OptimizedApp />);
    } catch (error) {
      console.error('Erreur de rendu React:', error);

      // Fallback en cas d'erreur critique
      root.render(
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <h1>MDMC Music Ads</h1>
          <p>Une erreur s'est produite lors du chargement de l'application.</p>
          <p>Veuillez rafraîchir la page ou contacter notre support.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#cc271a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer'
            }}
          >
            Rafraîchir la page
          </button>
        </div>
      );
    }
  };

  // Lancement avec vérifications
  if (document.getElementById('root')) {
    startApp();
  } else {
    console.error('Element root non trouvé');
  }
