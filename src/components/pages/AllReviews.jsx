import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../../assets/styles/all-reviews.css';

const AllReviews = () => {
  const { t } = useTranslation();
  
  // Données d'exemple pour les avis clients
  // Dans une version réelle, ces données viendraient d'une API ou d'une base de données
  const reviews = [
    {
      id: 1,
      name: "Jean Dupont",
      role: "Artiste indépendant",
      avatar: "/src/assets/images/avatars/avatar-1.jpg",
      rating: 5,
      text: "Grâce à MDMC, j'ai pu augmenter ma visibilité de 300% en seulement 2 mois. Leur expertise en YouTube Ads a transformé ma carrière !",
      date: "15/03/2025"
    },
    {
      id: 2,
      name: "Studio Mélodie",
      role: "Label indépendant",
      avatar: "/src/assets/images/avatars/avatar-2.jpg",
      rating: 5,
      text: "Nous travaillons avec MDMC depuis plus d'un an et les résultats sont exceptionnels. Leur approche stratégique et leur connaissance du marché musical font toute la différence.",
      date: "02/04/2025"
    },
    {
      id: 3,
      name: "Marie Lambert",
      role: "Chanteuse",
      avatar: "/src/assets/images/avatars/avatar-3.jpg",
      rating: 4,
      text: "Une équipe professionnelle qui comprend vraiment les besoins des artistes. Leur campagne TikTok a permis à mon single d'atteindre plus de 500 000 vues !",
      date: "22/03/2025"
    },
    {
      id: 4,
      name: "Thomas Martin",
      role: "Producteur",
      avatar: "/src/assets/images/avatars/avatar-4.jpg",
      rating: 5,
      text: "MDMC a complètement transformé notre approche marketing. Leur expertise en Meta Ads nous a permis d'atteindre une audience beaucoup plus large et plus engagée.",
      date: "05/04/2025"
    },
    {
      id: 5,
      name: "Electro Records",
      role: "Label électronique",
      avatar: "/src/assets/images/avatars/avatar-5.jpg",
      rating: 5,
      text: "Nous avons confié notre stratégie digitale à MDMC et les résultats ont dépassé nos attentes. Leur connaissance du marché de la musique électronique est impressionnante.",
      date: "10/04/2025"
    },
    {
      id: 6,
      name: "Sophie Dubois",
      role: "Artiste pop",
      avatar: "/src/assets/images/avatars/avatar-6.jpg",
      rating: 4,
      text: "J'ai vu mes streams augmenter de 250% après seulement un mois de campagne avec MDMC. Leur équipe est réactive et vraiment à l'écoute des besoins des artistes.",
      date: "18/03/2025"
    }
  ];
  
  // Fonction pour générer les étoiles en fonction de la note
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };
  
  return (
    <div className="all-reviews-page">
      <div className="container">
        <Link to="/" className="back-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 8H1M1 8L8 15M1 8L8 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('footer.nav_home')}
        </Link>
        
        <h1 className="section-title">{t('reviews.title')}</h1>
        <p className="section-subtitle">{t('reviews.subtitle')}</p>
        
        <div className="all-reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card-full">
              <div className="review-header">
                <div className="review-avatar">
                  <img src={review.avatar} alt={`Avatar de ${review.name}`} />
                </div>
                <div className="review-info">
                  <h3 className="review-name">{review.name}</h3>
                  <p className="review-role">{review.role}</p>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <div className="review-content">
                <p className="review-text">"{review.text}"</p>
                <p className="review-date">{review.date}</p>
                <span className="verified-badge">{t('reviews.verified_client')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllReviews;
