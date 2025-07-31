import React, { useState, useEffect } from 'react';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose, title = "Demander un accompagnement", context = "ressources" }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    source: context
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Fermer avec Escape et bloquer scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulation d'envoi - tu peux remplacer par ton endpoint
      const webhookUrl = import.meta.env.VITE_N8N_CONTACT_WEBHOOK || 'https://n8n-production-de00.up.railway.app/webhook-test/contact-form';
      
      const payload = {
        ...formData,
        timestamp: new Date().toISOString(),
        type: 'contact_modal',
        page: window.location.pathname
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', source: context });
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 2000);
      } else {
        throw new Error('Erreur réseau');
      }
    } catch (error) {
      console.error('Erreur envoi formulaire:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="contact-modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="contact-modal-body">
          {submitStatus === 'success' ? (
            <div className="success-message">
              <h4>Message envoyé avec succès !</h4>
              <p>Notre équipe vous recontactera rapidement.</p>
            </div>
          ) : (
            <>
              <p className="modal-description">
                Notre équipe d'experts peut vous accompagner dans la compréhension de ces concepts 
                et vous aider à définir la meilleure stratégie pour votre projet musical.
              </p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nom / Nom d'artiste *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Votre nom ou nom d'artiste"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Sujet de votre demande *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="devis">Demande de devis</option>
                    <option value="formation">Demande de formation</option>
                    <option value="medias">Demande médias</option>
                    <option value="rgpd">RGPD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Votre message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Décrivez votre projet musical et vos besoins..."
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className="error-message">
                    Erreur lors de l'envoi. Veuillez réessayer ou nous contacter directement.
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer ma demande'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;