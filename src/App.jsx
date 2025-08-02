import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  NavLink
} from 'react-router-dom';

// Import du hook de tracking SEO critique
import usePageTracking from './hooks/usePageTracking';
import useSocialMetaAdaptation from './hooks/useSocialMetaAdaptation';

import './App.css';
import './assets/styles/global.css';
import './assets/styles/animations.css';

import apiService from './services/api.service';
import { updateMetaTags } from './i18n';
import { updateMetaTagsForLanguage } from './utils/multilingualMeta';
import facebookPixel from './services/facebookPixel.service';
import gtm from './services/googleTagManager.service';

import {
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';


import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Simulator from './components/features/Simulator';
import CookieBanner from './components/features/CookieBanner';
import SEOHead from './components/common/SEOHead';

import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import About from './components/sections/About';
import Articles from './components/sections/Articles';
import Reviews from './components/sections/Reviews';
import Contact from './components/sections/Contact';
import AllReviews from './components/pages/AllReviews';
import ArtistPage from './pages/public/ArtistPage';
import SmartLinkPageNew from './pages/public/SmartLinkPageNew';
import SmartLinkPageClean from './pages/public/SmartLinkPageClean';
import SmartLinkPageDoubleTracking from './pages/public/SmartLinkPageDoubleTracking';

// Pages de ressources légales
import FAQ from './pages/public/resources/FAQ';
import Glossaire from './pages/public/resources/Glossaire';
import MentionsLegales from './pages/public/resources/MentionsLegales';
import PolitiqueConfidentialite from './pages/public/resources/PolitiqueConfidentialite';
import ConditionsGenerales from './pages/public/resources/ConditionsGenerales';
import Cookies from './pages/public/resources/Cookies';
import TestPage from './pages/public/resources/TestPage';
import TestContentValidation from './pages/public/resources/TestContentValidation';

// Pages services SEO-optimisées
import YouTubeAdsMusique from './pages/services/YouTubeAdsMusique';
import MetaAdsArtistes from './pages/services/MetaAdsArtistes';
import TikTokPromotionMusicale from './pages/services/TikTokPromotionMusicale';

import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';
import AdminLayout from './components/admin/AdminLayout';
import ArtistListPage from './pages/admin/artists/ArtistListPage';
import ArtistCreatePage from './pages/admin/artists/ArtistCreatePage';
import ArtistEditPage from './pages/admin/artists/ArtistEditPage';
import SmartlinkListPage from './pages/admin/smartlinks/SmartlinkListPage';
import SmartlinkCreatePage from './pages/admin/smartlinks/SmartlinkCreatePage';
import SmartlinkEditPage from './pages/admin/smartlinks/SmartlinkEditPage';
import SmartlinkAnalyticsPage from './pages/admin/smartlinks/SmartlinkAnalyticsPage';
import ShortLinkManager from './components/admin/ShortLinkManager';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({ isLoading: true, isAuthenticated: false, isAdmin: false });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      if (!isMounted) return;
      
      // Bypass d'authentification en développement
      const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
      if (bypassAuth) {
        console.log('🔓 BYPASS_AUTH activé - Accès admin autorisé sans authentification');
        if (isMounted) {
          setAuthStatus({
            isLoading: false,
            isAuthenticated: true,
            isAdmin: true,
          });
        }
        return;
      }
      
      try {
        const response = await apiService.auth.getMe();
        if (response.success && response.data) {
          if (isMounted) {
            setAuthStatus({
              isLoading: false,
              isAuthenticated: true,
              isAdmin: response.data.role === 'admin',
            });
          }
        } else {
          if (isMounted) {
            setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
          }
        }
      } catch {
        if (isMounted) {
          setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
        }
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [location.key]);

  if (authStatus.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Vérification de l'accès...</Typography>
      </Box>
    );
  }

  if (!authStatus.isAuthenticated || !authStatus.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};


const HomePage = ({ openSimulator }) => {
  // 📊 TRACKING CRITIQUE : Virtual pageviews pour homepage
  const { trackFormSubmission, trackEngagement } = usePageTracking(
    "Marketing Musical | YouTube Ads & Meta Ads pour Artistes | MDMC",
    "homepage"
  );

  useEffect(() => { 
    console.log("HomePage rendu avec tracking SEO activé"); 
    
    // Track homepage loaded
    trackEngagement('homepage_loaded');
  }, [trackEngagement]);

  return (
    <>
      <SEOHead 
        title="Marketing Musical | YouTube Ads & Meta Ads pour Artistes | MDMC"
        description="Agence N°1 marketing musical : +500 artistes accompagnés, +50M vues générées. YouTube Ads, Meta Ads, TikTok Pro. Résultats garantis pour artistes et labels. Devis gratuit."
        keywords="promotion musicale professionnelle, marketing musical efficace, publicité YouTube artiste, augmenter streams Spotify, campagne Meta musique, TikTok musical viral, promotion artiste émergent, label marketing digital, boost streams garantis, agence musicale performante"
        url="https://www.mdmcmusicads.com"
        canonicalUrl="https://www.mdmcmusicads.com/"
      />
      <Header />
      <main>
        <Hero openSimulator={openSimulator} />
        <Services />
        <About />
        <Articles />
        <Reviews />
        <Contact trackFormSubmission={trackFormSubmission} />
      </main>
      <Footer openSimulator={openSimulator} />
      <CookieBanner />
    </>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const simulatorRef = useRef(null);
  
  // Adaptation automatique des meta tags pour partage social
  useSocialMetaAdaptation();

  useEffect(() => {
    try {
      updateMetaTags(t);
      const lang = i18n.language.split('-')[0];
      
      // Mise à jour multilingue des meta tags selon la langue du navigateur
      updateMetaTagsForLanguage(lang);
      
      // Initialiser Facebook Pixel
      facebookPixel.init();
      facebookPixel.pageView();
      
      // Initialiser Google Tag Manager
      gtm.init();
    } catch (error) {
      console.warn('Failed to update meta tags:', error);
    }
  }, [t, i18n.language]);

  const openSimulator = () => simulatorRef.current?.openSimulator();

  return (
    <Router>
      <Simulator ref={simulatorRef} />
      <Routes>
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/artists/:slug" element={<ArtistPage />} />
        <Route path="/s/:slug" element={<SmartLinkPageNew />} />
        <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPageClean />} />
        <Route path="/smartlinks-old/:artistSlug/:trackSlug" element={<SmartLinkPageNew />} />
        <Route path="/smartlink-test/:slug" element={<SmartLinkPageDoubleTracking />} />
        
        {/* Routes services SEO-optimisées */}
        <Route path="/services/youtube-ads-musique" element={<YouTubeAdsMusique />} />
        <Route path="/services/meta-ads-artistes" element={<MetaAdsArtistes />} />
        <Route path="/services/tiktok-promotion-musicale" element={<TikTokPromotionMusicale />} />
        
        {/* Routes des pages de ressources légales - SEO optimisées */}
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-contenu" element={<TestContentValidation />} />
        <Route path="/ressources/faq" element={<FAQ />} />
        <Route path="/ressources/glossaire" element={<Glossaire />} />
        <Route path="/ressources/mentions-legales" element={<MentionsLegales />} />
        <Route path="/ressources/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/ressources/conditions-generales" element={<ConditionsGenerales />} />
        <Route path="/ressources/cookies" element={<Cookies />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminPanel />} />
          <Route path="artists" element={<Outlet />}>
            <Route index element={<ArtistListPage />} />
            <Route path="new" element={<ArtistCreatePage />} />
            <Route path="edit/:slug" element={<ArtistEditPage />} />
          </Route>
          <Route path="smartlinks" element={<Outlet />}>
            <Route index element={<SmartlinkListPage />} />
            <Route path="new" element={<SmartlinkCreatePage />} />
            <Route path="edit/:smartlinkId" element={<SmartlinkEditPage />} />
            <Route path="analytics/:id" element={<SmartlinkAnalyticsPage />} />
          </Route>
          <Route path="analytics" element={<SmartlinkAnalyticsPage />} />
          <Route path="shortlinks" element={<ShortLinkManager />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
// Force deployment trigger Mar  8 jul 2025 12:32:40 WEST
