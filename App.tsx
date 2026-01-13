
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, Home, Search, BookOpen, Building2, User as UserIcon, LogIn, ShieldAlert, Map, Facebook, Instagram, Shield, Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import { api } from './services/api';
import Logo from './components/Logo';
import { Analytics } from '@vercel/analytics/react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';
import { Clarity } from './components/Clarity';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages imports
import HomePage from './pages/Home';
import PetListPage from './pages/PetList';
import PetDetailPage from './pages/PetDetailPage';
import ShelterDashboard from './pages/ShelterDashboard';
import ShelterDetailPage from './pages/ShelterDetail';
import ShelterListPage from './pages/ShelterList';
import BlogPage from './pages/Blog';
import BlogDetailPage from './pages/BlogDetail';
import SupportPage from './pages/Support';
import UserProfilePage from './pages/UserProfile';
import AuthPage from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import AdoptionAssistant from './components/AdoptionAssistant';
import GDPRConsent from './components/GDPRConsent';
import ScrollToTop from './components/ScrollToTop';
import SmartMatch from './pages/SmartMatch';







const AuthListener: React.FC = () => {
  const { isRecoveringPassword } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isRecoveringPassword) {
      navigate('/auth?mode=update-password');
    }
  }, [isRecoveringPassword, navigate]);

  return null;
};

const RedirectListener: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check for query params on the main URL (before the hash)
    // This handles redirects like https://labkanadeje.sk/?pet_redirect=123
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('pet_redirect');

    if (petId) {
      console.log("Redirecting to pet:", petId);
      // Navigate to the pet detail page inside the HashRouter
      navigate(`/pets/${petId}`);

      // Clean up the URL (remove query param)
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }
  }, [navigate]);

  return null;
};

import InternalMedical from './pages/internal/InternalMedical';
import InternalAdoptions from './pages/internal/InternalAdoptions';
import AdoptionDetail from './pages/internal/AdoptionDetail';
import InternalDocuments from './pages/internal/InternalDocuments';
import InternalSettings from './pages/internal/InternalSettings';
import InternalRootRedirect from './components/internal/InternalRootRedirect';
import InternalLayout from './components/internal/InternalLayout';
import InternalDashboard from './pages/internal/InternalDashboard';
import InternalPetList from './pages/internal/InternalPetList';
import InternalPetDetail from './pages/internal/InternalPetDetail';

// Public Routes Component (Existing App Logic)
const PublicRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <AuthListener />
      <RedirectListener />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pets" element={<PetListPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />
          <Route path="/shelter" element={<ShelterDashboard />} />
          <Route path="/shelters" element={<ShelterListPage />} />
          <Route path="/shelters/:id" element={<ShelterDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/match" element={<SmartMatch />} />
        </Routes>
      </main>
      <Footer />
      <AdoptionAssistant />
      <GDPRConsent />
    </div>
  );
};

// Internal Routes Component (New System)
const InternalRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InternalRootRedirect />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/:shelterSlug" element={<InternalLayout />}>
        <Route index element={<InternalDashboard />} />
        <Route path="pets" element={<InternalPetList />} />
        <Route path="pets/:id" element={<InternalPetDetail />} />
        <Route path="medical" element={<InternalMedical />} />
        <Route path="adoptions" element={<InternalAdoptions />} />
        <Route path="adoptions/:id" element={<AdoptionDetail />} />
        <Route path="documents" element={<InternalDocuments />} />

        {/* Placeholder routes until implemented */}
        <Route path="settings" element={<InternalSettings />} />
      </Route>
      {/* Fallback for root or bad paths on internal subdomain */}
      <Route path="*" element={<div className="p-8 text-center text-gray-500">Vyberte útulok alebo sa prihláste.</div>} />
    </Routes>
  );
};

const App: React.FC = () => {
  // Simple subdomain check
  const isInternal = window.location.hostname.startsWith('intern.');

  return (
    <Router>
      <ScrollToTop />
      {isInternal ? <InternalRoutes /> : <PublicRoutes />}
      <Analytics />
      <Clarity />
    </Router>
  );
};

export default App;
