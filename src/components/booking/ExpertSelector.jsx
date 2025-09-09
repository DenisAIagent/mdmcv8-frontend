import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ExpertSelector.css';

// Configuration des experts avec données enrichies
const expertsConfig = {
  denis: {
    id: 'expert_001',
    name: 'Denis Adam',
    firstName: 'Denis',
    role: 'Head of YouTube Ads',
    calendlyUrl: 'https://calendly.com/denis-mdmcmusicads/30min',
    avatar: '/assets/images/experts/petit portrait denis.jpg',
    color: '#FF0000',
    accentColor: '#FF4444',
    stats: {
      views: '50M+',
      campaigns: '500+',
      roi: '4.2x',
      rating: 4.9,
      clients: '150+'
    },
    specialties: ['YouTube Ads', 'Video Marketing', 'Audience Growth', 'ROI Optimization'],
    bio: 'Ex-Google Partner. Architecte de campagnes YouTube virales avec une obsession pour les métriques qui transforment les artistes en stars.',
    fullBio: 'Denis Adam, ex-Google Partner certifié, révolutionne la promotion musicale sur YouTube depuis plus de 8 ans. Il a orchestré des campagnes générant plus de 50 millions de vues pour des artistes de tous niveaux, du talent émergent aux superstars établies.',
    availability: 'Lun-Ven 9h-18h CET',
    languages: ['FR', 'EN'],
    experience: '8+ ans',
    testimonials: [
      { 
        artist: 'JUL', 
        text: 'Denis a transformé ma visibilité YouTube! +300% de vues en 3 mois.',
        rating: 5
      },
      { 
        artist: 'Alonzo', 
        text: 'ROI exceptionnel sur mes campagnes. Un vrai expert!',
        rating: 5
      }
    ],
    achievements: [
      'Google Partner Certifié',
      '+500 campagnes réussies',
      'ROI moyen de 4.2x',
      '+50M vues générées'
    ]
  },
  
  marine: {
    id: 'expert_002',
    name: 'Marine Hébert',
    firstName: 'Marine',
    role: 'Meta Ads Specialist',
    calendlyUrl: 'https://calendly.com/mhl-agency/decouverte',
    avatar: '/assets/images/experts/petit portrait marine.jpeg',
    color: '#1877F2',
    accentColor: '#4267B2',
    stats: {
      budget: '3M€',
      clients: '200+',
      ctr: '12%',
      rating: 4.8,
      conversions: '25K+'
    },
    specialties: ['Facebook Ads', 'Instagram Growth', 'Influencer Marketing', 'Community Building'],
    bio: 'Meta Certified Professional. Je transforme les algorithmes sociaux en machines à engagement pour propulser votre musique.',
    fullBio: 'Marine Hébert, Meta Business Partner certifiée, maîtrise l\'art de faire vibrer les réseaux sociaux. Avec plus de 3M€ de budgets publicitaires gérés et 200+ artistes accompagnés, elle excelle dans la création de communautés engagées.',
    availability: 'Lun-Ven 10h-19h CET',
    languages: ['FR', 'EN', 'ES'],
    experience: '6+ ans',
    testimonials: [
      { 
        artist: 'Aya Nakamura', 
        text: 'Marine a doublé mon engagement Instagram en 2 mois!',
        rating: 5
      },
      { 
        artist: 'Dadju', 
        text: 'Stratégie Meta parfaite. Résultats au-delà de mes attentes.',
        rating: 5
      }
    ],
    achievements: [
      'Meta Business Partner',
      '3M€ budgets gérés',
      'CTR moyen de 12%',
      '+25K conversions générées'
    ]
  }
};

const ExpertSelector = ({ onExpertSelect, selectedExpert }) => {
  const [hoveredExpert, setHoveredExpert] = useState(null);
  const [expandedExpert, setExpandedExpert] = useState(null);

  const experts = Object.values(expertsConfig);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 400
      }
    }
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        damping: 25
      }
    })
  };

  // Rendu des étoiles pour les ratings
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`expert-star ${i < rating ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  // Rendu des statistiques animées
  const renderStats = (stats, color) => {
    return Object.entries(stats).map(([key, value], index) => (
      <motion.div
        key={key}
        custom={index}
        variants={statsVariants}
        initial="hidden"
        animate="visible"
        className="expert-stat"
        style={{ '--stat-color': color }}
      >
        <span className="expert-stat-value">{value}</span>
        <span className="expert-stat-label">{key}</span>
      </motion.div>
    ));
  };

  return (
    <div className="expert-selector-modern">
      <motion.div
        className="expert-selector-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Choisissez votre expert</h2>
        <p>Nos spécialistes vous accompagnent vers le succès</p>
      </motion.div>

      <motion.div
        className="expert-cards-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {experts.map((expert) => (
          <motion.div
            key={expert.id}
            className={`expert-card-modern ${selectedExpert?.id === expert.id ? 'selected' : ''}`}
            variants={cardVariants}
            whileHover="hover"
            onHoverStart={() => setHoveredExpert(expert.id)}
            onHoverEnd={() => setHoveredExpert(null)}
            onClick={() => onExpertSelect(expert)}
            style={{ '--expert-color': expert.color, '--expert-accent': expert.accentColor }}
          >
            {/* Glow effect au hover */}
            <AnimatePresence>
              {hoveredExpert === expert.id && (
                <motion.div
                  className="expert-card-glow"
                  variants={glowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ background: `radial-gradient(circle, ${expert.color}20 0%, transparent 70%)` }}
                />
              )}
            </AnimatePresence>

            {/* Header avec avatar et infos principales */}
            <div className="expert-card-header">
              <div className="expert-avatar-wrapper">
                <div className="expert-avatar-glow" />
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="expert-avatar-modern"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="expert-avatar-fallback-modern">
                  {expert.firstName.charAt(0)}{expert.name.split(' ')[1]?.charAt(0)}
                </div>
                
                {/* Status en ligne */}
                <motion.div
                  className="expert-status-indicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <span className="status-dot"></span>
                </motion.div>
              </div>

              <div className="expert-info-header">
                <h3>{expert.firstName}</h3>
                <span className="expert-role">{expert.role}</span>
                <div className="expert-rating">
                  {renderStars(expert.stats.rating)}
                  <span className="expert-rating-number">({expert.stats.rating})</span>
                </div>
                <div className="expert-experience">{expert.experience} d'expérience</div>
              </div>

              <div className="expert-quick-action">
                <motion.button
                  className="expert-quick-book"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Réserver
                </motion.button>
              </div>
            </div>

            {/* Spécialités avec badges animés */}
            <div className="expert-specialties">
              {expert.specialties.map((specialty, index) => (
                <motion.span
                  key={specialty}
                  className="expert-specialty-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {specialty}
                </motion.span>
              ))}
            </div>

            {/* Bio concise */}
            <p className="expert-bio-short">{expert.bio}</p>

            {/* Statistiques en grille */}
            <div className="expert-stats-grid">
              {renderStats(expert.stats, expert.color)}
            </div>

            {/* Disponibilité */}
            <div className="expert-availability">
              <div className="availability-indicator">
                <span className="availability-dot"></span>
                <span>Disponible {expert.availability}</span>
              </div>
              <div className="expert-languages">
                {expert.languages.map(lang => (
                  <span key={lang} className="language-badge">{lang}</span>
                ))}
              </div>
            </div>

            {/* Témoignage featured */}
            <div className="expert-featured-testimonial">
              <blockquote>"{expert.testimonials[0].text}"</blockquote>
              <cite>— {expert.testimonials[0].artist}</cite>
            </div>

            {/* CTA principal avec animation */}
            <motion.button
              className="expert-select-button-modern"
              whileHover={{ 
                scale: 1.02,
                boxShadow: `0 8px 25px ${expert.color}40`
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onExpertSelect(expert)}
            >
              <span className="expert-select-icon">📅</span>
              <span>Planifier avec {expert.firstName}</span>
              <motion.span
                className="expert-select-arrow"
                animate={hoveredExpert === expert.id ? { x: 4 } : { x: 0 }}
              >
                →
              </motion.span>
            </motion.button>

            {/* Achievements en overlay au hover */}
            <AnimatePresence>
              {hoveredExpert === expert.id && (
                <motion.div
                  className="expert-achievements-overlay"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4>Accomplissements</h4>
                  <ul>
                    {expert.achievements.map((achievement, index) => (
                      <motion.li
                        key={achievement}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="achievement-icon">✓</span>
                        {achievement}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Section de comparaison rapide */}
      <motion.div
        className="expert-comparison"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Pourquoi choisir MDMC Music Ads ?</h3>
        <div className="comparison-grid">
          <div className="comparison-item">
            <div className="comparison-icon">🎯</div>
            <div className="comparison-content">
              <h4>Expertise Musicale</h4>
              <p>Spécialisés uniquement dans l'industrie musicale</p>
            </div>
          </div>
          <div className="comparison-item">
            <div className="comparison-icon">📈</div>
            <div className="comparison-content">
              <h4>Résultats Garantis</h4>
              <p>ROI moyen de 4x sur toutes nos campagnes</p>
            </div>
          </div>
          <div className="comparison-item">
            <div className="comparison-icon">⚡</div>
            <div className="comparison-content">
              <h4>Réactivité</h4>
              <p>Support 7j/7 et optimisations en temps réel</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpertSelector;