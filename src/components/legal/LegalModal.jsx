/**
 * 📋 Modal pour afficher les pages légales
 * Composant optionnel pour ouvrir les pages en popup
 * Ne nuit pas au SEO car les vraies pages existent aux URLs dédiées
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import './LegalModal.css';

import FAQ from '../../pages/public/resources/FAQ';
import Glossaire from '../../pages/public/resources/Glossaire';
import MentionsLegales from '../../pages/public/resources/MentionsLegales';
import PolitiqueConfidentialite from '../../pages/public/resources/PolitiqueConfidentialite';
import ConditionsGenerales from '../../pages/public/resources/ConditionsGenerales';
import Cookies from '../../pages/public/resources/Cookies';

const LegalModal = ({ isOpen, onClose, pageType }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const renderPageContent = () => {
    switch (pageType) {
      case 'faq':
        return <FAQ />;
      case 'glossaire':
        return <Glossaire />;
      case 'mentions-legales':
        return <MentionsLegales />;
      case 'politique-confidentialite':
        return <PolitiqueConfidentialite />;
      case 'conditions-generales':
        return <ConditionsGenerales />;
      case 'cookies':
        return <Cookies />;
      default:
        return null;
    }
  };

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <button className="legal-modal-close" onClick={onClose} aria-label={t('common.close', 'Fermer')}>
            <X size={24} />
          </button>
        </div>
        
        <div className="legal-modal-body">
          {renderPageContent()}
        </div>

        <div className="legal-modal-footer">
          <a 
            href={`/ressources/${pageType}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="legal-modal-link"
          >
            {t('legal_modal.open_full_page', 'Ouvrir la page complète')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;