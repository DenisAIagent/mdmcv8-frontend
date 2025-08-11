import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin.css';

// Composant pour la gestion du contenu
const ContentEditor = ({ section, onSave, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language.split('-')[0]);
  
  // Charger le contenu initial
  useEffect(() => {
    // Dans une version réelle, cela ferait une requête API
    // Ici, nous utilisons les traductions existantes comme données initiales
    const sectionData = {};
    
    // Récupérer les données de traduction pour la section spécifiée
    if (section === 'hero') {
      sectionData.title = t('hero.title');
      sectionData.slogan = t('hero.slogan');
      sectionData.description = t('hero.description');
    } else if (section === 'services') {
      sectionData.title = t('services.title');
      sectionData.youtube_title = t('services.youtube.title');
      sectionData.youtube_description = t('services.youtube.description');
      sectionData.meta_title = t('services.meta.title');
      sectionData.meta_description = t('services.meta.description');
      sectionData.tiktok_title = t('services.tiktok.title');
      sectionData.tiktok_description = t('services.tiktok.description');
      sectionData.content_title = t('services.content.title');
      sectionData.content_description = t('services.content.description');
    } else if (section === 'about') {
      sectionData.title = t('about.title');
      sectionData.subtitle = t('about.subtitle');
      sectionData.description = t('about.description');
      sectionData.advantage1 = t('about.advantages.expertise');
      sectionData.advantage2 = t('about.advantages.campaigns');
      sectionData.advantage3 = t('about.advantages.targeting');
      sectionData.advantage4 = t('about.advantages.analytics');
    } else if (section === 'articles') {
      sectionData.title = t('articles.title');
      sectionData.view_all = t('articles.view_all');
    } else if (section === 'reviews') {
      sectionData.title = t('reviews.title');
      sectionData.subtitle = t('reviews.subtitle');
      sectionData.leave_review = t('reviews.leave_review');
      sectionData.view_all = t('reviews.view_all');
    } else if (section === 'contact') {
      sectionData.title = t('contact.title');
      sectionData.subtitle = t('contact.subtitle');
      sectionData.description = t('contact.description');
      sectionData.partners_title = t('contact.partners.title');
    }
    
    setContent(sectionData);
  }, [section, t]);

  // Gérer le changement de langue
  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // Gérer les changements de champs
  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dans une version réelle, cela enverrait les données à une API
    onSave(section, content, currentLanguage);
  };

  // Rendu du formulaire en fonction de la section
  const renderFormFields = () => {
    switch (section) {
      case 'hero':
        return (
          <>
            <div className="form-group">
              <label htmlFor="slogan">Slogan</label>
              <input
                type="text"
                id="slogan"
                value={content.slogan || ''}
                onChange={(e) => handleChange('slogan', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="title">Titre</label>
              <input
                type="text"
                id="title"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={content.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
              ></textarea>
            </div>
          </>
        );
      
      case 'services':
        return (
          <>
            <div className="form-group">
              <label htmlFor="services_title">Titre de la section</label>
              <input
                type="text"
                id="services_title"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <h3 className="form-section-title">YouTube Ads</h3>
            <div className="form-group">
              <label htmlFor="youtube_title">Titre</label>
              <input
                type="text"
                id="youtube_title"
                value={content.youtube_title || ''}
                onChange={(e) => handleChange('youtube_title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="youtube_description">Description</label>
              <textarea
                id="youtube_description"
                value={content.youtube_description || ''}
                onChange={(e) => handleChange('youtube_description', e.target.value)}
                rows="3"
              ></textarea>
            </div>
            <h3 className="form-section-title">Meta Ads</h3>
            <div className="form-group">
              <label htmlFor="meta_title">Titre</label>
              <input
                type="text"
                id="meta_title"
                value={content.meta_title || ''}
                onChange={(e) => handleChange('meta_title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="meta_description">Description</label>
              <textarea
                id="meta_description"
                value={content.meta_description || ''}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                rows="3"
              ></textarea>
            </div>
            <h3 className="form-section-title">TikTok Ads</h3>
            <div className="form-group">
              <label htmlFor="tiktok_title">Titre</label>
              <input
                type="text"
                id="tiktok_title"
                value={content.tiktok_title || ''}
                onChange={(e) => handleChange('tiktok_title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tiktok_description">Description</label>
              <textarea
                id="tiktok_description"
                value={content.tiktok_description || ''}
                onChange={(e) => handleChange('tiktok_description', e.target.value)}
                rows="3"
              ></textarea>
            </div>
            <h3 className="form-section-title">Stratégie de Contenu</h3>
            <div className="form-group">
              <label htmlFor="content_title">Titre</label>
              <input
                type="text"
                id="content_title"
                value={content.content_title || ''}
                onChange={(e) => handleChange('content_title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="content_description">Description</label>
              <textarea
                id="content_description"
                value={content.content_description || ''}
                onChange={(e) => handleChange('content_description', e.target.value)}
                rows="3"
              ></textarea>
            </div>
          </>
        );
      
      case 'about':
        return (
          <>
            <div className="form-group">
              <label htmlFor="about_title">Titre principal</label>
              <input
                type="text"
                id="about_title"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="about_subtitle">Sous-titre</label>
              <input
                type="text"
                id="about_subtitle"
                value={content.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="about_description">Description</label>
              <textarea
                id="about_description"
                value={content.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
              ></textarea>
            </div>
            <h3 className="form-section-title">Avantages</h3>
            <div className="form-group">
              <label htmlFor="advantage1">Avantage 1</label>
              <input
                type="text"
                id="advantage1"
                value={content.advantage1 || ''}
                onChange={(e) => handleChange('advantage1', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="advantage2">Avantage 2</label>
              <input
                type="text"
                id="advantage2"
                value={content.advantage2 || ''}
                onChange={(e) => handleChange('advantage2', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="advantage3">Avantage 3</label>
              <input
                type="text"
                id="advantage3"
                value={content.advantage3 || ''}
                onChange={(e) => handleChange('advantage3', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="advantage4">Avantage 4</label>
              <input
                type="text"
                id="advantage4"
                value={content.advantage4 || ''}
                onChange={(e) => handleChange('advantage4', e.target.value)}
              />
            </div>
          </>
        );
      
      case 'articles':
        return (
          <>
            <div className="form-group">
              <label htmlFor="articles_title">Titre de la section</label>
              <input
                type="text"
                id="articles_title"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="articles_view_all">Texte du bouton "Voir tous"</label>
              <input
                type="text"
                id="articles_view_all"
                value={content.view_all || ''}
                onChange={(e) => handleChange('view_all', e.target.value)}
              />
            </div>
          </>
        );
      
      case 'reviews':
        return (
          <>
            <div className="form-group">
              <label htmlFor="reviews_title">Titre de la section</label>
              <input
                type="text"
                id="reviews_title"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reviews_subtitle">Sous-titre</label>
              <input
                type="text"
                id="reviews_subtitle"
                value={content.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reviews_leave">Texte du bouton "Laisser un avis"</label>
              <input
                type="text"
                id="reviews_leave"
                value={content.leave_review || ''}
                onChange={(e) => handleChange('leave_review', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reviews_view_all">Texte du bouton "Voir tous"</label>
              <input
                type="text"
                id="reviews_view_all"
                value={content.view_all || ''}
                onChange={(e) => handleChange('view_all', e.target.value)}
              />
            </div>
          </>
        );
      
      case 'contact':
        return (
          <>
            <div className="form-group">
              <label htmlFor="contact_title">Titre de la section</label>
              <input
                type="text"
                id="contact_title"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact_subtitle">Sous-titre</label>
              <input
                type="text"
                id="contact_subtitle"
                value={content.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact_description">Description</label>
              <textarea
                id="contact_description"
                value={content.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="partners_title">Titre de la section partenaires</label>
              <input
                type="text"
                id="partners_title"
                value={content.partners_title || ''}
                onChange={(e) => handleChange('partners_title', e.target.value)}
              />
            </div>
          </>
        );
      
      default:
        return <p>Sélectionnez une section à modifier</p>;
    }
  };

  return (
    <div className="content-editor">
      <div className="editor-header">
        <h2>Modifier la section : {section}</h2>
        <div className="language-selector">
          <span>Langue :</span>
          <div className="language-buttons">
            <button 
              className={currentLanguage === 'fr' ? 'active' : ''} 
              onClick={() => handleLanguageChange('fr')}
            >
              FR
            </button>
            <button 
              className={currentLanguage === 'en' ? 'active' : ''} 
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
            <button 
              className={currentLanguage === 'es' ? 'active' : ''} 
              onClick={() => handleLanguageChange('es')}
            >
              ES
            </button>
            <button 
              className={currentLanguage === 'pt' ? 'active' : ''} 
              onClick={() => handleLanguageChange('pt')}
            >
              PT
            </button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="editor-form">
        {renderFormFields()}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="save-button">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentEditor;
