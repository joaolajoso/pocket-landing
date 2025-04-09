
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import Preview from "./pages/Preview";
import BusinessPreview from "./pages/BusinessPreview";
import UserProfile from "./pages/UserProfile";

// Scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
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
                    <Preview />
                  </ProtectedRoute>
                } />
                <Route path="/business-preview" element={
                  <ProtectedRoute>
                    <BusinessPreview />
                  </ProtectedRoute>
                } />
                <Route path="/u/:username" element={<UserProfile />} />
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
