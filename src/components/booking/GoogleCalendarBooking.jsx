import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GoogleCalendarBooking.css';

const GoogleCalendarBooking = ({
  expert,
  onScheduled = () => {},
  onBack = () => {}
}) => {
  const [currentStep, setCurrentStep] = useState('calendar'); // calendar, form, confirmation
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  // Mock data pour les créneaux disponibles (sera remplacé par l'API Google Calendar)
  const generateMockSlots = () => {
    const slots = {};
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends pour la démo
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const dateStr = date.toISOString().split('T')[0];
        slots[dateStr] = [
          '09:00', '09:30', '10:00', '10:30', 
          '11:00', '11:30', '14:00', '14:30', 
          '15:00', '15:30', '16:00', '16:30', '17:00'
        ].filter(() => Math.random() > 0.3); // Simule la disponibilité aléatoire
      }
    }
    
    return slots;
  };

  useEffect(() => {
    // Charger les créneaux disponibles
    setIsLoading(true);
    setTimeout(() => {
      setAvailableSlots(generateMockSlots());
      setIsLoading(false);
    }, 1000);
  }, [expert]);

  // Génère les dates pour les 2 prochaines semaines
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      setCurrentStep('form');
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation de l'appel API
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('confirmation');
      
      // Analytics
      if (window.gtag) {
        window.gtag('event', 'google_calendar_booking_completed', {
          event_category: 'conversion',
          event_label: expert.name,
          value: 100
        });
      }

      onScheduled({
        expert,
        date: selectedDate,
        time: selectedTime,
        formData
      });
    }, 2000);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading && currentStep === 'calendar') {
    return (
      <div className="gcb-loading">
        <div className="gcb-loading-spinner"></div>
        <p>Chargement des disponibilités...</p>
      </div>
    );
  }

  return (
    <div className="google-calendar-booking">
      {/* Header */}
      <div className="gcb-header">
        <button onClick={onBack} className="gcb-back-btn">
          ← Changer d'expert
        </button>
        <div className="gcb-expert-info">
          <img 
            src={expert.avatar} 
            alt={expert.name}
            className="gcb-expert-avatar"
            onError={(e) => e.target.style.display = 'none'}
          />
          <div>
            <h3>{expert.name}</h3>
            <p>{expert.role}</p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="gcb-progress">
        <div className={`gcb-progress-step ${currentStep === 'calendar' ? 'active' : currentStep === 'form' || currentStep === 'confirmation' ? 'completed' : ''}`}>
          <span>1</span> Créneau
        </div>
        <div className="gcb-progress-line"></div>
        <div className={`gcb-progress-step ${currentStep === 'form' ? 'active' : currentStep === 'confirmation' ? 'completed' : ''}`}>
          <span>2</span> Informations
        </div>
        <div className="gcb-progress-line"></div>
        <div className={`gcb-progress-step ${currentStep === 'confirmation' ? 'active' : ''}`}>
          <span>3</span> Confirmation
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="gcb-calendar-step"
          >
            <h4>Choisissez une date</h4>
            <div className="gcb-calendar">
              {generateDateRange().map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const hasSlots = availableSlots[dateStr]?.length > 0;
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                
                return (
                  <button
                    key={dateStr}
                    className={`gcb-date-btn ${!hasSlots ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => hasSlots && handleDateSelect(date)}
                    disabled={!hasSlots}
                  >
                    <span className="gcb-date-weekday">{formatDate(date).split(' ')[0]}</span>
                    <span className="gcb-date-day">{date.getDate()}</span>
                    <span className="gcb-date-month">{formatDate(date).split(' ')[2]}</span>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gcb-time-selection"
              >
                <h4>Choisissez un créneau</h4>
                <div className="gcb-time-slots">
                  {availableSlots[selectedDate.toISOString().split('T')[0]]?.map(time => (
                    <button
                      key={time}
                      className={`gcb-time-btn ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gcb-continue-btn"
                    onClick={handleContinue}
                  >
                    Continuer →
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="gcb-form-step"
          >
            <div className="gcb-selection-summary">
              <h4>Récapitulatif</h4>
              <div className="gcb-summary-item">
                <strong>{expert.name}</strong> • {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })} à {selectedTime}
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="gcb-booking-form">
              <div className="gcb-form-row">
                <div className="gcb-form-field">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="gcb-form-field">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="gcb-form-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="gcb-form-field">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>

              <div className="gcb-form-field">
                <label>Entreprise / Projet</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleFormChange('company', e.target.value)}
                  placeholder="Optionnel"
                />
              </div>

              <div className="gcb-form-field">
                <label>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  placeholder="Décrivez brièvement vos objectifs ou questions..."
                  rows="4"
                />
              </div>

              <div className="gcb-form-actions">
                <button
                  type="button"
                  className="gcb-back-form-btn"
                  onClick={() => setCurrentStep('calendar')}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  className="gcb-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Réservation...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {currentStep === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="gcb-confirmation-step"
          >
            <div className="gcb-confirmation-icon">✅</div>
            <h3>Réservation confirmée !</h3>
            <p>Votre consultation avec {expert.name} est programmée.</p>
            
            <div className="gcb-confirmation-details">
              <div className="gcb-detail-item">
                <strong>Date :</strong> {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="gcb-detail-item">
                <strong>Heure :</strong> {selectedTime}
              </div>
              <div className="gcb-detail-item">
                <strong>Expert :</strong> {expert.name}
              </div>
              <div className="gcb-detail-item">
                <strong>Email :</strong> {formData.email}
              </div>
            </div>

            <div className="gcb-next-steps">
              <h4>Prochaines étapes :</h4>
              <ul>
                <li>Vous recevrez un email de confirmation</li>
                <li>Un lien Google Meet sera envoyé 24h avant</li>
                <li>Préparez vos questions et objectifs</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoogleCalendarBooking;