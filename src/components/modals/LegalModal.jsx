import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/modal.css';

const LegalModal = ({ isOpen, onClose, type, title, children }) => {
  const { t } = useTranslation();

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fermer en cliquant sur le backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content legal-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label={t('modal.close', 'Fermer')}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('modal.close', 'Fermer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;