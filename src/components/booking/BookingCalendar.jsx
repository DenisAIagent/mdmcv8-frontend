import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvailability } from '../../hooks/useAvailability';
import './BookingCalendar.css';

const BookingCalendar = ({ expert, onSlotSelect, selectedSlot, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [viewMode, setViewMode] = useState('week'); // 'week' ou 'month'
  const [isLoading, setIsLoading] = useState(false);

  // Hook personnalisé pour récupérer les disponibilités
  const { availability, loading, error, fetchAvailability } = useAvailability(expert?.calendlyUrl);

  useEffect(() => {
    if (expert) {
      fetchAvailability();
    }
  }, [expert, currentDate]);

  // Utilitaires de dates
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timeZone
    }).format(new Date(time));
  };

  // Génération du calendrier
  const calendarDays = useMemo(() => {
    const start = new Date(currentDate);
    const days = [];
    
    if (viewMode === 'week') {
      // Vue semaine - 7 jours
      const startOfWeek = new Date(start);
      startOfWeek.setDate(start.getDate() - start.getDay() + 1); // Lundi
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
    } else {
      // Vue mois - calendrier complet
      start.setDate(1);
      const startOfMonth = new Date(start);
      const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      
      // Ajouter les jours du mois précédent pour compléter la semaine
      const firstDayWeek = startOfMonth.getDay();
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        const day = new Date(startOfMonth);
        day.setDate(startOfMonth.getDate() - i - 1);
        days.push(day);
      }
      
      // Ajouter tous les jours du mois
      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        days.push(new Date(start.getFullYear(), start.getMonth(), day));
      }
      
      // Compléter la grille avec les jours du mois suivant
      const remainingDays = 42 - days.length; // 6 semaines * 7 jours
      for (let i = 1; i <= remainingDays; i++) {
        const day = new Date(endOfMonth);
        day.setDate(endOfMonth.getDate() + i);
        days.push(day);
      }
    }
    
    return days;
  }, [currentDate, viewMode]);

  // Créneaux disponibles pour une date donnée
  const getAvailableSlots = (date) => {
    if (!availability || loading) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return availability.filter(slot => 
      slot.date === dateStr && 
      new Date(slot.start_time) > new Date() // Pas de créneaux passés
    );
  };

  // Vérifier si une date a des créneaux disponibles
  const hasAvailableSlots = (date) => {
    return getAvailableSlots(date).length > 0;
  };

  // Gestion de la navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handlers
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot) => {
    onSlotSelect({
      ...slot,
      date: selectedDate,
      expert: expert,
      timeZone: timeZone
    });
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1 
      }
    }
  };

  const dayVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", damping: 15 }
    }
  };

  const slotVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        damping: 20
      }
    }),
    hover: {
      scale: 1.02,
      backgroundColor: expert?.color + '10'
    }
  };

  if (error) {
    return (
      <div className="booking-calendar-error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>Impossible de charger les disponibilités de {expert?.name}</p>
        <div className="error-actions">
          <button onClick={onBack} className="btn-secondary">
            Retour
          </button>
          <button onClick={fetchAvailability} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="booking-calendar"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header avec navigation */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button onClick={onBack} className="calendar-back-btn">
            ← Retour
          </button>
          <div className="expert-info-mini">
            <img src={expert?.avatar} alt={expert?.name} className="expert-avatar-mini" />
            <div>
              <h3>RDV avec {expert?.name}</h3>
              <span className="expert-specialty-mini">{expert?.role}</span>
            </div>
          </div>
        </div>

        <div className="calendar-header-center">
          <div className="calendar-nav">
            <button onClick={goToPrevious} className="calendar-nav-btn">
              ‹
            </button>
            <h2 className="calendar-title">
              {viewMode === 'week' 
                ? `Semaine du ${formatDate(calendarDays[0])}`
                : currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              }
            </h2>
            <button onClick={goToNext} className="calendar-nav-btn">
              ›
            </button>
          </div>
          
          <button onClick={goToToday} className="calendar-today-btn">
            Aujourd'hui
          </button>
        </div>

        <div className="calendar-header-right">
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode('week')}
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            >
              Mois
            </button>
          </div>

          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="timezone-select"
          >
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="America/New_York">New York (EST)</option>
            <option value="America/Los_Angeles">Los Angeles (PST)</option>
          </select>
        </div>
      </div>

      {/* Calendrier principal */}
      <div className="calendar-container">
        <div className={`calendar-grid calendar-grid--${viewMode}`}>
          {/* En-têtes des jours */}
          {viewMode === 'week' ? (
            ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))
          ) : (
            ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))
          )}

          {/* Jours du calendrier */}
          {calendarDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            const hasSlots = hasAvailableSlots(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <motion.div
                key={day.toISOString()}
                variants={dayVariants}
                className={`calendar-day ${isToday ? 'today' : ''} ${
                  isPast ? 'past' : ''
                } ${isSelected ? 'selected' : ''} ${
                  hasSlots ? 'has-slots' : ''
                } ${!isCurrentMonth && viewMode === 'month' ? 'other-month' : ''}`}
                onClick={() => !isPast && hasSlots && handleDateSelect(day)}
                whileHover={!isPast && hasSlots ? { scale: 1.05 } : {}}
              >
                <div className="calendar-day-number">{day.getDate()}</div>
                {hasSlots && !isPast && (
                  <div className="availability-indicator">
                    <div className="availability-dots">
                      {Array.from({ length: Math.min(getAvailableSlots(day).length, 3) }, (_, i) => (
                        <div key={i} className="availability-dot" />
                      ))}
                      {getAvailableSlots(day).length > 3 && (
                        <span className="availability-more">+{getAvailableSlots(day).length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Créneaux horaires pour le jour sélectionné */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="time-slots-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="time-slots-header">
              <h3>Créneaux disponibles - {formatDate(selectedDate)}</h3>
              <p>Sélectionnez l'heure qui vous convient</p>
            </div>

            <div className="time-slots-grid">
              {loading ? (
                <div className="time-slots-loading">
                  <div className="loading-spinner" />
                  <p>Chargement des créneaux...</p>
                </div>
              ) : (
                getAvailableSlots(selectedDate).map((slot, index) => (
                  <motion.button
                    key={slot.start_time}
                    custom={index}
                    variants={slotVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className={`time-slot ${
                      selectedSlot?.start_time === slot.start_time ? 'selected' : ''
                    }`}
                    onClick={() => handleSlotSelect(slot)}
                    style={{ '--expert-color': expert?.color }}
                  >
                    <div className="time-slot-time">
                      {formatTime(slot.start_time)}
                    </div>
                    <div className="time-slot-duration">
                      {slot.duration || 30} min
                    </div>
                    {slot.type && (
                      <div className="time-slot-type">
                        {slot.type}
                      </div>
                    )}
                  </motion.button>
                ))
              )}
              
              {!loading && getAvailableSlots(selectedDate).length === 0 && (
                <div className="no-slots">
                  <div className="no-slots-icon">📅</div>
                  <p>Aucun créneau disponible ce jour-là</p>
                  <button onClick={() => setSelectedDate(null)} className="btn-secondary">
                    Choisir une autre date
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Légende */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-indicator today-indicator"></div>
          <span>Aujourd'hui</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator available-indicator"></div>
          <span>Créneaux disponibles</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator selected-indicator"></div>
          <span>Date sélectionnée</span>
        </div>
      </div>

      {/* Actions footer */}
      {selectedSlot && (
        <motion.div
          className="calendar-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="selected-slot-summary">
            <h4>Créneau sélectionné</h4>
            <p>
              {formatDate(selectedDate)} à {formatTime(selectedSlot.start_time)}
              <span className="timezone-info"> ({timeZone})</span>
            </p>
          </div>
          <button
            onClick={() => onSlotSelect(selectedSlot)}
            className="continue-btn"
          >
            Continuer
            <span className="btn-arrow">→</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookingCalendar;