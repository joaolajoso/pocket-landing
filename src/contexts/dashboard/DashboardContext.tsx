
import { createContext, useContext, useState, ReactNode } from "react";
import { DashboardContextType, DashboardProviderProps } from "./types";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useLinkManagement } from "./useLinkManagement";
import { useUserData } from "./useUserData";

// Create the context with a default value
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export function DashboardProvider({ children }: DashboardProviderProps) {
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { userData } = useUserData(profile, user);
  const { 
    links, 
    isLinkEditorOpen, 
    currentEditingLink,
    openLinkEditor,
    closeLinkEditor,
    saveLink,
    deleteLink
  } = useLinkManagement(profile, refreshProfile);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState("overview");

  const refreshData = () => {
    refreshProfile();
  };

  // Provide the context value
  const contextValue: DashboardContextType = {
    links,
    userData,
    activeTab,
    setActiveTab,
    isLinkEditorOpen,
    openLinkEditor,
    closeLinkEditor,
    currentEditingLink,
    saveLink,
    deleteLink,
    refreshData,
    profileLoading
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
