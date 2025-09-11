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
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [forceDirectLink, setForceDirectLink] = useState(false);
  
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

  // Affichage si Calendly est bloqué ou si on force le lien direct
  if (isBlocked || forceDirectLink) {
    return (
      <div className="calendly-blocked">
        <div className="calendly-blocked-content">
          <div className="calendly-blocked-icon">🗓️</div>
          <h3>Réservez votre consultation avec {expertName}</h3>
          <p>
            Pour une meilleure expérience, nous allons vous rediriger vers notre calendrier de réservation.
          </p>
          <div className="calendly-contact-alternatives">
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="calendly-alt-btn calendly-direct-btn"
              style={{
                backgroundColor: '#E50914',
                color: 'white',
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                margin: '20px auto',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#C00810';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#E50914';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              📅 Réserver maintenant avec {expertName}
            </a>
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              Vous serez redirigé vers Calendly pour choisir votre créneau
            </p>
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                Problème technique ? Contactez-nous directement :
              </p>
              <a 
                href="mailto:hello@mdmc-music-ads.com"
                className="calendly-alt-btn calendly-email-btn"
                style={{
                  color: '#E50914',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                📧 hello@mdmc-music-ads.com
              </a>
            </div>
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