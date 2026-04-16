
import { useState } from "react";
import { DashboardContextType } from "../types";
import { useProfileData } from "@/hooks/profile/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { useLinkManagement } from "../useLinkManagement";
import { useUserData } from "../useUserData";
import { useProfileMode } from "@/hooks/useProfileMode";

/**
 * Consolidated hook for managing dashboard state
 * Combines user data, profile data, links, and tabs
 */
export const useDashboardState = (): DashboardContextType => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Early return if not authenticated to prevent unnecessary hooks
  const shouldFetchData = isAuthenticated && user && !authLoading;
  
  // Only proceed with data fetching if user is authenticated
  const { profile, loading: profileLoading, refreshProfile } = useProfileData();
  const { userData } = useUserData(profile, user);
  
  // Use our refactored link management hook only when user is available
  const { 
    links, 
    isLinkEditorOpen, 
    currentEditingLink,
    currentSectionId,
    openLinkEditor,
    closeLinkEditor,
    saveLink,
    deleteLink
  } = useLinkManagement(shouldFetchData ? profile : null, refreshProfile);
  
  // Profile mode (personal vs business)
  const { 
    currentMode: profileMode, 
    setCurrentMode: setProfileMode,
    hasBusinessProfile
  } = useProfileMode();
  
  // Tab state management
  const [activeTab, setActiveTabState] = useState("overview");
  const [networkSubTab, setNetworkSubTab] = useState<string | undefined>(undefined);
  
  const setActiveTab = (tab: string, subTab?: string) => {
    setActiveTabState(tab);
    if (tab === 'network' && subTab) {
      setNetworkSubTab(subTab);
    } else if (tab !== 'network') {
      setNetworkSubTab(undefined);
    }
  };
  
  // Sidebar collapse state management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const refreshData = () => {
    if (shouldFetchData) {
      refreshProfile();
    }
  };

  // Provide the context value - reduce loading time by not waiting for all data
  return {
    links: shouldFetchData ? links : [],
    userData,
    activeTab,
    setActiveTab,
    networkSubTab,
    isLinkEditorOpen,
    openLinkEditor,
    closeLinkEditor,
    currentEditingLink,
    currentSectionId,
    saveLink,
    deleteLink,
    refreshData,
    profileLoading: authLoading || (shouldFetchData && profileLoading),
    sidebarCollapsed,
    setSidebarCollapsed,
    // Profile mode
    profileMode,
    setProfileMode,
    hasBusinessProfile
  };
};
