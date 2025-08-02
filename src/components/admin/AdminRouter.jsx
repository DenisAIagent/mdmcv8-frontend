import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages admin avec chemins corrects
const AdminSettings = React.lazy(() => import('../../pages/admin/AdminSettingsPage.jsx'));
const ArtistList = React.lazy(() => import('../../pages/admin/artists/ArtistListPage.jsx'));
const ArtistCreate = React.lazy(() => import('../../pages/admin/artists/ArtistCreatePage.jsx'));
const ArtistEdit = React.lazy(() => import('../../pages/admin/artists/ArtistEditPage.jsx'));
const SmartlinkList = React.lazy(() => import('../../pages/admin/smartlinks/SmartlinkListPage.jsx'));
const SmartlinkCreate = React.lazy(() => import('../../pages/admin/smartlinks/SmartlinkCreatePage.jsx'));
const SmartlinkEdit = React.lazy(() => import('../../pages/admin/smartlinks/SmartlinkEditPage.jsx'));
const SmartlinkAnalytics = React.lazy(() => import('../../pages/admin/smartlinks/SmartlinkAnalyticsPage.jsx'));
const ShortLinkManager = React.lazy(() => import('./ShortLinkManager.jsx'));

// Nouveaux dashboards optimisés
const DashboardTestPage = React.lazy(() => import('../../pages/admin/DashboardTestPage.jsx'));
const OptimizedDashboard = React.lazy(() => import('../../dashboard/layouts/DashboardLayout.jsx'));

// Composant Dashboard simple par défaut
const AdminDashboard = () => (
  <div>
    <h2>Dashboard Admin</h2>
    <p>Bienvenue dans l'interface d'administration MDMC.</p>
    <p>Utilisez le menu à gauche pour naviguer.</p>
  </div>
);

const AdminRouter = () => {
  return (
    <Routes>
      {/* Redirection par défaut vers dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={<OptimizedDashboard />} />
      
      {/* Page de test du dashboard */}
      <Route path="/dashboard-test" element={<DashboardTestPage />} />
      
      {/* Dashboard legacy (backup) */}
      <Route path="/dashboard-legacy" element={<AdminDashboard />} />
      
      {/* Routes artistes */}
      <Route path="/artists" element={<ArtistList />} />
      <Route path="/artists/new" element={<ArtistCreate />} />
      <Route path="/artists/edit/:id" element={<ArtistEdit />} />
      
      {/* Routes SmartLinks */}
      <Route path="/smartlinks" element={<SmartlinkList />} />
      <Route path="/smartlinks/new" element={<SmartlinkCreate />} />
      <Route path="/smartlinks/edit/:id" element={<SmartlinkEdit />} />
      <Route path="/smartlinks/analytics/:id" element={<SmartlinkAnalytics />} />
      
      {/* Routes ShortLinks */}
      <Route path="/shortlinks" element={<ShortLinkManager />} />
      
      {/* Paramètres */}
      <Route path="/settings" element={<AdminSettings />} />
      
      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRouter;