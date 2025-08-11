import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialiser l'API Gemini avec la clé API
const API_KEY = "AIzaSyDO2mciJoMkhQmamnyP0oELTsuQWsYR4KI";
const genAI = new GoogleGenerativeAI(API_KEY);

// Importer la documentation
import documentation from '../data/documentation.js';
// Créer un contexte riche à partir de la documentation
const createDocumentationContext = () => {
  // Convertir la documentation JSON en texte structuré
  let context = `
Tu es l'assistant virtuel du panneau d'administration MDMC Music Ads, une plateforme de marketing musical.
Tu as accès à la documentation complète du système et tu dois aider les utilisateurs à comprendre et utiliser les fonctionnalités suivantes :

1. Intégrations Marketing : Configuration de Google Analytics, Google Tag Manager, Google Ads, Meta Pixel et TikTok Pixel.
2. Connecteur WordPress : Comment connecter et synchroniser un blog WordPress avec le site MDMC.
3. Générateur de Landing Page : Comment créer, personnaliser et publier des landing pages sans code.
4. Panneau d'administration : Navigation et utilisation des différentes sections.

Voici la documentation complète à laquelle tu peux te référer :
`;

  // Ajouter les informations sur les intégrations marketing
  context += "\n=== INTÉGRATIONS MARKETING ===\n";
  const marketing = documentation.marketing_integrations;
  Object.keys(marketing).forEach(key => {
    const integration = marketing[key];
    context += `\n## ${integration.title} ##\n`;
    context += `${integration.description}\n`;
    
    // Ajouter les étapes de configuration
    if (integration.setup) {
      context += "Configuration :\n";
      Object.keys(integration.setup).forEach(step => {
        context += `- ${integration.setup[step]}\n`;
      });
    }
    
    // Ajouter les informations sur les événements si disponibles
    if (integration.events) {
      context += "Événements :\n";
      Object.keys(integration.events).forEach(event => {
        context += `- ${event}: ${integration.events[event]}\n`;
      });
    }
  });

  // Ajouter les informations sur le connecteur WordPress
  context += "\n=== CONNECTEUR WORDPRESS ===\n";
  const wordpress = documentation.wordpress_connector;
  context += `\n## ${wordpress.title} ##\n`;
  context += `${wordpress.description}\n`;
  
  // Authentification
  context += "\nAuthentification :\n";
  context += `${wordpress.authentication.description}\n`;
  context += "Mots de passe d'application :\n";
  Object.keys(wordpress.authentication.app_password).forEach(key => {
    if (key !== 'description') {
      context += `- ${wordpress.authentication.app_password[key]}\n`;
    }
  });
  
  // Configuration
  context += "\nConfiguration :\n";
  Object.keys(wordpress.configuration).forEach(key => {
    if (key !== 'title') {
      const item = wordpress.configuration[key];
      if (typeof item === 'object') {
        context += `- ${item.description}\n`;
      }
    }
  });
  
  // Synchronisation
  context += "\nSynchronisation :\n";
  Object.keys(wordpress.synchronization).forEach(key => {
    if (key !== 'title') {
      const item = wordpress.synchronization[key];
      if (typeof item === 'object') {
        context += `- ${item.description}\n`;
      }
    }
  });

  // Ajouter les informations sur le générateur de landing page
  context += "\n=== GÉNÉRATEUR DE LANDING PAGE ===\n";
  const landingPage = documentation.landing_page_generator;
  context += `\n## ${landingPage.title} ##\n`;
  context += `${landingPage.description}\n`;
  
  // Templates
  context += "\nTemplates :\n";
  context += `${landingPage.templates.description}\n`;
  context += "Types de templates :\n";
  Object.keys(landingPage.templates.types).forEach(key => {
    context += `- ${key}: ${landingPage.templates.types[key]}\n`;
  });
  
  // Sections
  context += "\nSections :\n";
  context += `${landingPage.sections.description}\n`;
  context += "Types de sections :\n";
  Object.keys(landingPage.sections.types).forEach(key => {
    context += `- ${key}: ${landingPage.sections.types[key]}\n`;
  });
  
  // Publication
  context += "\nPublication :\n";
  context += `${landingPage.publishing.description}\n`;
  Object.keys(landingPage.publishing.options).forEach(key => {
    context += `- ${landingPage.publishing.options[key]}\n`;
  });

  // Ajouter les informations sur le panneau d'administration
  context += "\n=== PANNEAU D'ADMINISTRATION ===\n";
  const adminPanel = documentation.admin_panel;
  context += `\n## ${adminPanel.title} ##\n`;
  context += `${adminPanel.description}\n`;
  
  // Navigation
  context += "\nNavigation :\n";
  context += `${adminPanel.navigation.description}\n`;
  context += "Sections :\n";
  Object.keys(adminPanel.navigation.sections).forEach(key => {
    context += `- ${key}: ${adminPanel.navigation.sections[key]}\n`;
  });

  // Ajouter les informations sur le chatbot
  context += "\n=== CHATBOT D'ASSISTANCE ===\n";
  const chatbot = documentation.chatbot;
  context += `\n## ${chatbot.title} ##\n`;
  context += `${chatbot.description}\n`;
  
  // Utilisation
  context += "\nUtilisation :\n";
  Object.keys(chatbot.usage).forEach(key => {
    if (key !== 'title' && key !== 'description') {
      context += `- ${chatbot.usage[key]}\n`;
    }
  });
  
  // Capacités
  context += "\nCapacités :\n";
  Object.keys(chatbot.capabilities).forEach(key => {
    if (key !== 'title' && key !== 'description') {
      context += `- ${chatbot.capabilities[key]}\n`;
    }
  });

  context += `\nRéponds de manière concise, professionnelle et utile. Si tu ne connais pas la réponse à une question spécifique,
suggère de contacter le support MDMC.`;

  return context;
};

// Générer le contexte à partir de la documentation
const MDMC_CONTEXT = createDocumentationContext();

// Modèle Gemini à utiliser
const MODEL_NAME = "gemini-2.0-flash";

/**
 * Service pour communiquer avec l'API Gemini
 */
const GeminiService = {
  /**
   * Obtenir une réponse de Gemini
   * @param {string} userMessage - Message de l'utilisateur
   * @param {Array} chatHistory - Historique de la conversation
   * @returns {Promise<string>} - Réponse de Gemini
   */
  async getResponse(userMessage, chatHistory = []) {
    try {
      // Obtenir le modèle
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      // Préparer l'historique de chat pour l'API
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      // Créer une nouvelle conversation avec le contexte
      const chat = model.startChat({
        history: [
          {
            role: "model",
            parts: [{ text: MDMC_CONTEXT }]
          },
          ...formattedHistory
        ],
      });
      
      // Envoyer le message et obtenir la réponse
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error("Erreur lors de la communication avec Gemini:", error);
      return "Désolé, je rencontre des difficultés à me connecter. Veuillez réessayer ou contacter le support MDMC si le problème persiste.";
    }
  },
  
  /**
   * Obtenir des suggestions basées sur un sujet
   * @param {string} topic - Sujet pour lequel obtenir des suggestions
   * @returns {Promise<Array<string>>} - Liste de suggestions
   */
  async getSuggestions(topic) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      const prompt = `En tant qu'assistant du panneau d'administration MDMC Music Ads, génère 3 questions courtes (moins de 8 mots chacune) 
      que les utilisateurs pourraient poser sur le sujet: "${topic}". 
      Réponds uniquement avec les 3 questions, séparées par des points-virgules, sans numérotation ni autre texte.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Diviser la réponse en suggestions individuelles
      const suggestions = response.text().split(';').map(s => s.trim()).filter(s => s);
      
      // Limiter à 3 suggestions maximum
      return suggestions.slice(0, 3);
    } catch (error) {
      console.error("Erreur lors de la génération de suggestions:", error);
      return ["Comment configurer cette fonctionnalité ?", "Résoudre un problème courant", "Meilleures pratiques"];
    }
  }
};

export default GeminiService;
