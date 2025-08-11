// src/data/documentation.js
const documentationData = {
  marketing_integrations: {
    google_analytics: {
      title: "Configuration de Google Analytics",
      description: "Google Analytics est un service d'analyse web qui permet de suivre et d'analyser le trafic de votre site web.",
      setup: {
        step1: "Créez un compte Google Analytics si vous n'en avez pas déjà un",
        step2: "Créez une propriété pour votre site web",
        step3: "Obtenez votre ID de mesure (G-XXXXXXXX) depuis l'interface Google Analytics",
        step4: "Entrez cet ID dans le champ correspondant du panneau d'administration MDMC"
      },
      events: {
        pageview: "Déclenché automatiquement lors du chargement d'une page",
        conversion: "Peut être configuré pour suivre les actions importantes comme les soumissions de formulaire",
        custom: "Vous pouvez définir des événements personnalisés selon vos besoins"
      },
      troubleshooting: {
        no_data: "Vérifiez que l'ID est correct et attendez 24-48h pour que les données commencent à apparaître",
        tracking_issues: "Utilisez l'extension Chrome 'Tag Assistant' pour vérifier que le tag est correctement installé"
      }
    },
    gtm: {
      title: "Configuration de Google Tag Manager",
      description: "Google Tag Manager est un système de gestion de balises qui permet de mettre à jour les balises de suivi sur votre site web.",
      setup: {
        step1: "Créez un compte Google Tag Manager si vous n'en avez pas déjà un",
        step2: "Créez un conteneur pour votre site web",
        step3: "Obtenez votre ID de conteneur (GTM-XXXXXXX) depuis l'interface GTM",
        step4: "Entrez cet ID dans le champ correspondant du panneau d'administration MDMC"
      },
      advanced: {
        triggers: "Configurez des déclencheurs pour activer vos tags dans certaines conditions",
        variables: "Définissez des variables pour stocker et réutiliser des informations",
        tags: "Ajoutez des tags pour différents services d'analyse et de marketing"
      }
    },
    google_ads: {
      title: "Configuration de Google Ads",
      description: "Google Ads est une plateforme publicitaire qui permet de diffuser des annonces sur Google et son réseau de partenaires.",
      setup: {
        step1: "Créez un compte Google Ads si vous n'en avez pas déjà un",
        step2: "Obtenez votre ID de conversion depuis l'interface Google Ads",
        step3: "Entrez cet ID dans le champ correspondant du panneau d'administration MDMC"
      },
      remarketing: {
        description: "Le remarketing permet de cibler les utilisateurs qui ont déjà visité votre site",
        setup: "Activez l'option de remarketing dans le panneau d'administration MDMC"
      }
    },
    meta_pixel: {
      title: "Configuration du Pixel Meta (Facebook)",
      description: "Le Pixel Meta est un outil d'analyse qui permet de mesurer l'efficacité de vos publicités Facebook et Instagram.",
      setup: {
        step1: "Créez un compte Business Manager si vous n'en avez pas déjà un",
        step2: "Créez un pixel dans le Gestionnaire d'événements",
        step3: "Obtenez votre ID de pixel depuis l'interface Meta",
        step4: "Entrez cet ID dans le champ correspondant du panneau d'administration MDMC"
      },
      events: {
        pageview: "Déclenché automatiquement lors du chargement d'une page (PageView)",
        lead: "Peut être configuré pour suivre les soumissions de formulaire (Lead)",
        purchase: "Peut être configuré pour suivre les achats (Purchase)"
      },
      advanced: {
        capi: "L'API Conversions permet d'envoyer des événements directement depuis le serveur",
        custom_audiences: "Créez des audiences personnalisées basées sur les interactions avec votre site"
      }
    },
    tiktok_pixel: {
      title: "Configuration du Pixel TikTok",
      description: "Le Pixel TikTok est un outil d'analyse qui permet de mesurer l'efficacité de vos publicités TikTok.",
      setup: {
        step1: "Créez un compte TikTok Ads si vous n'en avez pas déjà un",
        step2: "Créez un pixel dans TikTok Ads Manager",
        step3: "Obtenez votre ID de pixel depuis l'interface TikTok",
        step4: "Entrez cet ID dans le champ correspondant du panneau d'administration MDMC"
      },
      events: {
        pageview: "Déclenché automatiquement lors du chargement d'une page",
        click: "Peut être configuré pour suivre les clics sur des éléments importants",
        form: "Peut être configuré pour suivre les soumissions de formulaire"
      }
    }
  },
  wordpress_connector: {
    title: "Connecteur WordPress",
    description: "Le connecteur WordPress permet de synchroniser le contenu de votre blog WordPress avec votre site MDMC.",
    authentication: {
      title: "Authentification",
      description: "Pour connecter votre blog WordPress, vous devez utiliser l'authentification par mot de passe d'application.",
      app_password: {
        description: "Les mots de passe d'application sont des mots de passe spécifiques à une application qui permettent d'accéder à votre site WordPress.",
        step1: "Connectez-vous à votre tableau de bord WordPress",
        step2: "Allez dans Utilisateurs > Votre profil",
        step3: "Faites défiler jusqu'à la section 'Mots de passe d'application'",
        step4: "Entrez un nom pour l'application (ex: 'MDMC Connector')",
        step5: "Cliquez sur 'Ajouter un mot de passe d'application'",
        step6: "Copiez le mot de passe généré et utilisez-le dans le panneau d'administration MDMC"
      }
    },
    configuration: {
      title: "Configuration",
      url: {
        description: "L'URL de votre site WordPress",
        format: "https://votresite.com (sans slash final)"
      },
      username: {
        description: "Votre nom d'utilisateur WordPress",
        note: "Il est recommandé d'utiliser un compte administrateur ou éditeur"
      },
      app_password: {
        description: "Le mot de passe d'application généré dans WordPress",
        note: "Ce mot de passe est stocké de manière sécurisée et n'est jamais partagé"
      }
    },
    synchronization: {
      title: "Synchronisation",
      categories: {
        description: "Vous pouvez choisir quelles catégories d'articles synchroniser",
        note: "Sélectionnez uniquement les catégories pertinentes pour votre site MDMC"
      },
      frequency: {
        description: "Vous pouvez définir la fréquence de synchronisation",
        options: {
          manual: "Synchronisation manuelle uniquement",
          daily: "Synchronisation quotidienne",
          weekly: "Synchronisation hebdomadaire"
        }
      },
      content: {
        description: "Vous pouvez choisir quels éléments de contenu synchroniser",
        options: {
          full_content: "Contenu complet des articles",
          excerpt: "Extraits uniquement",
          featured_image: "Images à la une",
          categories: "Catégories",
          tags: "Tags"
        }
      }
    },
    troubleshooting: {
      title: "Dépannage",
      connection_issues: {
        description: "Problèmes de connexion",
        solutions: {
          check_url: "Vérifiez que l'URL est correcte et accessible",
          check_credentials: "Vérifiez que le nom d'utilisateur et le mot de passe d'application sont corrects",
          check_rest_api: "Vérifiez que l'API REST WordPress est activée sur votre site"
        }
      },
      sync_issues: {
        description: "Problèmes de synchronisation",
        solutions: {
          check_permissions: "Vérifiez que l'utilisateur a les permissions nécessaires",
          check_categories: "Vérifiez que les catégories sélectionnées existent",
          manual_sync: "Essayez une synchronisation manuelle pour voir les erreurs détaillées"
        }
      }
    }
  },
  landing_page_generator: {
    title: "Générateur de Landing Page",
    description: "Le générateur de landing page permet de créer facilement des pages d'atterrissage professionnelles sans avoir à coder.",
    templates: {
      title: "Templates",
      description: "Le générateur propose plusieurs templates optimisés pour l'industrie musicale.",
      types: {
        artist: "Template pour artiste solo",
        band: "Template pour groupe",
        label: "Template pour label",
        event: "Template pour événement",
        release: "Template pour sortie d'album"
      },
      customization: {
        colors: "Vous pouvez personnaliser les couleurs principales et secondaires",
        fonts: "Vous pouvez choisir parmi plusieurs polices de caractères",
        layout: "Vous pouvez ajuster la mise en page selon vos besoins"
      }
    },
    sections: {
      title: "Sections",
      description: "Vous pouvez ajouter, supprimer et réorganiser différentes sections dans votre landing page.",
      types: {
        hero: "Section d'en-tête avec image de fond et appel à l'action",
        features: "Section présentant les caractéristiques principales",
        gallery: "Section galerie d'images",
        testimonials: "Section témoignages",
        bio: "Section biographie",
        discography: "Section discographie",
        events: "Section événements",
        contact: "Section formulaire de contact",
        social: "Section réseaux sociaux"
      },
      management: {
        add: "Cliquez sur 'Ajouter une section' pour ajouter une nouvelle section",
        remove: "Cliquez sur l'icône de suppression pour retirer une section",
        reorder: "Utilisez le glisser-déposer pour réorganiser les sections"
      }
    },
    publishing: {
      title: "Publication",
      description: "Une fois votre landing page créée, vous pouvez la publier en quelques clics.",
      options: {
        preview: "Prévisualisez votre landing page avant de la publier",
        publish: "Publiez votre landing page sur un sous-domaine MDMC",
        custom_domain: "Utilisez un domaine personnalisé (configuration avancée)"
      },
      analytics: {
        description: "Vous pouvez intégrer vos pixels marketing pour suivre les performances de votre landing page",
        setup: "Activez les intégrations souhaitées dans l'onglet 'Intégrations' avant de publier"
      }
    },
    best_practices: {
      title: "Bonnes pratiques",
      description: "Conseils pour créer des landing pages efficaces",
      tips: {
        clear_cta: "Utilisez un appel à l'action clair et visible",
        mobile_first: "Pensez d'abord à l'expérience mobile",
        loading_speed: "Optimisez les images pour améliorer la vitesse de chargement",
        consistent_branding: "Maintenez une identité visuelle cohérente",
        social_proof: "Incluez des témoignages ou des chiffres pour renforcer la crédibilité"
      }
    }
  },
  admin_panel: {
    title: "Panneau d'administration",
    description: "Le panneau d'administration MDMC permet de gérer tous les aspects de votre site.",
    navigation: {
      title: "Navigation",
      description: "Le panneau d'administration est organisé en plusieurs sections accessibles depuis la barre latérale.",
      sidebar: {
        collapse: "Vous pouvez réduire la barre latérale en cliquant sur le bouton de bascule",
        expand: "Vous pouvez développer la barre latérale en cliquant sur le bouton de bascule"
      },
      sections: {
        dashboard: "Vue d'ensemble de votre site",
        reviews: "Gestion des avis clients",
        content: "Gestion du contenu du site",
        media: "Gestion des médias",
        marketing_integrations: "Configuration des intégrations marketing",
        wordpress_connector: "Configuration du connecteur WordPress",
        landing_page_generator: "Création et gestion des landing pages",
        settings: "Paramètres généraux du site"
      }
    },
    reviews_management: {
      title: "Gestion des avis",
      description: "Cette section permet de gérer les avis clients.",
      features: {
        approve: "Approuver les avis avant publication",
        reject: "Rejeter les avis inappropriés",
        generate_link: "Générer des liens pour que les clients puissent soumettre leurs avis"
      }
    },
    content_management: {
      title: "Gestion du contenu",
      description: "Cette section permet de gérer le contenu de votre site.",
      features: {
        edit_sections: "Modifier les différentes sections du site",
        multilingual: "Gérer le contenu dans différentes langues",
        preview: "Prévisualiser les modifications avant publication"
      }
    },
    media_management: {
      title: "Gestion des médias",
      description: "Cette section permet de gérer les médias de votre site.",
      features: {
        upload: "Télécharger des images et vidéos",
        organize: "Organiser les médias en catégories",
        optimize: "Optimiser les images pour le web"
      }
    },
    settings: {
      title: "Paramètres",
      description: "Cette section permet de configurer les paramètres généraux de votre site.",
      options: {
        site_title: "Titre du site",
        admin_email: "Email administrateur",
        default_language: "Langue par défaut",
        security: "Options de sécurité"
      }
    }
  },
  chatbot: {
    title: "Chatbot d'assistance",
    description: "Le chatbot d'assistance MDMC est alimenté par Gemini 2.0 et fournit une aide contextuelle sur toutes les fonctionnalités du panneau d'administration.",
    usage: {
      title: "Utilisation",
      description: "Comment utiliser le chatbot d'assistance",
      open: "Cliquez sur l'icône de chat en bas à droite de l'écran pour ouvrir le chatbot",
      ask: "Posez votre question dans le champ de texte et appuyez sur Entrée",
      suggestions: "Vous pouvez également cliquer sur les suggestions proposées par le chatbot"
    },
    capabilities: {
      title: "Capacités",
      description: "Ce que le chatbot peut faire pour vous",
      answer_questions: "Répondre à vos questions sur toutes les fonctionnalités du panneau d'administration",
      provide_guidance: "Vous guider étape par étape dans la configuration des différentes intégrations",
      troubleshoot: "Vous aider à résoudre les problèmes courants",
      suggest_best_practices: "Vous proposer des bonnes pratiques pour optimiser votre site"
    },
    limitations: {
      title: "Limitations",
      description: "Ce que le chatbot ne peut pas faire",
      technical_issues: "Résoudre des problèmes techniques complexes nécessitant une intervention humaine",
      account_specific: "Accéder à des informations spécifiques à votre compte (sauf celles visibles dans l'interface)",
      future_features: "Connaître les fonctionnalités qui seront ajoutées dans les futures mises à jour"
    }
  }
};

export default documentationData;
