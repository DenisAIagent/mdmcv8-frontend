import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BookingForm.css';

const BookingForm = ({ 
  expert, 
  slot, 
  onSubmit, 
  onBack, 
  isLoading, 
  initialData = {} 
}) => {
  // États du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    budget: '',
    currentPlatforms: [],
    goals: '',
    timeline: '',
    previousExperience: '',
    message: '',
    newsletter: true,
    terms: false,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Configuration des sections
  const formSections = [
    {
      id: 'personal',
      title: 'Informations personnelles',
      description: 'Dites-nous qui vous êtes',
      fields: ['firstName', 'lastName', 'email', 'phone']
    },
    {
      id: 'project',
      title: 'Votre projet musical',
      description: 'Parlons de votre musique et vos objectifs',
      fields: ['company', 'projectType', 'currentPlatforms', 'goals']
    },
    {
      id: 'strategy',
      title: 'Stratégie et budget',
      description: 'Définissons votre approche marketing',
      fields: ['budget', 'timeline', 'previousExperience']
    },
    {
      id: 'final',
      title: 'Message et confirmation',
      description: 'Derniers détails avant validation',
      fields: ['message', 'newsletter', 'terms']
    }
  ];

  // Options prédéfinies
  const projectTypes = [
    { value: 'artist-solo', label: 'Artiste solo', icon: '🎤' },
    { value: 'group-band', label: 'Groupe/Band', icon: '🎸' },
    { value: 'label', label: 'Label musical', icon: '🏢' },
    { value: 'producer', label: 'Producteur', icon: '🎧' },
    { value: 'manager', label: 'Manager d\'artiste', icon: '📊' },
    { value: 'other', label: 'Autre', icon: '🎵' }
  ];

  const budgetRanges = [
    { value: '500-1000', label: '500€ - 1 000€', icon: '💰' },
    { value: '1000-3000', label: '1 000€ - 3 000€', icon: '💎' },
    { value: '3000-5000', label: '3 000€ - 5 000€', icon: '🔥' },
    { value: '5000-10000', label: '5 000€ - 10 000€', icon: '🚀' },
    { value: '10000+', label: '10 000€+', icon: '⭐' },
    { value: 'discuss', label: 'À discuter', icon: '💬' }
  ];

  const platforms = [
    { value: 'spotify', label: 'Spotify', color: '#1DB954' },
    { value: 'youtube', label: 'YouTube', color: '#FF0000' },
    { value: 'apple-music', label: 'Apple Music', color: '#FA233B' },
    { value: 'instagram', label: 'Instagram', color: '#E4405F' },
    { value: 'tiktok', label: 'TikTok', color: '#000000' },
    { value: 'facebook', label: 'Facebook', color: '#1877F2' },
    { value: 'soundcloud', label: 'SoundCloud', color: '#FF3300' },
    { value: 'deezer', label: 'Deezer', color: '#FF6600' }
  ];

  const timelines = [
    { value: 'asap', label: 'Dès que possible', icon: '⚡' },
    { value: '1-month', label: 'Dans le mois', icon: '📅' },
    { value: '3-months', label: 'Dans les 3 mois', icon: '🗓️' },
    { value: '6-months', label: 'Dans les 6 mois', icon: '📆' },
    { value: 'flexible', label: 'Flexible', icon: '🤷‍♂️' }
  ];

  // Validation en temps réel
  useEffect(() => {
    validateForm();
  }, [formData, currentSection]);

  const validateForm = () => {
    const newErrors = {};
    const currentFields = formSections[currentSection]?.fields || [];

    // Validation par champ
    currentFields.forEach(field => {
      switch (field) {
        case 'firstName':
        case 'lastName':
          if (!formData[field].trim()) {
            newErrors[field] = 'Ce champ est requis';
          } else if (formData[field].length < 2) {
            newErrors[field] = 'Minimum 2 caractères';
          }
          break;
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!formData[field]) {
            newErrors[field] = 'Email requis';
          } else if (!emailRegex.test(formData[field])) {
            newErrors[field] = 'Email invalide';
          }
          break;
          
        case 'phone':
          const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
          if (formData[field] && !phoneRegex.test(formData[field].replace(/\s/g, ''))) {
            newErrors[field] = 'Numéro invalide';
          }
          break;
          
        case 'projectType':
          if (!formData[field]) {
            newErrors[field] = 'Sélectionnez votre type de projet';
          }
          break;
          
        case 'budget':
          if (!formData[field]) {
            newErrors[field] = 'Indiquez votre budget';
          }
          break;
          
        case 'goals':
          if (!formData[field].trim()) {
            newErrors[field] = 'Décrivez vos objectifs';
          } else if (formData[field].length < 10) {
            newErrors[field] = 'Minimum 10 caractères';
          }
          break;
          
        case 'terms':
          if (!formData[field]) {
            newErrors[field] = 'Vous devez accepter les conditions';
          }
          break;
      }
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextSection = () => {
    if (isValid && currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && currentSection === formSections.length - 1) {
      onSubmit(formData);
    }
  };

  // Animations
  const sectionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", damping: 25 }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.2 }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        damping: 20
      }
    })
  };

  // Rendu des champs selon le type
  const renderField = (field, index) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field ${errors[field] ? 'error' : ''}`}
          >
            <label htmlFor={field}>
              {field === 'firstName' ? 'Prénom' : 'Nom'} *
            </label>
            <input
              id={field}
              type="text"
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={field === 'firstName' ? 'Votre prénom' : 'Votre nom'}
              className="form-input"
            />
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      case 'email':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field ${errors[field] ? 'error' : ''}`}
          >
            <label htmlFor={field}>Email *</label>
            <input
              id={field}
              type="email"
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="votre@email.com"
              className="form-input"
            />
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      case 'phone':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field ${errors[field] ? 'error' : ''}`}
          >
            <label htmlFor={field}>Téléphone</label>
            <input
              id={field}
              type="tel"
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className="form-input"
            />
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      case 'company':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className="form-field"
          >
            <label htmlFor={field}>Nom d'artiste / Label / Société</label>
            <input
              id={field}
              type="text"
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Ex: MC Solaar, Universal Music..."
              className="form-input"
            />
          </motion.div>
        );

      case 'projectType':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field ${errors[field] ? 'error' : ''}`}
          >
            <label>Type de projet *</label>
            <div className="form-options-grid">
              {projectTypes.map(type => (
                <motion.button
                  key={type.value}
                  type="button"
                  className={`form-option ${formData[field] === type.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange(field, type.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{type.icon}</span>
                  <span className="option-label">{type.label}</span>
                </motion.button>
              ))}
            </div>
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      case 'currentPlatforms':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className="form-field"
          >
            <label>Plateformes actuelles</label>
            <p className="field-description">Sur quelles plateformes êtes-vous déjà présent ?</p>
            <div className="form-platforms-grid">
              {platforms.map(platform => (
                <motion.button
                  key={platform.value}
                  type="button"
                  className={`form-platform ${formData[field].includes(platform.value) ? 'selected' : ''}`}
                  onClick={() => handleArrayToggle(field, platform.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ '--platform-color': platform.color }}
                >
                  {platform.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'goals':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field ${errors[field] ? 'error' : ''}`}
          >
            <label htmlFor={field}>Vos objectifs *</label>
            <textarea
              id={field}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Décrivez vos objectifs: augmenter les streams, gagner en visibilité, développer votre audience..."
              className="form-textarea"
              rows={4}
            />
            <div className="textarea-counter">
              {formData[field].length}/500
            </div>
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      case 'budget':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field ${errors[field] ? 'error' : ''}`}
          >
            <label>Budget mensuel *</label>
            <div className="form-options-grid">
              {budgetRanges.map(budget => (
                <motion.button
                  key={budget.value}
                  type="button"
                  className={`form-option ${formData[field] === budget.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange(field, budget.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{budget.icon}</span>
                  <span className="option-label">{budget.label}</span>
                </motion.button>
              ))}
            </div>
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      case 'timeline':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className="form-field"
          >
            <label>Quand souhaitez-vous commencer ?</label>
            <div className="form-options-grid">
              {timelines.map(timeline => (
                <motion.button
                  key={timeline.value}
                  type="button"
                  className={`form-option ${formData[field] === timeline.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange(field, timeline.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{timeline.icon}</span>
                  <span className="option-label">{timeline.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'previousExperience':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className="form-field"
          >
            <label htmlFor={field}>Expérience précédente</label>
            <textarea
              id={field}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Avez-vous déjà fait de la publicité pour votre musique ? Qu'est-ce qui a marché ou pas ?"
              className="form-textarea"
              rows={3}
            />
          </motion.div>
        );

      case 'message':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className="form-field"
          >
            <label htmlFor={field}>Message personnel</label>
            <textarea
              id={field}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={`Dites-nous en plus sur votre projet. Que souhaitez-vous discuter avec ${expert?.name} ?`}
              className="form-textarea"
              rows={4}
            />
          </motion.div>
        );

      case 'newsletter':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className="form-field form-checkbox"
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.checked)}
                className="form-checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                Je souhaite recevoir les conseils marketing et actualités MDMC
              </span>
            </label>
          </motion.div>
        );

      case 'terms':
        return (
          <motion.div
            key={field}
            custom={index}
            variants={fieldVariants}
            className={`form-field form-checkbox ${errors[field] ? 'error' : ''}`}
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.checked)}
                className="form-checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                J'accepte les <a href="/terms" target="_blank">conditions d'utilisation</a> et la <a href="/privacy" target="_blank">politique de confidentialité</a> *
              </span>
            </label>
            {errors[field] && <span className="form-error">{errors[field]}</span>}
          </motion.div>
        );

      default:
        return null;
    }
  };

  const currentSectionData = formSections[currentSection];
  const progress = ((currentSection + 1) / formSections.length) * 100;

  return (
    <div className="booking-form-container">
      {/* Header avec contexte */}
      <div className="booking-form-header">
        <div className="booking-context">
          <img src={expert?.avatar} alt={expert?.name} className="expert-avatar-small" />
          <div>
            <h3>RDV avec {expert?.name}</h3>
            <p>{slot?.date} à {slot?.time}</p>
          </div>
        </div>
        
        <div className="form-progress">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="progress-text">
            {currentSection + 1}/{formSections.length}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="form-section"
          >
            <div className="section-header">
              <h2>{currentSectionData.title}</h2>
              <p>{currentSectionData.description}</p>
            </div>

            <div className="section-fields">
              {currentSectionData.fields.map((field, index) =>
                renderField(field, index)
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="form-navigation">
          <div className="nav-left">
            {currentSection > 0 && (
              <button
                type="button"
                onClick={prevSection}
                className="nav-btn nav-btn--secondary"
              >
                ← Précédent
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="nav-btn nav-btn--ghost"
            >
              Retour au calendrier
            </button>
          </div>

          <div className="nav-right">
            {currentSection < formSections.length - 1 ? (
              <button
                type="button"
                onClick={nextSection}
                disabled={!isValid}
                className="nav-btn nav-btn--primary"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="nav-btn nav-btn--primary nav-btn--submit"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small" />
                    Réservation...
                  </>
                ) : (
                  <>
                    Confirmer le RDV
                    <span className="submit-icon">✓</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;