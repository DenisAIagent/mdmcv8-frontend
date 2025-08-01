# Configuration Claude - MDMC Music Ads

## Règles de développement strictes

### ❌ JAMAIS DE PICTOGRAMMES / EMOJIS
**RÈGLE ABSOLUE : Ne jamais utiliser de pictogrammes, émojis ou symboles dans le code, interfaces utilisateur, ou textes du site.**

- ❌ Pas d'emojis dans les textes : "🎯 **Approche sur-mesure**"
- ❌ Pas de symboles Unicode : "📊", "🔍", "💰", "✅", etc.
- ❌ Pas d'icônes textuelles : "▶", "✓", "⚠️"
- ✅ Texte simple et professionnel uniquement

### Informations confidentielles
- Ne jamais divulguer les tarifs, frais de gestion, ou structure tarifaire
- Les outils de suivi sont les dashboards natifs des plateformes (Google Ads, Meta Business Manager, TikTok Ads Manager)
- Pas d'outils internes propriétaires

### Architecture technique
- HashRouter pour la navigation React
- Utiliser `<Link to>` pour la navigation interne, pas `<a href>`
- Variables CSS dans `variables.css` pour la cohérence
- Couleur principale : #E50914 (rouge MDMC)

### SEO et contenu
- Contenu riche en mots-clés pour le référencement naturel
- Structure sémantique optimisée (H1, H2, H3)
- Définitions complètes pour featured snippets

### UX/UI
- Design cohérent avec l'identité MDMC
- Animations fluides (0.3s transitions)
- Responsive mobile-first
- États visuels : hover, focus, active

### ❌ JAMAIS DE FALLBACKS POUR LES LOGOS DE PLATEFORMES
**RÈGLE CRITIQUE : Ne jamais créer de fallbacks/placeholders pour les logos de plateformes musicales.**

- ❌ Pas de SVG data URIs générés automatiquement
- ❌ Pas d'initiales des plateformes en fallback  
- ❌ Pas de placeholders génériques
- ✅ Si un logo de plateforme est manquant : ne rien afficher ou masquer l'élément
- ✅ Utiliser uniquement les logos officiels des plateformes
- **Raison :** Les fallbacks compromettent la valeur et l'authenticité du service SmartLinks

## Services proposés
- Campagnes YouTube Ads
- Meta Ads (Facebook/Instagram) 
- TikTok Promotion
- Analytics & Reporting
- Consulting Stratégique
- SmartLinks

## Sujets de contact autorisés
1. Demande de devis
2. Demande de formation
3. Demande médias
4. RGPD

## 🚫 RESTRICTIONS DE MODIFICATION CODE

### ❌ SITE GLOBAL WWW - NON MODIFIABLE
**INTERDICTION ABSOLUE de modifier :**
- Pages publiques (`/src/pages/public/*`)
- Composants layout (`/src/components/layout/*`)
- Sections homepage (`/src/components/sections/*`)
- Pages services (`/src/pages/services/*`)
- Index.html (sauf admin)
- Assets publics (`/public/*` sauf admin)

### ✅ ZONE ADMIN - MODIFIABLE UNIQUEMENT
**AUTORISATION limitée à :**
- Panneau admin (`/src/components/admin/*`)
- Pages admin (`/src/pages/admin/*`)
- Fonctionnalités admin (`/src/features/admin/*`)
- Gestion SmartLinks admin
- Outils d'administration

### ⚠️ EXCEPTIONS CRITIQUES - DOUBLE AUTORISATION OBLIGATOIRE
Modifications globales autorisées UNIQUEMENT avec **DOUBLE CONFIRMATION** :

**PROTOCOLE D'AUTORISATION :**
1. **Première confirmation** : "CONFIRM MODIFICATION SITE WWW"
2. **Seconde confirmation** : "DOUBLE AUTORISATION ACCORDÉE"  
3. **Messages séparés obligatoires** (pas dans le même message)

**CAS AUTORISÉS (avec double confirmation) :**
- Correctifs sécurité critiques
- Bugs bloquants système
- Optimisations performance critiques

**⛔ SANS DOUBLE AUTORISATION = REFUS AUTOMATIQUE**

**RAISON : Site web production stable - Admin panel en développement**

---
*Dernière mise à jour : 1 août 2025*