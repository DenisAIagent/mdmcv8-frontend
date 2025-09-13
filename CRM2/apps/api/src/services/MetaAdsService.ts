import axios from 'axios';
import { config } from '../config/index.js';

export interface MetaCampaignData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  created_time: string;
  updated_time: string;
  start_time?: string;
  stop_time?: string;
  daily_budget?: number;
  lifetime_budget?: number;
}

export interface MetaInsightData {
  campaign_id: string;
  date_start: string;
  date_stop: string;
  impressions: number;
  clicks: number;
  spend: number;
  reach?: number;
  frequency?: number;
  video_30_second_watched_actions?: Array<{
    action_type: string;
    value: number;
  }>;
  actions?: Array<{
    action_type: string;
    value: number;
  }>;
}

export class MetaAdsService {
  private baseURL = 'https://graph.facebook.com/v18.0';
  private accessToken: string;
  private adAccountId: string;

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  async getCampaigns(): Promise<MetaCampaignData[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.adAccountId}/campaigns`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,status,objective,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes Meta:', error);
      throw new Error('Impossible de récupérer les campagnes Meta Ads');
    }
  }

  async getCampaignInsights(
    campaignId: string,
    datePreset: string = 'last_30_days'
  ): Promise<MetaInsightData[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${campaignId}/insights`,
        {
          params: {
            access_token: this.accessToken,
            date_preset: datePreset,
            fields: 'campaign_id,date_start,date_stop,impressions,clicks,spend,reach,frequency,video_30_second_watched_actions,actions',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des insights pour ${campaignId}:`, error);
      throw new Error('Impossible de récupérer les données de performance');
    }
  }

  async getAccountInsights(datePreset: string = 'last_30_days'): Promise<MetaInsightData[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.adAccountId}/insights`,
        {
          params: {
            access_token: this.accessToken,
            date_preset: datePreset,
            level: 'campaign',
            fields: 'campaign_id,campaign_name,date_start,date_stop,impressions,clicks,spend,reach,frequency,video_30_second_watched_actions,actions',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des insights du compte:', error);
      throw new Error('Impossible de récupérer les données du compte Meta Ads');
    }
  }

  validateWebhook(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.meta.webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  private calculateMetrics(insights: MetaInsightData[]) {
    const totals = insights.reduce(
      (acc, insight) => {
        acc.impressions += insight.impressions || 0;
        acc.clicks += insight.clicks || 0;
        acc.spend += parseFloat(insight.spend.toString()) || 0;
        acc.reach += insight.reach || 0;
        
        const conversions = insight.actions?.filter(
          action => action.action_type === 'purchase' || action.action_type === 'complete_registration'
        ).reduce((sum, action) => sum + action.value, 0) || 0;
        
        acc.conversions += conversions;
        return acc;
      },
      { impressions: 0, clicks: 0, spend: 0, reach: 0, conversions: 0 }
    );

    return {
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
      frequency: totals.reach > 0 ? totals.impressions / totals.reach : 0,
    };
  }

  async getFormattedCampaignData(campaignId: string) {
    try {
      const [campaigns, insights] = await Promise.all([
        this.getCampaigns(),
        this.getCampaignInsights(campaignId)
      ]);

      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campagne non trouvée');
      }

      const metrics = this.calculateMetrics(insights);

      return {
        internal_id: campaignId,
        external_id: campaign.id,
        platform: 'meta' as const,
        campaign_name: campaign.name,
        status: this.mapMetaStatusToInternal(campaign.status),
        date_range: {
          start: new Date(campaign.start_time || campaign.created_time),
          end: campaign.stop_time ? new Date(campaign.stop_time) : undefined,
        },
        metrics: {
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          spend: metrics.spend,
          conversions: metrics.conversions,
          video_views: insights.reduce((sum, i) => {
            const videoViews = i.video_30_second_watched_actions?.find(
              action => action.action_type === 'video_view'
            )?.value || 0;
            return sum + videoViews;
          }, 0),
          engagement_rate: metrics.ctr / 100,
          ctr: metrics.ctr,
          cpm: metrics.cpm,
          cpc: metrics.cpc,
          cpa: metrics.cpa,
          reach: metrics.reach,
          frequency: metrics.frequency,
        },
        _private: {
          targeting: 'DONNÉES PRIVÉES MASQUÉES',
          bidding_strategy: 'DONNÉES PRIVÉES MASQUÉES',
          optimization_events: 'DONNÉES PRIVÉES MASQUÉES',
          budget_details: {
            daily: campaign.daily_budget,
            lifetime: campaign.lifetime_budget,
          }
        },
        last_sync: new Date(),
      };
    } catch (error) {
      console.error('Erreur lors du formatage des données:', error);
      throw error;
    }
  }

  private mapMetaStatusToInternal(metaStatus: string): 'active' | 'paused' | 'completed' | 'draft' {
    switch (metaStatus) {
      case 'ACTIVE':
        return 'active';
      case 'PAUSED':
        return 'paused';
      case 'ARCHIVED':
      case 'DELETED':
        return 'completed';
      default:
        return 'draft';
    }
  }
}