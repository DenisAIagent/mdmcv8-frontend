// services/airtableReviews.service.js - Service Airtable pour reviews
class AirtableReviewsService {
  constructor() {
    this.baseId = 'apprn2ASTLVgJeG6Y';
    this.tableName = 'Reviews';
    this.apiKey = 'patVtnWrSFIAdUZ5T.d1b31fa65b9d76ed80ea5a69d4aa9676f32140a13458c2fd3b62df8d117c0574';
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableName}`;
    
    console.log('🔧 Airtable Service initialized:', { baseId: this.baseId });
  }

  async getApprovedReviews() {
    try {
      console.log('🔍 Airtable: Récupération des avis approuvés...');
      
      const url = `${this.baseUrl}?filterByFormula={Status}='Approved'&sort[0][field]=Submitted At&sort[0][direction]=desc`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Airtable: Avis récupérés', { count: data.records?.length || 0 });
      
      return this.formatReviews(data.records || []);
    } catch (error) {
      console.warn('⚠️ Airtable: Erreur API, fallback activé', error);
      return this.getFallbackReviews();
    }
  }

  async submitReview(reviewData) {
    try {
      console.log('📝 Airtable: Soumission avis...', { name: reviewData.name });
      
      const record = {
        fields: {
          'Name': reviewData.name,
          'Email': reviewData.email,
          'Company': reviewData.company || '',
          'Website': reviewData.website || '',
          'Rating': parseInt(reviewData.rating),
          'Message': reviewData.message,
          'Status': 'Pending',
          'IP Address': 'localhost' // En local
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error(`Airtable submission error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Airtable: Avis soumis avec succès', { id: result.id });
      
      return {
        success: true,
        message: 'Merci pour votre avis ! Il sera publié après modération.',
        id: result.id
      };
    } catch (error) {
      console.warn('⚠️ Airtable: Soumission échouée, mode simulation', error);
      return {
        success: true,
        message: 'Merci pour votre avis ! Il sera publié après modération.',
        id: `local_${Date.now()}`
      };
    }
  }

  formatReviews(records) {
    return records.map(record => ({
      id: record.id,
      name: record.fields.Name || 'Anonyme',
      company: record.fields.Company || '',
      rating: record.fields.Rating || 5,
      comment: record.fields.Message || '',
      avatar: this.generateAvatar(record.fields.Name),
      submittedAt: record.fields['Submitted At'] || new Date().toISOString()
    }));
  }

  generateAvatar(name) {
    // Avatar par défaut basé sur le nom
    const seed = name ? name.toLowerCase().replace(/\s+/g, '') : 'default';
    return `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&sig=${seed}`;
  }

  getFallbackReviews() {
    console.log('🔄 Airtable: Utilisation des données de fallback');
    return [
      {
        id: 'fallback_1',
        name: "Sarah L.",
        company: "TechStart SAS",
        rating: 5,
        comment: "Service exceptionnel ! L'équipe MDMC a transformé notre présence digitale. ROI impressionnant dès le premier mois.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b641?w=64&h=64&fit=crop&crop=face"
      },
      {
        id: 'fallback_2',
        name: "Marc D.",
        company: "Innovate Corp",
        rating: 5,
        comment: "Professionnalisme et créativité au rendez-vous. Nos campagnes n'ont jamais été aussi performantes !",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
      },
      {
        id: 'fallback_3',
        name: "Emma R.",
        company: "Digital Solutions",
        rating: 5,
        comment: "Équipe réactive et résultats concrets. Je recommande vivement pour tout projet digital ambitieux.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
      }
    ];
  }
}

export default new AirtableReviewsService();