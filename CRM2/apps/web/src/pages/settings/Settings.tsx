import { useState } from 'react';
import { MetaAdsConnection } from '../../components/ads/MetaAdsConnection';
import { useAdsStore } from '../../store/adsStore';

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const DocumentArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export function Settings() {
  const user = { 
    fullName: 'Demo Client MDMC',
    primaryEmailAddress: { emailAddress: 'demo@mdmc.fr' }
  };
  const [notifications, setNotifications] = useState({
    emailReports: true,
    alerts: true,
    frequency: 'weekly'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { adAccounts, disconnectAccount } = useAdsStore();

  const handleConnectionSuccess = () => {
    setSuccessMessage('Compte Meta Ads connecté avec succès !');
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleConnectionError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleDisconnectAccount = (accountId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir déconnecter ce compte publicitaire ?')) {
      disconnectAccount(accountId);
      setSuccessMessage('Compte déconnecté avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Paramètres du compte
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez votre profil, notifications et préférences
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 text-sm">{successMessage}</div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">{errorMessage}</div>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Profile Settings */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* User Profile */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Profil utilisateur</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">DC</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{user?.fullName || 'Non défini'}</h3>
                  <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rôle</label>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Client Premium
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Plan d'abonnement</label>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    Growth Pro
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                  Modifier le profil
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BellIcon className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Préférences de notification</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Rapports de performance</h4>
                  <p className="text-sm text-gray-500">Recevez vos rapports de campagne par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailReports}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      emailReports: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Alertes critiques</h4>
                  <p className="text-sm text-gray-500">Notifications pour les seuils de budget et performance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.alerts}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      alerts: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-lg">
                <label className="text-sm font-medium text-gray-900 mb-3 block">Fréquence des rapports</label>
                <select
                  value={notifications.frequency}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    frequency: e.target.value
                  }))}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Platform Connections */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <LinkIcon className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Connexions publicitaires</h2>
            </div>
            
            <div className="space-y-6">
              {/* Connected Accounts */}
              {adAccounts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Comptes connectés</h3>
                  <div className="space-y-3">
                    {adAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            account.platform === 'meta' ? 'bg-blue-500' :
                            account.platform === 'google' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{account.accountName}</h4>
                            <p className="text-xs text-gray-500">
                              {account.platform === 'meta' ? 'Meta Ads' : 
                               account.platform === 'google' ? 'Google Ads' : account.platform} • 
                              Connecté le {new Date(account.connectedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDisconnectAccount(account.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                        >
                          Déconnecter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Connections */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Connecter une nouvelle plateforme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetaAdsConnection 
                    onSuccess={handleConnectionSuccess}
                    onError={handleConnectionError}
                  />
                  
                  {/* Google Ads Connection (Coming Soon) */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200/60 p-6 opacity-50">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                        <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Google Ads</h3>
                      <p className="text-sm text-gray-500 mb-4">Bientôt disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Export de données</h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Rapport PDF complet</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Données Excel</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Authentification 2FA</h4>
                  <p className="text-xs text-gray-500">Activée</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Sessions actives</h4>
                  <p className="text-xs text-gray-500">2 appareils connectés</p>
                </div>
                <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                  Gérer
                </button>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Facturation</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Plan actuel</h4>
                  <p className="text-xs text-gray-500">Growth Pro - 199€/mois</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Actif
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Prochaine facture</h4>
                  <p className="text-xs text-gray-500">15 septembre 2024</p>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                Gérer l'abonnement
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Zone de danger</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                Supprimer toutes les données
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                Fermer le compte
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}