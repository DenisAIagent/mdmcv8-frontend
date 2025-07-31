import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/landing-page-generator.css';

const LandingPageGenerator = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(1); // Commence à l'étape 1 par défaut
  const [landingPages, setLandingPages] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState('music-artist');
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ff3366');
  const [secondaryColor, setSecondaryColor] = useState('#333333');
  const [headerImage, setHeaderImage] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState('');
  const [artistName, setArtistName] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [sections, setSections] = useState([
    { type: 'hero', enabled: true, title: '', subtitle: '', buttonText: '', buttonLink: '' },
    { type: 'features', enabled: true, items: [
      { title: '', description: '', icon: 'music' },
      { title: '', description: '', icon: 'headphones' },
      { title: '', description: '', icon: 'play' }
    ]},
    { type: 'testimonials', enabled: true, items: [
      { name: '', quote: '', image: '' },
      { name: '', quote: '', image: '' }
    ]},
    { type: 'cta', enabled: true, title: '', description: '', buttonText: '', buttonLink: '' },
    { type: 'social', enabled: true, title: '', links: [
      { platform: 'spotify', url: '' },
      { platform: 'youtube', url: '' },
      { platform: 'instagram', url: '' },
      { platform: 'tiktok', url: '' }
    ]}
  ]);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [analyticsIntegration, setAnalyticsIntegration] = useState(false);
  const [pixelIntegration, setPixelIntegration] = useState(false);
  const [tiktokPixelIntegration, setTiktokPixelIntegration] = useState(false);

  // Templates disponibles
  const templates = [
    { id: 'music-artist', name: t('admin.landing_page.template_music_artist'), image: '/src/assets/images/template-artist.jpg' },
    { id: 'album-release', name: t('admin.landing_page.template_album_release'), image: '/src/assets/images/template-album.jpg' },
    { id: 'music-event', name: t('admin.landing_page.template_music_event'), image: '/src/assets/images/template-event.jpg' },
    { id: 'music-promotion', name: t('admin.landing_page.template_music_promotion'), image: '/src/assets/images/template-promotion.jpg' }
  ];

  // Simuler le chargement des landing pages existantes
  useEffect(() => {
    // Dans une version réelle, cela ferait une requête API
    setLandingPages([
      {
        id: 1,
        title: 'Nouvel Album - Étoiles Filantes',
        template: 'album-release',
        created: '2025-04-20T14:30:00',
        url: 'https://mdmc-music.com/landing/etoiles-filantes',
        visits: 1245,
        conversions: 89
      },
      {
        id: 2,
        title: 'Concert Live - Paris 2025',
        template: 'music-event',
        created: '2025-04-15T10:15:00',
        url: 'https://mdmc-music.com/landing/paris-2025',
        visits: 3782,
        conversions: 412
      }
    ]);
    // Si le générateur doit afficher la liste au début
    setActiveStep(0); // <- Assurez-vous que l'étape initiale est bien 0 pour voir la liste
  }, []);

  // Gérer le changement d'image d'en-tête
  const handleHeaderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mettre à jour une section
  const updateSection = (index, updates) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    setSections(updatedSections);
  };

  // Mettre à jour un élément dans une section
  const updateSectionItem = (sectionIndex, itemIndex, updates) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].items[itemIndex] = {
      ...updatedSections[sectionIndex].items[itemIndex],
      ...updates
    };
    setSections(updatedSections);
  };

  // Publier la landing page
  const publishLandingPage = () => {
    setIsPublishing(true);

    // Simuler une publication
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      const safeTitle = pageTitle || 'nouvelle-page'; // Fallback si pageTitle est vide
      const newUrl = `https://mdmc-music.com/landing/${safeTitle.toLowerCase().replace(/\s+/g, '-')}`;
      setPublishedUrl(newUrl);

      // Ajouter la nouvelle landing page à la liste
      const newLandingPage = {
        id: landingPages.length + 1,
        title: pageTitle || 'Sans Titre',
        template: currentTemplate,
        created: new Date().toISOString(),
        url: newUrl,
        visits: 0,
        conversions: 0
      };

      setLandingPages([newLandingPage, ...landingPages]);

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setPublishSuccess(false);
        setActiveStep(0); // Retour à la liste après succès
        // Réinitialisation des états du formulaire
        setPageTitle('');
        setPageDescription('');
        setPrimaryColor('#ff3366');
        setSecondaryColor('#333333');
        setHeaderImage(null);
        setHeaderImagePreview('');
        setArtistName('');
        setCtaText('');
        setCtaLink('');
        // Réinitialiser sections si nécessaire
        setAnalyticsIntegration(false);
        setPixelIntegration(false);
        setTiktokPixelIntegration(false);
      }, 3000);
    }, 2000);
  };

  // Rendu de l'étape 1 : Sélection du template
  const renderTemplateSelection = () => {
    return (
      <div className="template-selection">
        <h3>{t('admin.landing_page.select_template')}</h3>
        <div className="templates-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-card ${currentTemplate === template.id ? 'selected' : ''}`}
              onClick={() => setCurrentTemplate(template.id)}
            >
              <div className="template-image">
                {/* Assurez-vous que les chemins d'image sont corrects */}
                <img src={template.image} alt={template.name} />
              </div>
              <div className="template-info">
                <h4>{template.name}</h4>
                <button className="select-template-button">
                  {currentTemplate === template.id
                    ? t('admin.landing_page.selected')
                    : t('admin.landing_page.select')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu de l'étape 2 : Informations de base
  const renderBasicInfo = () => {
    return (
      <div className="basic-info">
        <h3>{t('admin.landing_page.basic_info')}</h3>

        <div className="form-group">
          <label htmlFor="page-title">{t('admin.landing_page.page_title')}</label>
          <input
            type="text"
            id="page-title"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder={t('admin.landing_page.page_title_placeholder')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="page-description">{t('admin.landing_page.page_description')}</label>
          <textarea
            id="page-description"
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            placeholder={t('admin.landing_page.page_description_placeholder')}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="artist-name">{t('admin.landing_page.artist_name')}</label>
            <input
              type="text"
              id="artist-name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder={t('admin.landing_page.artist_name_placeholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cta-text">{t('admin.landing_page.main_cta')}</label>
            <input
              type="text"
              id="cta-text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder={t('admin.landing_page.cta_placeholder')}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cta-link">{t('admin.landing_page.cta_link')}</label>
          <input
            type="url"
            id="cta-link"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            placeholder="https://"
          />
        </div>

        <div className="form-group">
          <label htmlFor="header-image">{t('admin.landing_page.header_image')}</label>
          <div className="image-upload">
            <input
              type="file"
              id="header-image"
              accept="image/*"
              onChange={handleHeaderImageChange}
              className="file-input"
            />
            <label htmlFor="header-image" className="file-label">
              <span className="upload-icon">+</span>
              <span>{t('admin.landing_page.choose_image')}</span>
            </label>

            {headerImagePreview && (
              <div className="image-preview">
                <img src={headerImagePreview} alt="Header preview" />
                <button
                  className="remove-image"
                  onClick={() => {
                    setHeaderImage(null);
                    setHeaderImagePreview('');
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="primary-color">{t('admin.landing_page.primary_color')}</label>
            <div className="color-picker">
              <input
                type="color"
                id="primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="secondary-color">{t('admin.landing_page.secondary_color')}</label>
            <div className="color-picker">
              <input
                type="color"
                id="secondary-color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu de l'étape 3 : Personnalisation des sections
  const renderSectionCustomization = () => {
    // Attention: ce code suppose que l'état `sections` a toujours les bonnes clés
    // Vous pourriez ajouter des vérifications `sections[index] && ...` pour plus de robustesse
    return (
      <div className="section-customization">
        <h3>{t('admin.landing_page.customize_sections')}</h3>

        <div className="sections-accordion">
          {/* Section Héro */}
          <div className="section-item">
            <div className="section-header">
              <div className="section-toggle">
                <input
                  type="checkbox"
                  id="hero-toggle"
                  checked={sections[0]?.enabled || false} // Vérification ajoutée
                  onChange={(e) => updateSection(0, { enabled: e.target.checked })}
                />
                <label htmlFor="hero-toggle"></label>
              </div>
              <h4>{t('admin.landing_page.hero_section')}</h4>
              <button className="section-expand">▼</button>
            </div>

            {sections[0]?.enabled && ( // Condition pour afficher si activé
            <div className="section-content">
              <div className="form-group">
                <label>{t('admin.landing_page.hero_title')}</label>
                <input
                  type="text"
                  value={sections[0]?.title || ''} // Vérification ajoutée
                  onChange={(e) => updateSection(0, { title: e.target.value })}
                  placeholder={t('admin.landing_page.hero_title_placeholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('admin.landing_page.hero_subtitle')}</label>
                <input
                  type="text"
                  value={sections[0]?.subtitle || ''} // Vérification ajoutée
                  onChange={(e) => updateSection(0, { subtitle: e.target.value })}
                  placeholder={t('admin.landing_page.hero_subtitle_placeholder')}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.landing_page.button_text')}</label>
                  <input
                    type="text"
                    value={sections[0]?.buttonText || ''} // Vérification ajoutée
                    onChange={(e) => updateSection(0, { buttonText: e.target.value })}
                    placeholder={t('admin.landing_page.button_text_placeholder')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.landing_page.button_link')}</label>
                  <input
                    type="url"
                    value={sections[0]?.buttonLink || ''} // Vérification ajoutée
                    onChange={(e) => updateSection(0, { buttonLink: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Section Caractéristiques */}
          <div className="section-item">
             <div className="section-header">
               <div className="section-toggle">
                 <input
                   type="checkbox"
                   id="features-toggle"
                   checked={sections[1]?.enabled || false}
                   onChange={(e) => updateSection(1, { enabled: e.target.checked })}
                 />
                 <label htmlFor="features-toggle"></label>
               </div>
               <h4>{t('admin.landing_page.features_section')}</h4>
               <button className="section-expand">▼</button>
             </div>
             {sections[1]?.enabled && (
             <div className="section-content">
               {sections[1]?.items?.map((item, index) => ( // Vérification sur items
                 <div key={index} className="feature-item">
                   <h5>{t('admin.landing_page.feature')} {index + 1}</h5>

                   <div className="form-group">
                     <label>{t('admin.landing_page.feature_title')}</label>
                     <input
                       type="text"
                       value={item.title}
                       onChange={(e) => updateSectionItem(1, index, { title: e.target.value })}
                       placeholder={t('admin.landing_page.feature_title_placeholder')}
                     />
                   </div>

                   <div className="form-group">
                     <label>{t('admin.landing_page.feature_description')}</label>
                     <textarea
                       value={item.description}
                       onChange={(e) => updateSectionItem(1, index, { description: e.target.value })}
                       placeholder={t('admin.landing_page.feature_description_placeholder')}
                       rows="2"
                     />
                   </div>

                   <div className="form-group">
                     <label>{t('admin.landing_page.feature_icon')}</label>
                     <select
                       value={item.icon}
                       onChange={(e) => updateSectionItem(1, index, { icon: e.target.value })}
                     >
                       <option value="music">{t('admin.landing_page.icon_music')}</option>
                       <option value="headphones">{t('admin.landing_page.icon_headphones')}</option>
                       <option value="play">{t('admin.landing_page.icon_play')}</option>
                       <option value="mic">{t('admin.landing_page.icon_mic')}</option>
                       <option value="album">{t('admin.landing_page.icon_album')}</option>
                       <option value="ticket">{t('admin.landing_page.icon_ticket')}</option>
                     </select>
                   </div>
                 </div>
               ))}
             </div>
            )}
          </div>

          {/* Section Témoignages */}
           <div className="section-item">
             <div className="section-header">
               <div className="section-toggle">
                 <input
                   type="checkbox"
                   id="testimonials-toggle"
                   checked={sections[2]?.enabled || false}
                   onChange={(e) => updateSection(2, { enabled: e.target.checked })}
                 />
                 <label htmlFor="testimonials-toggle"></label>
               </div>
               <h4>{t('admin.landing_page.testimonials_section')}</h4>
               <button className="section-expand">▼</button>
             </div>
             {sections[2]?.enabled && (
             <div className="section-content">
               {sections[2]?.items?.map((item, index) => (
                 <div key={index} className="testimonial-item">
                   <h5>{t('admin.landing_page.testimonial')} {index + 1}</h5>

                   <div className="form-group">
                     <label>{t('admin.landing_page.testimonial_name')}</label>
                     <input
                       type="text"
                       value={item.name}
                       onChange={(e) => updateSectionItem(2, index, { name: e.target.value })}
                       placeholder={t('admin.landing_page.testimonial_name_placeholder')}
                     />
                   </div>

                   <div className="form-group">
                     <label>{t('admin.landing_page.testimonial_quote')}</label>
                     <textarea
                       value={item.quote}
                       onChange={(e) => updateSectionItem(2, index, { quote: e.target.value })}
                       placeholder={t('admin.landing_page.testimonial_quote_placeholder')}
                       rows="3"
                     />
                   </div>
                 </div>
               ))}
             </div>
             )}
           </div>

           {/* Section CTA */}
           <div className="section-item">
             <div className="section-header">
               <div className="section-toggle">
                 <input
                   type="checkbox"
                   id="cta-toggle"
                   checked={sections[3]?.enabled || false}
                   onChange={(e) => updateSection(3, { enabled: e.target.checked })}
                 />
                 <label htmlFor="cta-toggle"></label>
               </div>
               <h4>{t('admin.landing_page.cta_section')}</h4>
               <button className="section-expand">▼</button>
             </div>
             {sections[3]?.enabled && (
             <div className="section-content">
               <div className="form-group">
                 <label>{t('admin.landing_page.cta_title')}</label>
                 <input
                   type="text"
                   value={sections[3]?.title || ''}
                   onChange={(e) => updateSection(3, { title: e.target.value })}
                   placeholder={t('admin.landing_page.cta_title_placeholder')}
                 />
               </div>

               <div className="form-group">
                 <label>{t('admin.landing_page.cta_description')}</label>
                 <textarea
                   value={sections[3]?.description || ''}
                   onChange={(e) => updateSection(3, { description: e.target.value })}
                   placeholder={t('admin.landing_page.cta_description_placeholder')}
                   rows="2"
                 />
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label>{t('admin.landing_page.button_text')}</label>
                   <input
                     type="text"
                     value={sections[3]?.buttonText || ''}
                     onChange={(e) => updateSection(3, { buttonText: e.target.value })}
                     placeholder={t('admin.landing_page.button_text_placeholder')}
                   />
                 </div>

                 <div className="form-group">
                   <label>{t('admin.landing_page.button_link')}</label>
                   <input
                     type="url"
                     value={sections[3]?.buttonLink || ''}
                     onChange={(e) => updateSection(3, { buttonLink: e.target.value })}
                     placeholder="https://"
                   />
                 </div>
               </div>
             </div>
             )}
           </div>

           {/* Section Réseaux Sociaux */}
           <div className="section-item">
             <div className="section-header">
               <div className="section-toggle">
                 <input
                   type="checkbox"
                   id="social-toggle"
                   checked={sections[4]?.enabled || false}
                   onChange={(e) => updateSection(4, { enabled: e.target.checked })}
                 />
                 <label htmlFor="social-toggle"></label>
               </div>
               <h4>{t('admin.landing_page.social_section')}</h4>
               <button className="section-expand">▼</button>
             </div>
             {sections[4]?.enabled && (
             <div className="section-content">
               <div className="form-group">
                 <label>{t('admin.landing_page.social_title')}</label>
                 <input
                   type="text"
                   value={sections[4]?.title || ''}
                   onChange={(e) => updateSection(4, { title: e.target.value })}
                   placeholder={t('admin.landing_page.social_title_placeholder')}
                 />
               </div>

               {sections[4]?.links?.map((link, index) => ( // Vérification sur links
                 <div key={index} className="social-item">
                   <div className="form-row">
                     <div className="form-group platform-icon">
                       {/* Pour afficher une icône réelle, il faudrait un composant ou une logique CSS */}
                       <span className={`social-icon ${link.platform}`}></span>
                       <span className="platform-name">{link.platform}</span>
                     </div>

                     <div className="form-group">
                       <input
                         type="url"
                         value={link.url}
                         onChange={(e) => {
                           const updatedLinks = [...sections[4].links];
                           updatedLinks[index].url = e.target.value;
                           updateSection(4, { links: updatedLinks });
                         }}
                         placeholder={`https://${link.platform}.com/...`}
                       />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             )}
           </div>
         </div>
       </div>
     );
  };

  // Rendu de l'étape 4 : Intégrations et publication
  const renderIntegrationsAndPublish = () => {
    return (
      <div className="integrations-publish">
        <h3>{t('admin.landing_page.integrations_publish')}</h3>

        <div className="integrations-section">
          <h4>{t('admin.landing_page.analytics_tracking')}</h4>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={analyticsIntegration}
                onChange={(e) => setAnalyticsIntegration(e.target.checked)}
              />
              {/* Réutilisation de la clé d'intégration */}
              {t('admin.integrations.google_analytics')}
            </label>
            <p className="integration-description">
              {t('admin.landing_page.google_analytics_description')}
            </p>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pixelIntegration}
                onChange={(e) => setPixelIntegration(e.target.checked)}
              />
               {/* Réutilisation de la clé d'intégration */}
              {t('admin.integrations.meta_pixel')}
            </label>
            <p className="integration-description">
              {t('admin.landing_page.meta_pixel_description')}
            </p>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tiktokPixelIntegration}
                onChange={(e) => setTiktokPixelIntegration(e.target.checked)}
              />
               {/* Réutilisation de la clé d'intégration */}
              {t('admin.integrations.tiktok_pixel')}
            </label>
            <p className="integration-description">
              {t('admin.landing_page.tiktok_pixel_description')}
            </p>
          </div>
        </div>

        <div className="preview-section">
          <h4>{t('admin.landing_page.preview')}</h4>

          <div className="preview-controls">
            <button
              className={`preview-button ${previewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setPreviewMode('desktop')}
            >
              <span className="preview-icon desktop"></span> {/* CSS needed for icon */}
              {t('admin.landing_page.desktop')}
            </button>

            <button
              className={`preview-button ${previewMode === 'tablet' ? 'active' : ''}`}
              onClick={() => setPreviewMode('tablet')}
            >
              <span className="preview-icon tablet"></span> {/* CSS needed for icon */}
              {t('admin.landing_page.tablet')}
            </button>

            <button
              className={`preview-button ${previewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setPreviewMode('mobile')}
            >
              <span className="preview-icon mobile"></span> {/* CSS needed for icon */}
              {t('admin.landing_page.mobile')}
            </button>
          </div>

          <div className={`preview-frame ${previewMode}`}>
            <div className="preview-content">
              {/* L'aperçu réel nécessiterait de rendre les sections configurées */}
              <div className="preview-placeholder">
                <h3>{pageTitle || t('admin.landing_page.preview_title')}</h3>
                <p>{pageDescription || t('admin.landing_page.preview_description')}</p>
                <div className="preview-cta">
                  {ctaText || t('admin.landing_page.preview_cta')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="publish-section">
          <h4>{t('admin.landing_page.publish')}</h4>
          <p>{t('admin.landing_page.publish_description')}</p>

          <button
            className={`publish-button ${isPublishing ? 'publishing' : ''} ${publishSuccess ? 'success' : ''}`}
            onClick={publishLandingPage}
            disabled={isPublishing || publishSuccess}
          >
            {isPublishing
              ? t('admin.landing_page.publishing')
              : publishSuccess
                ? t('admin.landing_page.published')
                : t('admin.landing_page.publish_page')}
          </button>

          {publishSuccess && (
            <div className="publish-success">
              <p>{t('admin.landing_page.publish_success')}</p>
              <div className="published-url">
                <input type="text" value={publishedUrl} readOnly />
                <button
                  className="copy-url-button"
                  onClick={() => {
                    navigator.clipboard.writeText(publishedUrl);
                    alert(t('admin.landing_page.url_copied'));
                  }}
                >
                  {t('admin.landing_page.copy')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendu de la liste des landing pages existantes
  const renderLandingPagesList = () => {
    return (
      <div className="landing-pages-list">
        <div className="list-header">
          <h3>{t('admin.landing_page.your_pages')}</h3>
          <button
            className="create-new-button"
            onClick={() => setActiveStep(1)} // Passer à l'étape 1 pour créer
          >
            + {t('admin.landing_page.create_new')}
          </button>
        </div>

        {landingPages.length === 0 ? (
          <p className="no-pages">{t('admin.landing_page.no_pages')}</p>
        ) : (
          <div className="pages-table">
            <div className="table-header">
              <div className="table-cell">{t('admin.landing_page.page_title')}</div> {/* Clé page_title réutilisée */}
              <div className="table-cell">{t('admin.landing_page.template')}</div>
              <div className="table-cell">{t('admin.landing_page.created')}</div>
              <div className="table-cell">{t('admin.landing_page.visits')}</div>
              <div className="table-cell">{t('admin.landing_page.conversions')}</div>
              <div className="table-cell">{t('admin.landing_page.actions')}</div>
            </div>

            {landingPages.map(page => (
              <div key={page.id} className="table-row">
                <div className="table-cell page-title">
                  <a href={page.url} target="_blank" rel="noopener noreferrer">
                    {page.title}
                  </a>
                </div>
                <div className="table-cell">
                  {/* MODIFICATION POUR TEST 1 : Afficher ID au lieu du nom traduit */}
                  {page.template}
                  {/* Ligne originale : {templates.find(tmpl => tmpl.id === page.template)?.name || page.template} */}
                </div>
                <div className="table-cell">
                  {new Date(page.created).toLocaleDateString()}
                </div>
                <div className="table-cell">
                  {page.visits.toLocaleString()}
                </div>
                <div className="table-cell">
                  {page.conversions.toLocaleString()}
                  {page.visits > 0 &&
                    <span className="conversion-rate">
                       ({(page.conversions / page.visits * 100).toFixed(1)}%) {/* Calcul amélioré */}
                    </span>
                  }
                </div>
                <div className="table-cell actions">
                  <button className="action-button edit">
                    {t('admin.landing_page.edit')}
                  </button>
                  <button className="action-button view" onClick={() => window.open(page.url, '_blank')}>
                     {/* Réutilisation de la clé générale */}
                    {t('admin.view')}
                  </button>
                  <button className="action-button duplicate">
                    {t('admin.landing_page.duplicate')}
                  </button>
                   <button className="action-button delete">
                    {/* Réutilisation de la clé générale */}
                    {t('admin.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  // Rendu principal
  return (
    <div className="landing-page-generator">
      <div className="generator-header">
        <h2>{t('admin.landing_page.title')}</h2>
        <p>{t('admin.landing_page.description')}</p>
      </div>

      {/* Afficher la liste des landing pages ou le générateur */}
      {activeStep === 0 ? (
        renderLandingPagesList()
      ) : (
        <div className="generator-content">
          <div className="steps-indicator">
            <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">{t('admin.landing_page.step1')}</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">{t('admin.landing_page.step2')}</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">{t('admin.landing_page.step3')}</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${activeStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">{t('admin.landing_page.step4')}</div>
            </div>
          </div>

          <div className="step-content">
            {activeStep === 1 && renderTemplateSelection()}
            {activeStep === 2 && renderBasicInfo()}
            {activeStep === 3 && renderSectionCustomization()}
            {activeStep === 4 && renderIntegrationsAndPublish()}
          </div>

          <div className="step-navigation">
            {activeStep > 1 && (
              <button
                className="prev-step-button"
                onClick={() => setActiveStep(activeStep - 1)}
              >
                 {/* Utilisation de la clé corrigée */}
                {t('admin.landing_page.previous')}
              </button>
            )}

            {activeStep === 1 && ( // Bouton Annuler seulement à l'étape 1
              <button
                className="cancel-button"
                onClick={() => setActiveStep(0)} // Retour à la liste
              >
                {/* Utilisation de la clé corrigée */}
                {t('admin.landing_page.cancel')}
              </button>
            )}

            {activeStep < 4 && ( // Bouton Suivant sauf à la dernière étape
              <button
                className="next-step-button"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                {/* Utilisation de la clé corrigée */}
                {t('admin.landing_page.next')}
              </button>
            )}
             {/* Pas de bouton 'Publier' ici, il est dans renderIntegrationsAndPublish */}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageGenerator;
