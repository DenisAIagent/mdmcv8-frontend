import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/language-selector.css';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Langues disponibles
  const languages = [
    { code: 'fr', name: t('language.fr') },
    { code: 'en', name: t('language.en') },
    { code: 'es', name: t('language.es') },
    { code: 'pt', name: t('language.pt') }
  ];
  
  // Langue actuelle
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  // Changer la langue
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Effet de transition de page lors du changement de langue
    document.body.classList.add('language-transition');
    setTimeout(() => {
      document.body.classList.remove('language-transition');
    }, 500);
  };
  
  // Fermer le menu déroulant en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fermer le menu avec la touche Escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);
  
  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className="language-selector-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language.select')}
      >
        <span className="language-code">{currentLanguage.code.toUpperCase()}</span>
        <span className="language-name">{currentLanguage.name}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <ul 
          className="language-dropdown" 
          role="listbox" 
          aria-label={t('language.select')}
        >
          {languages.map((lang) => (
            <li 
              key={lang.code} 
              role="option" 
              aria-selected={lang.code === i18n.language}
            >
              <button 
                className={`language-option ${lang.code === i18n.language ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
                aria-label={`${t('language.select')} ${lang.name}`}
              >
                <span className="language-code">{lang.code.toUpperCase()}</span>
                <span className="language-name">{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
