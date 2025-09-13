export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'client' | 'manager';
  plan: 'starter' | 'growth' | 'enterprise';
  avatar?: string;
  company?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  preferences: {
    language: 'fr' | 'en';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
    };
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  company?: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AdAccount {
  id: string;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat';
  accountId: string;
  accountName: string;
  currency: string;
  timezone: string;
  isActive: boolean;
  connectedAt: string;
  lastSyncAt?: string;
  accessToken: string;
  refreshToken?: string;
  permissions: string[];
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat';
  accountId: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  objective: string;
  budget: {
    type: 'daily' | 'lifetime';
    amount: number;
    spent: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
  };
  targeting: {
    countries: string[];
    ageMin?: number;
    ageMax?: number;
    genders?: string[];
    interests?: string[];
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpm: number;
    cpc: number;
    roas: number;
  };
  createdAt: string;
  updatedAt: string;
}