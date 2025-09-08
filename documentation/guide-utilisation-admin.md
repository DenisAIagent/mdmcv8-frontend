# Guide d'utilisation du Panneau d'Administration MDMC Music Ads

Ce guide vous aidera à utiliser efficacement le panneau d'administration MDMC Music Ads et ses nouvelles fonctionnalités.

## Table des matières

1. [Accès au panneau d'administration](#accès-au-panneau-dadministration)
2. [Navigation dans l'interface](#navigation-dans-linterface)
3. [Intégrations Marketing](#intégrations-marketing)
4. [Connecteur WordPress](#connecteur-wordpress)
5. [Synchronisation WordPress](#synchronisation-wordpress)
6. [Générateur de Landing Pages](#générateur-de-landing-pages)
7. [Chatbot d'assistance](#chatbot-dassistance)
8. [Gestion des avis clients](#gestion-des-avis-clients)
9. [FAQ](#faq)

## Accès au panneau d'administration

1. Accédez à l'URL de votre site MDMC Music Ads et ajoutez `/admin` à la fin
2. Connectez-vous avec vos identifiants :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `mdmc2025`
3. Vous serez redirigé vers le tableau de bord principal

## Navigation dans l'interface

Le panneau d'administration dispose d'une barre latérale qui peut être rétractée pour maximiser l'espace de travail :

- Cliquez sur le bouton `←` en haut de la barre latérale pour la réduire
- Cliquez sur le bouton `→` pour l'étendre à nouveau

La barre latérale contient les sections suivantes :

- **Tableau de bord** : Vue d'ensemble des statistiques et activités récentes
- **Avis** : Gestion des avis clients
- **Contenu** : Édition du contenu du site
- **Médias** : Gestion des fichiers médias
- **Intégrations Marketing** : Configuration des pixels et outils marketing
- **Connecteur WordPress** : Configuration de la connexion WordPress
- **Synchronisation WordPress** : Gestion de la synchronisation des articles
- **Générateur de Landing Pages** : Création de pages d'atterrissage

## Intégrations Marketing

Cette section vous permet de configurer facilement différents outils marketing sans avoir à manipuler de code.

### Google Analytics

1. Activez l'interrupteur pour Google Analytics
2. Entrez votre ID de mesure (format G-XXXXXXXXXX ou UA-XXXXXXXX-X)
3. Activez les options supplémentaires si nécessaire :
   - Enhanced E-commerce
   - User Properties

### Google Tag Manager

1. Activez l'interrupteur pour Google Tag Manager
2. Entrez votre ID de conteneur (format GTM-XXXXXXX)

### Google Ads

1. Activez l'interrupteur pour Google Ads
2. Entrez votre ID de conversion (format AW-XXXXXXXXX)
3. Activez l'option de remarketing si nécessaire

### Meta Pixel (Facebook)

1. Activez l'interrupteur pour Meta Pixel
2. Entrez votre ID de pixel (format numérique à 15-16 chiffres)
3. Activez l'option de correspondance avancée si nécessaire

### TikTok Pixel

1. Activez l'interrupteur pour TikTok Pixel
2. Entrez votre ID de pixel (format numérique à 19-20 chiffres)
3. Activez l'option de correspondance avancée si nécessaire

N'oubliez pas de cliquer sur "Enregistrer les paramètres" après avoir configuré vos intégrations.

## Connecteur WordPress

Cette section vous permet de connecter votre blog WordPress existant au site MDMC Music Ads.

### Configuration de la connexion

1. Entrez l'URL de votre site WordPress (ex: https://votresite.wordpress.com)
2. Entrez votre nom d'utilisateur WordPress
3. Entrez votre mot de passe d'application WordPress
   - Pour créer un mot de passe d'application, accédez à votre tableau de bord WordPress > Profil > Mots de passe d'application
   - Créez un nouveau mot de passe avec le nom "MDMC"
4. Cliquez sur "Tester la connexion" pour vérifier que les informations sont correctes

### Options de configuration

Une fois la connexion établie, vous pouvez configurer :

1. La fréquence de synchronisation :
   - Manuelle : synchronisation uniquement lorsque vous le demandez
   - Quotidienne : synchronisation automatique une fois par jour
   - Hebdomadaire : synchronisation automatique une fois par semaine
2. Les catégories à synchroniser : sélectionnez les catégories d'articles que vous souhaitez importer

## Synchronisation WordPress

Cette section vous permet de gérer la synchronisation des articles entre votre blog WordPress et le site MDMC Music Ads.

### Démarrer une synchronisation

1. Cliquez sur le bouton "Démarrer la synchronisation"
2. Suivez la progression de la synchronisation dans la barre de progression
3. Une fois terminée, vous verrez un message de confirmation

### Journal de synchronisation

Vous pouvez consulter le journal de synchronisation pour voir les détails de chaque opération :

1. Cliquez sur "Afficher le journal" pour voir l'historique des synchronisations
2. Le journal affiche la date, l'heure et le statut de chaque opération

### Gestion des articles synchronisés

Les articles synchronisés sont affichés sous forme de cartes avec :

- Image à la une
- Titre
- Catégorie
- Date de publication
- Extrait

Pour chaque article, vous pouvez :

- Cliquer sur "Voir l'article" pour ouvrir l'article complet
- Cliquer sur "Supprimer" pour retirer l'article de la synchronisation (cela n'affecte pas l'article original sur WordPress)

## Générateur de Landing Pages

Cette section vous permet de créer facilement des landing pages professionnelles sans avoir besoin de compétences en développement.

### Création d'une nouvelle landing page

1. Cliquez sur "Créer une nouvelle landing page"
2. Suivez les 4 étapes du processus :

#### Étape 1 : Sélection du template

Choisissez parmi les templates disponibles :
- Promotion d'album
- Promotion de single
- Promotion de concert
- Inscription à une newsletter
- Template personnalisé

#### Étape 2 : Informations de base

Configurez les informations essentielles :
- Titre de la page
- Description
- Couleurs principales
- Logo et images

#### Étape 3 : Personnalisation des sections

Ajoutez et configurez les sections de votre landing page :
- Section héro avec image de fond
- Caractéristiques ou avantages
- Galerie d'images
- Témoignages
- Formulaire de contact
- Appel à l'action (CTA)
- Intégration de médias sociaux

#### Étape 4 : Publication

Configurez les options de publication :
- URL personnalisée
- Intégration des pixels marketing
- Méta-données pour le SEO
- Date de publication

### Gestion des landing pages

Vous pouvez gérer vos landing pages existantes :
- Modifier une landing page
- Dupliquer une landing page
- Archiver une landing page
- Voir les statistiques de performance

## Chatbot d'assistance

Le chatbot d'assistance est disponible à tout moment dans le panneau d'administration pour vous aider à utiliser les différentes fonctionnalités.

### Utilisation du chatbot

1. Cliquez sur l'icône du chatbot dans le coin inférieur droit de l'écran
2. Posez votre question dans le champ de texte
3. Le chatbot vous fournira une réponse basée sur la documentation complète du système

### Exemples de questions

- "Comment configurer Google Analytics ?"
- "Comment synchroniser mon blog WordPress ?"
- "Comment créer une landing page ?"
- "Comment gérer les avis clients ?"

Le chatbot utilise l'API Gemini 2.0 pour fournir des réponses précises et contextuelles à vos questions.

## Gestion des avis clients

Cette section vous permet de gérer les avis clients sur votre site.

### Approbation des avis

1. Accédez à la section "Avis" dans le menu latéral
2. Consultez les avis en attente d'approbation
3. Pour chaque avis, vous pouvez :
   - Cliquer sur "Approuver" pour publier l'avis sur votre site
   - Cliquer sur "Rejeter" pour supprimer l'avis

### Génération de liens d'avis

Vous pouvez générer des liens pour inviter vos clients à laisser un avis :

1. Cliquez sur "Générer un lien d'avis"
2. Le lien sera automatiquement copié dans votre presse-papiers
3. Partagez ce lien avec vos clients par email ou message

## FAQ

### Comment résoudre les problèmes de connexion à WordPress ?

Si vous rencontrez des problèmes de connexion à WordPress :
1. Vérifiez que l'URL de votre site WordPress est correcte
2. Assurez-vous que votre nom d'utilisateur a les droits d'administrateur
3. Créez un nouveau mot de passe d'application dans WordPress
4. Vérifiez que l'API REST WordPress est activée sur votre site

### Comment optimiser mes landing pages pour le SEO ?

Pour optimiser vos landing pages pour le référencement :
1. Utilisez des titres et descriptions pertinents
2. Ajoutez des balises alt à toutes vos images
3. Structurez votre contenu avec des titres hiérarchiques
4. Utilisez des mots-clés pertinents dans votre contenu

### Comment suivre les performances de mes intégrations marketing ?

Pour suivre les performances :
1. Utilisez les tableaux de bord natifs de chaque plateforme (Google Analytics, Meta, etc.)
2. Configurez des objectifs de conversion dans Google Analytics
3. Utilisez les rapports d'attribution pour comprendre l'efficacité de chaque canal

### Comment personnaliser davantage mes landing pages ?

Si vous souhaitez personnaliser davantage vos landing pages :
1. Utilisez l'option "Template personnalisé" dans le générateur
2. Ajoutez du CSS personnalisé dans la section "Styles avancés"
3. Utilisez l'éditeur HTML pour des modifications plus précises

Pour toute autre question, n'hésitez pas à utiliser le chatbot d'assistance ou à contacter le support MDMC.
