import axios from 'axios';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

// Configuration de base axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mdmc-auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return config;
});

// Mock service pour développement (remplacera les vraies APIs)
class AuthService {
  private isProduction = import.meta.env.PROD;
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!this.isProduction) {
      // Mock login pour développement
      return this.mockLogin(credentials);
    }
    
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur de connexion');
      }
      throw new Error('Erreur de connexion');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    if (!this.isProduction) {
      // Mock register pour développement
      return this.mockRegister(data);
    }
    
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
      }
      throw new Error('Erreur lors de l\'inscription');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    if (!this.isProduction) {
      return this.mockRefreshToken(refreshToken);
    }
    
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw new Error('Session expirée');
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.isProduction) {
      return this.mockGetCurrentUser();
    }
    
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Impossible de récupérer les informations utilisateur');
    }
  }

  async logout(): Promise<void> {
    if (!this.isProduction) {
      return;
    }
    
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore les erreurs de déconnexion côté serveur
      console.warn('Erreur lors de la déconnexion:', error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!this.isProduction) {
      return Promise.resolve();
    }
    
    try {
      await api.post('/auth/reset-password', { email });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
      }
      throw new Error('Erreur lors de la réinitialisation');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    if (!this.isProduction) {
      return Promise.resolve();
    }
    
    try {
      await api.post('/auth/verify-email', { token });
    } catch (error) {
      throw new Error('Erreur lors de la vérification de l\'email');
    }
  }

  // Services Mock pour développement
  private async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Simuler des credentials valides
    if (credentials.email === 'demo@mdmc.fr' && credentials.password === 'demo123') {
      return {
        user: {
          id: '1',
          email: 'demo@mdmc.fr',
          fullName: 'Demo Client MDMC',
          role: 'client',
          plan: 'growth',
          company: 'MDMC Music Ads',
          createdAt: '2024-01-15T10:00:00Z',
          lastLoginAt: new Date().toISOString(),
          isEmailVerified: true,
          preferences: {
            language: 'fr',
            timezone: 'Europe/Paris',
            notifications: {
              email: true,
              push: true,
              frequency: 'weekly',
            },
          },
        },
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };
    }
    
    throw new Error('Email ou mot de passe incorrect');
  }

  private async mockRegister(data: RegisterData): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      user: {
        id: '2',
        email: data.email,
        fullName: data.fullName,
        role: 'client',
        plan: 'starter',
        company: data.company,
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        preferences: {
          language: 'fr',
          timezone: 'Europe/Paris',
          notifications: {
            email: true,
            push: false,
            frequency: 'weekly',
          },
        },
      },
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
  }

  private async mockRefreshToken(refreshToken: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      user: {
        id: '1',
        email: 'demo@mdmc.fr',
        fullName: 'Demo Client MDMC',
        role: 'client',
        plan: 'growth',
        company: 'MDMC Music Ads',
        createdAt: '2024-01-15T10:00:00Z',
        lastLoginAt: new Date().toISOString(),
        isEmailVerified: true,
        preferences: {
          language: 'fr',
          timezone: 'Europe/Paris',
          notifications: {
            email: true,
            push: true,
            frequency: 'weekly',
          },
        },
      },
      token: 'mock_jwt_token_refreshed_' + Date.now(),
      refreshToken: 'mock_refresh_token_refreshed_' + Date.now(),
    };
  }

  private async mockGetCurrentUser(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: '1',
      email: 'demo@mdmc.fr',
      fullName: 'Demo Client MDMC',
      role: 'client',
      plan: 'growth',
      company: 'MDMC Music Ads',
      createdAt: '2024-01-15T10:00:00Z',
      lastLoginAt: new Date().toISOString(),
      isEmailVerified: true,
      preferences: {
        language: 'fr',
        timezone: 'Europe/Paris',
        notifications: {
          email: true,
          push: true,
          frequency: 'weekly',
        },
      },
    };
  }
}

export const authService = new AuthService();