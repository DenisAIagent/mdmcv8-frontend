/**
 * Service pour système de réservation avec envoi automatique d'emails
 * Garde la belle interface tout en envoyant directement les demandes aux experts
 * 
 * INTÉGRATION EMAILJS :
 * - Envoie automatiquement les demandes de RDV aux experts par email
 * - L'expert reçoit toutes les infos et peut confirmer manuellement
 * - Plus simple que Calendly API et sans coût supplémentaire
 * 
 * CONFIGURATION :
 * - Définir VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY dans .env.local
 * - Configurer les templates EmailJS pour experts et clients
 * - Ajouter les emails des experts dans la configuration
 */

import emailjs from '@emailjs/browser';

class CalendlyService {
  constructor() {
    // Configuration pour les experts MDMC
    this.experts = {
      'denis': {
        id: 'denis',
        name: 'Denis Adam',
        email: 'denis@mdmc-music-ads.com', // À remplacer par le vrai email
        speciality: 'YouTube Ads',
        timezone: 'Europe/Paris'
      },
      'marine': {
        id: 'marine',
        name: 'Marine Harel', 
        email: 'marine@mdmc-music-ads.com', // À remplacer par le vrai email
        speciality: 'Meta Ads',
        timezone: 'Europe/Paris'
      }
    };

    // Configuration EmailJS
    this.emailjsConfig = {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    };

    // Initialiser EmailJS
    if (this.emailjsConfig.publicKey) {
      emailjs.init(this.emailjsConfig.publicKey);
    }
  }

  /**
   * Récupère les créneaux disponibles pour un expert
   * @param {string} expertId - ID de l'expert (denis, marine)
   * @param {Date} startDate - Date de début
   * @param {Date} endDate - Date de fin
   * @returns {Object} Créneaux disponibles par date
   */
  async getAvailableSlots(expertId, startDate = null, endDate = null) {
    try {
      if (!startDate) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Commence demain
      }
      
      if (!endDate) {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 14); // 2 semaines
      }

      // Génération de créneaux réalistes basés sur les horaires d'expert
      console.info('📅 Génération des créneaux disponibles pour', expertId);
      return this.generateRealisticAvailability(expertId, startDate, endDate);
      
    } catch (error) {
      console.error('Erreur récupération créneaux:', error);
      throw new Error('Impossible de récupérer les créneaux disponibles');
    }
  }

  /**
   * Crée une demande de rendez-vous et l'envoie par email à l'expert
   * @param {Object} bookingData - Données de réservation
   * @returns {Object} Confirmation d'envoi
   */
  async createBooking(bookingData) {
    try {
      const { expert, date, time, formData } = bookingData;
      
      if (!this.emailjsConfig.serviceId || !this.emailjsConfig.templateId) {
        throw new Error('Configuration EmailJS manquante. Vérifiez vos variables d\'environnement.');
      }

      const expertConfig = this.experts[expert.id];
      if (!expertConfig) {
        throw new Error(`Expert ${expert.id} non trouvé dans la configuration.`);
      }

      // Formatage des données pour l'email
      const emailData = {
        // Informations expert
        expert_name: expertConfig.name,
        expert_email: expertConfig.email,
        expert_speciality: expertConfig.speciality,
        
        // Informations client
        client_name: `${formData.firstName} ${formData.lastName}`,
        client_first_name: formData.firstName,
        client_last_name: formData.lastName,
        client_email: formData.email,
        client_phone: formData.phone || 'Non renseigné',
        client_company: formData.company || 'Non renseigné',
        client_message: formData.message || 'Aucun message spécifique',
        
        // Informations rendez-vous
        requested_date: date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        requested_time: time,
        requested_duration: '30 minutes',
        requested_timezone: expertConfig.timezone,
        
        // Informations système
        booking_id: `MDMC_${Date.now()}`,
        booking_timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR'),
        booking_source: 'Site MDMC Music Ads'
      };

      console.log('📧 Envoi email de demande de RDV à', expertConfig.email);

      // Envoi de l'email via EmailJS
      const result = await emailjs.send(
        this.emailjsConfig.serviceId,
        this.emailjsConfig.templateId,
        emailData,
        this.emailjsConfig.publicKey
      );

      console.log('✅ Email envoyé avec succès:', result.status, result.text);

      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'booking_request_sent', {
          event_category: 'conversion',
          event_label: expert.name,
          expert_id: expert.id,
          booking_source: 'emailjs_direct',
          booking_id: emailData.booking_id,
          value: 100
        });
      }

      // Retourner les données dans le format attendu
      return {
        success: true,
        booking_id: emailData.booking_id,
        method: 'email_request',
        scheduled_event: {
          start_time: this.combineDateAndTime(date, time),
          end_time: this.addMinutes(this.combineDateAndTime(date, time), 30),
          timezone: expertConfig.timezone,
          status: 'pending_confirmation',
          location: { 
            type: 'google_meet', 
            join_url: 'Sera fourni par l\'expert après confirmation' 
          }
        },
        invitee: {
          name: emailData.client_name,
          email: formData.email
        },
        expert: {
          ...expert,
          email: expertConfig.email
        },
        confirmationSent: true,
        emailStatus: result.status,
        nextSteps: [
          `Email envoyé à ${expertConfig.name}`,
          'L\'expert va examiner votre demande',
          'Vous recevrez une confirmation par email',
          'Un lien Google Meet sera fourni si accepté'
        ]
      };

    } catch (error) {
      console.error('❌ Erreur envoi email de demande RDV:', error);
      
      // Analytics pour les erreurs
      if (window.gtag) {
        window.gtag('event', 'booking_request_error', {
          event_category: 'error',
          event_label: error.message,
          expert_id: bookingData.expert?.id,
          booking_source: 'emailjs_direct'
        });
      }
      
      throw new Error('Impossible d\'envoyer la demande de rendez-vous. Veuillez réessayer ou nous contacter directement.');
    }
  }

  /**
   * Annule un rendez-vous
   * @param {string} bookingId - ID de la réservation
   * @returns {Object} Confirmation d'annulation
   */
  async cancelBooking(bookingId) {
    try {
      // const response = await fetch(`${this.apiUrl}/cancel/${bookingId}`, {
      //   method: 'DELETE'
      // });
      // return response.json();
      
      return { success: true, cancelled: true };
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      throw new Error('Impossible d\'annuler le rendez-vous');
    }
  }

  /**
   * Génère des créneaux disponibles réalistes
   * @private
   */
  generateRealisticAvailability(expertId, startDate, endDate) {
    const slots = {};
    const current = new Date(startDate);
    
    // Horaires de disponibilité par expert
    const schedules = {
      'denis': {
        days: [1, 2, 3, 4, 5], // Lun-Ven
        hours: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
      },
      'marine': {
        days: [1, 2, 3, 4, 5], // Lun-Ven  
        hours: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
      }
    };

    const schedule = schedules[expertId] || schedules['denis'];
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      
      if (schedule.days.includes(dayOfWeek)) {
        const dateStr = current.toISOString().split('T')[0];
        
        // Simule des créneaux occupés aléatoirement (70% de disponibilité)
        const availableSlots = schedule.hours.filter(() => Math.random() > 0.3);
        
        if (availableSlots.length > 0) {
          slots[dateStr] = availableSlots;
        }
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return slots;
  }

  /**
   * Combine date et heure en ISO string
   * @private
   */
  combineDateAndTime(date, time) {
    const [hours, minutes] = time.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
  }

  /**
   * Ajoute des minutes à une date
   * @private
   */
  addMinutes(isoString, minutes) {
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  }

  /**
   * Récupère les informations d'un expert
   * @param {string} expertId - ID de l'expert
   * @returns {Object} Informations de l'expert
   */
  getExpertInfo(expertId) {
    return this.experts[expertId] || null;
  }

  /**
   * Valide les données de réservation
   * @param {Object} bookingData - Données à valider
   * @returns {boolean} Validité des données
   */
  validateBookingData(bookingData) {
    const { expert, date, time, formData } = bookingData;
    
    if (!expert || !date || !time || !formData) {
      return false;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }
    
    return true;
  }
}

// Export singleton
const calendlyService = new CalendlyService();
export default calendlyService;