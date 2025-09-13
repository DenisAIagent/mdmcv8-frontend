import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  clerk_id: string; // ID utilisateur Clerk
  email: string;
  role: 'admin' | 'manager' | 'client' | 'viewer';
  client_ids: mongoose.Types.ObjectId[]; // Clients auxquels il a accès
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

const UserSchema: Schema = new Schema({
  clerk_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'client', 'viewer'],
    default: 'viewer',
    required: true
  },
  client_ids: [{
    type: Schema.Types.ObjectId,
    ref: 'Client'
  }],
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  avatar_url: {
    type: String,
    trim: true
  },
  last_login: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'fr'
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    dashboard_layout: {
      type: Schema.Types.Mixed,
      default: () => ({})
    }
  },
  permissions: {
    can_export: {
      type: Boolean,
      default: true
    },
    can_view_spend: {
      type: Boolean,
      default: true
    },
    can_manage_alerts: {
      type: Boolean,
      default: false
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'users'
});

// Indexes pour performance
UserSchema.index({ clerk_id: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ is_active: 1 });
UserSchema.index({ client_ids: 1 });

// Middleware pour mise à jour automatique
UserSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Méthodes d'instance
UserSchema.methods.hasAccessToClient = function(clientId: string): boolean {
  // Admin/Manager ont accès à tous les clients
  if (this.role === 'admin' || this.role === 'manager') {
    return true;
  }
  
  // Autres rôles: vérifier l'accès explicite
  return this.client_ids.some(id => id.toString() === clientId.toString());
};

UserSchema.methods.canPerformAction = function(action: string): boolean {
  switch (action) {
    case 'view_private_data':
      return this.role === 'admin' || this.role === 'manager';
    case 'manage_users':
      return this.role === 'admin';
    case 'export_data':
      return this.permissions.can_export;
    case 'view_spend':
      return this.permissions.can_view_spend;
    case 'manage_alerts':
      return this.permissions.can_manage_alerts;
    default:
      return false;
  }
};

UserSchema.methods.updateLastLogin = function() {
  this.last_login = new Date();
  return this.save();
};

// Méthodes statiques
UserSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ clerk_id: clerkId, is_active: true });
};

UserSchema.statics.findByRole = function(role: string) {
  return this.find({ role, is_active: true });
};

UserSchema.statics.findClientsUsers = function(clientId: string) {
  return this.find({ 
    client_ids: clientId, 
    is_active: true 
  });
};

// Méthodes pour la gestion des permissions par rôle
UserSchema.statics.getDefaultPermissions = function(role: string) {
  const permissions = {
    admin: {
      can_export: true,
      can_view_spend: true,
      can_manage_alerts: true
    },
    manager: {
      can_export: true,
      can_view_spend: true,
      can_manage_alerts: true
    },
    client: {
      can_export: true,
      can_view_spend: true,
      can_manage_alerts: false
    },
    viewer: {
      can_export: false,
      can_view_spend: false,
      can_manage_alerts: false
    }
  };
  
  return permissions[role as keyof typeof permissions] || permissions.viewer;
};

export const User = mongoose.model<IUser>('User', UserSchema);