// Script d'initialisation MongoDB pour le développement
// Ce script s'exécute au premier démarrage du container MongoDB

// Créer la base de données
db = db.getSiblingDB('mdmc-dashboard');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'mdmc_user',
  pwd: 'mdmc_password',
  roles: [
    {
      role: 'readWrite',
      db: 'mdmc-dashboard'
    }
  ]
});

// Créer les collections avec validation
db.createCollection('clients', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'tier'],
      properties: {
        name: {
          bsonType: 'string',
          maxLength: 100
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        tier: {
          enum: ['starter', 'growth', 'premium']
        }
      }
    }
  }
});

db.createCollection('campaigns', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['client_id', 'platform', 'campaign_name', 'internal_id'],
      properties: {
        platform: {
          enum: ['meta', 'google', 'tiktok', 'snapchat']
        },
        status: {
          enum: ['active', 'paused', 'completed', 'draft']
        }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['clerk_id', 'email', 'role'],
      properties: {
        role: {
          enum: ['admin', 'manager', 'client', 'viewer']
        }
      }
    }
  }
});

// Créer les indexes pour performance
db.clients.createIndex({ 'email': 1 }, { unique: true });
db.clients.createIndex({ 'tier': 1 });
db.clients.createIndex({ 'is_active': 1 });

db.campaigns.createIndex({ 'client_id': 1, 'platform': 1 });
db.campaigns.createIndex({ 'client_id': 1, 'status': 1 });
db.campaigns.createIndex({ 'internal_id': 1 }, { unique: true });
db.campaigns.createIndex({ 'external_id': 1 });

db.users.createIndex({ 'clerk_id': 1 }, { unique: true });
db.users.createIndex({ 'email': 1 });
db.users.createIndex({ 'client_ids': 1 });

// Insérer des données de test pour le développement
print('Creating test data...');

// Client de test
const testClient = db.clients.insertOne({
  name: 'Artiste Test',
  email: 'artiste@test.com',
  tier: 'growth',
  created_at: new Date(),
  updated_at: new Date(),
  settings: {
    timezone: 'Europe/Paris',
    currency: 'EUR',
    language: 'fr',
    notifications: {
      email_reports: true,
      alerts: true,
      frequency: 'weekly'
    }
  },
  is_active: true,
  onboarding_completed: true
});

// Campagne de test
db.campaigns.insertOne({
  client_id: testClient.insertedId,
  platform: 'meta',
  campaign_name: 'Promotion Single "Test Song"',
  internal_id: 'test_campaign_001',
  external_id: 'meta_123456789',
  status: 'active',
  date_range: {
    start: new Date('2024-01-01'),
    end: new Date('2024-02-01')
  },
  metrics: {
    impressions: 50000,
    clicks: 2500,
    spend: 500,
    conversions: 125,
    video_views: 15000,
    engagement_rate: 0.05,
    ctr: 0.05,
    cpm: 10,
    cpc: 0.20,
    cpa: 4,
    reach: 45000,
    frequency: 1.1
  },
  _private: {
    targeting: {
      age_range: '18-35',
      interests: ['music', 'pop'],
      locations: ['FR', 'BE', 'CH']
    },
    bidding_strategy: 'lowest_cost',
    optimization_events: ['video_views', 'link_clicks']
  },
  created_at: new Date(),
  updated_at: new Date(),
  last_sync: new Date()
});

print('✅ MongoDB initialization completed successfully');
print('📊 Test data created');
print('🔐 Database user created: mdmc_user');
print('📚 Collections created with validation rules');
print('🚀 Ready for development!');