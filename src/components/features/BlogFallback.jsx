import React, { useState, useEffect } from 'react';

const BlogFallback = ({ error, retry }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await retry?.();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="blog-fallback">
      <div className="fallback-container">
        {/* Alert principal */}
        <div className="alert alert-info">
          <h2>Articles temporairement indisponibles</h2>
          <p className="error-message">
            {error?.status === 404 
              ? 'Problème de connexion: Erreur backend: 404'
              : 'Problème de connexion au serveur'
            }
          </p>
        </div>

        {/* Skeleton placeholder */}
        <div className="article-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
          <div className="skeleton-body">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="fallback-actions">
          <button
            className="btn btn-primary"
            onClick={handleRetry}
            disabled={isRetrying || retryCount >= 3}
          >
            {isRetrying ? 'Reconnexion...' : 'Réessayer'}
          </button>
          
          <a
            href="https://blog-wp-production.up.railway.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Visiter le Blog MDMC
          </a>
        </div>

        {/* Info supplémentaire */}
        <p className="technical-info">
          Notre équipe technique travaille à résoudre ce problème. 
          Vous pouvez consulter nos derniers articles directement sur notre blog.
        </p>

        {/* Dev info */}
        {import.meta.env.DEV && error && (
          <div className="debug-info">
            <pre>
              Debug Info:{'\n'}
              Status: {error.status || 'Unknown'}{'\n'}
              Message: {error.message || 'No message'}{'\n'}
              Retry Count: {retryCount}/3
            </pre>
          </div>
        )}
      </div>

      <style jsx>{`
        .blog-fallback {
          display: flex;
          justify-content: center;
          padding: 2rem 1rem;
          min-height: 400px;
          background-color: var(--color-bg, #0a0a0a);
        }

        .fallback-container {
          max-width: 600px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }

        .alert {
          width: 100%;
          padding: 1.5rem;
          border-radius: 8px;
          background-color: rgba(204, 39, 26, 0.1);
          border: 1px solid rgba(204, 39, 26, 0.3);
          color: #ffffff;
        }

        .alert h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .error-message {
          margin: 0;
          color: #cccccc;
          font-size: 0.9rem;
        }

        .article-skeleton {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .skeleton-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .skeleton-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skeleton-title,
        .skeleton-subtitle,
        .skeleton-text,
        .skeleton-line {
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-title {
          height: 24px;
          width: 70%;
        }

        .skeleton-subtitle {
          height: 16px;
          width: 90%;
        }

        .skeleton-text {
          height: 16px;
          width: 60%;
        }

        .skeleton-line {
          height: 16px;
          width: 100%;
          margin-bottom: 0.5rem;
        }

        .skeleton-line.short {
          width: 80%;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .fallback-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
          text-align: center;
          font-family: inherit;
        }

        .btn:hover {
          transform: scale(1.05);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background-color: #cc271a;
          color: #ffffff;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #a91f15;
          box-shadow: 0 10px 30px rgba(204, 39, 26, 0.3);
        }

        .btn-secondary {
          background-color: transparent;
          color: #ffffff;
          border: 2px solid #ffffff;
        }

        .btn-secondary:hover {
          background-color: #ffffff;
          color: #0a0a0a;
        }

        .technical-info {
          text-align: center;
          max-width: 400px;
          color: #cccccc;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .debug-info {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .debug-info pre {
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #cccccc;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .blog-fallback {
            padding: 1rem 0.5rem;
          }
          
          .fallback-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Hook pour gérer les états de chargement blog
export const useBlogWithFallback = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Remplacez par votre vraie logique d'API
      const response = await fetch('/api/articles');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Blog fetch error:', err);
      setError({
        status: err.status || 500,
        message: err.message || 'Network error'
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    retry: fetchArticles,
    hasError: !!error
  };
};

export default BlogFallback;
