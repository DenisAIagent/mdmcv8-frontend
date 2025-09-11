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
        padding: '40px 20px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div className="calendly-blocked-content">
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}>
            📅
          </div>
          <h3 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1a1a1a',
            marginBottom: '15px'
          }}>
            Consultation Gratuite avec {expertName}
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            marginBottom: '30px',
            maxWidth: '500px',
            margin: '0 auto 30px'
          }}>
            30 minutes pour discuter de votre stratégie marketing musical et obtenir des conseils personnalisés
          </p>
          
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '30px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏰</div>
                <div style={{ fontSize: '14px', color: '#666' }}>30 min</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>💬</div>
                <div style={{ fontSize: '14px', color: '#666' }}>1-to-1</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>🎯</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Personnalisé</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>💰</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Gratuit</div>
              </div>
            </div>
          </div>

          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#E50914',
              color: 'white',
              padding: '18px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '50px',
              textDecoration: 'none',
              display: 'inline-block',
              margin: '10px auto',
              boxShadow: '0 8px 20px rgba(229, 9, 20, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#C00810';
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(229, 9, 20, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#E50914';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(229, 9, 20, 0.3)';
            }}
          >
            🚀 Réserver ma consultation gratuite
          </a>
          
          <p style={{ 
            marginTop: '20px', 
            fontSize: '14px', 
            color: '#999',
            fontStyle: 'italic'
          }}>
            Cliquez pour accéder au calendrier et choisir votre créneau
          </p>

          <div style={{ 
            marginTop: '40px', 
            padding: '20px', 
            background: 'rgba(229, 9, 20, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(229, 9, 20, 0.1)'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              ✨ Ce que vous allez obtenir :
            </p>
            <div style={{ 
              display: 'grid', 
              gap: '10px',
              textAlign: 'left',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '14px', color: '#555' }}>
                ✓ Analyse de votre présence actuelle
              </div>
              <div style={{ fontSize: '14px', color: '#555' }}>
                ✓ Stratégie personnalisée pour votre musique
              </div>
              <div style={{ fontSize: '14px', color: '#555' }}>
                ✓ Conseils pratiques et actionnables
              </div>
              <div style={{ fontSize: '14px', color: '#555' }}>
                ✓ Réponses à toutes vos questions
              </div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
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