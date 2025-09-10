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
      views: '25M+',
      campaigns: '350+',
      roi: '3.8x',
      rating: 4.9,
      clients: '120+'
    },
    specialties: ['YouTube Ads', 'Video Marketing', 'Audience Growth', 'ROI Optimization'],
    bio: 'Expert en campagnes YouTube Ads pour artistes avec un focus sur le ROI et la croissance organique.',
    fullBio: 'Denis Adam, spécialiste du marketing musical sur YouTube avec plus de 25M de vues générées. Expert reconnu pour ses stratégies ROI-focused et sa connaissance approfondie de l\'écosystème YouTube Music.',
    availability: 'Lun-Ven 9h-18h CET',
    languages: ['FR', 'EN'],
    experience: 'Expert certifié',
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
      'Google Partner',
      'Spécialiste YouTube Music Ads',
      '25M+ vues YouTube générées',
      'Campagnes pour 100+ artistes',
      'ROI moyen de 3.8x'
    ]
  },
  
  marine: {
    id: 'expert_002',
    name: 'Marine Harel',
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
    bio: 'Spécialiste Meta Ads expérimentée. Je transforme les algorithmes sociaux en machines à engagement pour propulser votre musique.',
    fullBio: 'Marine Harel, spécialiste Meta Ads expérimentée, maîtrise l\'art de faire vibrer les réseaux sociaux. Avec plus de 3M€ de budgets publicitaires gérés et 200+ artistes accompagnés, elle excelle dans la création de communautés engagées.',
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
      '6+ ans d\'expérience Meta Ads',
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
        <h2>Nos Experts Marketing Musical</h2>
        <p>Choisissez votre spécialiste pour une consultation personnalisée</p>
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

            {/* Layout simple et efficace */}
            <div className="expert-card-simple">
              <div className="expert-info">
                <h3>{expert.name}</h3>
                <p className="expert-role-simple">{expert.role}</p>
                <div className="expert-rating-simple">
                  {renderStars(expert.stats.rating)} ({expert.stats.rating})
                </div>
              </div>
              <motion.button
                className="expert-select-button-simple"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onExpertSelect(expert)}
              >
                Choisir
              </motion.button>
            </div>

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

      {/* Section de comparaison simplifiée */}
      <motion.div
        className="expert-comparison-compact"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="comparison-stats">
          <div className="comparison-stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Artistes accompagnés</span>
          </div>
          <div className="comparison-stat">
            <span className="stat-number">3.5x</span>
            <span className="stat-label">ROI moyen</span>
          </div>
          <div className="comparison-stat">
            <span className="stat-number">40M+</span>
            <span className="stat-label">Vues générées</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpertSelector;