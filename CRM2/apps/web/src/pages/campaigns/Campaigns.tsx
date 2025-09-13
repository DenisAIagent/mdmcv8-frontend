import React, { useState, useEffect } from 'react';
import { useAdsStore } from '../../store/adsStore';

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const DotsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>
);

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

export function Campaigns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const {
    campaigns,
    adAccounts,
    isLoading,
    error,
    refreshCampaigns,
    updateCampaignStatus,
    clearError
  } = useAdsStore();

  useEffect(() => {
    // Actualiser les campagnes au chargement
    if (adAccounts.length > 0) {
      adAccounts.forEach(account => {
        refreshCampaigns(account.id);
      });
    }
  }, [adAccounts, refreshCampaigns]);

  // Transformer les données pour la compatibilité avec l'interface existante
  const transformedCampaigns = campaigns.map(campaign => {
    const account = adAccounts.find(acc => acc.id === campaign.accountId);
    return {
      id: campaign.id,
      name: campaign.name,
      artist: 'Artiste', // TODO: Ajouter le champ artiste dans le modèle Campaign
      platform: campaign.platform === 'meta' ? 'Meta Ads' : 
                campaign.platform === 'google' ? 'Google Ads' : 
                campaign.platform,
      status: campaign.status === 'active' ? 'Active' :
              campaign.status === 'paused' ? 'Paused' :
              campaign.status === 'completed' ? 'Completed' : 'Draft',
      budget: campaign.budget.amount,
      spent: campaign.budget.spent,
      impressions: campaign.metrics.impressions,
      clicks: campaign.metrics.clicks,
      conversions: campaign.metrics.conversions,
      ctr: campaign.metrics.ctr,
      cpm: campaign.metrics.cpm,
      startDate: campaign.schedule.startDate?.split('T')[0] || '',
      endDate: campaign.schedule.endDate?.split('T')[0] || '',
      trend: 'stable' as const, // TODO: Calculer la tendance réelle
      trendValue: '+0.0%' // TODO: Calculer la variation réelle
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Meta Ads': return 'bg-blue-500';
      case 'Google Ads': return 'bg-green-500';
      case 'TikTok Ads': return 'bg-pink-500';
      case 'Snapchat Ads': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('fr-FR').format(number);
  };

  const filteredCampaigns = transformedCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Chargement des campagnes...</p>
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
            onClick={() => {
              clearError();
              window.location.reload();
            }} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // État vide
  if (campaigns.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune campagne</h3>
          <p className="mt-1 text-gray-500">
            Connectez vos comptes publicitaires pour voir vos campagnes ou créez une nouvelle campagne.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Nouvelle campagne
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
            Gestion des campagnes
          </h1>
          <p className="text-gray-500 mt-1">
            Surveillez et optimisez vos campagnes publicitaires
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
          Nouvelle campagne
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom de campagne ou artiste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-32"
          >
            <option value="all">Tous les statuts</option>
            <option value="Active">Actives</option>
            <option value="Paused">En pause</option>
            <option value="Completed">Terminées</option>
            <option value="Draft">Brouillons</option>
          </select>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-36"
          >
            <option value="all">Toutes les plateformes</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Snapchat Ads">Snapchat Ads</option>
          </select>

          <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white flex items-center space-x-2">
            <FilterIcon className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300/60 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${getPlatformColor(campaign.platform)}`}></div>
                  <span className="text-xs font-medium text-gray-500">{campaign.platform}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{campaign.name}</h3>
                <p className="text-sm text-gray-600">{campaign.artist}</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DotsIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Budget utilisé</span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{Math.round((campaign.spent / campaign.budget) * 100)}% utilisé</span>
                <span>{formatCurrency(campaign.budget - campaign.spent)} restant</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Impressions</div>
                <div className="font-semibold text-gray-900">{formatNumber(campaign.impressions)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Clics</div>
                <div className="font-semibold text-gray-900">{formatNumber(campaign.clicks)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">CTR</div>
                <div className="font-semibold text-gray-900">{campaign.ctr}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">CPM</div>
                <div className="font-semibold text-gray-900">{formatCurrency(campaign.cpm)}</div>
              </div>
            </div>

            {/* Performance Trend */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Performance vs. période précédente
              </div>
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                campaign.trend === 'up' ? 'text-green-600' : 
                campaign.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {campaign.trend === 'up' ? (
                  <TrendingUpIcon className="w-3 h-3" />
                ) : campaign.trend === 'down' ? (
                  <TrendingDownIcon className="w-3 h-3" />
                ) : null}
                <span>{campaign.trendValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FilterIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne trouvée</h3>
          <p className="text-gray-500 mb-6">
            Aucune campagne ne correspond à vos critères de recherche.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPlatformFilter('all');
            }}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}