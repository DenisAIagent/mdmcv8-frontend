import { useState } from 'react';
import { useAdsStore } from '../../store/adsStore';

const MetaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

interface MetaAdsConnectionProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MetaAdsConnection({ onSuccess, onError }: MetaAdsConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const { connectMetaAccount, error, clearError } = useAdsStore();

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      onError?.('Veuillez entrer un token d\'accès valide');
      return;
    }

    setIsConnecting(true);
    clearError();

    try {
      await connectMetaAccount(accessToken.trim());
      setAccessToken('');
      setShowManualInput(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion Meta Ads';
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthConnect = () => {
    // TODO: Implémenter la connexion OAuth Meta
    // Pour l'instant, on affiche l'entrée manuelle
    setShowManualInput(true);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <MetaIcon className="h-6 w-6 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connecter Meta Ads
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Connectez votre compte Meta Ads pour importer vos campagnes et métriques
        </p>

        {!showManualInput ? (
          <div className="space-y-4">
            <button
              onClick={handleOAuthConnect}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MetaIcon className="h-4 w-4 mr-2" />
              Connecter avec Meta
            </button>
            
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Ou entrer manuellement un token d'accès
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Token d'accès Meta Ads
              </label>
              <textarea
                id="accessToken"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Collez votre token d'accès Meta Ads ici..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                rows={4}
              />
              <p className="mt-1 text-xs text-gray-500 text-left">
                Vous pouvez obtenir un token d'accès depuis le{' '}
                <a 
                  href="https://developers.facebook.com/tools/explorer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Graph API Explorer
                </a>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowManualInput(false);
                  setAccessToken('');
                  clearError();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={handleConnect}
                disabled={isConnecting || !accessToken.trim()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Connexion...</span>
                  </>
                ) : (
                  'Connecter'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}