class GoogleTagManagerService {
  constructor() {
    this.gtmIds = ['GTM-PFSK4LJZ', 'GTM-W485T7VB'];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Vérifier que GTM est chargé
    if (window.dataLayer) {
      this.isInitialized = true;
      console.log('🏷️ Google Tag Manager initialisé avec containers:', this.gtmIds);
    }
  }

  // Fonction générique pour envoyer des événements
  sendEvent(eventName, eventData = {}) {
    if (typeof window === 'undefined' || !window.dataLayer) return;

    window.dataLayer.push({
      event: eventName,
      ...eventData
    });

    console.log('🏷️ GTM Event envoyé aux 2 containers:', eventName, eventData);
  }

  // Events spécifiques MDMC Music Ads
  trackSimulatorStart() {
    this.sendEvent('simulator_start', {
      event_category: 'engagement',
      event_label: 'music_campaign_simulator',
      value: 1
    });
  }

  trackSimulatorComplete(formData, results) {
    this.sendEvent('simulator_complete', {
      event_category: 'conversion',
      event_label: 'lead_generation',
      artist_name: formData.artistName,
      platform: formData.platform,
      campaign_type: formData.campaignType,
      country: formData.country,
      budget: parseInt(formData.budget || 0),
      estimated_views: results.views,
      estimated_reach: results.reach,
      value: parseInt(formData.budget || 0)
    });
  }

  trackServicePageView(serviceName) {
    this.sendEvent('service_page_view', {
      event_category: 'page_view',
      event_label: serviceName.toLowerCase().replace(/\s+/g, '_'),
      service_name: serviceName,
      page_title: `Service: ${serviceName}`
    });
  }

  trackContactFormSubmit(formType = 'contact') {
    this.sendEvent('contact_form_submit', {
      event_category: 'conversion',
      event_label: formType,
      form_type: formType,
      value: 1
    });
  }

  trackSmartLinkClick(artistName, trackName, platform) {
    this.sendEvent('smartlink_click', {
      event_category: 'engagement',
      event_label: 'smartlink_interaction',
      artist_name: artistName,
      track_name: trackName,
      platform: platform,
      value: 1
    });
  }

  trackNewsletterSignup() {
    this.sendEvent('newsletter_signup', {
      event_category: 'conversion',
      event_label: 'subscription',
      value: 1
    });
  }

  trackServiceInterest(serviceName, budget = 0) {
    this.sendEvent('service_interest', {
      event_category: 'engagement',
      event_label: 'service_inquiry',
      service_name: serviceName,
      estimated_budget: budget,
      value: budget
    });
  }

  // Event e-commerce pour services
  trackServiceView(serviceName, price = 0) {
    this.sendEvent('view_item', {
      event_category: 'ecommerce',
      currency: 'EUR',
      value: price,
      items: [{
        item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
        item_name: serviceName,
        item_category: 'Music Marketing Service',
        price: price,
        quantity: 1
      }]
    });
  }

  // Tracking scroll et engagement
  trackScrollDepth(percentage) {
    this.sendEvent('scroll_depth', {
      event_category: 'engagement',
      event_label: `scroll_${percentage}`,
      scroll_percentage: percentage,
      value: percentage
    });
  }

  // Tracking temps passé sur page
  trackTimeOnPage(seconds) {
    const minutes = Math.floor(seconds / 60);
    this.sendEvent('time_on_page', {
      event_category: 'engagement',
      event_label: `time_${minutes}min`,
      time_seconds: seconds,
      time_minutes: minutes,
      value: seconds
    });
  }

  // Custom event pour campagnes spécifiques
  trackCampaignEvent(campaignName, action, value = 1) {
    this.sendEvent('campaign_event', {
      event_category: 'campaign',
      event_label: campaignName,
      campaign_name: campaignName,
      campaign_action: action,
      value: value
    });
  }
}

// Instance singleton
const gtm = new GoogleTagManagerService();

export default gtm;