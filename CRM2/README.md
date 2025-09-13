# MDMC Dashboard - SaaS Multi-Platform Campaign Management

> Dashboard de gestion de campagnes publicitaires multi-plateformes pour MDMC Music Ads

## 🎯 Vue d'ensemble

MDMC Dashboard est une solution SaaS complète permettant aux artistes et labels musicaux de visualiser leurs performances publicitaires sur Meta Ads, Google Ads, TikTok Ads et Snapchat Ads. Le système expose uniquement les métriques de performance tout en protégeant les configurations techniques des campagnes (ciblage, enchères, etc.) qui constituent la valeur ajoutée de l'agence.

### 🔑 Fonctionnalités principales

- **Dashboard unifié** : Vue consolidée des performances sur toutes les plateformes
- **Métriques en temps réel** : CTR, CPM, CPC, CPA, conversions, portée
- **Sécurité des données** : Séparation stricte des données publiques/privées
- **Multi-tenant** : Isolation complète des données clients
- **Synchronisation automatique** : Mise à jour via APIs des plateformes
- **Exports personnalisés** : PDF, Excel, CSV avec branding client

### 🏗️ Architecture technique

```
CRM2/
├── apps/
│   ├── api/          # Backend API (Express + TypeScript)
│   └── web/          # Frontend React (Vite + TypeScript)
├── packages/
│   └── shared/       # Types et utilitaires partagés
├── docker-compose.yml # Environnement de développement
└── README.md
```

## 🚀 Installation et démarrage

### Prérequis

- Node.js 18+ 
- MongoDB 6+
- Redis 6+
- Docker & Docker Compose (recommandé)

### 1. Installation des dépendances

```bash
# Installation complète du monorepo
npm install

# Construction des packages partagés
npm run build:shared
```

### 2. Configuration

Créer les fichiers d'environnement :

```bash
# API
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

### 3. Base de données (Docker)

```bash
# Démarrage des services (MongoDB + Redis + interfaces admin)
docker-compose up -d

# Vérification
docker-compose ps
```

### 4. Lancement en développement

```bash
# Démarrage complet (API + Web)
npm run dev

# Ou séparément :
npm run dev:api    # Port 3001
npm run dev:web    # Port 3000
```

**URLs de développement :**
- Frontend : http://localhost:3000
- API : http://localhost:3001
- MongoDB Express : http://localhost:8081
- Redis Commander : http://localhost:8082

## ⚙️ Configuration

### Variables d'environnement API

```env
# Base
NODE_ENV=development
PORT=3001

# Base de données
MONGODB_URI=mongodb://mdmc_user:mdmc_password@localhost:27017/mdmc-dashboard
REDIS_URL=redis://localhost:6379

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# APIs Publicitaires
META_ACCESS_TOKEN=your_meta_access_token
META_AD_ACCOUNT_ID=act_123456789
META_WEBHOOK_SECRET=your_webhook_secret
```

### Variables d'environnement Frontend

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=MDMC Dashboard
```

## 🏛️ Architecture de sécurité

### Principe de séparation des données

**Données exposées aux clients :**
- Métriques de performance (impressions, clics, conversions)
- Noms de campagnes et statuts
- Dates et budgets globaux

**Données privées (jamais exposées) :**
- Paramètres de ciblage détaillés
- Stratégies d'enchères
- Audiences personnalisées
- Optimisations créatives

### Modèle Campaign avec sécurité intégrée

```typescript
export interface Campaign {
  _id: string;
  client_id: string;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat';
  campaign_name: string;
  
  // Métriques publiques
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpm: number;
  };
  
  // ⚠️ JAMAIS exposé dans les APIs clients
  _private: {
    targeting: object;
    bidding_strategy: string;
    optimization_events: string[];
  };
}

// Auto-sanitisation
CampaignSchema.methods.toJSON = function() {
  const campaign = this.toObject();
  delete campaign._private;
  delete campaign.external_id;
  return campaign;
};
```

## 🔌 API Reference

### Endpoints principaux

```bash
# Liste des campagnes
GET /api/clients/{clientId}/campaigns
  ?platform=meta&status=active&page=1&limit=20

# Synchronisation Meta Ads
POST /api/clients/{clientId}/campaigns/sync/meta

# Métriques dashboard
GET /api/clients/{clientId}/dashboard/metrics
  ?date_from=2024-01-01&date_to=2024-01-31

# Webhook Meta Ads
POST /api/webhooks/meta
```

### Exemple de réponse

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "campaign_name": "Summer Vibes - Single Promotion",
      "platform": "meta",
      "status": "active",
      "metrics": {
        "impressions": 125000,
        "clicks": 3250,
        "spend": 450.75,
        "conversions": 85,
        "ctr": 2.6,
        "cpm": 3.61
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

## 🎨 Frontend Architecture

### Structure React

```
apps/web/src/
├── components/
│   ├── auth/           # Authentification
│   ├── layouts/        # Layouts généraux
│   └── ui/            # Composants UI réutilisables
├── pages/
│   ├── dashboard/      # Page principale
│   ├── campaigns/      # Liste des campagnes
│   ├── analytics/      # Analytics avancées
│   └── settings/       # Paramètres utilisateur
├── hooks/
│   ├── useCampaigns.ts # API campagnes
│   └── useDashboard.ts # Métriques dashboard
└── lib/
    └── utils.ts        # Utilitaires
```

### Technologies utilisées

- **React 18** + TypeScript
- **Vite** pour le build et dev server
- **Tailwind CSS** pour le styling
- **Tremor** pour les graphiques et métriques
- **React Query** pour la gestion des données
- **Clerk** pour l'authentification
- **React Router** pour la navigation

## 🧪 Développement

### Scripts disponibles

```bash
# Développement
npm run dev              # Lance API + Web en parallèle
npm run dev:api          # Lance seulement l'API
npm run dev:web          # Lance seulement le frontend

# Build
npm run build            # Build API + Web
npm run build:api        # Build API uniquement
npm run build:web        # Build Web uniquement

# Tests et qualité
npm run test             # Lance tous les tests
npm run type-check       # Vérification TypeScript
npm run lint             # ESLint
npm run format           # Prettier
```

## 🔐 Sécurité et conformité

### Mesures de protection

1. **Authentification** : JWT Clerk avec validation serveur
2. **Autorisation** : RBAC avec vérification d'accès client
3. **Rate limiting** : 100 req/15min par IP
4. **Validation** : Schemas Mongoose + validation runtime
5. **Sanitisation** : Suppression automatique données privées
6. **CORS** : Origins restrictives en production
7. **Headers** : Helmet.js pour headers de sécurité

### Conformité RGPD

- Consentement explicite pour le tracking
- Portabilité des données utilisateur
- Droit à l'effacement
- Transparence des traitements

## 📊 Monitoring et performance

### Métriques techniques

- Temps de réponse API < 300ms
- Disponibilité > 99.9%
- Taux d'erreur < 0.1%
- Couverture de tests > 80%

### Outils de monitoring

- **Logs** : Format JSON structuré
- **Health checks** : Endpoint `/health`
- **Métriques** : Exposition Prometheus
- **Alerting** : Intégration Slack/Email

## 🚢 Déploiement

### Architecture production

- **Backend** : Railway / Heroku
- **Frontend** : Vercel / Netlify
- **Database** : MongoDB Atlas
- **Cache** : Redis Cloud
- **Monitoring** : Sentry
- **CDN** : Cloudflare

### Variables d'environnement production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mdmc-prod
CORS_ORIGIN=https://dashboard.mdmc.fr
CLERK_SECRET_KEY=sk_live_...
META_ACCESS_TOKEN=live_token_...
```

## 📞 Support et contributions

### Standards de développement

- **TypeScript strict** : Mode strict activé
- **Commits conventionnels** : feat/fix/docs/refactor
- **Tests** : Couverture minimale 80%
- **Code review** : Obligatoire pour toute PR

### Contacts

- **Technique** : dev@mdmc.fr
- **Business** : support@mdmc.fr
- **Urgences** : Slack #tech-urgences

---

**MDMC Music Ads Dashboard** - Version 1.0.0
Architecture sécurisée pour la gestion de campagnes publicitaires musicales.