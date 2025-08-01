import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy loading des composants avec extensions explicites
const HomePage = React.lazy(() => import('../../pages/HomePage.jsx'));
const AdminLayout = React.lazy(() => import('../../pages/admin/AdminLayout.jsx'));
const AdminLogin = React.lazy(() => import('../../pages/admin/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('../../pages/admin/AdminDashboard.jsx'));
const ArtistPage = React.lazy(() => import('../../pages/ArtistPage.jsx'));
const SmartLinkPage = React.lazy(() => import('../../pages/SmartLinkPage.jsx'));
const ShortLinkPage = React.lazy(() => import('../../pages/public/ShortLinkPage.jsx'));
const AllReviews = React.lazy(() => import('../../pages/AllReviews.jsx'));

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