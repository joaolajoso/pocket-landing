
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfileExample from "./pages/ProfileExample";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BusinessPreview from "./pages/BusinessPreview";
import UserProfile from "./pages/UserProfile";
import { useProfile } from "./hooks/useProfile";
import { Loader2 } from "lucide-react";

// Scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Redirect to public profile page
const PreviewRedirect = () => {
  const { profile, loading } = useProfile();
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirecting to your profile...</p>
      </div>
    );
  }
  
  if (profile?.slug) {
    return <Navigate to={`/u/${profile.slug}`} replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <Helmet
                titleTemplate="%s | PocketCV"
                defaultTitle="PocketCV - Create your online professional profile"
              >
                <meta name="description" content="PocketCV is a simple way to create a professional online profile to share with recruiters, clients, and connections." />
                <meta property="og:title" content="PocketCV - Your professional online presence" />
                <meta property="og:description" content="Create a professional online profile to share with recruiters, clients, and connections." />
                <meta property="og:image" content="/og-image.png" />
                <meta property="og:url" content="https://pocketcv.pt" />
                <meta property="og:type" content="website" />
              </Helmet>
              <ScrollToTop />
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/example" element={<ProfileExample />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/preview" element={
                  <ProtectedRoute>
                    <PreviewRedirect />
                  </ProtectedRoute>
                } />
                <Route path="/business-preview" element={
                  <ProtectedRoute>
                    <BusinessPreview />
                  </ProtectedRoute>
                } />
                {/* Standardized URL format for user profiles */}
                <Route path="/u/:username" element={<UserProfile />} />
                {/* Legacy format for backward compatibility, but will redirect to /u/:username */}
                <Route path="/:username" element={<UserProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
