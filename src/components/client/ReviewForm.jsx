import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/review-form.css';

// Composant pour le formulaire de soumission d'avis client
const ReviewForm = ({ token }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer le changement de note
  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.artistName.trim()) {
      setError('Le nom de l\'artiste est requis');
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Une adresse email valide est requise');
      return;
    }
    
    if (!formData.comment.trim()) {
      setError('Un commentaire est requis');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans une version réelle, cela enverrait les données à une API
      console.log('Avis soumis:', {
        ...formData,
        token,
        date: new Date().toISOString()
      });
      
      // Marquer comme soumis
      setIsSubmitted(true);
    } catch (error) {
      setError('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Afficher un message de succès après la soumission
  if (isSubmitted) {
    return (
      <div className="review-form-container">
        <div className="review-success">
          <i className="success-icon">✓</i>
          <h2>Merci pour votre avis !</h2>
          <p>Votre avis a été soumis avec succès et sera examiné par notre équipe.</p>
          <a href="/" className="back-button">Retour au site</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h1>Partagez votre expérience avec MDMC</h1>
        <p>Votre avis est important pour nous et aide d'autres artistes à faire leur choix.</p>
      </div>
      
      {error && <div className="review-form-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="artistName">Nom de l'artiste ou du label *</label>
          <input
            type="text"
            id="artistName"
            name="artistName"
            value={formData.artistName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-group">
          <p className="rating-label">Note *</p>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star}
                className={star <= formData.rating ? 'star active' : 'star'}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Votre avis *</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            rows="5"
            placeholder="Partagez votre expérience avec nos services..."
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className={`submit-button ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading-spinner"></span>
          ) : (
            'Soumettre votre avis'
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
