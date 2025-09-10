import { useState, useCallback, useMemo } from 'react';

// Simulation des créneaux disponibles
const generateMockAvailability = (expertUrl) => {
  const slots = [];
  const now = new Date();
  
  // Générer des créneaux pour les 14 prochains jours
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);
    
    // Skip weekends pour une simulation plus réaliste
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Créneaux matinaux (9h-12h)
    const morningSlots = [
      { hour: 9, minute: 0 },
      { hour: 9, minute: 30 },
      { hour: 10, minute: 0 },
      { hour: 10, minute: 30 },
      { hour: 11, minute: 0 },
      { hour: 11, minute: 30 }
    ];
    
    // Créneaux après-midi (14h-18h)
    const afternoonSlots = [
      { hour: 14, minute: 0 },
      { hour: 14, minute: 30 },
      { hour: 15, minute: 0 },
      { hour: 15, minute: 30 },
      { hour: 16, minute: 0 },
      { hour: 16, minute: 30 },
      { hour: 17, minute: 0 },
      { hour: 17, minute: 30 }
    ];
    
    // Combiner et randomiser la disponibilité
    const allSlots = [...morningSlots, ...afternoonSlots];
    const availableSlots = allSlots.filter(() => Math.random() > 0.3); // 70% de disponibilité
    
    availableSlots.forEach(({ hour, minute }) => {
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);
      
      // Ne pas inclure les créneaux passés
      if (slotTime <= now) return;
      
      slots.push({
        date: dateStr,
        start_time: slotTime.toISOString(),
        end_time: new Date(slotTime.getTime() + 30 * 60000).toISOString(),
        duration: 30,
        type: Math.random() > 0.7 ? 'Consultation Premium' : 'Consultation Standard',
        available: true
      });
    });
  }
  
  return slots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
};

// Cache pour éviter de régénérer constamment
const availabilityCache = new Map();

const useAvailability = (expertUrl) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Simuler l'appel API Calendly
  const fetchAvailability = useCallback(async (forceRefresh = false) => {
    if (!expertUrl) {
      setError('URL expert manquante');
      return;
    }

    // Utiliser le cache si disponible et récent (< 5 minutes)
    const cacheKey = expertUrl;
    const cachedData = availabilityCache.get(cacheKey);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (!forceRefresh && cachedData && cachedData.timestamp > fiveMinutesAgo) {
      setAvailability(cachedData.data);
      setLastFetch(cachedData.timestamp);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Récupération disponibilités pour:', expertUrl);
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Simuler un taux d'échec de 2%
      if (Math.random() < 0.02) {
        throw new Error('Impossible de récupérer les disponibilités');
      }
      
      const mockAvailability = generateMockAvailability(expertUrl);
      
      // Mettre en cache
      const cacheData = {
        data: mockAvailability,
        timestamp: new Date()
      };
      availabilityCache.set(cacheKey, cacheData);
      
      setAvailability(mockAvailability);
      setLastFetch(cacheData.timestamp);
      
      console.log(`✅ ${mockAvailability.length} créneaux récupérés`);
      
    } catch (err) {
      console.error('❌ Erreur récupération disponibilités:', err);
      setError(err.message);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, [expertUrl]);

  // Utilitaires pour filtrer les créneaux
  const getAvailabilityForDate = useCallback((date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return availability.filter(slot => slot.date === dateStr && slot.available);
  }, [availability]);

  const getAvailabilityForDateRange = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return availability.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= start && slotDate <= end && slot.available;
    });
  }, [availability]);

  const hasAvailabilityOnDate = useCallback((date) => {
    return getAvailabilityForDate(date).length > 0;
  }, [getAvailabilityForDate]);

  // Statistiques sur la disponibilité
  const availabilityStats = useMemo(() => {
    if (!availability.length) return null;

    const totalSlots = availability.length;
    const availableSlots = availability.filter(slot => slot.available).length;
    const nextAvailable = availability.find(slot => slot.available && new Date(slot.start_time) > new Date());
    
    // Répartition par jour
    const slotsByDay = availability.reduce((acc, slot) => {
      const day = slot.date;
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalSlots,
      available: availableSlots,
      unavailable: totalSlots - availableSlots,
      nextAvailable: nextAvailable,
      availabilityRate: (availableSlots / totalSlots) * 100,
      slotsByDay
    };
  }, [availability]);

  // Auto-refresh toutes les 5 minutes si la page est active
  const setupAutoRefresh = useCallback(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && expertUrl) {
        fetchAvailability(false); // Refresh sans forcer (utilise le cache)
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchAvailability, expertUrl]);

  return {
    availability,
    loading,
    error,
    lastFetch,
    fetchAvailability,
    getAvailabilityForDate,
    getAvailabilityForDateRange,
    hasAvailabilityOnDate,
    availabilityStats,
    setupAutoRefresh,
    
    // États helpers
    isLoading: loading,
    isEmpty: !loading && availability.length === 0,
    hasData: availability.length > 0,
    hasError: !!error
  };
};

export { useAvailability };