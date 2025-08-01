import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy loading des composants avec chemins corrects
const HomePage = React.lazy(() => import('../../pages/HomePage.jsx')); // Chemin corrigé
const AdminLayout = React.lazy(() => import('../admin/AdminLayout.jsx')); // Chemin corrigé
const AdminLogin = React.lazy(() => import('../admin/AdminLogin.jsx')); // Chemin corrigé
const ArtistPage = React.lazy(() => import('../../pages/public/ArtistPage.jsx')); // Chemin corrigé
const SmartLinkPage = React.lazy(() => import('../../pages/public/SmartLinkPage.jsx')); // Chemin corrigé
const ShortLinkPage = React.lazy(() => import('../../pages/public/ShortLinkPage.jsx'));
const AllReviews = React.lazy(() => import('../pages/AllReviews.jsx')); // Chemin corrigé

const AppRouter = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/artistes/:artistSlug" element={<ArtistPage />} />
      <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPage />} />
      
      {/* Route ShortLink - NOUVELLE */}
      <Route path="/s/:shortCode" element={<ShortLinkPage />} />
      
      <Route path="/avis" element={<AllReviews />} />
      
      {/* Routes admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
  );
};

export default AppRouter; 