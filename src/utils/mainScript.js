import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n';

// Point d'entrée principal de l'application
function main() {
  // Initialisation du simulateur
  const initSimulator = () => {
    const simulatorTriggers = document.querySelectorAll('.simulator-trigger, #footer-simulateur-btn');
    const simulatorPopup = document.getElementById('simulator-popup');
    
    if (!simulatorPopup) return;
    
    simulatorTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        simulatorPopup.style.display = 'block';
      });
    });
    
    // Fermeture du simulateur
    const closeButton = simulatorPopup.querySelector('.close-popup');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        simulatorPopup.style.display = 'none';
      });
    }
    
    // Fermeture en cliquant en dehors du contenu
    simulatorPopup.addEventListener('click', (e) => {
      if (e.target === simulatorPopup) {
        simulatorPopup.style.display = 'none';
      }
    });
  };
  
  // Gestion du header au scroll
  const initScrollHeader = () => {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Vérifier l'état initial
    handleScroll();
  };
  
  // Initialisation du menu mobile
  const initMobileMenu = () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMobile = document.querySelector('.nav-mobile');
    
    if (!hamburger || !navMobile) return;
    
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMobile.classList.toggle('active');
    });
    
    // Fermer le menu en cliquant sur un lien
    const mobileLinks = navMobile.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMobile.classList.remove('active');
      });
    });
  };
  
  // Initialisation de la bannière de cookies
  const initCookieBanner = () => {
    const cookieBanner = document.getElementById('cookie-banner');
    if (!cookieBanner) return;
    
    // Vérifier si l'utilisateur a déjà fait un choix
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Afficher la bannière après un court délai
      setTimeout(() => {
        cookieBanner.style.display = 'block';
      }, 2000);
    }
    
    // Boutons de la bannière
    const acceptButton = cookieBanner.querySelector('.btn-accept');
    const declineButton = cookieBanner.querySelector('.btn-decline');
    
    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.style.display = 'none';
      });
    }
    
    if (declineButton) {
      declineButton.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieBanner.style.display = 'none';
      });
    }
  };
  
  // Initialisation du simulateur de campagne
  const initCampaignSimulator = () => {
    const form = document.getElementById('simulator-form');
    if (!form) return;
    
    // Fonctions pour la navigation entre les étapes
    window.nextStep = (step) => {
      const currentStep = document.getElementById(`step-${step - 1}`);
      const nextStep = document.getElementById(`step-${step}`);
      
      if (!currentStep || !nextStep) return;
      
      // Validation simple
      let isValid = true;
      
      if (step === 2) {
        const platform = document.getElementById('platform');
        if (platform && platform.value === '') {
          document.getElementById('platform-error').style.display = 'block';
          isValid = false;
        }
      }
      
      if (step === 3) {
        const budget = document.getElementById('budget');
        if (budget && (budget.value === '' || parseInt(budget.value) < 500)) {
          document.getElementById('budget-error').style.display = 'block';
          isValid = false;
        }
      }
      
      if (step === 4) {
        const country = document.getElementById('country');
        if (country && country.value === '') {
          document.getElementById('country-error').style.display = 'block';
          isValid = false;
        }
      }
      
      if (isValid) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        
        // Mettre à jour la barre de progression
        const progressSteps = document.querySelectorAll('.progress-step');
        if (progressSteps && progressSteps.length >= step) {
          progressSteps[step - 1].classList.add('active');
        }
      }
    };
    
    window.prevStep = (step) => {
      const currentStep = document.getElementById(`step-${step + 1}`);
      const prevStep = document.getElementById(`step-${step}`);
      
      if (!currentStep || !prevStep) return;
      
      currentStep.classList.remove('active');
      prevStep.classList.add('active');
      
      // Mettre à jour la barre de progression
      const progressSteps = document.querySelectorAll('.progress-step');
      if (progressSteps && progressSteps.length > step) {
        progressSteps[step].classList.remove('active');
      }
    };
    
    // Calcul et affichage des résultats
    window.showResults = () => {
      const artistName = document.getElementById('artistName');
      const email = document.getElementById('simulator-email');
      
      // Validation simple
      let isValid = true;
      
      if (artistName && artistName.value === '') {
        document.getElementById('artistName-error').style.display = 'block';
        isValid = false;
      }
      
      if (email && (email.value === '' || !email.value.includes('@'))) {
        document.getElementById('simulator-email-error').style.display = 'block';
        isValid = false;
      }
      
      if (!isValid) return;
      
      // Récupérer les valeurs du formulaire
      const platform = document.getElementById('platform').value;
      const budget = parseInt(document.getElementById('budget').value);
      const country = document.getElementById('country').value;
      
      // Calculs simplifiés
      let cpv = 0;
      let multiplier = 1;
      
      // CPV selon la plateforme
      switch (platform) {
        case 'youtube':
          cpv = 0.03;
          break;
        case 'meta':
          cpv = 0.05;
          break;
        case 'tiktok':
          cpv = 0.04;
          break;
        default:
          cpv = 0.04;
      }
      
      // Ajustement selon la région
      switch (country) {
        case 'europe':
          multiplier = 1.1;
          break;
        case 'usa':
          multiplier = 1.3;
          break;
        case 'latin_america':
          multiplier = 0.8;
          break;
        default:
          multiplier = 1;
      }
      
      const adjustedCpv = cpv * multiplier;
      const views = Math.round(budget / adjustedCpv);
      const reach = Math.round(views * 2.5);
      
      // Afficher les résultats
      document.getElementById('result-views').textContent = views.toLocaleString();
      document.getElementById('result-cpv').textContent = `${adjustedCpv.toFixed(3)} €`;
      document.getElementById('result-reach').textContent = reach.toLocaleString();
      
      // Mettre à jour le lien Calendly avec les informations du formulaire
      const calendlyLink = document.getElementById('calendly-link');
      if (calendlyLink) {
        calendlyLink.href = `https://calendly.com/mdmc/consultation?name=${encodeURIComponent(artistName.value)}&email=${encodeURIComponent(email.value)}&a1=${encodeURIComponent(platform)}&a2=${encodeURIComponent(budget)}`;
      }
      
      // Passer à l'étape des résultats
      window.nextStep(5);
    };
    
    // Réinitialiser les erreurs lors de la saisie
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      });
    });
  };
  
  // Initialiser toutes les fonctionnalités
  initScrollHeader();
  initMobileMenu();
  initCookieBanner();
  initSimulator();
  initCampaignSimulator();
}

// Hook React pour intégrer le code JavaScript vanilla
const useMainScript = () => {
  const { i18n } = useTranslation();
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current) {
      main();
      initialized.current = true;
    }
  }, []);
  
  // Réappliquer certaines fonctionnalités lors du changement de langue
  useEffect(() => {
    if (initialized.current) {
      // Réinitialiser les éléments qui dépendent de la langue
      // (si nécessaire)
    }
  }, [i18n.language]);
  
  return null;
};

export default useMainScript;
