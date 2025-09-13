import { useState } from 'react';

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5m-18 0h18" />
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

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

interface PerformanceData {
  platform: string;
  impressions: number[];
  clicks: number[];
  conversions: number[];
  spend: number[];
  dates: string[];
  color: string;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
}

export function Analytics() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('impressions');

  const metrics: MetricCard[] = [
    {
      title: 'Impressions totales',
      value: '2.8M',
      change: '+14.6%',
      trend: 'up',
      description: 'vs période précédente'
    },
    {
      title: 'Taux de clic moyen',
      value: '2.73%',
      change: '+0.34%',
      trend: 'up',
      description: 'CTR global'
    },
    {
      title: 'Coût par mille',
      value: '24.50€',
      change: '-2.8%',
      trend: 'down',
      description: 'CPM moyen'
    },
    {
      title: 'Conversions',
      value: '1,247',
      change: '+18.2%',
      trend: 'up',
      description: 'Actions terminées'
    },
    {
      title: 'Coût par conversion',
      value: '12.80€',
      change: '-5.1%',
      trend: 'down',
      description: 'CPA moyen'
    },
    {
      title: 'Retour sur investissement',
      value: '340%',
      change: '+22.3%',
      trend: 'up',
      description: 'ROI global'
    }
  ];

  const performanceData: PerformanceData[] = [
    {
      platform: 'Meta Ads',
      impressions: [85000, 92000, 88000, 95000, 102000, 108000, 115000],
      clicks: [2210, 2392, 2288, 2470, 2652, 2808, 2990],
      conversions: [66, 72, 69, 74, 80, 84, 90],
      spend: [1800, 1950, 1870, 2010, 2160, 2295, 2440],
      dates: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      color: 'blue'
    },
    {
      platform: 'Google Ads',
      impressions: [65000, 68000, 71000, 74000, 77000, 80000, 83000],
      clicks: [1885, 1972, 2059, 2146, 2233, 2320, 2407],
      conversions: [51, 53, 56, 58, 60, 63, 65],
      spend: [1400, 1462, 1525, 1587, 1650, 1712, 1775],
      dates: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      color: 'green'
    },
    {
      platform: 'TikTok Ads',
      impressions: [45000, 48000, 52000, 55000, 58000, 61000, 65000],
      clicks: [1350, 1440, 1560, 1650, 1740, 1830, 1950],
      conversions: [27, 29, 31, 33, 35, 37, 39],
      spend: [950, 1015, 1100, 1162, 1225, 1290, 1375],
      dates: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      color: 'pink'
    }
  ];

  const topPerformingCampaigns = [
    { name: 'Summer Vibes 2024', artist: 'Melodic Dreams', platform: 'Meta Ads', roas: 4.2, conversions: 127, spend: 2450 },
    { name: 'Electronic Night', artist: 'Bass Collective', platform: 'Google Ads', roas: 3.8, conversions: 98, spend: 1890 },
    { name: 'Pop Sensation Launch', artist: 'StarLights', platform: 'Meta Ads', roas: 3.6, conversions: 156, spend: 3200 },
    { name: 'Indie Rock Revival', artist: 'The Neon Lights', platform: 'TikTok Ads', roas: 3.1, conversions: 67, spend: 1650 },
    { name: 'Jazz Fusion Experience', artist: 'Modern Jazz Ensemble', platform: 'Snapchat Ads', roas: 2.9, conversions: 45, spend: 1200 }
  ];

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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Meta Ads': return 'bg-blue-500';
      case 'Google Ads': return 'bg-green-500';
      case 'TikTok Ads': return 'bg-pink-500';
      case 'Snapchat Ads': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getChartData = () => {
    return performanceData.map(platform => {
      let data;
      switch (selectedMetric) {
        case 'clicks': data = platform.clicks; break;
        case 'conversions': data = platform.conversions; break;
        case 'spend': data = platform.spend; break;
        default: data = platform.impressions;
      }
      return { ...platform, data };
    });
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.flatMap(p => p.data));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Analytics avancés
          </h1>
          <p className="text-gray-500 mt-1">
            Analysez vos performances et optimisez vos campagnes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">12 derniers mois</option>
            </select>
          </div>
          
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2">
            <DownloadIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUpIcon className="w-3 h-3" />
                ) : (
                  <TrendingDownIcon className="w-3 h-3" />
                )}
                <span>{metric.change}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Performance par plateforme</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Métrique:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="impressions">Impressions</option>
              <option value="clicks">Clics</option>
              <option value="conversions">Conversions</option>
              <option value="spend">Dépenses</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-6">
          {chartData.map((platform, platformIndex) => (
            <div key={platform.platform} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform.platform)}`}></div>
                  <span className="font-medium text-gray-900">{platform.platform}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedMetric === 'spend' 
                    ? formatCurrency(platform.data.reduce((sum, val) => sum + val, 0))
                    : formatNumber(platform.data.reduce((sum, val) => sum + val, 0))
                  }
                </span>
              </div>
              
              {/* Bar Chart */}
              <div className="grid grid-cols-7 gap-2 h-16">
                {platform.data.map((value, index) => (
                  <div key={index} className="flex flex-col items-center justify-end space-y-1">
                    <div 
                      className={`w-full ${getPlatformColor(platform.platform)} rounded-t-sm transition-all duration-300 hover:opacity-80`}
                      style={{ 
                        height: `${Math.max((value / maxValue) * 100, 5)}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-500">{platform.dates[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top campagnes performantes</h3>
        
        <div className="space-y-4">
          {topPerformingCampaigns.map((campaign, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getPlatformColor(campaign.platform)}`}></div>
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{campaign.artist}</span>
                    <span>•</span>
                    <span>{campaign.platform}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-right">
                <div>
                  <div className="text-sm font-medium text-gray-900">{campaign.roas}x</div>
                  <div className="text-xs text-gray-500">ROAS</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatNumber(campaign.conversions)}</div>
                  <div className="text-xs text-gray-500">Conversions</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(campaign.spend)}</div>
                  <div className="text-xs text-gray-500">Dépensé</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights automatiques</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-green-900">Performance exceptionnelle</h4>
                <p className="text-sm text-green-700 mt-1">
                  Vos campagnes Meta Ads ont généré 22% de conversions en plus cette semaine.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-blue-900">Opportunité d'optimisation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Le CPM sur TikTok Ads a baissé de 15%. Moment idéal pour augmenter le budget.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-yellow-900">Attention requise</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Le taux de conversion sur Google Ads est en baisse depuis 3 jours.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Réallouer le budget</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Transférez 20% du budget Google Ads vers Meta Ads pour maximiser le ROI.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Nouveau public cible</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Testez l'audience 18-24 ans sur TikTok pour "Summer Vibes 2024".
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Optimiser les créatifs</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Les vidéos verticales performent 35% mieux. Adaptez vos créatifs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}