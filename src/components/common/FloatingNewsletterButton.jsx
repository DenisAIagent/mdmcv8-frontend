import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaTimes, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './FloatingNewsletterButton.css';

const FloatingNewsletterButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Apparition progressive après 3 secondes
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Arrêter l'animation pulse après 12 secondes
    const pulseTimer = setTimeout(() => {
      setIsPulsing(false);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsPulsing(false);

    if (!isOpen) {
      setIsSuccess(false);
      setFormData({ email: '', name: '' });
    }

    // Analytics
    if (window.gtag) {
      window.gtag('event', 'floating_newsletter_button_click', {
        event_category: 'engagement',
        event_label: 'floating_newsletter',
        action: isOpen ? 'close' : 'open'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez entrer un email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          source: 'Floating Button',
          attributes: {
            NAME: formData.name || 'Non renseigné',
            SOURCE_DETAIL: 'Bouton flottant newsletter'
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast.success('Inscription réussie ! Bienvenue dans notre communauté.');

        // Analytics
        if (window.gtag) {
          window.gtag('event', 'newsletter_signup_floating', {
            event_category: 'conversion',
            event_label: 'floating_newsletter',
            value: 50
          });
        }

        // Fermer après 3 secondes
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setFormData({ email: '', name: '' });
        }, 3000);

      } else if (data.message === 'Vous êtes déjà inscrit(e)') {
        toast.info('Vous êtes déjà inscrit(e) à notre newsletter !');
        setFormData({ email: '', name: '' });
      } else {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bouton flottant */}
      <button
        className={`floating-newsletter-btn ${isPulsing ? 'pulsing' : ''} ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="S'inscrire à la newsletter"
      >
        <span className="btn-icon">
          {isOpen ? <FaTimes /> : <FaEnvelope />}
        </span>
        <span className="btn-tooltip">
          <FaPaperPlane /> Newsletter gratuite
        </span>
      </button>

      {/* Modal Newsletter */}
      {isOpen && (
        <div className="floating-newsletter-wrapper">
          <div className="floating-newsletter-backdrop" onClick={handleToggle} />
          <div className="floating-newsletter-content">
            <button className="floating-newsletter-close" onClick={handleToggle}>
              <FaTimes />
            </button>

            {!isSuccess ? (
              <>
                <div className="floating-newsletter-header">
                  <div className="newsletter-icon-wrapper">
                    <FaEnvelope className="newsletter-main-icon" />
                  </div>
                  <h3>Restez informé(e) !</h3>
                  <p>Recevez nos meilleurs conseils en marketing musical</p>
                </div>

                <form onSubmit={handleSubmit} className="floating-newsletter-form">
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre prénom (optionnel)"
                      className="newsletter-input"
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Votre email *"
                      className="newsletter-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="newsletter-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Inscription...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Je m'inscris gratuitement
                      </>
                    )}
                  </button>

                  <div className="newsletter-benefits">
                    <ul>
                      <li>✓ Stratégies exclusives de promotion</li>
                      <li>✓ Études de cas d'artistes à succès</li>
                      <li>✓ Dernières tendances du marketing musical</li>
                      <li>✓ Offres spéciales réservées aux abonnés</li>
                    </ul>
                  </div>

                  <p className="newsletter-privacy">
                    Vos données sont protégées. Désinscription en 1 clic.
                  </p>
                </form>
              </>
            ) : (
              <div className="floating-newsletter-success">
                <FaCheckCircle className="success-icon" />
                <h3>Inscription réussie !</h3>
                <p>Bienvenue dans la communauté MDMC</p>
                <p className="success-message">
                  Vous recevrez bientôt nos meilleurs conseils pour propulser votre musique.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingNewsletterButton;