import React, { useEffect, useRef, useState } from 'react';
import './CalendlyWidget.css';

const CalendlyWidget = ({ 
  url = 'https://calendly.com/your-calendly-username', // À remplacer par votre URL Calendly
  type = 'inline', // 'inline', 'popup', 'modal'
  height = '700',
  prefill = {},
  utm = {},
  onScheduled = () => {},
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Charger le script Calendly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    
    script.onload = () => {
      setIsLoaded(true);
      
      if (type === 'inline' && widgetRef.current) {
        // Widget inline
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: widgetRef.current,
          prefill: prefill,
          utm: utm
        });
      }
    };

    // Vérifier si le script n'est pas déjà chargé
    if (!document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
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
      {!isLoaded && (
        <div className="calendly-loading">
          <div className="calendly-loader">
            <div className="calendly-spinner"></div>
            <p>Chargement du calendrier...</p>
          </div>
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