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
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)',
        padding: '20px 15px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '100%'
      }}>
        <div className="calendly-blocked-content" style={{ width: '100%' }}>
          <h3 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#1a1a1a',
            marginBottom: '12px',
            lineHeight: '1.3'
          }}>
            Consultation Gratuite<br/>avec {expertName}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.5',
            padding: '0 10px'
          }}>
            30 minutes pour discuter de votre stratégie marketing musical
          </p>
          
          <div style={{ 
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            padding: '0 10px'
          }}>
            <div style={{ 
              padding: '10px',
              background: 'rgba(229, 9, 20, 0.05)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#333', fontWeight: '600' }}>Durée</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>30 minutes</div>
            </div>
            <div style={{ 
              padding: '10px',
              background: 'rgba(229, 9, 20, 0.05)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#333', fontWeight: '600' }}>Type</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>1-to-1</div>
            </div>
            <div style={{ 
              padding: '10px',
              background: 'rgba(229, 9, 20, 0.05)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#333', fontWeight: '600' }}>Format</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>Personnalisé</div>
            </div>
            <div style={{ 
              padding: '10px',
              background: 'rgba(229, 9, 20, 0.05)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#333', fontWeight: '600' }}>Prix</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>Gratuit</div>
            </div>
          </div>

          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#E50914',
              color: 'white',
              padding: '16px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '30px',
              textDecoration: 'none',
              display: 'block',
              width: 'calc(100% - 20px)',
              maxWidth: '320px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(229, 9, 20, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#C00810';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#E50914';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.3)';
            }}
          >
            Réserver ma consultation
          </a>
          
          <p style={{ 
            marginTop: '15px', 
            fontSize: '12px', 
            color: '#999',
            fontStyle: 'italic',
            padding: '0 10px'
          }}>
            Accéder au calendrier pour choisir votre créneau
          </p>

          <div style={{ 
            marginTop: '25px', 
            padding: '15px', 
            background: 'rgba(229, 9, 20, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(229, 9, 20, 0.08)'
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: '#333', 
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Bénéfices de la consultation
            </p>
            <div style={{ 
              textAlign: 'left',
              fontSize: '12px',
              color: '#555',
              lineHeight: '1.6',
              padding: '0 5px'
            }}>
              <div style={{ marginBottom: '6px' }}>• Analyse de votre présence actuelle</div>
              <div style={{ marginBottom: '6px' }}>• Stratégie personnalisée</div>
              <div style={{ marginBottom: '6px' }}>• Conseils pratiques actionnables</div>
              <div>• Réponses à vos questions</div>
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