import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin.css';
import '../../assets/styles/media-manager.css';

// Composant pour la gestion des médias
const MediaManager = () => {
  const { t } = useTranslation();
  const [mediaList, setMediaList] = useState([
    {
      id: 1,
      name: 'logo.png',
      type: 'image',
      url: '/src/assets/images/logo.png',
      size: '24 KB',
      date: '15/03/2025'
    },
    {
      id: 2,
      name: 'hero-bg.jpg',
      type: 'image',
      url: '/src/assets/images/hero-bg.jpg',
      size: '156 KB',
      date: '20/03/2025'
    },
    {
      id: 3,
      name: 'partner-fmm.png',
      type: 'image',
      url: '/src/assets/images/partners/fmm.png',
      size: '32 KB',
      date: '10/04/2025'
    },
    {
      id: 4,
      name: 'partner-google.png',
      type: 'image',
      url: '/src/assets/images/partners/google.png',
      size: '18 KB',
      date: '10/04/2025'
    }
  ]);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Filtrer les médias en fonction du type et du terme de recherche
  const filteredMedia = mediaList.filter(media => {
    const matchesFilter = filter === 'all' || media.type === filter;
    const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Simuler le téléchargement d'un fichier
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            // Ajouter un nouveau média à la liste (simulation)
            const newMedia = {
              id: mediaList.length + 1,
              name: 'nouveau-fichier.jpg',
              type: 'image',
              url: '/src/assets/images/nouveau-fichier.jpg',
              size: '78 KB',
              date: '27/04/2025'
            };
            setMediaList(prev => [...prev, newMedia]);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  // Gérer le clic sur le bouton de téléchargement
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Gérer la sélection de fichier
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      simulateUpload();
    }
  };
  
  // Gérer le glisser-déposer
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      simulateUpload();
    }
  };
  
  // Empêcher le comportement par défaut du navigateur
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  // Gérer la suppression d'un média
  const handleDeleteMedia = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      setMediaList(prev => prev.filter(media => media.id !== id));
    }
  };
  
  // Gérer la visualisation d'un média
  const handleViewMedia = (media) => {
    setSelectedMedia(media);
  };
  
  // Fermer la fenêtre de visualisation
  const closeMediaViewer = () => {
    setSelectedMedia(null);
  };
  
  return (
    <div className="media-manager">
      <div className="media-upload-section">
        <h2>Gestion des médias</h2>
        <div className="media-upload">
          <h3>Ajouter un nouveau média</h3>
          <div 
            className={`upload-dropzone ${isUploading ? 'uploading' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {isUploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>Téléchargement en cours... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <i className="upload-icon">📁</i>
                <p>Glissez-déposez des fichiers ici ou cliquez pour sélectionner</p>
                <input 
                  type="file" 
                  className="file-input" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                />
                <button className="upload-button" onClick={handleUploadClick}>
                  Sélectionner des fichiers
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="media-library-section">
        <div className="media-library-header">
          <h3>Bibliothèque de médias</h3>
          <div className="media-filters">
            <select 
              className="media-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
              <option value="document">Documents</option>
            </select>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="media-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredMedia.length === 0 ? (
          <div className="no-media">
            <p>Aucun média ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="media-grid">
            {filteredMedia.map(media => (
              <div className="media-item" key={media.id}>
                <div className="media-preview" onClick={() => handleViewMedia(media)}>
                  {media.type === 'image' ? (
                    <img src={media.url} alt={media.name} />
                  ) : media.type === 'video' ? (
                    <div className="video-preview">
                      <i className="video-icon">🎬</i>
                    </div>
                  ) : (
                    <div className="document-preview">
                      <i className="document-icon">📄</i>
                    </div>
                  )}
                </div>
                <div className="media-info">
                  <p className="media-name" title={media.name}>{media.name}</p>
                  <p className="media-details">
                    <span className="media-type">{media.type}</span>
                    <span className="media-size">{media.size}</span>
                  </p>
                  <p className="media-date">{media.date}</p>
                </div>
                <div className="media-actions">
                  <button 
                    className="media-action view"
                    onClick={() => handleViewMedia(media)}
                  >
                    Voir
                  </button>
                  <button className="media-action replace">
                    Remplacer
                  </button>
                  <button 
                    className="media-action delete"
                    onClick={() => handleDeleteMedia(media.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedMedia && (
        <div className="media-viewer">
          <div className="media-viewer-overlay" onClick={closeMediaViewer}></div>
          <div className="media-viewer-content">
            <button className="close-viewer" onClick={closeMediaViewer}>×</button>
            <h3>{selectedMedia.name}</h3>
            <div className="media-preview-large">
              {selectedMedia.type === 'image' ? (
                <img src={selectedMedia.url} alt={selectedMedia.name} />
              ) : selectedMedia.type === 'video' ? (
                <div className="video-preview">
                  <i className="video-icon">🎬</i>
                  <p>Aperçu vidéo non disponible</p>
                </div>
              ) : (
                <div className="document-preview">
                  <i className="document-icon">📄</i>
                  <p>Aperçu document non disponible</p>
                </div>
              )}
            </div>
            <div className="media-details-full">
              <div className="detail-item">
                <span className="detail-label">Nom:</span>
                <span className="detail-value">{selectedMedia.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedMedia.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Taille:</span>
                <span className="detail-value">{selectedMedia.size}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date d'ajout:</span>
                <span className="detail-value">{selectedMedia.date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">URL:</span>
                <span className="detail-value">{selectedMedia.url}</span>
              </div>
            </div>
            <div className="media-viewer-actions">
              <button className="replace-button">Remplacer</button>
              <button 
                className="delete-button"
                onClick={() => {
                  handleDeleteMedia(selectedMedia.id);
                  closeMediaViewer();
                }}
              >
                Supprimer
              </button>
              <button className="copy-url-button">Copier l'URL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
