import React, { useState, useEffect } from 'react';
import { FaPhone, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import CalendlyBookingSystem from '../booking/CalendlyBookingSystem';
import './FloatingConsultationButton.css';

const FloatingConsultationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    // Apparition progressive après 2 secondes
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Arrêter l'animation pulse après 10 secondes
    const pulseTimer = setTimeout(() => {
      setIsPulsing(false);
    }, 10000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsPulsing(false); // Arrêter le pulse quand on clique

    // Analytics
    if (window.gtag) {
      window.gtag('event', 'floating_consultation_button_click', {
        event_category: 'engagement',
        event_label: 'floating_button',
        action: isOpen ? 'close' : 'open'
      });
    }
  };

  const handleScheduled = (data) => {
    console.log('✅ Consultation programmée via bouton flottant:', data);

    if (window.gtag) {
      window.gtag('event', 'consultation_scheduled_floating', {
        event_category: 'conversion',
        event_label: 'floating_button',
        value: 100
      });
    }

    // Fermer après réservation
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bouton flottant */}
      <button
        className={`floating-consultation-btn ${isPulsing ? 'pulsing' : ''} ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Réserver une consultation gratuite"
      >
        <span className="btn-icon">
          {isOpen ? <FaTimes /> : <FaPhone />}
        </span>
        <span className="btn-tooltip">
          <FaCalendarAlt /> Consultation gratuite
        </span>
      </button>

      {/* Module Calendly en modal */}
      {isOpen && (
        <div className="floating-modal-wrapper">
          <div className="floating-modal-backdrop" onClick={handleToggle} />
          <div className="floating-modal-content">
            <div className="floating-modal-header">
              <h3>Réservez votre consultation gratuite</h3>
              <p>30 minutes avec un expert en marketing musical</p>
              <button className="floating-modal-close" onClick={handleToggle}>
                <FaTimes />
              </button>
            </div>
            <div className="floating-modal-body">
              <CalendlyBookingSystem
                displayMode="inline"
                onScheduled={handleScheduled}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingConsultationButton;