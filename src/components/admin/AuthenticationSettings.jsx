import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/authentication-settings.css';

const AuthenticationSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    wordpress: {
      url: '',
      username: '',
      appPassword: '',
      isConnected: false,
      status: 'disconnected',
      syncFrequency: 'manual',
      selectedCategories: []
    },
    googleAnalytics: {
      measurementId: '',
      isEnabled: false,
      enableEnhancedEcommerce: false,
      enableUserProperties: false
    },
    googleTagManager: {
      containerId: '',
      isEnabled: false
    },
    googleAds: {
      conversionId: '',
      isEnabled: false,
      enableRemarketing: false
    },
    metaPixel: {
      pixelId: '',
      isEnabled: false,
      enableAdvancedMatching: false
    },
    tiktokPixel: {
      pixelId: '',
      isEnabled: false,
      enableAdvancedMatching: false
    }
  });

  const [wordpressCategories, setWordpressCategories] = useState([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingStatus, setTestingStatus] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Charger les paramètres depuis le localStorage au chargement
  useEffect(() => {
    const savedSettings = localStorage.getItem('mdmc_integration_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, []);

  // Simuler la récupération des catégories WordPress après connexion
  useEffect(() => {
    if (settings.wordpress.isConnected) {
      // Dans une implémentation réelle, cela ferait un appel API à WordPress
      setWordpressCategories([
        { id: 1, name: 'Actualités' },
        { id: 2, name: 'Tutoriels' },
        { id: 3, name: 'Événements' },
        { id: 4, name: 'Témoignages' },
        { id: 5, name: 'Études de cas' }
      ]);
    }
  }, [settings.wordpress.isConnected]);

  // Gérer les changements dans les champs de formulaire
  const handleChange = (section, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: value
      }
    }));
  };

  // Gérer les changements de case à cocher
  const handleCheckboxChange = (section, field) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: !prevSettings[section][field]
      }
    }));
  };

  // Gérer la sélection des catégories WordPress
  const handleCategoryChange = (categoryId) => {
    setSettings(prevSettings => {
      const selectedCategories = [...prevSettings.wordpress.selectedCategories];
      
      if (selectedCategories.includes(categoryId)) {
        // Retirer la catégorie si déjà sélectionnée
        const index = selectedCategories.indexOf(categoryId);
        selectedCategories.splice(index, 1);
      } else {
        // Ajouter la catégorie
        selectedCategories.push(categoryId);
      }
      
      return {
        ...prevSettings,
        wordpress: {
          ...prevSettings.wordpress,
          selectedCategories
        }
      };
    });
  };

  // Tester la connexion WordPress
  const testWordPressConnection = async () => {
    setTestingConnection(true);
    setTestingStatus('testing');
    
    // Simuler un appel API à WordPress
    setTimeout(() => {
      if (settings.wordpress.url && settings.wordpress.username && settings.wordpress.appPassword) {
        setSettings(prevSettings => ({
          ...prevSettings,
          wordpress: {
            ...prevSettings.wordpress,
            isConnected: true,
            status: 'connected'
          }
        }));
        setTestingStatus('success');
      } else {
        setSettings(prevSettings => ({
          ...prevSettings,
          wordpress: {
            ...prevSettings.wordpress,
            isConnected: false,
            status: 'failed'
          }
        }));
        setTestingStatus('error');
      }
      setTestingConnection(false);
    }, 2000);
  };

  // Enregistrer tous les paramètres
  const saveSettings = () => {
    setSavingSettings(true);
    setSaveStatus('saving');
    
    // Simuler un enregistrement
    setTimeout(() => {
      try {
        localStorage.setItem('mdmc_integration_settings', JSON.stringify(settings));
        setSaveStatus('success');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des paramètres:', error);
        setSaveStatus('error');
      }
      setSavingSettings(false);
    }, 1500);
  };

  // Vérifier la validité des ID de pixel
  const validatePixelId = (id, type) => {
    switch (type) {
      case 'ga':
        return /^G-[A-Z0-9]{10}$/.test(id) || /^UA-[0-9]+-[0-9]+$/.test(id);
      case 'gtm':
        return /^GTM-[A-Z0-9]{5,7}$/.test(id);
      case 'meta':
        return /^[0-9]{15,16}$/.test(id);
      case 'tiktok':
        return /^[0-9]{19,20}$/.test(id);
      default:
        return true;
    }
  };

  return (
    <div className="authentication-settings">
      <h2>{t('admin.authentication_settings.title')}</h2>
      <p className="settings-description">{t('admin.authentication_settings.description')}</p>
      
      {/* WordPress Connection */}
      <div className="settings-section">
        <h3>{t('admin.authentication_settings.wordpress_connection')}</h3>
        <div className="form-group">
          <label>{t('admin.authentication_settings.wordpress_url')}</label>
          <input 
            type="text" 
            value={settings.wordpress.url} 
            onChange={(e) => handleChange('wordpress', 'url', e.target.value)}
            placeholder="https://votresite.wordpress.com"
          />
          <small>{t('admin.authentication_settings.wordpress_url_help')}</small>
        </div>
        
        <div className="form-group">
          <label>{t('admin.authentication_settings.wordpress_username')}</label>
          <input 
            type="text" 
            value={settings.wordpress.username} 
            onChange={(e) => handleChange('wordpress', 'username', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>{t('admin.authentication_settings.wordpress_app_password')}</label>
          <input 
            type="password" 
            value={settings.wordpress.appPassword} 
            onChange={(e) => handleChange('wordpress', 'appPassword', e.target.value)}
          />
          <small>{t('admin.authentication_settings.wordpress_app_password_help')}</small>
        </div>
        
        <button 
          className="test-connection-btn"
          onClick={testWordPressConnection}
          disabled={testingConnection}
        >
          {testingConnection ? t('admin.authentication_settings.testing') : t('admin.authentication_settings.test_connection')}
        </button>
        
        {testingStatus === 'success' && (
          <div className="connection-status success">
            {t('admin.authentication_settings.connection_success')}
          </div>
        )}
        
        {testingStatus === 'error' && (
          <div className="connection-status error">
            {t('admin.authentication_settings.connection_error')}
          </div>
        )}
        
        {settings.wordpress.isConnected && (
          <>
            <div className="form-group">
              <label>{t('admin.authentication_settings.sync_frequency')}</label>
              <select 
                value={settings.wordpress.syncFrequency}
                onChange={(e) => handleChange('wordpress', 'syncFrequency', e.target.value)}
              >
                <option value="manual">{t('admin.authentication_settings.sync_manual')}</option>
                <option value="daily">{t('admin.authentication_settings.sync_daily')}</option>
                <option value="weekly">{t('admin.authentication_settings.sync_weekly')}</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>{t('admin.authentication_settings.select_categories')}</label>
              <div className="categories-list">
                {wordpressCategories.map(category => (
                  <div key={category.id} className="category-item">
                    <input 
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={settings.wordpress.selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                    />
                    <label htmlFor={`category-${category.id}`}>{category.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Marketing Integrations */}
      <div className="settings-section">
        <h3>{t('admin.authentication_settings.marketing_integrations')}</h3>
        
        {/* Google Analytics */}
        <div className="integration-item">
          <div className="integration-header">
            <h4>Google Analytics</h4>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.googleAnalytics.isEnabled}
                onChange={() => handleCheckboxChange('googleAnalytics', 'isEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {settings.googleAnalytics.isEnabled && (
            <>
              <div className="form-group">
                <label>{t('admin.authentication_settings.ga_measurement_id')}</label>
                <input 
                  type="text" 
                  value={settings.googleAnalytics.measurementId} 
                  onChange={(e) => handleChange('googleAnalytics', 'measurementId', e.target.value)}
                  className={!validatePixelId(settings.googleAnalytics.measurementId, 'ga') && settings.googleAnalytics.measurementId ? 'invalid' : ''}
                  placeholder="G-XXXXXXXXXX"
                />
                {!validatePixelId(settings.googleAnalytics.measurementId, 'ga') && settings.googleAnalytics.measurementId && (
                  <small className="error">{t('admin.authentication_settings.invalid_ga_id')}</small>
                )}
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox"
                  id="ga-enhanced-ecommerce"
                  checked={settings.googleAnalytics.enableEnhancedEcommerce}
                  onChange={() => handleCheckboxChange('googleAnalytics', 'enableEnhancedEcommerce')}
                />
                <label htmlFor="ga-enhanced-ecommerce">{t('admin.authentication_settings.enable_enhanced_ecommerce')}</label>
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox"
                  id="ga-user-properties"
                  checked={settings.googleAnalytics.enableUserProperties}
                  onChange={() => handleCheckboxChange('googleAnalytics', 'enableUserProperties')}
                />
                <label htmlFor="ga-user-properties">{t('admin.authentication_settings.enable_user_properties')}</label>
              </div>
            </>
          )}
        </div>
        
        {/* Google Tag Manager */}
        <div className="integration-item">
          <div className="integration-header">
            <h4>Google Tag Manager</h4>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.googleTagManager.isEnabled}
                onChange={() => handleCheckboxChange('googleTagManager', 'isEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {settings.googleTagManager.isEnabled && (
            <div className="form-group">
              <label>{t('admin.authentication_settings.gtm_container_id')}</label>
              <input 
                type="text" 
                value={settings.googleTagManager.containerId} 
                onChange={(e) => handleChange('googleTagManager', 'containerId', e.target.value)}
                className={!validatePixelId(settings.googleTagManager.containerId, 'gtm') && settings.googleTagManager.containerId ? 'invalid' : ''}
                placeholder="GTM-XXXXXXX"
              />
              {!validatePixelId(settings.googleTagManager.containerId, 'gtm') && settings.googleTagManager.containerId && (
                <small className="error">{t('admin.authentication_settings.invalid_gtm_id')}</small>
              )}
            </div>
          )}
        </div>
        
        {/* Google Ads */}
        <div className="integration-item">
          <div className="integration-header">
            <h4>Google Ads</h4>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.googleAds.isEnabled}
                onChange={() => handleCheckboxChange('googleAds', 'isEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {settings.googleAds.isEnabled && (
            <>
              <div className="form-group">
                <label>{t('admin.authentication_settings.google_ads_conversion_id')}</label>
                <input 
                  type="text" 
                  value={settings.googleAds.conversionId} 
                  onChange={(e) => handleChange('googleAds', 'conversionId', e.target.value)}
                  placeholder="AW-XXXXXXXXX"
                />
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox"
                  id="google-ads-remarketing"
                  checked={settings.googleAds.enableRemarketing}
                  onChange={() => handleCheckboxChange('googleAds', 'enableRemarketing')}
                />
                <label htmlFor="google-ads-remarketing">{t('admin.authentication_settings.enable_remarketing')}</label>
              </div>
            </>
          )}
        </div>
        
        {/* Meta Pixel */}
        <div className="integration-item">
          <div className="integration-header">
            <h4>Meta Pixel (Facebook)</h4>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.metaPixel.isEnabled}
                onChange={() => handleCheckboxChange('metaPixel', 'isEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {settings.metaPixel.isEnabled && (
            <>
              <div className="form-group">
                <label>{t('admin.authentication_settings.meta_pixel_id')}</label>
                <input 
                  type="text" 
                  value={settings.metaPixel.pixelId} 
                  onChange={(e) => handleChange('metaPixel', 'pixelId', e.target.value)}
                  className={!validatePixelId(settings.metaPixel.pixelId, 'meta') && settings.metaPixel.pixelId ? 'invalid' : ''}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
                {!validatePixelId(settings.metaPixel.pixelId, 'meta') && settings.metaPixel.pixelId && (
                  <small className="error">{t('admin.authentication_settings.invalid_meta_id')}</small>
                )}
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox"
                  id="meta-advanced-matching"
                  checked={settings.metaPixel.enableAdvancedMatching}
                  onChange={() => handleCheckboxChange('metaPixel', 'enableAdvancedMatching')}
                />
                <label htmlFor="meta-advanced-matching">{t('admin.authentication_settings.enable_advanced_matching')}</label>
              </div>
            </>
          )}
        </div>
        
        {/* TikTok Pixel */}
        <div className="integration-item">
          <div className="integration-header">
            <h4>TikTok Pixel</h4>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.tiktokPixel.isEnabled}
                onChange={() => handleCheckboxChange('tiktokPixel', 'isEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {settings.tiktokPixel.isEnabled && (
            <>
              <div className="form-group">
                <label>{t('admin.authentication_settings.tiktok_pixel_id')}</label>
                <input 
                  type="text" 
                  value={settings.tiktokPixel.pixelId} 
                  onChange={(e) => handleChange('tiktokPixel', 'pixelId', e.target.value)}
                  className={!validatePixelId(settings.tiktokPixel.pixelId, 'tiktok') && settings.tiktokPixel.pixelId ? 'invalid' : ''}
                  placeholder="XXXXXXXXXXXXXXXXXXX"
                />
                {!validatePixelId(settings.tiktokPixel.pixelId, 'tiktok') && settings.tiktokPixel.pixelId && (
                  <small className="error">{t('admin.authentication_settings.invalid_tiktok_id')}</small>
                )}
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox"
                  id="tiktok-advanced-matching"
                  checked={settings.tiktokPixel.enableAdvancedMatching}
                  onChange={() => handleCheckboxChange('tiktokPixel', 'enableAdvancedMatching')}
                />
                <label htmlFor="tiktok-advanced-matching">{t('admin.authentication_settings.enable_advanced_matching')}</label>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="settings-actions">
        <button 
          className="save-settings-btn"
          onClick={saveSettings}
          disabled={savingSettings}
        >
          {savingSettings ? t('admin.authentication_settings.saving') : t('admin.authentication_settings.save_settings')}
        </button>
        
        {saveStatus === 'success' && (
          <div className="save-status success">
            {t('admin.authentication_settings.save_success')}
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="save-status error">
            {t('admin.authentication_settings.save_error')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticationSettings;
