import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mdmc-dashboard'
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Authentication (Clerk)
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    jwtVerificationKey: process.env.CLERK_JWT_VERIFICATION_KEY
  },

  // API Integrations
  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    apiVersion: process.env.META_API_VERSION || 'v19.0'
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    developerToken: process.env.GOOGLE_DEVELOPER_TOKEN
  },

  tiktok: {
    appId: process.env.TIKTOK_APP_ID,
    appSecret: process.env.TIKTOK_APP_SECRET,
    apiVersion: process.env.TIKTOK_API_VERSION || 'v1.3'
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // Cache TTL (in seconds)
  cache: {
    metricsTtl: parseInt(process.env.METRICS_CACHE_TTL || '3600', 10), // 1 hour
    campaignsTtl: parseInt(process.env.CAMPAIGNS_CACHE_TTL || '1800', 10) // 30 minutes
  },

  // External Services
  sentry: {
    dsn: process.env.SENTRY_DSN
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@mdmcmusicads.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@mdmcmusicads.com'
  },

  // Feature Flags
  features: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableAlerts: process.env.ENABLE_ALERTS !== 'false',
    enableExport: process.env.ENABLE_EXPORT !== 'false',
    enableWebhooks: process.env.ENABLE_WEBHOOKS !== 'false'
  }
};

// Validation des variables critiques
export function validateConfig() {
  const required = [
    'MONGODB_URI',
    'CLERK_SECRET_KEY',
    'ENCRYPTION_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
  }

  // Validation de la clé de chiffrement
  if (config.security.encryptionKey && config.security.encryptionKey.length < 32) {
    console.error('❌ ENCRYPTION_KEY must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
}

export default config;