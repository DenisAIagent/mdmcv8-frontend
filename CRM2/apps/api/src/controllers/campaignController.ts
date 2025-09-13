import { Request, Response } from 'express';
import { Campaign } from '../models/Campaign.js';
import { Client } from '../models/Client.js';
import { MetaAdsService } from '../services/MetaAdsService.js';
import { ApiResponse, CampaignFilters, PaginationParams } from '@mdmc/shared';

interface AuthenticatedRequest extends Request {
  user?: {
    clerkId: string;
    role: string;
    clientIds: string[];
  };
}

export const getCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId } = req.params;
    const { 
      platform, 
      status, 
      date_from, 
      date_to,
      page = 1,
      limit = 20,
      sort = 'updated_at',
      order = 'desc'
    } = req.query as CampaignFilters & PaginationParams;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID requis',
        code: 'MISSING_CLIENT_ID'
      } as ApiResponse);
    }

    const filters: any = { client_id: clientId };

    if (platform) {
      filters.platform = platform;
    }

    if (status) {
      filters.status = status;
    }

    if (date_from || date_to) {
      filters['date_range.start'] = {};
      if (date_from) {
        filters['date_range.start']['$gte'] = new Date(date_from);
      }
      if (date_to) {
        filters['date_range.start']['$lte'] = new Date(date_to);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const [campaigns, total] = await Promise.all([
      Campaign.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Campaign.countDocuments(filters)
    ]);

    const response: ApiResponse = {
      success: true,
      data: campaigns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des campagnes',
      code: 'CAMPAIGNS_FETCH_ERROR'
    } as ApiResponse);
  }
};

export const getCampaignById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, campaignId } = req.params;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      client_id: clientId
    }).lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée',
        code: 'CAMPAIGN_NOT_FOUND'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: campaign
    } as ApiResponse);
  } catch (error) {
    console.error('Erreur lors de la récupération de la campagne:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de la campagne',
      code: 'CAMPAIGN_FETCH_ERROR'
    } as ApiResponse);
  }
};

export const syncMetaCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      } as ApiResponse);
    }

    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    const metaAdAccountId = process.env.META_AD_ACCOUNT_ID;

    if (!metaAccessToken || !metaAdAccountId) {
      return res.status(500).json({
        success: false,
        error: 'Configuration Meta Ads manquante',
        code: 'META_CONFIG_MISSING'
      } as ApiResponse);
    }

    const metaService = new MetaAdsService(metaAccessToken, metaAdAccountId);

    try {
      const metaCampaigns = await metaService.getCampaigns();
      const syncResults = [];

      for (const metaCampaign of metaCampaigns) {
        try {
          const formattedData = await metaService.getFormattedCampaignData(metaCampaign.id);
          
          const updatedCampaign = await Campaign.findOneAndUpdate(
            { 
              external_id: metaCampaign.id,
              client_id: clientId
            },
            {
              ...formattedData,
              client_id: clientId,
              updated_at: new Date()
            },
            { 
              upsert: true, 
              new: true,
              runValidators: true 
            }
          );

          syncResults.push({
            campaign_id: updatedCampaign._id,
            external_id: metaCampaign.id,
            name: metaCampaign.name,
            status: 'synced'
          });
        } catch (campaignError) {
          console.error(`Erreur sync campagne ${metaCampaign.id}:`, campaignError);
          syncResults.push({
            external_id: metaCampaign.id,
            name: metaCampaign.name,
            status: 'error',
            error: campaignError.message
          });
        }
      }

      await Client.findByIdAndUpdate(clientId, {
        last_sync: new Date(),
        updated_at: new Date()
      });

      res.json({
        success: true,
        data: {
          synced_campaigns: syncResults.filter(r => r.status === 'synced').length,
          total_campaigns: metaCampaigns.length,
          errors: syncResults.filter(r => r.status === 'error').length,
          results: syncResults
        }
      } as ApiResponse);

    } catch (metaError) {
      console.error('Erreur API Meta:', metaError);
      return res.status(502).json({
        success: false,
        error: 'Erreur de communication avec Meta Ads API',
        code: 'META_API_ERROR'
      } as ApiResponse);
    }

  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la synchronisation',
      code: 'SYNC_ERROR'
    } as ApiResponse);
  }
};

export const getDashboardMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId } = req.params;
    const { date_from, date_to } = req.query;

    const dateFilter: any = {};
    if (date_from || date_to) {
      dateFilter['date_range.start'] = {};
      if (date_from) {
        dateFilter['date_range.start']['$gte'] = new Date(date_from as string);
      }
      if (date_to) {
        dateFilter['date_range.start']['$lte'] = new Date(date_to as string);
      }
    }

    const campaigns = await Campaign.find({
      client_id: clientId,
      ...dateFilter
    }).lean();

    const metrics = campaigns.reduce((acc, campaign) => {
      const m = campaign.metrics;
      return {
        total_spend: acc.total_spend + (m.spend || 0),
        total_impressions: acc.total_impressions + (m.impressions || 0),
        total_clicks: acc.total_clicks + (m.clicks || 0),
        total_conversions: acc.total_conversions + (m.conversions || 0),
        campaign_count: acc.campaign_count + 1
      };
    }, {
      total_spend: 0,
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      campaign_count: 0
    });

    const dashboardMetrics = {
      ...metrics,
      average_ctr: metrics.total_impressions > 0 
        ? (metrics.total_clicks / metrics.total_impressions) * 100 
        : 0,
      average_cpm: metrics.total_impressions > 0 
        ? (metrics.total_spend / metrics.total_impressions) * 1000 
        : 0,
      average_cpc: metrics.total_clicks > 0 
        ? metrics.total_spend / metrics.total_clicks 
        : 0,
    };

    const platformBreakdown = await Campaign.aggregate([
      { $match: { client_id: clientId, ...dateFilter } },
      {
        $group: {
          _id: '$platform',
          spend: { $sum: '$metrics.spend' },
          impressions: { $sum: '$metrics.impressions' },
          clicks: { $sum: '$metrics.clicks' },
          conversions: { $sum: '$metrics.conversions' }
        }
      },
      {
        $project: {
          platform: '$_id',
          spend: 1,
          impressions: 1,
          clicks: 1,
          conversions: 1,
          ctr: { 
            $cond: [
              { $gt: ['$impressions', 0] },
              { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] },
              0
            ]
          },
          cpm: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $multiply: [{ $divide: ['$spend', '$impressions'] }, 1000] },
              0
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: dashboardMetrics,
        platform_breakdown: platformBreakdown
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des métriques',
      code: 'METRICS_FETCH_ERROR'
    } as ApiResponse);
  }
};

export const handleMetaWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);

    const metaService = new MetaAdsService('', '');
    
    if (!metaService.validateWebhook(payload, signature)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const { entry } = req.body;
    
    for (const webhookEntry of entry) {
      const { changes } = webhookEntry;
      
      for (const change of changes) {
        if (change.field === 'campaigns') {
          console.log('Webhook Meta - Changement campagne:', change.value);
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur webhook Meta:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
};