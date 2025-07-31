import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy loading des composants avec extensions explicites
const HomePage = React.lazy(() => import('../../pages/HomePage.jsx'));
const AdminLayout = React.lazy(() => import('../../pages/admin/AdminLayout.jsx'));
const AdminLogin = React.lazy(() => import('../../pages/admin/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('../../pages/admin/AdminDashboard.jsx'));
const ArtistPage = React.lazy(() => import('../../pages/ArtistPage.jsx'));
const SmartLinkPage = React.lazy(() => import('../../pages/SmartLinkPage.jsx'));
const AllReviews = React.lazy(() => import('../../pages/AllReviews.jsx'));

// ... reste du code inchangé ... 