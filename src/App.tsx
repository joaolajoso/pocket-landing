
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";

import Onboarding from "./pages/Onboarding";
import CompanyProfile from "./pages/CompanyProfile";
import BusinessEmployeeProfile from "./pages/BusinessEmployeeProfile";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import Business from "./pages/Business";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost1 from "./pages/BlogPost1";
import BlogPost2 from "./pages/BlogPost2";
import BlogPost3 from "./pages/BlogPost3";
import BlogPost4 from "./pages/BlogPost4";

import Developers from "./pages/Developers";
import Pricing from "./pages/Pricing";
import SoloPricing from "./pages/SoloPricing";
import EventsLanding from "./pages/EventsLanding";
import Shop from "./pages/Shop";
import NFCCardStandard from "./pages/shop/NFCCardStandard";
import NFCCardCustom from "./pages/shop/NFCCardCustom";
import Checkout from "./pages/shop/Checkout";
import OrderConfirmation from "./pages/shop/OrderConfirmation";
import NotFound from "./pages/NotFound";
import EventDashboard from "./pages/EventDashboard";
import EventPublicPage from "./pages/EventPublicPage";
import EventLandingPage from "./pages/EventLandingPage";
import EventRecapPage from "./pages/EventRecapPage";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import JoinOrganization from "./pages/JoinOrganization";
import StandInviteOnboarding from "./pages/StandInviteOnboarding";

import BusinessDashboard from "./pages/BusinessDashboard";
import CreateEvent from "./pages/CreateEvent";
import EventsHub from "./pages/EventsHub";
import EventsTeam from "./pages/EventsTeam";

// Business mockup pages (for UX/UI refinement)
import BusinessMockupProducts from "./pages/mockups/BusinessMockupProducts";
import BusinessMockupServices from "./pages/mockups/BusinessMockupServices";
import BusinessMockupProfessional from "./pages/mockups/BusinessMockupProfessional";

import OnboardingSetup from "./pages/OnboardingSetup";
import SEOSitemap from "./components/SEOSitemap";
import SEORobots from "./components/SEORobots";
import { ErrorBoundary } from "./components/ErrorBoundary";
import SubdomainRouter from "./components/SubdomainRouter";
import { ScrollToTop } from "./components/ScrollToTop";
import { OAuthTokenCleaner } from "./components/OAuthTokenCleaner";


const queryClient = new QueryClient();

import OptimizedNavigationHandler from "./components/OptimizedNavigationHandler";
import PWAStartRedirect from "./components/PWAStartRedirect";
import { usePWAInstallPrevention } from "./hooks/usePWAInstallPrevention";
import { LightModeWrapper } from "./components/LightModeWrapper";

// Component to handle authenticated user redirects and PWA launches
const AuthenticatedHome = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Check if this is a recovery flow (tokens with type=recovery in hash)
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.substring(1));
  const isRecoveryFlow = hashParams.get('type') === 'recovery';
  
  // Robust PWA detection (works on iOS and Android)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  if (loading) {
    return null; // Minimal loading for faster perceived performance
  }
  
  // CRITICAL: If recovery flow, redirect to login page with hash preserved
  if (isRecoveryFlow && hash.includes('access_token')) {
    return <Navigate to={`/login?type=recovery${hash}`} replace />;
  }
  
  // If authenticated and NOT in PWA mode, redirect to dashboard immediately
  if (isAuthenticated && !isPWA) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <>
      <OptimizedNavigationHandler />
      <PWAStartRedirect />
      {!isAuthenticated && <Index />}
    </>
  );
};

// Global PWA install prevention component
const PWAInstallManager = () => {
  usePWAInstallPrevention();
  return null;
};

const App = () => {
  return (
    <>
      <OAuthTokenCleaner />
      <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
              <ScrollToTop />
              <PWAInstallManager />
              <SEOSitemap />
              <SEORobots />
              <SubdomainRouter>
              <Routes>
                <Route path="/" element={<AuthenticatedHome />} />
                <Route path="/login" element={<LightModeWrapper><Login /></LightModeWrapper>} />
                <Route path="/forbusinesses" element={<LightModeWrapper><Business /></LightModeWrapper>} />
                <Route path="/onboarding/:linkId?" element={<LightModeWrapper><Onboarding /></LightModeWrapper>} />
                <Route path="/contact" element={<LightModeWrapper><Contact /></LightModeWrapper>} />
                <Route path="/about" element={<LightModeWrapper><AboutUs /></LightModeWrapper>} />
                <Route path="/terms" element={<LightModeWrapper><Terms /></LightModeWrapper>} />
                <Route path="/privacy" element={<LightModeWrapper><Privacy /></LightModeWrapper>} />
                <Route path="/cookies" element={<LightModeWrapper><Cookies /></LightModeWrapper>} />
                <Route path="/support" element={<LightModeWrapper><Support /></LightModeWrapper>} />
                <Route path="/faq" element={<LightModeWrapper><FAQ /></LightModeWrapper>} />
                <Route path="/blog" element={<LightModeWrapper><Blog /></LightModeWrapper>} />
                <Route path="/blog/boost-networking-with-nfc" element={<LightModeWrapper><BlogPost1 /></LightModeWrapper>} />
                <Route path="/blog/digital-business-cards-guide" element={<LightModeWrapper><BlogPost2 /></LightModeWrapper>} />
                <Route path="/blog/modern-networking-strategies" element={<LightModeWrapper><BlogPost3 /></LightModeWrapper>} />
                <Route path="/blog/follow-up-leads-pos-evento" element={<LightModeWrapper><BlogPost4 /></LightModeWrapper>} />
                <Route path="/developers" element={<LightModeWrapper><Developers /></LightModeWrapper>} />
                <Route path="/pricing" element={<LightModeWrapper><Pricing /></LightModeWrapper>} />
                <Route path="/pricing/solo" element={<LightModeWrapper><SoloPricing /></LightModeWrapper>} />
                <Route path="/shop" element={<LightModeWrapper><Shop /></LightModeWrapper>} />
                <Route path="/shop/nfc-card-standard" element={<LightModeWrapper><NFCCardStandard /></LightModeWrapper>} />
                <Route path="/shop/nfc-card-custom" element={<LightModeWrapper><NFCCardCustom /></LightModeWrapper>} />
                <Route path="/shop/checkout" element={<LightModeWrapper><Checkout /></LightModeWrapper>} />
                <Route path="/shop/order-confirmation" element={<LightModeWrapper><OrderConfirmation /></LightModeWrapper>} />
                <Route 
                  path="/onboarding-setup" 
                  element={
                    <ProtectedRoute>
                      <OnboardingSetup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/business/*" 
                  element={
                    <ProtectedRoute>
                      <BusinessDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/eventspocketcv" element={<EventsLanding />} />
                <Route path="/events" element={
                  <ProtectedRoute>
                    <EventsHub />
                  </ProtectedRoute>
                } />
                <Route path="/events/create" element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                } />
                <Route path="/events/team" element={
                  <ProtectedRoute>
                    <EventsTeam />
                  </ProtectedRoute>
                } />
                <Route path="/join/:token" element={<LightModeWrapper><JoinOrganization /></LightModeWrapper>} />
                <Route path="/events/stand-invite/:linkId" element={<StandInviteOnboarding />} />
                <Route path="/events/stand-invite" element={<StandInviteOnboarding />} />
                <Route path="/events/:eventId" element={<EventLandingPage />} />
                <Route path="/events/:eventId/app" element={<EventPublicPage />} />
                <Route path="/events/:eventId/recap" element={
                  <ProtectedRoute>
                    <EventRecapPage />
                  </ProtectedRoute>
                } />
                <Route 
                  path="/events/:eventId/dashboard" 
                  element={
                    <ProtectedRoute>
                      <EventDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/audit-logs" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminAuditLogs />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route path="/u/:username" element={<LightModeWrapper><UserProfile /></LightModeWrapper>} />
                <Route path="/c/:subdomain" element={<LightModeWrapper><CompanyProfile /></LightModeWrapper>} />
                <Route path="/c/:subdomain/:memberSlug" element={<LightModeWrapper><BusinessEmployeeProfile /></LightModeWrapper>} />
                
                {/* Business mockup pages for UX/UI refinement */}
                <Route path="/bmockup/produtos" element={<BusinessMockupProducts />} />
                <Route path="/bmockup/servicos" element={<BusinessMockupServices />} />
                <Route path="/bmockup/profissional" element={<BusinessMockupProfessional />} />
                
                <Route path="/pauloreis" element={<Navigate to="/u/pauloreis" replace />} />
                <Route path="/404" element={<LightModeWrapper><NotFound /></LightModeWrapper>} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              
              </SubdomainRouter>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
    </>
  );
};

export default App;
