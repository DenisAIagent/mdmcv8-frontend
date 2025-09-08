class NewsletterService {
  constructor() {
    // Utiliser l'URL locale en développement, sinon l'API externe
    this.baseURL = window.location.origin;
  }

  async subscribe(email, source = 'Instagram Links Page') {
    try {
      console.log('📧 Newsletter Service: Inscription en cours...', { email, source });
      
      const response = await fetch(`${this.baseURL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          source,
          attributes: {
            SOURCE: source,
            DATE_INSCRIPTION: new Date().toISOString()
          }
        })
      });

      const responseData = await response.json().catch(() => null);
      
      if (response.ok) {
        console.log('✅ Newsletter Service: Inscription réussie', responseData);
        return { 
          success: true, 
          message: responseData?.message || 'Inscription réussie' 
        };
      } else if (response.status === 400 && responseData?.code === 'duplicate_contact') {
        // L'email existe déjà dans la liste
        console.log('ℹ️ Newsletter Service: Email déjà inscrit');
        return { 
          success: true, 
          message: 'Vous êtes déjà inscrit(e) à notre newsletter' 
        };
      } else {
        console.error('❌ Newsletter Service: Erreur inscription', response.status, responseData);
        return { 
          success: false, 
          message: responseData?.message || 'Une erreur est survenue' 
        };
      }
    } catch (error) {
      console.error('❌ Newsletter Service: Erreur réseau', error);
      
      // Fallback: essayer directement l'API Brevo si le backend n'est pas disponible
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('🔄 Newsletter Service: Tentative avec API Brevo directe...');
        return this.subscribeDirectToBrevo(email, source);
      }
      
      return { 
        success: false, 
        message: 'Erreur de connexion. Veuillez réessayer.' 
      };
    }
  }

  async subscribeDirectToBrevo(email, source) {
    // Fallback direct vers Brevo (nécessite la clé API dans l'environnement)
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Newsletter Service: Clé API Brevo manquante');
      return { 
        success: false, 
        message: 'Configuration manquante. Contactez l\'administrateur.' 
      };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          listIds: [2],
          attributes: {
            SOURCE: source,
            DATE_INSCRIPTION: new Date().toISOString()
          },
          updateEnabled: true
        }),
      });

      if (response.ok || response.status === 400) {
        return { success: true, message: 'Inscription réussie' };
      } else {
        return { success: false, message: 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      console.error('❌ Newsletter Service: Erreur Brevo direct', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
}

export default new NewsletterService();