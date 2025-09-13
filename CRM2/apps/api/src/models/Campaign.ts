import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  video_views?: number;
  engagement_rate: number;
  ctr: number; // Click-through rate
  cpm: number; // Cost per mille
  cpc: number; // Cost per click
  cpa?: number; // Cost per acquisition
  reach?: number;
  frequency?: number;
}

export interface ICampaignPrivateData {
  targeting?: any; // Audiences, interests, etc. - JAMAIS exposé
  bidding_strategy?: string;
  creative_ids?: string[];
  optimization_events?: string[];
  budget_settings?: any;
  placement_settings?: any;
}

export interface ICampaign extends Document {
  _id: string;
  client_id: mongoose.Types.ObjectId;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat';
  campaign_name: string; // Nom visible pour le client
  internal_id: string; // ID chiffré de la vraie campagne
  external_id?: string; // ID de la plateforme (Meta, Google, etc.)
  status: 'active' | 'paused' | 'completed' | 'draft';
  date_range: {
    start: Date;
    end?: Date;
  };
  metrics: ICampaignMetrics;
  _private: ICampaignPrivateData; // Données jamais exposées via API
  created_at: Date;
  updated_at: Date;
  last_sync: Date;
}

const CampaignMetricsSchema: Schema = new Schema({
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  spend: { type: Number, default: 0, min: 0 },
  conversions: { type: Number, default: 0 },
  video_views: { type: Number, default: 0 },
  engagement_rate: { type: Number, default: 0, min: 0, max: 1 },
  ctr: { type: Number, default: 0, min: 0, max: 1 },
  cpm: { type: Number, default: 0, min: 0 },
  cpc: { type: Number, default: 0, min: 0 },
  cpa: { type: Number, min: 0 },
  reach: { type: Number, default: 0 },
  frequency: { type: Number, default: 0, min: 0 }
}, { _id: false });

const CampaignSchema: Schema = new Schema({
  client_id: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['meta', 'google', 'tiktok', 'snapchat'],
    required: true
  },
  campaign_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  internal_id: {
    type: String,
    required: true,
    unique: true // ID unique chiffré
  },
  external_id: {
    type: String,
    index: true // ID de la plateforme pour les syncs
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'draft'],
    default: 'draft'
  },
  date_range: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date
    }
  },
  metrics: {
    type: CampaignMetricsSchema,
    default: () => ({})
  },
  _private: {
    type: Schema.Types.Mixed,
    select: false, // JAMAIS inclus dans les requêtes par défaut
    default: () => ({})
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_sync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'campaigns'
});

// Indexes composites pour performance
CampaignSchema.index({ client_id: 1, platform: 1 });
CampaignSchema.index({ client_id: 1, status: 1 });
CampaignSchema.index({ client_id: 1, 'date_range.start': -1 });
CampaignSchema.index({ platform: 1, external_id: 1 });
CampaignSchema.index({ last_sync: 1 });

// Middleware pour mise à jour automatique
CampaignSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Méthodes d'instance - SÉCURITÉ CRITIQUE
CampaignSchema.methods.toJSON = function() {
  const campaign = this.toObject();
  
  // Supprimer DÉFINITIVEMENT les données privées
  delete campaign._private;
  delete campaign.external_id; // ID externe non exposé aux clients
  
  return campaign;
};

// Méthode pour les admins seulement (accès aux données privées)
CampaignSchema.methods.toAdminJSON = function() {
  return this.toObject(); // Inclut _private pour les admins
};

// Méthodes statiques
CampaignSchema.statics.findByClient = function(clientId: string) {
  return this.find({ 
    client_id: clientId, 
    status: { $ne: 'draft' } 
  }).select('-_private');
};

CampaignSchema.statics.findActiveCampaigns = function(clientId: string) {
  return this.find({ 
    client_id: clientId, 
    status: 'active' 
  }).select('-_private');
};

CampaignSchema.statics.findByPlatform = function(clientId: string, platform: string) {
  return this.find({ 
    client_id: clientId, 
    platform,
    status: { $ne: 'draft' }
  }).select('-_private');
};

// Méthode pour calculer le ROI
CampaignSchema.methods.calculateROI = function(revenue?: number) {
  if (!revenue || this.metrics.spend === 0) return 0;
  return ((revenue - this.metrics.spend) / this.metrics.spend) * 100;
};

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);