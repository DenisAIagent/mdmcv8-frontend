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
  
  useEffect(() => {
    // Analytics tracking quand le widget est chargé
    if (url && window.gtag) {
      window.gtag('event', 'calendly_widget_loaded', {
        event_category: 'booking',
        event_label: url,
        expert_name: expertName
      });
    }

    // Détecter si le contenu est bloqué
    const detectBlocked = setTimeout(() => {
      if (!hasLoaded) {
        setIsBlocked(true);
        console.log('❌ Calendly widget failed to load after 3 seconds');
      }
    }, 3000); // 3 secondes pour charger

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

  // Affichage si Calendly est bloqué
  if (isBlocked) {
    return (
      <div className="calendly-blocked">
        <div className="calendly-blocked-content">
          <div className="calendly-blocked-icon">🚫</div>
          <h3>Calendrier bloqué</h3>
          <p>
            Le calendier de réservation ne peut pas s'afficher. Cela peut être dû à votre navigateur, un bloqueur de publicité, ou des paramètres de sécurité.
          </p>
          <div className="calendly-blocked-solutions">
            <h4>Solutions :</h4>
            <ul>
              <li>Actualisez la page et réessayez</li>
              <li>Désactivez temporairement votre bloqueur de publicité</li>
              <li>Ajoutez calendly.com à vos sites de confiance</li>
              <li>Essayez avec un autre navigateur (Chrome, Firefox, Safari)</li>
              <li>Ou contactez-nous directement :</li>
            </ul>
            <div className="calendly-contact-alternatives">
              <a 
                href="mailto:hello@mdmc-music-ads.com"
                className="calendly-alt-btn calendly-email-btn"
              >
                📧 hello@mdmc-music-ads.com
              </a>
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="calendly-alt-btn calendly-direct-btn"
              >
                🗓️ Ouvrir Calendly directement
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