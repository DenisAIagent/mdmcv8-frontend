// Export des types et utilitaires partagés
export * from './types/index.js';

// Utilitaires de validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPlatform = (platform: string): boolean => {
  return ['meta', 'google', 'tiktok', 'snapchat'].includes(platform);
};

export const isValidRole = (role: string): boolean => {
  return ['admin', 'manager', 'client', 'viewer'].includes(role);
};

export const isValidTier = (tier: string): boolean => {
  return ['starter', 'growth', 'premium'].includes(tier);
};

// Utilitaires de formatage
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Utilitaires de date
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR');
};

// Utilitaires de calcul métrique
export const calculateCTR = (clicks: number, impressions: number): number => {
  return impressions > 0 ? clicks / impressions : 0;
};

export const calculateCPM = (spend: number, impressions: number): number => {
  return impressions > 0 ? (spend / impressions) * 1000 : 0;
};

export const calculateCPC = (spend: number, clicks: number): number => {
  return clicks > 0 ? spend / clicks : 0;
};

export const calculateCPA = (spend: number, conversions: number): number => {
  return conversions > 0 ? spend / conversions : 0;
};

export const calculateROI = (revenue: number, spend: number): number => {
  return spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
};