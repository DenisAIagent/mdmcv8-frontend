import { useState, useCallback } from 'react';

// Service de simulation pour les réservations
const simulateBookingAPI = async (bookingData) => {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simuler un taux d'échec de 5%
  if (Math.random() < 0.05) {
    throw new Error('Erreur de réservation. Veuillez réessayer.');
  }
  
  return {
    success: true,
    bookingId: `booking_${Date.now()}`,
    confirmationCode: `MDMC${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    data: bookingData
  };
};

const useBookingFlow = () => {
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);

  const createBooking = useCallback(async (bookingData) => {
    setBookingStatus('loading');
    setError(null);
    
    try {
      console.log('🔄 Création de réservation:', bookingData);
      
      // Validation des données requises
      if (!bookingData.expert || !bookingData.slot || !bookingData.email) {
        throw new Error('Données de réservation incomplètes');
      }
      
      // Appel à l'API simulée
      const response = await simulateBookingAPI(bookingData);
      
      console.log('✅ Réservation créée:', response);
      
      setCurrentBooking(response.data);
      setBookingStatus('success');
      
      // Envoyer les événements analytics
      if (window.gtag) {
        window.gtag('event', 'booking_completed', {
          'expert_id': bookingData.expert.id,
          'expert_name': bookingData.expert.name,
          'project_type': bookingData.projectType,
          'budget': bookingData.budget,
          'value': 1
        });
      }
      
      // Facebook Pixel
      if (window.fbq) {
        window.fbq('track', 'Schedule', {
          content_name: `Consultation ${bookingData.expert.name}`,
          value: 100,
          currency: 'EUR'
        });
      }
      
      return response;
      
    } catch (err) {
      console.error('❌ Erreur création réservation:', err);
      setError(err.message);
      setBookingStatus('error');
      
      // Analytics pour les erreurs
      if (window.gtag) {
        window.gtag('event', 'booking_error', {
          'error_message': err.message
        });
      }
      
      throw err;
    }
  }, []);

  const resetBooking = useCallback(() => {
    setBookingStatus('idle');
    setError(null);
    setCurrentBooking(null);
  }, []);

  return {
    bookingStatus,
    error,
    currentBooking,
    createBooking,
    resetBooking,
    isLoading: bookingStatus === 'loading',
    isSuccess: bookingStatus === 'success',
    isError: bookingStatus === 'error'
  };
};

export { useBookingFlow };