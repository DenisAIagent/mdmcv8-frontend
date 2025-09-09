import { useCallback } from 'react';

const useAnalytics = () => {
  const trackEvent = useCallback((eventName, properties = {}) => {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
          event_category: 'booking_system',
          event_label: properties.label || '',
          value: properties.value || 0,
          custom_parameters: properties,
          ...properties
        });
        
        console.log('📊 GA4 Event:', eventName, properties);
      }

      // Facebook Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        // Mapper les événements vers Facebook Pixel
        const fbEventMap = {
          'booking_modal_opened': 'InitiateCheckout',
          'booking_expert_selected': 'AddToCart',
          'booking_slot_selected': 'AddPaymentInfo',
          'booking_completed': 'Purchase',
          'booking_step_change': 'PageView'
        };
        
        const fbEvent = fbEventMap[eventName] || 'CustomEvent';
        
        window.fbq('track', fbEvent, {
          content_name: eventName,
          content_category: 'booking',
          value: properties.value || 0,
          currency: 'EUR',
          ...properties
        });
        
        console.log('📘 Facebook Pixel Event:', fbEvent, properties);
      }

      // Tracking personnalisé MDMC (si implémenté)
      if (typeof window !== 'undefined' && window.mdmcAnalytics) {
        window.mdmcAnalytics.track(eventName, {
          timestamp: new Date().toISOString(),
          session_id: sessionStorage.getItem('mdmc_session_id'),
          user_agent: navigator.userAgent,
          page_url: window.location.href,
          ...properties
        });
        
        console.log('🎵 MDMC Analytics Event:', eventName, properties);
      }

      // Console log pour le développement
      if (process.env.NODE_ENV === 'development') {
        console.group(`🎯 Analytics Event: ${eventName}`);
        console.log('Properties:', properties);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
      }

    } catch (error) {
      console.warn('⚠️ Analytics tracking error:', error);
    }
  }, []);

  const trackPageView = useCallback((pageName, properties = {}) => {
    trackEvent('page_view', {
      page_name: pageName,
      ...properties
    });
  }, [trackEvent]);

  const trackConversion = useCallback((type, value, properties = {}) => {
    trackEvent('conversion', {
      conversion_type: type,
      conversion_value: value,
      ...properties
    });
  }, [trackEvent]);

  const trackError = useCallback((errorMessage, errorCode, properties = {}) => {
    trackEvent('error', {
      error_message: errorMessage,
      error_code: errorCode,
      ...properties
    });
  }, [trackEvent]);

  const trackTiming = useCallback((category, variable, value, label) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
        event_label: label
      });
    }
    
    trackEvent('timing', {
      category,
      variable,
      value,
      label
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    trackTiming
  };
};

export { useAnalytics };