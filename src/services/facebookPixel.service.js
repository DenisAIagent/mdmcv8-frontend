import ReactPixel from 'react-facebook-pixel';

class FacebookPixelService {
  constructor() {
    this.pixelId = '2004441327053045';
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    const options = {
      autoConfig: true,
      debug: import.meta.env.NODE_ENV === 'development',
    };

    ReactPixel.init(this.pixelId, undefined, options);
    this.isInitialized = true;
    
    console.log('🎯 Meta Pixel initialisé:', this.pixelId);
  }

  pageView() {
    if (!this.isInitialized) this.init();
    ReactPixel.pageView();
    console.log('📄 Meta Pixel - PageView tracked');
  }

  // Events personnalisés pour MDMC Music Ads
  trackSimulatorStart() {
    if (!this.isInitialized) this.init();
    ReactPixel.track('InitiateCheckout', {
      content_name: 'Music Campaign Simulator',
      content_category: 'Marketing Tool'
    });
    console.log('🎵 Meta Pixel - Simulator Started');
  }

  trackSimulatorComplete(formData, results) {
    if (!this.isInitialized) this.init();
    ReactPixel.track('Lead', {
      content_name: 'Campaign Simulation Completed',
      content_category: 'Lead Generation',
      value: parseFloat(formData.budget || 0),
      currency: 'EUR',
      custom_data: {
        platform: formData.platform,
        campaign_type: formData.campaignType,
        country: formData.country,
        estimated_views: results.views,
        artist_name: formData.artistName
      }
    });
    console.log('✅ Meta Pixel - Lead tracked:', formData.artistName);
  }

  trackServicePageView(serviceName) {
    if (!this.isInitialized) this.init();
    ReactPixel.track('ViewContent', {
      content_name: `Service: ${serviceName}`,
      content_category: 'Service Page',
      content_type: 'service'
    });
    console.log('🎯 Meta Pixel - Service viewed:', serviceName);
  }

  trackContactFormSubmit() {
    if (!this.isInitialized) this.init();
    ReactPixel.track('Contact', {
      content_name: 'Contact Form Submission',
      content_category: 'Contact'
    });
    console.log('📧 Meta Pixel - Contact form submitted');
  }

  trackSmartLinkClick(artistName, trackName) {
    if (!this.isInitialized) this.init();
    ReactPixel.track('ViewContent', {
      content_name: `SmartLink: ${trackName}`,
      content_category: 'SmartLink',
      content_type: 'music_link',
      custom_data: {
        artist_name: artistName,
        track_name: trackName
      }
    });
    console.log('🔗 Meta Pixel - SmartLink clicked:', `${artistName} - ${trackName}`);
  }

  // Events e-commerce (si vous vendez des services)
  trackServiceInterest(serviceName, value = 0) {
    if (!this.isInitialized) this.init();
    ReactPixel.track('AddToCart', {
      content_name: serviceName,
      content_category: 'Music Marketing Service',
      content_type: 'service',
      value: value,
      currency: 'EUR'
    });
    console.log('🛒 Meta Pixel - Service interest:', serviceName);
  }

  // Custom event pour newsletter
  trackNewsletterSignup() {
    if (!this.isInitialized) this.init();
    ReactPixel.track('Subscribe', {
      content_name: 'Newsletter Signup',
      content_category: 'Subscription'
    });
    console.log('📬 Meta Pixel - Newsletter signup');
  }
}

// Instance singleton
const facebookPixel = new FacebookPixelService();

export default facebookPixel;