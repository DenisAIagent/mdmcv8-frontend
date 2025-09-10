import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpertSelector from './ExpertSelector';
import CalendlyBooking from './CalendlyBooking';

const CalendlyBookingSystem = ({ 
  displayMode = 'modal',
  triggerElement,
  onClose = () => {},
  onScheduled = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(displayMode === 'inline');
  const [selectedExpert, setSelectedExpert] = useState(null);

  const handleExpertSelect = (expert) => {
    setSelectedExpert(expert);
    
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'expert_selected', {
        event_category: 'booking',
        event_label: expert.name,
        expert_id: expert.id
      });
    }
  };

  const handleBackToExperts = () => {
    setSelectedExpert(null);
  };

  const handleScheduled = (payload) => {
    console.log('✅ Consultation programmée:', payload);
    
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'consultation_scheduled', {
        event_category: 'conversion',
        event_label: selectedExpert?.name,
        expert_id: selectedExpert?.id,
        value: 100
      });
    }

    onScheduled({ expert: selectedExpert, calendlyPayload: payload });
    
    // Fermer le modal après la réservation
    if (displayMode === 'modal') {
      setTimeout(() => {
        setIsOpen(false);
        onClose();
      }, 2000);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Mode inline - toujours visible
  if (displayMode === 'inline') {
    return (
      <div className="calendly-booking-system">
        {!selectedExpert ? (
          <div className="mb-8">
            <ExpertSelector 
              onExpertSelect={handleExpertSelect}
              selectedExpert={selectedExpert}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Réserver avec {selectedExpert.name}
                </h3>
                <p className="text-gray-600">{selectedExpert.role}</p>
              </div>
              <button
                onClick={handleBackToExperts}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Changer d'expert
              </button>
            </div>
            
            <div className="calendly-booking-wrapper">
              <div className="expert-header-compact">
                <div className="expert-info-line">
                  <h3>Réservation avec {selectedExpert.name}</h3>
                  <button
                    onClick={handleBackToExperts}
                    className="change-expert-btn"
                  >
                    Changer d'expert
                  </button>
                </div>
                <p className="expert-subtitle">{selectedExpert.role} • {selectedExpert.specialties?.[0]}</p>
              </div>
              
              <CalendlyBooking
                url={selectedExpert.calendlyUrl}
                expertName={selectedExpert.name}
                onEventScheduled={handleScheduled}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode modal
  return (
    <>
      {/* Trigger pour ouvrir le modal */}
      {triggerElement && React.cloneElement(triggerElement, { onClick: handleToggle })}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {!selectedExpert ? 'Choisir un expert' : `Réserver avec ${selectedExpert.name}`}
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {!selectedExpert ? (
                  <ExpertSelector 
                    onExpertSelect={handleExpertSelect}
                    selectedExpert={selectedExpert}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={selectedExpert.avatar}
                          alt={selectedExpert.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedExpert.name}
                          </h3>
                          <p className="text-gray-600">{selectedExpert.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleBackToExperts}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Changer d'expert
                      </button>
                    </div>
                    
                    <CalendlyBooking
                      url={selectedExpert.calendlyUrl}
                      locale="fr"
                      utm={{
                        utmSource: 'mdmc_website',
                        utmCampaign: 'expert_booking',
                        utmMedium: 'modal_widget'
                      }}
                      onScheduled={handleScheduled}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendlyBookingSystem;