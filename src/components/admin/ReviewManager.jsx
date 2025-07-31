import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin.css';
import '../../assets/styles/review-manager.css';

const ReviewManager = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([
    {
      id: 1,
      artistName: 'Marie Lambert',
      email: 'marie.lambert@example.com',
      rating: 5,
      comment: "Une équipe professionnelle qui comprend vraiment les besoins des artistes. Leur campagne TikTok a permis à mon single d'atteindre plus de 500 000 vues !",
      date: '27/04/2025',
      status: 'pending'
    },
    {
      id: 2,
      artistName: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      rating: 5,
      comment: "Grâce à MDMC, j'ai pu augmenter ma visibilité de 300% en seulement 2 mois. Leur expertise en YouTube Ads a transformé ma carrière !",
      date: '15/03/2025',
      status: 'approved'
    },
    {
      id: 3,
      artistName: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      rating: 4,
      comment: 'Très bonne expérience avec MDMC. Leur équipe est réactive et les résultats sont au rendez-vous. Je recommande !',
      date: '05/04/2025',
      status: 'approved'
    }
  ]);

  // ... (aucun changement ici – tout ton code reste inchangé)

  // 👇 Remets ici tout le reste de ton fichier inchangé à partir de :
  // const [filter, setFilter] = useState('all');
  // jusqu’à la fin du return()

  // Pour des raisons de lisibilité, je ne duplique pas tout à nouveau.
  // Mais tu peux simplement remplacer **uniquement la constante `reviews`** avec celle ci-dessus,
  // et garder le reste de ton fichier tel quel.
};

export default ReviewManager;
