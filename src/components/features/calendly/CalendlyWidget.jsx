import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CalendlyWidget.css';

// Cache global pour éviter les rechargements multiples
let calendlyScriptPromise = null;

const loadCalendlyScript = () => {
  if (calendlyScriptPromise) {
    return calendlyScriptPromise;
  }

  // Vérifier si le script existe déjà
  if (window.Calendly) {
    return Promise.resolve();
  }

  calendlyScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    
    if (existingScript) {
      if (window.Calendly) {
        resolve();
      } else {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('📅 Calendly script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Calendly script');
      calendlyScriptPromise = null;
      reject(new Error('Failed to load Calendly script'));
    };

    document.head.appendChild(script);
  });

  return calendlyScriptPromise;
};

const CalendlyWidget = ({ 
  url = 'https://calendly.com/your-calendly-username',
  type = 'inline',
  height = '700',
  prefill = {},
  utm = {},
  onScheduled = () => {},
  className = '',
  lazyLoad = true // Nouveau prop pour le lazy loading
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const widgetRef = useRef(null);

  const initializeCalendly = useCallback(async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await loadCalendlyScript();
      
      if (type === 'inline' && widgetRef.current && window.Calendly) {
        // Nettoyer le container avant d'initialiser
        widgetRef.current.innerHTML = '';
        
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: widgetRef.current,
          prefill: prefill,
          utm: utm
        });
      }
      
      setIsLoaded(true);
    } catch (err) {
      setError(err.message);
      console.error('❌ Calendly initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [url, type, prefill, utm, isLoaded, isLoading]);

  useEffect(() => {
    if (!lazyLoad) {
      // Preload script sans l'initialiser
      loadCalendlyScript().catch(console.error);
    }
  }, [lazyLoad]);

  useEffect(() => {
    if (!lazyLoad && !isLoaded) {
      initializeCalendly();
    }

    // Event listener pour les événements Calendly
    const handleCalendlyEvent = (e) => {
      if (e.data.event === 'calendly.event_scheduled') {
        console.log('RDV programmé:', e.data.payload);
        onScheduled(e.data.payload);
        
        if (type === 'modal') {
          setShowModal(false);
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [url, type, prefill, utm, onScheduled]);

  const openPopup = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: url,
        prefill: prefill,
        utm: utm
      });
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  if (type === 'popup') {
    return (
      <button
        onClick={openPopup}
        className={`calendly-button calendly-popup-button ${className}`}
        disabled={!isLoaded}
      >
        <span className="calendly-button-icon">📅</span>
        Prendre rendez-vous
      </button>
    );
  }

  if (type === 'modal') {
    return (
      <>
        <button
          onClick={openModal}
          className={`calendly-button calendly-modal-button ${className}`}
          disabled={!isLoaded}
        >
          <span className="calendly-button-icon">📅</span>
          Planifier un appel
        </button>
        
        {showModal && (
          <div className="calendly-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="calendly-modal-content" onClick={e => e.stopPropagation()}>
              <button
                className="calendly-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
              <div
                className="calendly-inline-widget"
                ref={widgetRef}
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Type 'inline' par défaut
  return (
    <div className={`calendly-widget-container ${className}`}>
      {lazyLoad && !isLoaded && !isLoading && (
        <div className="calendly-lazy-load">
          <button
            onClick={initializeCalendly}
            className="calendly-load-button"
            disabled={isLoading}
          >
            <span className="calendly-load-icon">CAL</span>
            Charger le calendrier
          </button>
          <p className="calendly-load-description">
            Cliquez pour afficher les créneaux disponibles
          </p>
        </div>
      )}

      {isLoading && (
        <div className="calendly-loading">
          <div className="calendly-loader">
            <div className="calendly-spinner"></div>
            <p>Chargement du calendrier...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="calendly-error">
          <p>Erreur de chargement du calendrier</p>
          <button
            onClick={initializeCalendly}
            className="calendly-retry-button"
          >
            Réessayer
          </button>
        </div>
      )}

      <div
        ref={widgetRef}
        className="calendly-inline-widget"
        style={{
          minWidth: '320px',
          height: `${height}px`,
          display: isLoaded ? 'block' : 'none'
        }}
      />
    </div>
  );
};

export default CalendlyWidget;