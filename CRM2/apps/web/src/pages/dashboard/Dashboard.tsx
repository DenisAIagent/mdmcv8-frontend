import React, { useEffect } from 'react';
import { useAdsStore } from '../../store/adsStore';

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
);

export function Dashboard() {
  const {
    adAccounts,
    campaigns,
    selectedAccount,
    isLoading,
    error,
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    avgCTR,
    avgCPM,
    avgROAS,
    calculateMetrics
  } = useAdsStore();

  useEffect(() => {
    calculateMetrics();
  }, [campaigns, calculateMetrics]);

  // Calculer les données de performance par plateforme
  const performanceData = adAccounts.map(account => {
    const accountCampaigns = campaigns.filter(c => c.accountId === account.id);
    const accountSpend = accountCampaigns.reduce((sum, c) => sum + c.budget.spent, 0);
    const accountImpressions = accountCampaigns.reduce((sum, c) => sum + c.metrics.impressions, 0);
    const accountClicks = accountCampaigns.reduce((sum, c) => sum + c.metrics.clicks, 0);
    const accountConversions = accountCampaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
    const accountCTR = accountCampaigns.length > 0 
      ? accountCampaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / accountCampaigns.length 
      : 0;
    const accountCPM = accountCampaigns.length > 0 
      ? accountCampaigns.reduce((sum, c) => sum + c.metrics.cpm, 0) / accountCampaigns.length 
      : 0;

    return {
      platform: account.platform === 'meta' ? 'Meta Ads' : account.platform === 'google' ? 'Google Ads' : account.platform,
      accountName: account.accountName,
      spend: accountSpend,
      impressions: accountImpressions,
      clicks: accountClicks,
      conversions: accountConversions,
      ctr: accountCTR,
      cpm: accountCPM,
      color: account.platform === 'meta' ? 'blue' : account.platform === 'google' ? 'green' : 'purple',
    };
  }).filter(data => data.spend > 0 || data.impressions > 0); // Afficher seulement les comptes avec des données

  const kpis = [
    {
      label: 'Total des dépenses',
      value: totalSpend,
      format: 'currency',
      change: '+12.5%',
      trend: 'up',
      period: 'vs mois dernier'
    },
    {
      label: 'Total des impressions',
      value: totalImpressions,
      format: 'number',
      change: '+8.2%',
      trend: 'up',
      period: 'vs mois dernier'
    },
    {
      label: 'Total des clics',
      value: totalClicks,
      format: 'number',
      change: '+15.3%',
      trend: 'up',
      period: 'vs mois dernier'
    },
    {
      label: 'Total des conversions',
      value: totalConversions,
      format: 'number',
      change: '-2.1%',
      trend: 'down',
      period: 'vs mois dernier'
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0 
      }).format(value);
    }
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // État vide
  if (adAccounts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun compte publicitaire connecté</h3>
          <p className="mt-1 text-gray-500">
            Connectez vos comptes Meta Ads ou Google Ads pour commencer à voir vos performances.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Connecter un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Vue d'ensemble
          </h1>
          <p className="text-gray-500 mt-1">
            Performances de vos campagnes en temps réel
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>3 derniers mois</option>
          </select>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <h3 className="text-sm font-medium text-gray-600">{kpi.label}</h3>
              </div>
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? (
                  <TrendingUpIcon className="w-3 h-3" />
                ) : (
                  <TrendingDownIcon className="w-3 h-3" />
                )}
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                {formatValue(kpi.value, kpi.format)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{kpi.period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance par plateforme</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">Voir détails</button>
          </div>
          
          <div className="space-y-4">
            {performanceData.map((platform, index) => {
              const ctr = platform.ctr;
              const maxCtr = Math.max(...performanceData.map(p => p.ctr));
              const width = (ctr / maxCtr) * 100;
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${platform.color}-500`}></div>
                      <span className="font-medium text-gray-900">{platform.platform}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatValue(platform.spend, 'currency')}
                      </p>
                      <p className="text-xs text-gray-500">
                        CTR: {platform.ctr}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`bg-${platform.color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques clés</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CTR moyen</span>
              <span className="text-lg font-semibold text-gray-900">{avgCTR.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPM moyen</span>
              <span className="text-lg font-semibold text-gray-900">{formatValue(avgCPM, 'currency')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPC moyen</span>
              <span className="text-lg font-semibold text-gray-900">
                {totalClicks > 0 ? formatValue(totalSpend / totalClicks, 'currency') : '0€'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taux de conversion</span>
              <span className="text-lg font-semibold text-gray-900">
                {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00'}%
              </span>
            </div>
            
            <hr className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ROAS moyen</span>
                <span className="text-lg font-semibold text-green-600">
                  {avgROAS > 0 ? `${avgROAS.toFixed(1)}x` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Campagnes actives</span>
                <span className="text-lg font-semibold text-gray-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            Voir tout
          </button>
        </div>
        
        <div className="space-y-4">
          {[
            { action: 'Campagne "Summer Vibes" optimisée', time: 'Il y a 2 heures', status: 'success' },
            { action: 'Budget Google Ads augmenté de 15%', time: 'Il y a 4 heures', status: 'info' },
            { action: 'Nouvelle audience créée sur Meta', time: 'Il y a 6 heures', status: 'success' },
            { action: 'Rapport mensuel généré', time: 'Il y a 1 jour', status: 'neutral' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}