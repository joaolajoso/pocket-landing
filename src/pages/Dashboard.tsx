import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import LinkEditor from "@/components/LinkEditor";
import Footer from "@/components/Footer";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileNavigation from "@/components/dashboard/MobileNavigation";
import { useNewConnections } from "@/hooks/network/useNewConnections";

import DashboardContent from "@/components/dashboard/DashboardContent";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  LayoutDashboard, 
  BarChart3, 
  Smartphone, 
  Settings, 
  Users, 
  Building2,
  Calendar,
  Info,
  ShoppingCart,
  Target,
  MessageCircle
} from "lucide-react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { InvitationNotificationPopup } from "@/components/organization/InvitationNotificationPopup";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { ProfileModeProvider } from "@/contexts/ProfileModeContext";
import { QA_EMAILS } from "@/components/dashboard/tabs/qa/testDefinitions";
import { FlaskConical } from "lucide-react";
import { useUserActiveEventParticipation, setLastFocusEvent } from "@/hooks/useUserActiveEventParticipation";
import { motion } from "framer-motion";
import EventMessenger from "@/components/event-public/messenger/EventMessenger";

// Main Dashboard component
const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  // Only block on actual auth loading, no artificial delay
  if (loading) {
    return null; // Brief flash avoided by dark bg on root
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProfileModeProvider>
      <DashboardProvider>
        <DashboardInner />
      </DashboardProvider>
    </ProfileModeProvider>
  );
};

// Re-export the shared dock for use in this file
import MobileBottomDock from '@/components/shared/MobileBottomDock';
const MobileBottomNavigation = MobileBottomDock;
// Then access the context inside this component
const DashboardInner = () => {
  const { 
    userData, 
    isLinkEditorOpen, 
    closeLinkEditor, 
    saveLink, 
    currentEditingLink,
    activeTab,
    setActiveTab,
    profileLoading,
    links,
    sidebarCollapsed
  } = useDashboard();
  const location = useLocation();

  // Handle tab navigation from other pages (e.g. focus mode dock)
  useEffect(() => {
    const state = location.state as { tab?: string } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Check if the user has reached the maximum number of links (5)
  const hasReachedMaxLinks = links && links.length >= 5 && !currentEditingLink;

  // Show shell with skeleton content instead of blocking loader
  if (profileLoading) {
    return (
      <>
        <div className="min-h-screen flex bg-background">
          <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} userData={null} />
          <div className={cn(
            "flex flex-col flex-1 w-full transition-all duration-300",
            sidebarCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-80"
          )}>
            <DashboardHeader userData={null} />
            <div className="flex-1 p-4 md:p-6 space-y-4 pb-20 md:pb-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
              <div className="h-64 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
          <MobileBottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </>
    );
  }

  return (
    <>
      <InvitationNotificationPopup />
      <div className="min-h-screen flex bg-background">
        {/* Responsive sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} userData={userData} />
        
        {/* Main content area with responsive margins */}
        <div className={cn(
          "flex flex-col flex-1 w-full transition-all duration-300",
          sidebarCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-80"
        )}>
          {/* Header - always visible but different styles for mobile vs desktop */}
          <DashboardHeader userData={userData} />
          
          <div className="flex-1 overflow-x-hidden overflow-y-auto pb-20 md:pb-4 pt-14 md:pt-0">
            <DashboardContent />
          </div>
          
          {activeTab === 'settings' && <Footer />}
        </div>
        
        {/* Mobile Bottom Navigation - fixed at bottom */}
        <MobileBottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <LinkEditor 
          isOpen={isLinkEditorOpen} 
          onClose={closeLinkEditor}
          onSave={saveLink}
          editingLink={currentEditingLink}
          maxLinksReached={hasReachedMaxLinks}
        />
      </div>
    </>
  );
};

export default Dashboard;
