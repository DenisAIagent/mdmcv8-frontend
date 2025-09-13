// Types partagés entre le frontend et le backend

export interface Client {
  _id: string;
  name: string;
  email: string;
  tier: 'starter' | 'growth' | 'premium';
  created_at: Date;
  updated_at: Date;
  settings: {
    timezone: string;
    currency: string;
    language: string;
    notifications: {
      email_reports: boolean;
      alerts: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
    };
  };
  is_active: boolean;
  last_login?: Date;
  onboarding_completed: boolean;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  video_views?: number;
  engagement_rate: number;
  ctr: number;
  cpm: number;
  cpc: number;
  cpa?: number;
  reach?: number;
  frequency?: number;
}

export interface Campaign {
  _id: string;
  client_id: string;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat';
  campaign_name: string;
  internal_id: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  date_range: {
    start: Date;
    end?: Date;
  };
  metrics: CampaignMetrics;
  created_at: Date;
  updated_at: Date;
  last_sync: Date;
}

export interface User {
  _id: string;
  clerk_id: string;
  email: string;
  role: 'admin' | 'manager' | 'client' | 'viewer';
  client_ids: string[];
  name?: string;
  avatar_url?: string;
  last_login?: Date;
  preferences: {
    theme?: 'light' | 'dark';
    language?: string;
    timezone?: string;
    dashboard_layout?: any;
  };
  permissions: {
    can_export: boolean;
    can_view_spend: boolean;
    can_manage_alerts: boolean;
  };
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// Types pour les API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CampaignFilters {
  platform?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  client_id?: string;
}

// Types pour les métriques agrégées
export interface DashboardMetrics {
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  average_ctr: number;
  average_cpm: number;
  average_cpc: number;
  roi_percentage?: number;
}

export interface PlatformMetrics {
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat';
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
}

// Types pour les alertes
export interface Alert {
  _id: string;
  client_id: string;
  campaign_id?: string;
  type: 'budget_threshold' | 'performance_drop' | 'campaign_ended' | 'api_error';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  is_read: boolean;
  created_at: Date;
  data?: any;
}

// Types pour l'export
export interface ExportRequest {
  client_id: string;
  date_from: string;
  date_to: string;
  platforms?: string[];
  format: 'pdf' | 'excel' | 'csv';
  include_charts: boolean;
}

// Types pour les webhooks
export interface WebhookData {
  platform: 'meta' | 'google' | 'tiktok';
  event_type: string;
  campaign_id: string;
  data: any;
  timestamp: Date;
}

// Utilitaires de type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Constantes
export const PLATFORMS = ['meta', 'google', 'tiktok', 'snapchat'] as const;
export const CAMPAIGN_STATUSES = ['active', 'paused', 'completed', 'draft'] as const;
export const USER_ROLES = ['admin', 'manager', 'client', 'viewer'] as const;
export const CLIENT_TIERS = ['starter', 'growth', 'premium'] as const;