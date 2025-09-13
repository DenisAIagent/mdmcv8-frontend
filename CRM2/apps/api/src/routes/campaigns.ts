import express from 'express';
import { 
  getCampaigns, 
  getCampaignById, 
  syncMetaCampaigns, 
  getDashboardMetrics,
  handleMetaWebhook
} from '../controllers/campaignController.js';
import { requireAuth, requireClientAccess } from '../middlewares/auth.js';

const router = express.Router();

router.get('/clients/:clientId/campaigns', 
  requireAuth, 
  requireClientAccess('clientId'), 
  getCampaigns
);

router.get('/clients/:clientId/campaigns/:campaignId', 
  requireAuth, 
  requireClientAccess('clientId'), 
  getCampaignById
);

router.post('/clients/:clientId/campaigns/sync/meta', 
  requireAuth, 
  requireClientAccess('clientId'), 
  syncMetaCampaigns
);

router.get('/clients/:clientId/dashboard/metrics', 
  requireAuth, 
  requireClientAccess('clientId'), 
  getDashboardMetrics
);

router.post('/webhooks/meta', handleMetaWebhook);

export default router;