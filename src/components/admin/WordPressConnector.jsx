import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/wordpress-connector.css';

const WordPressConnector = () => {
  const { t } = useTranslation();
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [wordpressUrl, setWordpressUrl] = useState('');
  const [username, setUsername] = useState('');
  const [applicationPassword, setApplicationPassword] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, completed, error
  const [syncedPosts, setSyncedPosts] = useState([]);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [autoPublish, setAutoPublish] = useState(false);

  // Simuler le chargement des catégories lorsque la connexion est établie
  useEffect(() => {
    if (connectionStatus === 'connected') {
      // Dans une version réelle, cela ferait une requête à l'API WordPress
      setAvailableCategories([
        { id: 1, name: 'Actualités' },
        { id: 2, name: 'Tutoriels' },
        { id: 3, name: 'Études de cas' },
        { id: 4, name: 'Événements' },
        { id: 5, name: 'Interviews' }
      ]);
      
      // Simuler des articles synchronisés
      setSyncedPosts([
        {
          id: 101,
          title: 'Comment optimiser vos campagnes publicitaires musicales',
          excerpt: 'Découvrez les meilleures pratiques pour maximiser l\'impact de vos campagnes publicitaires dans l\'industrie musicale...',
          date: '2025-04-25T14:30:00',
          status: 'published',
          categories: [1, 3]
        },
        {
          id: 102,
          title: 'Les tendances marketing pour les artistes en 2025',
          excerpt: 'L\'année 2025 apporte son lot de nouvelles tendances marketing pour les artistes. Voici comment rester à la pointe...',
          date: '2025-04-23T10:15:00',
          status: 'published',
          categories: [1, 5]
        },
        {
          id: 103,
          title: 'Interview exclusive avec DJ Harmony',
          excerpt: 'Nous avons rencontré DJ Harmony pour discuter de sa stratégie marketing et de son succès fulgurant...',
          date: '2025-04-20T16:45:00',
          status: 'draft',
          categories: [5]
        }
      ]);
    }
  }, [connectionStatus]);

  // Fonction pour tester la connexion à WordPress
  const testConnection = () => {
    setTestingConnection(true);
    setConnectionError('');
    
    // Validation des champs
    if (!wordpressUrl || !username || !applicationPassword) {
      setConnectionError(t('admin.wordpress.error_missing_fields'));
      setTestingConnection(false);
      return;
    }
    
    // Validation de l'URL
    if (!wordpressUrl.startsWith('https://')) {
      setConnectionError(t('admin.wordpress.error_https_required'));
      setTestingConnection(false);
      return;
    }
    
    // Simuler une requête API
    setTimeout(() => {
      setConnectionStatus('connected');
      setTestingConnection(false);
    }, 2000);
  };

  // Fonction pour déconnecter WordPress
  const disconnectWordPress = () => {
    setConnectionStatus('disconnected');
    setSyncedPosts([]);
    setAvailableCategories([]);
    setSelectedCategories([]);
  };

  // Fonction pour synchroniser les articles
  const syncPosts = () => {
    setSyncStatus('syncing');
    
    // Simuler une synchronisation
    setTimeout(() => {
      setSyncStatus('completed');
      
      // Dans une version réelle, cela mettrait à jour la liste des articles
    }, 3000);
  };

  // Rendu du guide d'obtention du mot de passe d'application
  const renderPasswordGuide = () => {
    return (
      <div className="password-guide">
        <h3>{t('admin.wordpress.password_guide_title')}</h3>
        <ol>
          <li>{t('admin.wordpress.password_guide_step1')}</li>
          <li>{t('admin.wordpress.password_guide_step2')}</li>
          <li>{t('admin.wordpress.password_guide_step3')}</li>
          <li>{t('admin.wordpress.password_guide_step4')}</li>
          <li>{t('admin.wordpress.password_guide_step5')}</li>
        </ol>
        <div className="guide-images">
          <img src="/src/assets/images/wp-app-password.jpg" alt="WordPress Application Password" />
        </div>
        <button className="close-guide-button" onClick={() => setShowPasswordGuide(false)}>
          {t('admin.wordpress.close_guide')}
        </button>
      </div>
    );
  };

  // Rendu du formulaire de connexion
  const renderConnectionForm = () => {
    return (
      <div className="connection-form">
        <div className="form-group">
          <label htmlFor="wordpress-url">{t('admin.wordpress.site_url')}</label>
          <input
            type="url"
            id="wordpress-url"
            value={wordpressUrl}
            onChange={(e) => setWordpressUrl(e.target.value)}
            placeholder="https://votresite.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="wordpress-username">{t('admin.wordpress.username')}</label>
          <input
            type="text"
            id="wordpress-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('admin.wordpress.username_placeholder')}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="wordpress-app-password">
            {t('admin.wordpress.app_password')}
            <button 
              type="button" 
              className="help-button"
              onClick={() => setShowPasswordGuide(true)}
            >
              ?
            </button>
          </label>
          <input
            type="password"
            id="wordpress-app-password"
            value={applicationPassword}
            onChange={(e) => setApplicationPassword(e.target.value)}
            placeholder={t('admin.wordpress.app_password_placeholder')}
          />
        </div>
        
        {connectionError && (
          <div className="connection-error">
            {connectionError}
          </div>
        )}
        
        <button 
          className={`connect-button ${testingConnection ? 'connecting' : ''}`}
          onClick={testConnection}
          disabled={testingConnection}
        >
          {testingConnection 
            ? t('admin.wordpress.testing_connection') 
            : t('admin.wordpress.test_connection')}
        </button>
      </div>
    );
  };

  // Rendu des paramètres de synchronisation
  const renderSyncSettings = () => {
    return (
      <div className="sync-settings">
        <h3>{t('admin.wordpress.sync_settings')}</h3>
        
        <div className="form-group">
          <label>{t('admin.wordpress.categories_to_sync')}</label>
          <div className="categories-selector">
            {availableCategories.map(category => (
              <label key={category.id} className="category-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.id]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                    }
                  }}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>{t('admin.wordpress.sync_frequency')}</label>
          <select 
            value={syncFrequency} 
            onChange={(e) => setSyncFrequency(e.target.value)}
          >
            <option value="hourly">{t('admin.wordpress.hourly')}</option>
            <option value="daily">{t('admin.wordpress.daily')}</option>
            <option value="weekly">{t('admin.wordpress.weekly')}</option>
            <option value="manual">{t('admin.wordpress.manual')}</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
            />
            {t('admin.wordpress.auto_publish')}
          </label>
        </div>
        
        <div className="sync-actions">
          <button 
            className={`sync-button ${syncStatus === 'syncing' ? 'syncing' : ''}`}
            onClick={syncPosts}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' 
              ? t('admin.wordpress.syncing') 
              : t('admin.wordpress.sync_now')}
          </button>
          
          <button 
            className="disconnect-button"
            onClick={disconnectWordPress}
          >
            {t('admin.wordpress.disconnect')}
          </button>
        </div>
      </div>
    );
  };

  // Rendu des articles synchronisés
  const renderSyncedPosts = () => {
    return (
      <div className="synced-posts">
        <h3>{t('admin.wordpress.synced_posts')}</h3>
        
        {syncedPosts.length === 0 ? (
          <p className="no-posts">{t('admin.wordpress.no_posts')}</p>
        ) : (
          <div className="posts-list">
            {syncedPosts.map(post => (
              <div key={post.id} className={`post-item ${post.status}`}>
                <div className="post-header">
                  <h4>{post.title}</h4>
                  <span className={`post-status ${post.status}`}>
                    {post.status === 'published' 
                      ? t('admin.wordpress.published') 
                      : t('admin.wordpress.draft')}
                  </span>
                </div>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="post-date">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <div className="post-categories">
                    {post.categories.map(catId => {
                      const category = availableCategories.find(c => c.id === catId);
                      return category ? (
                        <span key={catId} className="post-category">
                          {category.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="post-actions">
                  <button className="edit-post-button">
                    {t('admin.wordpress.edit')}
                  </button>
                  <button className="view-post-button">
                    {t('admin.wordpress.view')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {syncStatus === 'completed' && (
          <div className="sync-complete">
            <p>{t('admin.wordpress.last_sync')}: {new Date().toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="wordpress-connector">
      <div className="connector-header">
        <h2>{t('admin.wordpress.title')}</h2>
        <p>{t('admin.wordpress.description')}</p>
      </div>
      
      {showPasswordGuide && renderPasswordGuide()}
      
      <div className="connector-content">
        {connectionStatus === 'disconnected' ? (
          renderConnectionForm()
        ) : (
          <>
            <div className="connection-status connected">
              <span className="status-icon"></span>
              {t('admin.wordpress.connected_to')}: {wordpressUrl}
            </div>
            
            <div className="connector-grid">
              <div className="connector-column">
                {renderSyncSettings()}
              </div>
              <div className="connector-column">
                {renderSyncedPosts()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WordPressConnector;
