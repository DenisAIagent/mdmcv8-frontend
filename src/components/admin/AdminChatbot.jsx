// src/components/admin/AdminChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin-chatbot.css'; // Assure-toi que ce chemin est correct
import GeminiService from '../../services/geminiService'; // Assure-toi que ce chemin est correct

const AdminChatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Ajoute un message de bienvenue et des suggestions initiales au chargement
  useEffect(() => {
    const initChat = async () => {
      addBotMessage(t('admin.chatbot.welcome_message', 'Bonjour ! Comment puis-je vous aider ?'));
      try {
        // Attendre un court instant avant de charger les suggestions pour ne pas surcharger l'init
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const initialSuggestions = await GeminiService.getSuggestions('fonctionnalités MDMC');
        if (initialSuggestions && initialSuggestions.length > 0) {
          addBotMessage(t('admin.chatbot.help_prompt', 'Voici quelques sujets sur lesquels je peux vous aider :'), initialSuggestions);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération des suggestions initiales du chatbot:", e);
        // On pourrait ajouter un message d'erreur spécifique si les suggestions ne chargent pas
      }
    };
    initChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]); // Dépendance 't' pour la traduction

  // Fait défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Met le focus sur l'input lorsque le chatbot est ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Ajoute un message à la liste des messages
  const addMessage = (text, sender, suggestions = []) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { id: Date.now() + Math.random(), text, sender, suggestions } // Utilise un ID plus unique
    ]);
  };

  // Raccourci pour ajouter un message du bot
  const addBotMessage = (text, suggestions = []) => {
    addMessage(text, 'bot', suggestions);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Fonction pour traiter le message de l'utilisateur (tapé ou cliqué depuis une suggestion)
  const processUserMessage = async (messageText) => {
    if (messageText.trim() === '') return;

    addMessage(messageText, 'user'); // Ajoute le message de l'utilisateur
    if(inputValue !== '') setInputValue(''); // Vide l'input seulement si le message vient de l'input
    setIsTyping(true); // Active l'indicateur de frappe du bot

    try {
      // 'messages' est passé pour donner du contexte au service Gemini si besoin
      const botResponseText = await GeminiService.sendMessage(messageText, messages);
      addBotMessage(botResponseText);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message au chatbot via GeminiService:", error);
      addBotMessage(t('admin.chatbot.error_message', "Désolé, une erreur s'est produite lors de la communication."));
    } finally {
      setIsTyping(false); // Désactive l'indicateur de frappe
    }
  };

  // Gère la soumission du formulaire (quand l'utilisateur appuie sur Entrée ou clique sur Envoyer)
  const handleSubmit = async (e) => {
    e.preventDefault();
    processUserMessage(inputValue);
  };

  // Gère le clic sur un bouton de suggestion
  const handleSuggestionClick = (suggestion) => {
    processUserMessage(suggestion); // Traite la suggestion comme un message utilisateur
  };

  return (
    <div className="admin-chatbot">
      <button
        className="chatbot-toggle"
        onClick={toggleChatbot}
        aria-label={isOpen ? t('admin.chatbot.close', 'Fermer l\'assistant') : t('admin.chatbot.open', 'Ouvrir l\'assistant')}
        aria-expanded={isOpen}
      >
        {/* Remplacer par une vraie icône SVG ou composant Icône */}
        {isOpen ? <span>&times;</span> : <span>💬</span>}
      </button>

      {isOpen && (
        <div className="chatbot-container" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
          <div className="chatbot-header">
            <h3 id="chatbot-title" className="chatbot-title-text">
              {t('admin.chatbot.title', 'Assistant MDMC')}
            </h3>
            <button className="chatbot-close-button" onClick={toggleChatbot} aria-label={t('admin.chatbot.close', 'Fermer')}>
              &times;
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-bubble">
                  {typeof msg.text === 'string' ? msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  )) : String(msg.text)}
                </div>
                {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="suggestions">
                    {msg.suggestions.map((suggestion, sIndex) => (
                      <button
                        key={sIndex}
                        className="suggestion-button"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chatbot-input-field"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={t('admin.chatbot.input_placeholder', 'Posez votre question...')}
              ref={inputRef}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="chatbot-send-button"
              aria-label={t('admin.chatbot.send', 'Envoyer')}
              disabled={!inputValue.trim() || isTyping}
            >
              {/* Remplacer par une vraie icône SVG Envoyer */}
              <span>&gt;</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}; // Cette accolade fermante est la ligne 347 (environ) qui était pointée par l'erreur.

export default AdminChatbot;
