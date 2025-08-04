# 🔐 Identifiants MDMC SmartLinks - Denis Adam

## Accès Service SmartLinks
**URL :** https://smartlink.mdmcmusicads.com

## 👨‍💼 Compte Administrateur
```
Nom d'utilisateur : denis_mdmc_admin
Mot de passe       : SecureMDMC@2025!Denis#Admin
Rôle              : Administrateur complet
```

## 👤 Compte Client  
```
Nom d'utilisateur : denis_mdmc_client
Mot de passe       : ClientMDMC@2025!Denis#Access
Rôle              : Client MDMC
```

## ⚙️ Configuration Railway (Variables d'environnement)

Pour activer ces identifiants en production, ajouter ces variables dans Railway :

```bash
ADMIN_USERNAME=denis_mdmc_admin
ADMIN_PASSWORD=SecureMDMC@2025!Denis#Admin
CLIENT_USERNAME=denis_mdmc_client
CLIENT_PASSWORD=ClientMDMC@2025!Denis#Access
```

## 🛡️ Sécurité

### Améliorations appliquées :
- ✅ Identifiants déplacés vers variables d'environnement
- ✅ Mots de passe complexes (majuscules, minuscules, chiffres, symboles)
- ✅ Logging des tentatives de connexion avec IP
- ✅ Délai anti-force brute (1 seconde)
- ✅ Rôles utilisateur (admin/client)

### À implémenter prochainement :
- 🔄 Hachage bcrypt des mots de passe
- 🔄 JWT avec expiration automatique
- 🔄 Rate limiting avec express-rate-limit
- 🔄 Authentification à deux facteurs (2FA)

## 📝 Utilisation

1. **Connexion** : https://smartlink.mdmcmusicads.com
2. **Saisir identifiants** administrateur ou client
3. **Accès dashboard** : Interface de création SmartLinks
4. **Créer SmartLink** : Artiste + Titre + URL source
5. **Partager** : URL générée optimisée pour réseaux sociaux

## 🚨 Important

- **NE JAMAIS** partager ces identifiants
- **CHANGER** les mots de passe régulièrement
- **UTILISER** uniquement pour projets MDMC légitimes
- **SIGNALER** toute activité suspecte

---
*Généré le 4 août 2025 - Service MDMC SmartLinks v1.0*