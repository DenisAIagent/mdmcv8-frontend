import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpertSelector from './ExpertSelector';
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import ConfirmationView from './ConfirmationView';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { useAnalytics } from '../../hooks/useAnalytics';
import './BookingSystem.css';

const BookingSystem = ({ 
  className = '',
  displayMode = 'modal', // 'modal', 'inline', 'fullscreen'
  triggerElement,
  onClose = () => {},
  onScheduled = () => {}
}) => {
  // États principaux
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('expert-selection');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks personnalisés
  const { createBooking, bookingStatus } = useBookingFlow();
  const { trackEvent } = useAnalytics();
  const modalRef = useRef(null);

  // Étapes du flow
  const steps = [
    { id: 'expert-selection', title: 'Choix de l\'expert', progress: 25 },
    { id: 'calendar', title: 'Sélection du créneau', progress: 50 },
    { id: 'form', title: 'Informations', progress: 75 },
    { id: 'confirmation', title: 'Confirmation', progress: 100 }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  // Animations Framer Motion
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const stepVariants = {
    hidden: { 
      opacity: 0, 
      x: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Gestion des étapes
  const goToStep = (step) => {
    trackEvent('booking_step_change', { from: currentStep, to: step });
    setCurrentStep(step);
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1].id);
    }
  };

  // Gestion de l'ouverture/fermeture
  const openModal = () => {
    setIsOpen(true);
    setCurrentStep('expert-selection');
    trackEvent('booking_modal_opened');
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentStep('expert-selection');
    setSelectedExpert(null);
    setSelectedSlot(null);
    setBookingData({});
    onClose();
    trackEvent('booking_modal_closed');
  };

  // Handlers
  const handleExpertSelect = (expert) => {
    setSelectedExpert(expert);
    setBookingData(prev => ({ ...prev, expert }));
    trackEvent('booking_expert_selected', { expertId: expert.id, expertName: expert.name });
    nextStep();
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingData(prev => ({ ...prev, slot }));
    trackEvent('booking_slot_selected', { 
      date: slot.date, 
      time: slot.time,
      expertId: selectedExpert.id 
    });
    nextStep();
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    
    try {
      const completeBookingData = {
        ...bookingData,
        ...formData,
        timestamp: new Date().toISOString()
      };

      setBookingData(completeBookingData);
      
      // Simuler l'appel API
      await createBooking(completeBookingData);
      
      trackEvent('booking_completed', {
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        date: selectedSlot.date,
        time: selectedSlot.time,
        projectType: formData.projectType,
        budget: formData.budget
      });
      
      onScheduled(completeBookingData);
      nextStep();
      
    } catch (error) {
      console.error('Booking failed:', error);
      trackEvent('booking_failed', { error: error.message });
      // Gestion d'erreur ici
    } finally {
      setIsLoading(false);
    }
  };

  // Fermeture par ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Rendu du contenu selon l'étape
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'expert-selection':
        return (
          <ExpertSelector
            onExpertSelect={handleExpertSelect}
            selectedExpert={selectedExpert}
          />
        );
      
      case 'calendar':
        return (
          <BookingCalendar
            expert={selectedExpert}
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
            onBack={prevStep}
          />
        );
      
      case 'form':
        return (
          <BookingForm
            expert={selectedExpert}
            slot={selectedSlot}
            onSubmit={handleFormSubmit}
            onBack={prevStep}
            isLoading={isLoading}
            initialData={bookingData}
          />
        );
      
      case 'confirmation':
        return (
          <ConfirmationView
            bookingData={bookingData}
            onClose={closeModal}
            onNewBooking={() => {
              setCurrentStep('expert-selection');
              setSelectedExpert(null);
              setSelectedSlot(null);
              setBookingData({});
            }}
          />
        );
      
      default:
        return null;
    }
  };

  // Rendu pour mode inline
  if (displayMode === 'inline') {
    return (
      <div className={`booking-system booking-system--inline ${className}`}>
        <div className="booking-progress">
          <div className="booking-progress-bar">
            <motion.div 
              className="booking-progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${currentStepData?.progress || 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="booking-progress-text">
            Étape {steps.findIndex(s => s.id === currentStep) + 1} sur {steps.length}: {currentStepData?.title}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="booking-step-container"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Trigger element avec clone et event handler
  const TriggerElement = triggerElement ? (
    React.cloneElement(triggerElement, { onClick: openModal })
  ) : (
    <button
      onClick={openModal}
      className="booking-trigger-button"
    >
      <span className="booking-trigger-icon">📅</span>
      <div className="booking-trigger-content">
        <span className="booking-trigger-title">Réserver une consultation</span>
        <span className="booking-trigger-subtitle">Gratuite • 30 min • En ligne</span>
      </div>
      <span className="booking-trigger-arrow">→</span>
    </button>
  );

  return (
    <>
      {TriggerElement}
      
      <AnimatePresence>
        {isOpen && (
          <div className="booking-modal-root">
            <motion.div
              className="booking-modal-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeModal}
            />
            
            <motion.div
              ref={modalRef}
              className={`booking-modal ${className}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header avec progress */}
              <div className="booking-modal-header">
                <button
                  onClick={closeModal}
                  className="booking-modal-close"
                  aria-label="Fermer"
                >
                  ✕
                </button>
                
                <div className="booking-progress">
                  <div className="booking-progress-steps">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`booking-progress-step ${
                          index <= steps.findIndex(s => s.id === currentStep) ? 'active' : ''
                        }`}
                      >
                        <div className="booking-progress-step-number">
                          {index + 1}
                        </div>
                        <span className="booking-progress-step-title">
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="booking-progress-bar">
                    <motion.div 
                      className="booking-progress-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: `${currentStepData?.progress || 0}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="booking-modal-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="booking-step-container"
                  >
                    {renderCurrentStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingSystem;