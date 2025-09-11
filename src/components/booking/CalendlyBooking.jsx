import React, { useEffect, useState } from 'react';
import { InlineWidget } from 'react-calendly';
import './CalendlyBooking.css';

const CalendlyBooking = ({
  // URL Calendly de l'expert sélectionné
  url,
  // Expert info
  expertName,
  // Callbacks
  onEventScheduled
}) => {
  const [isBlocked, setIsBlocked] = useState(true); // Forcer le mode direct par défaut
  const [hasLoaded, setHasLoaded] = useState(false);
  const [forceDirectLink, setForceDirectLink] = useState(true); // Forcer le lien direct
  
  useEffect(() => {
    // Analytics tracking quand le widget est chargé
    if (url && window.gtag) {
      window.gtag('event', 'calendly_widget_loaded', {
        event_category: 'booking',
        event_label: url,
        expert_name: expertName
      });
    }

    // Détecter si le contenu est bloqué - réduit à 2 secondes
    const detectBlocked = setTimeout(() => {
      if (!hasLoaded) {
        setIsBlocked(true);
        setForceDirectLink(true);
        console.log('❌ Calendly widget failed to load after 2 seconds - switching to direct link');
      }
    }, 2000); // 2 secondes pour charger

    // Écouter les événements Calendly
    const handleCalendlyEvent = (e) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        console.log('📅 Calendly Event:', e.data.event);
        setHasLoaded(true);
        setIsBlocked(false);
        
        if (e.data.event === 'calendly.event_scheduled') {
          // Tracking de conversion
          if (window.gtag) {
            window.gtag('event', 'booking_completed', {
              event_category: 'conversion',
              event_label: expertName,
              value: 100
            });
          }

          if (window.fbq) {
            window.fbq('track', 'Schedule', {
              content_name: 'MDMC Consultation',
              value: 100,
              currency: 'EUR'
            });
          }

          // Callback personnalisé
          if (onEventScheduled) {
            onEventScheduled(e.data.payload);
          }
        }

        // Calendly widget prêt
        if (e.data.event === 'calendly.profile_page_viewed' || 
            e.data.event === 'calendly.event_type_viewed') {
          setHasLoaded(true);
          setIsBlocked(false);
        }
      }
    };

    // Détecter les iframes Calendly chargées
    const checkIframes = () => {
      const iframes = document.querySelectorAll('iframe[src*="calendly.com"]');
      if (iframes.length > 0) {
        console.log('✅ Calendly iframe detected');
        setHasLoaded(true);
        setIsBlocked(false);
      }
    };

    // Vérifier les iframes périodiquement
    const iframeCheck = setInterval(checkIframes, 1000);

    // Nettoyer après 10 secondes
    const cleanup = setTimeout(() => {
      clearInterval(iframeCheck);
    }, 10000);

    window.addEventListener('message', handleCalendlyEvent);
    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
      clearTimeout(detectBlocked);
      clearInterval(iframeCheck);
      clearTimeout(cleanup);
    };
  }, [url, expertName, onEventScheduled, hasLoaded]);

  if (!url) {
    return (
      <div className="calendly-loading">
        <div className="calendly-loading-spinner"></div>
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  // Toujours afficher le lien direct pour éviter les problèmes de blocage
  if (isBlocked || forceDirectLink) {
    return (
      <div className="calendly-blocked" style={{ 
        background: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '100%',
        margin: '0'
      }}>
        <div className="calendly-blocked-content" style={{ width: '100%' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#1a1a1a',
            marginBottom: '6px',
            lineHeight: '1.2',
            margin: '0 0 6px 0',
            wordWrap: 'break-word',
            overflow: 'hidden'
          }}>
            RDV avec {expertName}
          </h3>
          
          <p style={{ 
            fontSize: '12px', 
            color: '#666',
            marginBottom: '12px',
            lineHeight: '1.3',
            margin: '0 0 12px 0',
            wordWrap: 'break-word'
          }}>
            30 min • Gratuit • En ligne
          </p>

          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#E50914',
              color: 'white',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'block',
              width: '100%',
              margin: '0 0 12px 0',
              boxShadow: '0 2px 4px rgba(229, 9, 20, 0.2)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              border: 'none',
              boxSizing: 'border-box',
              textAlign: 'center',
              wordWrap: 'break-word',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#C00810';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#E50914';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Réserver
          </a>

          <div style={{ 
            padding: '10px', 
            background: '#f8f9fa',
            borderRadius: '6px',
            textAlign: 'left',
            fontSize: '11px',
            color: '#555',
            lineHeight: '1.4',
            wordWrap: 'break-word',
            overflow: 'hidden'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#333', fontSize: '11px' }}>
              Objectifs :
            </div>
            <div style={{ marginBottom: '2px', wordWrap: 'break-word' }}>• Vos besoins</div>
            <div style={{ marginBottom: '2px', wordWrap: 'break-word' }}>• Votre projet</div>
            <div style={{ wordWrap: 'break-word' }}>• Nos solutions</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendly-widget-container">
      <InlineWidget
        url={url}
        styles={{
          height: '650px',
          width: '100%',
          minWidth: '320px',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        pageSettings={{
          backgroundColor: 'ffffff',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: 'E50914',
          textColor: '111827'
        }}
        prefill={{
          date: new Date(),
          email: '',
          firstName: '',
          lastName: '',
          name: ''
        }}
        utm={{
          utmCampaign: 'mdmc_booking',
          utmSource: 'website',
          utmMedium: 'inline_widget',
          utmContent: expertName
        }}
      />
    </div>
  );
};

export default CalendlyBooking;