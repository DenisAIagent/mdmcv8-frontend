import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/wordpress-sync.css';

const WordPressSync = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSyncDate, setLastSyncDate] = useState(null);
  const [syncedPosts, setSyncedPosts] = useState([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncLogs, setSyncLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Charger les paramètres depuis le localStorage au chargement
  useEffect(() => {
    const savedSettings = localStorage.getItem('mdmc_integration_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Charger la date de dernière synchronisation
        const lastSync = localStorage.getItem('mdmc_wordpress_last_sync');
        if (lastSync) {
          setLastSyncDate(new Date(JSON.parse(lastSync)));
        }
        
        // Charger les articles synchronisés
        const savedPosts = localStorage.getItem('mdmc_wordpress_synced_posts');
        if (savedPosts) {
          setSyncedPosts(JSON.parse(savedPosts));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        addSyncLog('error', 'Erreur lors du chargement des paramètres');
      }
    }
  }, []);

  // Ajouter un message au journal de synchronisation
  const addSyncLog = (type, message) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    setSyncLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Limiter à 100 entrées
  };

  // Simuler la synchronisation avec WordPress
  const startSync = async () => {
    if (!settings || !settings.wordpress.isConnected) {
      addSyncLog('error', 'WordPress n\'est pas connecté. Veuillez configurer la connexion dans les paramètres.');
      return;
    }
    
    setSyncStatus('syncing');
    setSyncProgress(0);
    setSyncMessage(t('admin.wordpress_sync.sync_starting'));
    addSyncLog('info', 'Démarrage de la synchronisation');
    
    // Simuler une progression de synchronisation
    const totalSteps = 5;
    
    // Étape 1: Connexion à l'API WordPress
    await simulateStep(1, totalSteps, t('admin.wordpress_sync.connecting_to_api'));
    
    // Vérifier si la connexion est réussie (simulé)
    if (!settings.wordpress.url || !settings.wordpress.username || !settings.wordpress.appPassword) {
      setSyncStatus('error');
      setSyncMessage(t('admin.wordpress_sync.connection_failed'));
      addSyncLog('error', 'Échec de la connexion à l\'API WordPress');
      return;
    }
    
    // Étape 2: Récupération des catégories
    await simulateStep(2, totalSteps, t('admin.wordpress_sync.fetching_categories'));
    
    // Étape 3: Récupération des articles
    await simulateStep(3, totalSteps, t('admin.wordpress_sync.fetching_posts'));
    
    // Simuler la récupération des articles
    const newPosts = generateMockPosts(settings.wordpress.selectedCategories);
    
    // Étape 4: Traitement des articles
    await simulateStep(4, totalSteps, t('admin.wordpress_sync.processing_posts'));
    
    // Étape 5: Enregistrement des articles
    await simulateStep(5, totalSteps, t('admin.wordpress_sync.saving_posts'));
    
    // Mettre à jour les articles synchronisés
    const updatedPosts = [...syncedPosts];
    
    // Ajouter les nouveaux articles
    newPosts.forEach(post => {
      const existingIndex = updatedPosts.findIndex(p => p.id === post.id);
      if (existingIndex >= 0) {
        // Mettre à jour l'article existant
        updatedPosts[existingIndex] = post;
        addSyncLog('info', `Article mis à jour: ${post.title}`);
      } else {
        // Ajouter le nouvel article
        updatedPosts.push(post);
        addSyncLog('success', `Nouvel article synchronisé: ${post.title}`);
      }
    });
    
    // Enregistrer les articles synchronisés
    setSyncedPosts(updatedPosts);
    localStorage.setItem('mdmc_wordpress_synced_posts', JSON.stringify(updatedPosts));
    
    // Mettre à jour la date de dernière synchronisation
    const now = new Date();
    setLastSyncDate(now);
    localStorage.setItem('mdmc_wordpress_last_sync', JSON.stringify(now.toISOString()));
    
    // Terminer la synchronisation
    setSyncStatus('success');
    setSyncMessage(t('admin.wordpress_sync.sync_completed'));
    addSyncLog('success', 'Synchronisation terminée avec succès');
  };

  // Simuler une étape de synchronisation
  const simulateStep = async (step, totalSteps, message) => {
    setSyncMessage(message);
    setSyncProgress(Math.floor((step - 1) / totalSteps * 100));
    addSyncLog('info', message);
    
    // Simuler un délai pour l'étape
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    setSyncProgress(Math.floor(step / totalSteps * 100));
  };

  // Générer des articles fictifs pour la démonstration
  const generateMockPosts = (selectedCategories) => {
    if (!selectedCategories || selectedCategories.length === 0) {
      return [];
    }
    
    const categories = {
      1: 'Actualités',
      2: 'Tutoriels',
      3: 'Événements',
      4: 'Témoignages',
      5: 'Études de cas'
    };
    
    const posts = [];
    const now = new Date();
    
    // Générer 1-3 articles pour chaque catégorie sélectionnée
    selectedCategories.forEach(categoryId => {
      const categoryName = categories[categoryId] || `Catégorie ${categoryId}`;
      const numPosts = 1 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numPosts; i++) {
        const postDate = new Date(now);
        postDate.setDate(postDate.getDate() - Math.floor(Math.random() * 30));
        
        posts.push({
          id: `wp-${categoryId}-${i}-${Date.now()}`,
          title: `${categoryName} - Article ${i + 1}`,
          excerpt: `Ceci est un extrait de l'article ${i + 1} dans la catégorie ${categoryName}.`,
          content: `<p>Ceci est le contenu complet de l'article ${i + 1} dans la catégorie ${categoryName}.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>`,
          date: postDate.toISOString(),
          category: {
            id: categoryId,
            name: categoryName
          },
          author: 'Admin MDMC',
          featured_image: `https://picsum.photos/seed/${categoryId}-${i}/800/600`,
          url: `https://example.com/blog/${categoryName.toLowerCase().replace(/\s+/g, '-')}/${i + 1}`
        });
      }
    });
    
    return posts;
  };

  // Supprimer un article synchronisé
  const deletePost = (postId) => {
    const updatedPosts = syncedPosts.filter(post => post.id !== postId);
    setSyncedPosts(updatedPosts);
    localStorage.setItem('mdmc_wordpress_synced_posts', JSON.stringify(updatedPosts));
    addSyncLog('info', `Article supprimé: ${postId}`);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!settings) {
    return (
      <div className="wordpress-sync loading">
        <div className="loading-spinner"></div>
        <p>{t('admin.wordpress_sync.loading_settings')}</p>
      </div>
    );
  }

  if (!settings.wordpress.isConnected) {
    return (
      <div className="wordpress-sync not-connected">
        <h2>{t('admin.wordpress_sync.title')}</h2>
        <div className="connection-required">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{t('admin.wordpress_sync.connection_required')}</p>
          <button onClick={() => window.location.hash = '#/admin/settings'}>
            {t('admin.wordpress_sync.go_to_settings')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wordpress-sync">
      <h2>{t('admin.wordpress_sync.title')}</h2>
      
      <div className="sync-info">
        <div className="sync-status-card">
          <h3>{t('admin.wordpress_sync.sync_status')}</h3>
          <div className="status-details">
            <div className="status-item">
              <span className="status-label">{t('admin.wordpress_sync.wordpress_url')}:</span>
              <span className="status-value">{settings.wordpress.url}</span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('admin.wordpress_sync.sync_frequency')}:</span>
              <span className="status-value">
                {settings.wordpress.syncFrequency === 'manual' 
                  ? t('admin.wordpress_sync.manual') 
                  : settings.wordpress.syncFrequency === 'daily'
                    ? t('admin.wordpress_sync.daily')
                    : t('admin.wordpress_sync.weekly')}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('admin.wordpress_sync.last_sync')}:</span>
              <span className="status-value">
                {lastSyncDate ? formatDate(lastSyncDate) : t('admin.wordpress_sync.never')}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('admin.wordpress_sync.synced_posts')}:</span>
              <span className="status-value">{syncedPosts.length}</span>
            </div>
          </div>
          
          <button 
            className={`sync-button ${syncStatus === 'syncing' ? 'syncing' : ''}`}
            onClick={startSync}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' 
              ? t('admin.wordpress_sync.syncing') 
              : t('admin.wordpress_sync.start_sync')}
          </button>
          
          {syncStatus === 'syncing' && (
            <div className="sync-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">{syncMessage}</div>
            </div>
          )}
          
          {syncStatus === 'success' && (
            <div className="sync-result success">
              <i className="fas fa-check-circle"></i>
              <span>{syncMessage}</span>
            </div>
          )}
          
          {syncStatus === 'error' && (
            <div className="sync-result error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{syncMessage}</span>
            </div>
          )}
        </div>
        
        <div className="sync-logs-toggle">
          <button onClick={() => setShowLogs(!showLogs)}>
            {showLogs 
              ? t('admin.wordpress_sync.hide_logs') 
              : t('admin.wordpress_sync.show_logs')}
          </button>
        </div>
        
        {showLogs && (
          <div className="sync-logs">
            <h3>{t('admin.wordpress_sync.sync_logs')}</h3>
            <div className="logs-container">
              {syncLogs.length === 0 ? (
                <p className="no-logs">{t('admin.wordpress_sync.no_logs')}</p>
              ) : (
                syncLogs.map(log => (
                  <div key={log.id} className={`log-entry ${log.type}`}>
                    <span className="log-time">{formatDate(log.timestamp)}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="synced-posts">
        <h3>{t('admin.wordpress_sync.synced_posts')}</h3>
        
        {syncedPosts.length === 0 ? (
          <p className="no-posts">{t('admin.wordpress_sync.no_posts')}</p>
        ) : (
          <div className="posts-grid">
            {syncedPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-image">
                  <img src={post.featured_image} alt={post.title} />
                </div>
                <div className="post-content">
                  <h4 className="post-title">{post.title}</h4>
                  <div className="post-meta">
                    <span className="post-category">{post.category.name}</span>
                    <span className="post-date">{formatDate(post.date)}</span>
                  </div>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-actions">
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="view-post"
                    >
                      {t('admin.wordpress_sync.view_post')}
                    </a>
                    <button 
                      className="delete-post" 
                      onClick={() => deletePost(post.id)}
                    >
                      {t('admin.wordpress_sync.delete_post')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPressSync;
