
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LinkEditor from "@/components/LinkEditor";
import Footer from "@/components/Footer";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileNavigation from "@/components/dashboard/MobileNavigation";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { Loader2 } from "lucide-react";

const DashboardInner = () => {
  const { 
    userData, 
    isLinkEditorOpen, 
    closeLinkEditor, 
    saveLink, 
    currentEditingLink,
    activeTab,
    setActiveTab,
    profileLoading
  } = useDashboard();

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader userData={userData} />
      
      <div className="flex flex-1 relative">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex flex-col flex-1">
          <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <DashboardContent />
        </div>
      </div>
      
      <LinkEditor 
        isOpen={isLinkEditorOpen} 
        onClose={closeLinkEditor}
        onSave={saveLink}
        editingLink={currentEditingLink}
      />
      
      <Footer />
    </div>
  );
};

// Wrap the inner component with the Dashboard Provider
const Dashboard = () => {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
};

export default Dashboard;
