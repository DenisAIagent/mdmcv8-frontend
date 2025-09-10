import React, { useState } from 'react';
import CalendlyWidget from './CalendlyWidget';
import './CalendlyExpertSelector.css';

const experts = [
  {
    id: 'denis',
    name: 'Denis',
    specialty: 'YouTube Ads',
    description: 'Expert en publicité YouTube et stratégies vidéo',
    calendlyUrl: 'https://calendly.com/denis-mdmcmusicads/30min',
    avatar: '/assets/images/experts/petit portrait denis.jpg',
    color: '#FF0000',
    initials: 'DA'
  },
  {
    id: 'marine',
    name: 'Marine',
    specialty: 'Meta Ads',
    description: 'Spécialiste Facebook & Instagram Ads',
    calendlyUrl: 'https://calendly.com/mhl-agency/decouverte',
    avatar: '/assets/images/experts/petit portrait marine.jpeg',
    color: '#1877F2',
    initials: 'MH'
  }
];

const CalendlyExpertSelector = ({ 
  displayType = 'inline', // 'modal', 'inline', 'popup'
  className = '',
  onScheduled = () => {}
}) => {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showCalendly, setShowCalendly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpertSelect = (expert) => {
    setSelectedExpert(expert);
    setShowCalendly(true);
  };

  const handleBack = () => {
    setShowCalendly(false);
    setSelectedExpert(null);
    setIsExpanded(true); // Retour à la sélection d'expert
  };

  const handleScheduled = (payload) => {
    console.log(`RDV programmé avec ${selectedExpert.name}:`, payload);
    onScheduled({ ...payload, expert: selectedExpert });
    
    // Réinitialiser après un court délai
    setTimeout(() => {
      setShowCalendly(false);
      setSelectedExpert(null);
    }, 2000);
  };

  // Bouton dépliant principal
  if (!isExpanded && !showCalendly) {
    return (
      <div className={`expert-selector-collapsed ${className}`}>
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(true)}
        >
          <span className="expand-icon">RDV</span>
          <div className="expand-text">
            <span className="expand-title">Prendre rendez-vous</span>
            <span className="expand-subtitle">Choisissez votre expert</span>
          </div>
          <span className="expand-arrow"></span>
        </button>
      </div>
    );
  }

  // Vue sélection d'expert (dépliée)
  if (isExpanded && !showCalendly) {
    return (
      <div className={`expert-selector ${className}`}>
        <div className="expert-selector-header">
          <button 
            className="collapse-button"
            onClick={() => setIsExpanded(false)}
          >
            ← Fermer
          </button>
          <h3>Choisissez votre expert</h3>
          <p>Sélectionnez le spécialiste adapté à vos besoins</p>
        </div>
        
        <div className="expert-cards">
          {experts.map(expert => (
            <div 
              key={expert.id}
              className="expert-card"
              onClick={() => handleExpertSelect(expert)}
              style={{ '--expert-color': expert.color }}
            >
              <div className="expert-card-header">
                <div className="expert-avatar-container">
                  <img 
                    src={expert.avatar} 
                    alt={expert.name}
                    className="expert-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="expert-avatar-fallback" style={{display: 'none'}}>
                    {expert.initials}
                  </div>
                </div>
                <div className="expert-info">
                  <h3>{expert.name}</h3>
                  <span className="expert-specialty">{expert.specialty}</span>
                </div>
              </div>
              
              <p className="expert-description">{expert.description}</p>
              
              <button 
                className="expert-select-btn"
                aria-label={`Prendre RDV avec ${expert.name}`}
              >
                Planifier avec {expert.name}
                <span className="btn-arrow"></span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vue Calendly avec l'expert sélectionné
  return (
    <div className={`expert-calendly-container ${className}`}>
      <div className="expert-calendly-header">
        <button 
          className="back-button"
          onClick={handleBack}
          aria-label="Retour à la sélection"
        >
          ← Retour
        </button>
        
        <div className="selected-expert-info">
          <span className="expert-icon-small"></span>
          <span>
            RDV avec <strong>{selectedExpert.name}</strong> - {selectedExpert.specialty}
          </span>
        </div>
      </div>
      
      <CalendlyWidget
        url={selectedExpert.calendlyUrl}
        type={displayType}
        lazyLoad={true}
        prefill={{
          name: '',
          email: '',
          customAnswers: {
            a1: `Expert choisi: ${selectedExpert.name} (${selectedExpert.specialty})`
          }
        }}
        onScheduled={handleScheduled}
        className="expert-calendly-widget"
      />
    </div>
  );
};

export default CalendlyExpertSelector;