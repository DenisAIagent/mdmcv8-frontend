import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/marketing-integrations.css';

const MarketingIntegrations = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('google-analytics');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [googleAdsId, setGoogleAdsId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [testStatus, setTestStatus] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation des formats d'ID
  const validateGAId = (id) => /^G-[A-Z0-9]{10}$|^UA-\d{4,10}-\d{1,4}$/.test(id) || id === '';
  const validateGTMId = (id) => /^GTM-[A-Z0-9]{5,7}$/.test(id) || id === '';
  const validateGoogleAdsId = (id) => /^AW-\d{9,11}$/.test(id) || id === '';
  const validateMetaPixelId = (id) => /^\d{15,16}$/.test(id) || id === '';
  const validateTikTokPixelId = (id) => /^\d{19,20}$/.test(id) || id === '';

  // Gestion des erreurs de validation
  const [validationErrors, setValidationErrors] = useState({
    googleAnalytics: false,
    gtm: false,
    googleAds: false,
    metaPixel: false,
    tiktokPixel: false
  });

  // Fonction pour tester l'intégration
  const testIntegration = (type) => {
    setTestStatus({
      ...testStatus,
      [type]: 'testing'
    });

    // Simulation d'un test d'intégration
    setTimeout(() => {
      setTestStatus({
        ...testStatus,
        [type]: 'success'
      });
    }, 1500);
  };

  // Fonction pour sauvegarder les configurations
  const saveConfigurations = () => {
    // Validation avant sauvegarde
    const errors = {
      googleAnalytics: !validateGAId(googleAnalyticsId) && googleAnalyticsId !== '',
      gtm: !validateGTMId(gtmId) && gtmId !== '',
      googleAds: !validateGoogleAdsId(googleAdsId) && googleAdsId !== '',
      metaPixel: !validateMetaPixelId(metaPixelId) && metaPixelId !== '',
      tiktokPixel: !validateTikTokPixelId(tiktokPixelId) && tiktokPixelId !== ''
    };

    setValidationErrors(errors);

    // Si aucune erreur, procéder à la sauvegarde
    if (!Object.values(errors).some(error => error)) {
      setIsSaving(true);

      // Simulation d'une sauvegarde API
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);

        // Réinitialiser le message de succès après 3 secondes
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }, 1000);
    }
  };

  // Rendu des onglets de configuration
  const renderTabContent = () => {
    switch (activeTab) {
      case 'google-analytics':
        return (
          <div className="integration-tab-content">
            <div className="integration-header">
              <h3>{t('admin.integrations.google_analytics')}</h3>
              <p>{t('admin.integrations.google_analytics_description')}</p>
            </div>

            <div className={`form-group ${validationErrors.googleAnalytics ? 'has-error' : ''}`}>
              <label htmlFor="ga-id">{t('admin.integrations.ga_id')}</label>
              <div className="input-with-help">
                <input
                  type="text"
                  id="ga-id"
                  value={googleAnalyticsId}
                  onChange={(e) => {
                    setGoogleAnalyticsId(e.target.value);
                    if (validationErrors.googleAnalytics) {
                      setValidationErrors({...validationErrors, googleAnalytics: !validateGAId(e.target.value)});
                    }
                  }}
                  placeholder="G-XXXXXXXXXX ou UA-XXXXXXX-X"
                />
                <div className="input-help">
                  <span className="help-icon">?</span>
                  <div className="help-tooltip">
                    {t('admin.integrations.ga_id_help')}
                  </div>
                </div>
              </div>
              {validationErrors.googleAnalytics && (
                <div className="error-message">{t('admin.integrations.invalid_ga_id')}</div>
              )}
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.ga_events')}</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  {t('admin.integrations.page_views')}
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  {t('admin.integrations.scroll_tracking')}
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  {t('admin.integrations.outbound_links')}
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  {t('admin.integrations.form_submissions')}
                </label>
              </div>
            </div>

            <div className="integration-actions">
              <button 
                className={`test-button ${testStatus.googleAnalytics ? `test-${testStatus.googleAnalytics}` : ''}`}
                onClick={() => testIntegration('googleAnalytics')}
                disabled={!googleAnalyticsId || testStatus.googleAnalytics === 'testing'}
              >
                {testStatus.googleAnalytics === 'testing' 
                  ? t('admin.integrations.testing') 
                  : testStatus.googleAnalytics === 'success'
                    ? t('admin.integrations.test_success')
                    : t('admin.integrations.test_integration')}
              </button>
            </div>
          </div>
        );

      case 'gtm':
        return (
          <div className="integration-tab-content">
            <div className="integration-header">
              <h3>{t('admin.integrations.gtm')}</h3>
              <p>{t('admin.integrations.gtm_description')}</p>
            </div>

            <div className={`form-group ${validationErrors.gtm ? 'has-error' : ''}`}>
              <label htmlFor="gtm-id">{t('admin.integrations.gtm_id')}</label>
              <div className="input-with-help">
                <input
                  type="text"
                  id="gtm-id"
                  value={gtmId}
                  onChange={(e) => {
                    setGtmId(e.target.value);
                    if (validationErrors.gtm) {
                      setValidationErrors({...validationErrors, gtm: !validateGTMId(e.target.value)});
                    }
                  }}
                  placeholder="GTM-XXXXXX"
                />
                <div className="input-help">
                  <span className="help-icon">?</span>
                  <div className="help-tooltip">
                    {t('admin.integrations.gtm_id_help')}
                  </div>
                </div>
              </div>
              {validationErrors.gtm && (
                <div className="error-message">{t('admin.integrations.invalid_gtm_id')}</div>
              )}
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.gtm_placement')}</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="gtm-placement" defaultChecked />
                  {t('admin.integrations.head_and_body')}
                </label>
                <label className="radio-label">
                  <input type="radio" name="gtm-placement" />
                  {t('admin.integrations.head_only')}
                </label>
              </div>
            </div>

            <div className="integration-actions">
              <button 
                className={`test-button ${testStatus.gtm ? `test-${testStatus.gtm}` : ''}`}
                onClick={() => testIntegration('gtm')}
                disabled={!gtmId || testStatus.gtm === 'testing'}
              >
                {testStatus.gtm === 'testing' 
                  ? t('admin.integrations.testing') 
                  : testStatus.gtm === 'success'
                    ? t('admin.integrations.test_success')
                    : t('admin.integrations.test_integration')}
              </button>
            </div>
          </div>
        );

      case 'google-ads':
        return (
          <div className="integration-tab-content">
            <div className="integration-header">
              <h3>{t('admin.integrations.google_ads')}</h3>
              <p>{t('admin.integrations.google_ads_description')}</p>
            </div>

            <div className={`form-group ${validationErrors.googleAds ? 'has-error' : ''}`}>
              <label htmlFor="google-ads-id">{t('admin.integrations.google_ads_id')}</label>
              <div className="input-with-help">
                <input
                  type="text"
                  id="google-ads-id"
                  value={googleAdsId}
                  onChange={(e) => {
                    setGoogleAdsId(e.target.value);
                    if (validationErrors.googleAds) {
                      setValidationErrors({...validationErrors, googleAds: !validateGoogleAdsId(e.target.value)});
                    }
                  }}
                  placeholder="AW-XXXXXXXXX"
                />
                <div className="input-help">
                  <span className="help-icon">?</span>
                  <div className="help-tooltip">
                    {t('admin.integrations.google_ads_id_help')}
                  </div>
                </div>
              </div>
              {validationErrors.googleAds && (
                <div className="error-message">{t('admin.integrations.invalid_google_ads_id')}</div>
              )}
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.conversion_events')}</label>
              <div className="conversion-events">
                <div className="conversion-event">
                  <input 
                    type="text" 
                    placeholder={t('admin.integrations.event_name')} 
                    defaultValue="purchase"
                  />
                  <input 
                    type="text" 
                    placeholder={t('admin.integrations.conversion_id')} 
                    defaultValue="AW-XXXXXXXXX/YYYYYYYYYYYYYYY"
                  />
                  <button className="remove-event-button">×</button>
                </div>
                <div className="conversion-event">
                  <input 
                    type="text" 
                    placeholder={t('admin.integrations.event_name')} 
                    defaultValue="sign_up"
                  />
                  <input 
                    type="text" 
                    placeholder={t('admin.integrations.conversion_id')} 
                    defaultValue="AW-XXXXXXXXX/ZZZZZZZZZZZZZZZ"
                  />
                  <button className="remove-event-button">×</button>
                </div>
                <button className="add-event-button">
                  + {t('admin.integrations.add_conversion')}
                </button>
              </div>
            </div>

            <div className="integration-actions">
              <button 
                className={`test-button ${testStatus.googleAds ? `test-${testStatus.googleAds}` : ''}`}
                onClick={() => testIntegration('googleAds')}
                disabled={!googleAdsId || testStatus.googleAds === 'testing'}
              >
                {testStatus.googleAds === 'testing' 
                  ? t('admin.integrations.testing') 
                  : testStatus.googleAds === 'success'
                    ? t('admin.integrations.test_success')
                    : t('admin.integrations.test_integration')}
              </button>
            </div>
          </div>
        );

      case 'meta-pixel':
        return (
          <div className="integration-tab-content">
            <div className="integration-header">
              <h3>{t('admin.integrations.meta_pixel')}</h3>
              <p>{t('admin.integrations.meta_pixel_description')}</p>
            </div>

            <div className={`form-group ${validationErrors.metaPixel ? 'has-error' : ''}`}>
              <label htmlFor="meta-pixel-id">{t('admin.integrations.meta_pixel_id')}</label>
              <div className="input-with-help">
                <input
                  type="text"
                  id="meta-pixel-id"
                  value={metaPixelId}
                  onChange={(e) => {
                    setMetaPixelId(e.target.value);
                    if (validationErrors.metaPixel) {
                      setValidationErrors({...validationErrors, metaPixel: !validateMetaPixelId(e.target.value)});
                    }
                  }}
                  placeholder="XXXXXXXXXXXXXXX"
                />
                <div className="input-help">
                  <span className="help-icon">?</span>
                  <div className="help-tooltip">
                    {t('admin.integrations.meta_pixel_id_help')}
                  </div>
                </div>
              </div>
              {validationErrors.metaPixel && (
                <div className="error-message">{t('admin.integrations.invalid_meta_pixel_id')}</div>
              )}
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.standard_events')}</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  PageView
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  ViewContent
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  AddToCart
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  InitiateCheckout
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Purchase
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Lead
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  CompleteRegistration
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.advanced_matching')}</label>
              <div className="toggle-switch">
                <input type="checkbox" id="meta-advanced-matching" />
                <label htmlFor="meta-advanced-matching"></label>
                <span className="toggle-label">{t('admin.integrations.enable_advanced_matching')}</span>
              </div>
            </div>

            <div className="integration-actions">
              <button 
                className={`test-button ${testStatus.metaPixel ? `test-${testStatus.metaPixel}` : ''}`}
                onClick={() => testIntegration('metaPixel')}
                disabled={!metaPixelId || testStatus.metaPixel === 'testing'}
              >
                {testStatus.metaPixel === 'testing' 
                  ? t('admin.integrations.testing') 
                  : testStatus.metaPixel === 'success'
                    ? t('admin.integrations.test_success')
                    : t('admin.integrations.test_integration')}
              </button>
            </div>
          </div>
        );

      case 'tiktok-pixel':
        return (
          <div className="integration-tab-content">
            <div className="integration-header">
              <h3>{t('admin.integrations.tiktok_pixel')}</h3>
              <p>{t('admin.integrations.tiktok_pixel_description')}</p>
            </div>

            <div className={`form-group ${validationErrors.tiktokPixel ? 'has-error' : ''}`}>
              <label htmlFor="tiktok-pixel-id">{t('admin.integrations.tiktok_pixel_id')}</label>
              <div className="input-with-help">
                <input
                  type="text"
                  id="tiktok-pixel-id"
                  value={tiktokPixelId}
                  onChange={(e) => {
                    setTiktokPixelId(e.target.value);
                    if (validationErrors.tiktokPixel) {
                      setValidationErrors({...validationErrors, tiktokPixel: !validateTikTokPixelId(e.target.value)});
                    }
                  }}
                  placeholder="XXXXXXXXXXXXXXXXXXX"
                />
                <div className="input-help">
                  <span className="help-icon">?</span>
                  <div className="help-tooltip">
                    {t('admin.integrations.tiktok_pixel_id_help')}
                  </div>
                </div>
              </div>
              {validationErrors.tiktokPixel && (
                <div className="error-message">{t('admin.integrations.invalid_tiktok_pixel_id')}</div>
              )}
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.standard_events')}</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  PageView
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  ViewContent
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  AddToCart
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  InitiateCheckout
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  PlaceAnOrder
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  CompletePayment
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Subscribe
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t('admin.integrations.event_api')}</label>
              <div className="toggle-switch">
                <input type="checkbox" id="tiktok-event-api" />
                <label htmlFor="tiktok-event-api"></label>
                <span className="toggle-label">{t('admin.integrations.enable_event_api')}</span>
              </div>
            </div>

            <div className="integration-actions">
              <button 
                className={`test-button ${testStatus.tiktokPixel ? `test-${testStatus.tiktokPixel}` : ''}`}
                onClick={() => testIntegration('tiktokPixel')}
                disabled={!tiktokPixelId || testStatus.tiktokPixel === 'testing'}
              >
                {testStatus.tiktokPixel === 'testing' 
                  ? t('admin.integrations.testing') 
                  : testStatus.tiktokPixel === 'success'
                    ? t('admin.integrations.test_success')
                    : t('admin.integrations.test_integration')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="marketing-integrations">
      <div className="integrations-header">
        <h2>{t('admin.integrations.title')}</h2>
        <p>{t('admin.integrations.description')}</p>
      </div>

      <div className="integrations-tabs">
        <button 
          className={`tab-button ${activeTab === 'google-analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('google-analytics')}
        >
          <span className="tab-icon google-icon"></span>
          {t('admin.integrations.google_analytics')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'gtm' ? 'active' : ''}`}
          onClick={() => setActiveTab('gtm')}
        >
          <span className="tab-icon gtm-icon"></span>
          {t('admin.integrations.gtm')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'google-ads' ? 'active' : ''}`}
          onClick={() => setActiveTab('google-ads')}
        >
          <span className="tab-icon google-ads-icon"></span>
          {t('admin.integrations.google_ads')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'meta-pixel' ? 'active' : ''}`}
          onClick={() => setActiveTab('meta-pixel')}
        >
          <span className="tab-icon meta-icon"></span>
          {t('admin.integrations.meta_pixel')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'tiktok-pixel' ? 'active' : ''}`}
          onClick={() => setActiveTab('tiktok-pixel')}
        >
          <span className="tab-icon tiktok-icon"></span>
          {t('admin.integrations.tiktok_pixel')}
        </button>
      </div>

      <div className="integrations-content">
        {renderTabContent()}
      </div>

      <div className="integrations-footer">
        {saveSuccess && (
          <div className="save-success-message">
            {t('admin.integrations.save_success')}
          </div>
        )}
        <button 
          className="save-button"
          onClick={saveConfigurations}
          disabled={isSaving}
        >
          {isSaving ? t('admin.integrations.saving') : t('admin.integrations.save_all')}
        </button>
      </div>
    </div>
  );
};

export default MarketingIntegrations;
