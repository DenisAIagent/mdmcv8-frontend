import axios from 'axios';
import { AdAccount, Campaign } from '../types/auth';

const META_API_VERSION = 'v18.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  timezone_name: string;
  account_status: number;
  amount_spent: string;
  balance: string;
}

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  updated_time: string;
  start_time?: string;
  stop_time?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
}

interface MetaInsights {
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpm: string;
  cpc: string;
  conversions?: string;
  cost_per_conversion?: string;
}

class MetaAdsService {
  private isProduction = import.meta.env.PROD;

  async getAdAccounts(accessToken: string): Promise<AdAccount[]> {
    if (!this.isProduction) {
      return this.mockGetAdAccounts();
    }

    try {
      const response = await axios.get(`${META_BASE_URL}/me/adaccounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,currency,timezone_name,account_status,amount_spent,balance'
        }
      });

      return response.data.data.map((account: MetaAdAccount) => ({
        id: account.id,
        platform: 'meta' as const,
        accountId: account.id,
        accountName: account.name,
        currency: account.currency,
        timezone: account.timezone_name,
        isActive: account.account_status === 1,
        connectedAt: new Date().toISOString(),
        accessToken,
        permissions: ['read_insights', 'manage_pages', 'ads_management']
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erreur Meta API: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error('Erreur lors de la récupération des comptes publicitaires');
    }
  }

  async getCampaigns(accountId: string, accessToken: string): Promise<Campaign[]> {
    if (!this.isProduction) {
      return this.mockGetCampaigns(accountId);
    }

    try {
      const response = await axios.get(`${META_BASE_URL}/${accountId}/campaigns`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,status,objective,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining'
        }
      });

      const campaigns = await Promise.all(
        response.data.data.map(async (campaign: MetaCampaign) => {
          const insights = await this.getCampaignInsights(campaign.id, accessToken);
          
          return {
            id: campaign.id,
            name: campaign.name,
            platform: 'meta' as const,
            accountId,
            status: this.mapCampaignStatus(campaign.status),
            objective: campaign.objective,
            budget: {
              type: campaign.daily_budget ? 'daily' as const : 'lifetime' as const,
              amount: parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100,
              spent: parseFloat(insights.spend)
            },
            schedule: {
              startDate: campaign.start_time || campaign.created_time,
              endDate: campaign.stop_time
            },
            targeting: {
              countries: [], // Nécessite un appel API supplémentaire
              interests: []
            },
            metrics: {
              impressions: parseInt(insights.impressions) || 0,
              clicks: parseInt(insights.clicks) || 0,
              conversions: parseInt(insights.conversions || '0'),
              ctr: parseFloat(insights.ctr) || 0,
              cpm: parseFloat(insights.cpm) || 0,
              cpc: parseFloat(insights.cpc) || 0,
              roas: this.calculateROAS(insights)
            },
            createdAt: campaign.created_time,
            updatedAt: campaign.updated_time
          };
        })
      );

      return campaigns;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erreur Meta API: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error('Erreur lors de la récupération des campagnes');
    }
  }

  async getCampaignInsights(campaignId: string, accessToken: string, dateRange = 'last_30d'): Promise<MetaInsights> {
    if (!this.isProduction) {
      return this.mockGetInsights();
    }

    try {
      const response = await axios.get(`${META_BASE_URL}/${campaignId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'impressions,clicks,spend,ctr,cpm,cpc,conversions,cost_per_conversion',
          date_preset: dateRange
        }
      });

      return response.data.data[0] || {};
    } catch (error) {
      console.warn('Erreur lors de la récupération des insights:', error);
      return this.mockGetInsights();
    }
  }

  async createCampaign(accountId: string, accessToken: string, campaignData: any): Promise<Campaign> {
    if (!this.isProduction) {
      return this.mockCreateCampaign(campaignData);
    }

    try {
      const response = await axios.post(`${META_BASE_URL}/${accountId}/campaigns`, {
        name: campaignData.name,
        objective: campaignData.objective,
        status: 'PAUSED', // Toujours créer en pause
        daily_budget: campaignData.budget.type === 'daily' ? campaignData.budget.amount * 100 : undefined,
        lifetime_budget: campaignData.budget.type === 'lifetime' ? campaignData.budget.amount * 100 : undefined,
        access_token: accessToken
      });

      // Récupérer les détails de la campagne créée
      const campaigns = await this.getCampaigns(accountId, accessToken);
      return campaigns.find(c => c.id === response.data.id) || campaigns[0];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erreur création campagne: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error('Erreur lors de la création de la campagne');
    }
  }

  async updateCampaignStatus(campaignId: string, accessToken: string, status: 'ACTIVE' | 'PAUSED'): Promise<void> {
    if (!this.isProduction) {
      return Promise.resolve();
    }

    try {
      await axios.post(`${META_BASE_URL}/${campaignId}`, {
        status,
        access_token: accessToken
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erreur mise à jour: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  }

  private mapCampaignStatus(metaStatus: string): 'active' | 'paused' | 'completed' | 'draft' {
    switch (metaStatus) {
      case 'ACTIVE': return 'active';
      case 'PAUSED': return 'paused';
      case 'DELETED': return 'completed';
      default: return 'draft';
    }
  }

  private calculateROAS(insights: MetaInsights): number {
    const spend = parseFloat(insights.spend) || 0;
    const conversions = parseFloat(insights.conversions || '0');
    const avgOrderValue = 50; // Valeur moyenne estimée - à personnaliser
    
    if (spend === 0) return 0;
    return (conversions * avgOrderValue) / spend;
  }

  // Services Mock pour développement
  private async mockGetAdAccounts(): Promise<AdAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'act_123456789',
        platform: 'meta',
        accountId: 'act_123456789',
        accountName: 'MDMC Music Ads - Principal',
        currency: 'EUR',
        timezone: 'Europe/Paris',
        isActive: true,
        connectedAt: '2024-07-15T10:00:00Z',
        accessToken: 'mock_token',
        permissions: ['read_insights', 'manage_pages', 'ads_management']
      },
      {
        id: 'act_987654321',
        platform: 'meta',
        accountId: 'act_987654321',
        accountName: 'MDMC - Campagnes Artistes',
        currency: 'EUR',
        timezone: 'Europe/Paris',
        isActive: true,
        connectedAt: '2024-06-01T14:30:00Z',
        accessToken: 'mock_token',
        permissions: ['read_insights', 'ads_management']
      }
    ];
  }

  private async mockGetCampaigns(accountId: string): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return [
      {
        id: 'camp_001',
        name: 'Summer Vibes 2024 - Meta Launch',
        platform: 'meta',
        accountId,
        status: 'active',
        objective: 'CONVERSIONS',
        budget: {
          type: 'daily',
          amount: 150,
          spent: 89.50
        },
        schedule: {
          startDate: '2024-07-01T00:00:00Z',
          endDate: '2024-07-31T23:59:59Z'
        },
        targeting: {
          countries: ['FR', 'BE', 'CH'],
          ageMin: 18,
          ageMax: 45,
          interests: ['Electronic Music', 'Festivals', 'Streaming Music']
        },
        metrics: {
          impressions: 125000,
          clicks: 3250,
          conversions: 85,
          ctr: 2.6,
          cpm: 26.0,
          cpc: 0.89,
          roas: 3.2
        },
        createdAt: '2024-07-01T10:00:00Z',
        updatedAt: '2024-07-15T14:30:00Z'
      },
      {
        id: 'camp_002',
        name: 'Pop Sensation Launch - Retargeting',
        platform: 'meta',
        accountId,
        status: 'active',
        objective: 'LINK_CLICKS',
        budget: {
          type: 'lifetime',
          amount: 5000,
          spent: 4200
        },
        schedule: {
          startDate: '2024-07-10T00:00:00Z',
          endDate: '2024-08-10T23:59:59Z'
        },
        targeting: {
          countries: ['FR'],
          ageMin: 16,
          ageMax: 35,
          interests: ['Pop Music', 'Music Videos', 'Top 40']
        },
        metrics: {
          impressions: 185000,
          clicks: 4600,
          conversions: 110,
          ctr: 2.5,
          cpm: 22.7,
          cpc: 0.91,
          roas: 4.1
        },
        createdAt: '2024-07-10T09:15:00Z',
        updatedAt: '2024-07-20T11:45:00Z'
      }
    ];
  }

  private async mockGetInsights(): Promise<MetaInsights> {
    return {
      impressions: '125000',
      clicks: '3250',
      spend: '89.50',
      ctr: '2.6',
      cpm: '26.0',
      cpc: '0.89',
      conversions: '85',
      cost_per_conversion: '1.05'
    };
  }

  private async mockCreateCampaign(campaignData: any): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: 'camp_' + Date.now(),
      name: campaignData.name,
      platform: 'meta',
      accountId: campaignData.accountId,
      status: 'draft',
      objective: campaignData.objective,
      budget: campaignData.budget,
      schedule: campaignData.schedule,
      targeting: campaignData.targeting || { countries: [] },
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpm: 0,
        cpc: 0,
        roas: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const metaAdsService = new MetaAdsService();