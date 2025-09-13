import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  _id: string;
  name: string;
  email: string;
  tier: 'starter' | 'growth' | 'premium';
  agency_notes?: string; // Notes internes non visibles au client
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
  // Méta-données pour le système
  is_active: boolean;
  last_login?: Date;
  onboarding_completed: boolean;
}

const ClientSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  tier: {
    type: String,
    enum: ['starter', 'growth', 'premium'],
    default: 'starter',
    required: true
  },
  agency_notes: {
    type: String,
    maxlength: 1000,
    select: false // Jamais inclus dans les requêtes par défaut
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  settings: {
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP', 'CAD']
    },
    language: {
      type: String,
      default: 'fr',
      enum: ['fr', 'en', 'es', 'pt']
    },
    notifications: {
      email_reports: {
        type: Boolean,
        default: true
      },
      alerts: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      }
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  },
  onboarding_completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'clients'
});

// Indexes pour performance
ClientSchema.index({ email: 1 });
ClientSchema.index({ is_active: 1 });
ClientSchema.index({ tier: 1 });
ClientSchema.index({ created_at: -1 });

// Middleware pour mise à jour automatique
ClientSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Méthodes d'instance
ClientSchema.methods.toJSON = function() {
  const client = this.toObject();
  delete client.agency_notes; // Toujours exclure les notes internes
  return client;
};

// Méthodes statiques
ClientSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), is_active: true });
};

ClientSchema.statics.findByTier = function(tier: string) {
  return this.find({ tier, is_active: true });
};

export const Client = mongoose.model<IClient>('Client', ClientSchema);