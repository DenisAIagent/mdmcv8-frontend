import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { User } from '../models/User.js';
import { config } from '../config/index.js';

// Extension de l'interface Request pour inclure les données utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkId: string;
        email: string;
        role: 'admin' | 'manager' | 'client' | 'viewer';
        clientIds: string[];
        permissions: {
          can_export: boolean;
          can_view_spend: boolean;
          can_manage_alerts: boolean;
        };
      };
    }
  }
}

/**
 * Middleware d'authentification avec Clerk
 * Vérifie le JWT et charge les données utilisateur
 */
export const requireAuth = ClerkExpressRequireAuth({
  secretKey: config.clerk.secretKey
});

/**
 * Middleware pour charger les données utilisateur depuis la DB
 */
export const loadUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Chercher l'utilisateur par Clerk ID
    const user = await User.findByClerkId(req.auth.userId);
    
    if (!user) {
      return res.status(403).json({ 
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Mettre à jour la dernière connexion
    await user.updateLastLogin();

    // Attacher les données utilisateur à la requête
    req.user = {
      id: user._id,
      clerkId: user.clerk_id,
      email: user.email,
      role: user.role,
      clientIds: user.client_ids.map(id => id.toString()),
      permissions: user.permissions
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware pour vérifier les rôles requis
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_role: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier l'accès à un client spécifique
 */
export const requireClientAccess = (clientIdParam = 'clientId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const clientId = req.params[clientIdParam];
    
    if (!clientId) {
      return res.status(400).json({ 
        error: 'Client ID required',
        code: 'CLIENT_ID_REQUIRED'
      });
    }

    // Admin et Manager ont accès à tous les clients
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      return next();
    }

    // Vérifier l'accès explicite pour les autres rôles
    if (!req.user.clientIds.includes(clientId)) {
      return res.status(403).json({ 
        error: 'Access denied to this client',
        code: 'CLIENT_ACCESS_DENIED',
        client_id: clientId
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier une permission spécifique
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Admin a toutes les permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Vérifier la permission spécifique
    let hasPermission = false;
    
    switch (permission) {
      case 'export':
        hasPermission = req.user.permissions.can_export;
        break;
      case 'view_spend':
        hasPermission = req.user.permissions.can_view_spend;
        break;
      case 'manage_alerts':
        hasPermission = req.user.permissions.can_manage_alerts;
        break;
      case 'view_private_data':
        hasPermission = req.user.role === 'admin' || req.user.role === 'manager';
        break;
      default:
        hasPermission = false;
    }

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required_permission: permission
      });
    }

    next();
  };
};

/**
 * Middleware optionnel pour authentification (ne bloque pas si pas d'auth)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.userId) {
      await loadUser(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
    next();
  }
};