import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/cookieBanner.css';

const CookieBanner = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté ou refusé les cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    // Si pas de préférence enregistrée, afficher la bannière après un court délai
    if (!cookieConsent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    
    // Ici, vous pourriez initialiser des scripts d'analyse ou autres cookies
    console.log('Cookies acceptés, initialisation des services tiers...');
  };
  
  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    
    console.log('Cookies refusés, aucun service tiers ne sera chargé.');
  };
  
  const openSettings = () => {
    // Cette fonction pourrait ouvrir un modal plus détaillé pour les paramètres de cookies
    console.log('Ouverture des paramètres de cookies...');
    // Pour l'instant, simplement accepter tous les cookies
    acceptCookies();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>{t('cookies.message')}</p>
        <div className="cookie-buttons">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={declineCookies}
          >
            {t('cookies.decline')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={openSettings}
          >
            {t('cookies.settings')}
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={acceptCookies}
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
