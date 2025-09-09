import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmationView.css';

const ConfirmationView = ({ bookingData, onClose, onNewBooking }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showCalendarLink, setShowCalendarLink] = useState(false);

  useEffect(() => {
    // Masquer les confettis après 3 secondes
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Génération des liens calendrier
  const generateCalendarLinks = () => {
    const { expert, slot, firstName, lastName, email } = bookingData;
    const startDate = new Date(`${slot.date}T${slot.time}`);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 min plus tard
    
    const title = `Consultation MDMC avec ${expert.name}`;
    const description = `Rendez-vous de consultation marketing musical avec ${expert.name} (${expert.role}) de MDMC Music Ads. Lien de la réunion sera envoyé par email.`;
    const location = 'Visioconférence (lien envoyé par email)';

    const formatDate = (date) => {
      return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    };

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
      yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(title)}&st=${formatDate(startDate)}&et=${formatDate(endDate)}&desc=${encodeURIComponent(description)}&in_loc=${encodeURIComponent(location)}`
    };
  };

  const calendarLinks = generateCalendarLinks();

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 20 }
    }
  };

  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transition: { duration: 0.5 }
    }
  };

  const formatDate = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const shareOnSocial = (platform) => {
    const message = `Excellente nouvelle ! Je viens de réserver une consultation avec ${bookingData.expert.name} de @MDMCMusicAds pour booster ma carrière musicale ! 🚀 #MusicMarketing #MDMC`;
    const url = 'https://www.mdmcmusicads.com';
    
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`
    };
    
    window.open(links[platform], '_blank', 'width=600,height=400');
  };

  return (
    <motion.div
      className="confirmation-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animation de confettis */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="confetti-animation"
            variants={confettiVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="confetti-piece"
                initial={{ 
                  y: -100, 
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: Math.random() * 360 * 3,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  ease: "easeOut"
                }}
                style={{
                  backgroundColor: ['#E50914', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header de confirmation */}
      <motion.div className="confirmation-header" variants={itemVariants}>
        <div className="success-icon-container">
          <motion.div
            className="success-icon"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300,
              delay: 0.2 
            }}
          >
            ✓
          </motion.div>
        </div>
        
        <h1>Rendez-vous confirmé !</h1>
        <p className="confirmation-subtitle">
          Votre consultation avec {bookingData.expert?.name} est réservée
        </p>
      </motion.div>

      {/* Détails du RDV */}
      <motion.div className="booking-summary" variants={itemVariants}>
        <div className="summary-card">
          <div className="expert-summary">
            <img 
              src={bookingData.expert?.avatar} 
              alt={bookingData.expert?.name}
              className="expert-avatar-confirmation"
            />
            <div className="expert-details">
              <h3>{bookingData.expert?.name}</h3>
              <span className="expert-role">{bookingData.expert?.role}</span>
              <div className="expert-specialties">
                {bookingData.expert?.specialties?.slice(0, 2).map(specialty => (
                  <span key={specialty} className="specialty-tag">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="appointment-details">
            <div className="detail-item">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <span className="detail-label">Date & Heure</span>
                <span className="detail-value">
                  {formatDate(bookingData.slot?.date, bookingData.slot?.time)}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">⏱️</div>
              <div className="detail-content">
                <span className="detail-label">Durée</span>
                <span className="detail-value">30 minutes</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">💻</div>
              <div className="detail-content">
                <span className="detail-label">Format</span>
                <span className="detail-value">Visioconférence</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">💰</div>
              <div className="detail-content">
                <span className="detail-label">Tarif</span>
                <span className="detail-value">Gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prochaines étapes */}
      <motion.div className="next-steps" variants={itemVariants}>
        <h3>Prochaines étapes</h3>
        <div className="steps-timeline">
          <div className="step">
            <div className="step-icon completed">1</div>
            <div className="step-content">
              <h4>Email de confirmation</h4>
              <p>Vous recevrez un email avec les détails et le lien de la réunion</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon pending">2</div>
            <div className="step-content">
              <h4>Préparation</h4>
              <p>Préparez vos questions et éléments sur votre projet musical</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon pending">3</div>
            <div className="step-content">
              <h4>Consultation</h4>
              <p>Échangez avec {bookingData.expert?.firstName} sur votre stratégie</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions rapides */}
      <motion.div className="quick-actions" variants={itemVariants}>
        <h3>Actions rapides</h3>
        
        {/* Ajout au calendrier */}
        <div className="action-group">
          <h4>Ajouter à votre calendrier</h4>
          <div className="calendar-buttons">
            <a
              href={calendarLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-btn calendar-btn--google"
            >
              <span className="calendar-icon">📅</span>
              Google Calendar
            </a>
            <a
              href={calendarLinks.outlook}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-btn calendar-btn--outlook"
            >
              <span className="calendar-icon">📅</span>
              Outlook
            </a>
            <a
              href={calendarLinks.yahoo}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-btn calendar-btn--yahoo"
            >
              <span className="calendar-icon">📅</span>
              Yahoo
            </a>
          </div>
        </div>

        {/* Partage sur les réseaux */}
        <div className="action-group">
          <h4>Partager votre réussite</h4>
          <div className="social-buttons">
            <button
              onClick={() => shareOnSocial('twitter')}
              className="social-btn social-btn--twitter"
            >
              <span className="social-icon">🐦</span>
              Twitter
            </button>
            <button
              onClick={() => shareOnSocial('facebook')}
              className="social-btn social-btn--facebook"
            >
              <span className="social-icon">📘</span>
              Facebook
            </button>
            <button
              onClick={() => shareOnSocial('linkedin')}
              className="social-btn social-btn--linkedin"
            >
              <span className="social-icon">💼</span>
              LinkedIn
            </button>
          </div>
        </div>
      </motion.div>

      {/* Conseils de préparation */}
      <motion.div className="preparation-tips" variants={itemVariants}>
        <h3>Conseils pour optimiser votre consultation</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎵</div>
            <h4>Préparez votre musique</h4>
            <p>Ayez vos morceaux récents prêts à partager (liens Spotify, SoundCloud...)</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">📊</div>
            <h4>Vos statistiques</h4>
            <p>Notez vos chiffres actuels (streams, followers, engagement...)</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Objectifs clairs</h4>
            <p>Définissez ce que vous souhaitez accomplir dans les 3-6 prochains mois</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <h4>Questions spécifiques</h4>
            <p>Préparez vos questions sur la stratégie et les outils marketing</p>
          </div>
        </div>
      </motion.div>

      {/* Témoignages rapides */}
      <motion.div className="testimonials-mini" variants={itemVariants}>
        <h3>Ce que disent nos clients</h3>
        <div className="testimonials-slider">
          {bookingData.expert?.testimonials?.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <blockquote>"{testimonial.text}"</blockquote>
              <cite>— {testimonial.artist}</cite>
              <div className="testimonial-rating">
                {'★'.repeat(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions finales */}
      <motion.div className="confirmation-actions" variants={itemVariants}>
        <button
          onClick={onNewBooking}
          className="action-btn action-btn--secondary"
        >
          Réserver un autre créneau
        </button>
        
        <button
          onClick={onClose}
          className="action-btn action-btn--primary"
        >
          Parfait, c'est noté !
        </button>
      </motion.div>

      {/* Footer avec contact d'urgence */}
      <motion.div className="confirmation-footer" variants={itemVariants}>
        <p>
          <strong>Besoin d'aide ?</strong> Contactez-nous à{' '}
          <a href="mailto:contact@mdmcmusicads.com">contact@mdmcmusicads.com</a>
          {' '}ou au <a href="tel:+33123456789">+33 1 23 45 67 89</a>
        </p>
        
        <div className="emergency-contact">
          <p>
            <strong>Urgence le jour J ?</strong>{' '}
            <a href={`mailto:${bookingData.expert?.email || 'contact@mdmcmusicads.com'}`}>
              Contactez directement {bookingData.expert?.firstName}
            </a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationView;