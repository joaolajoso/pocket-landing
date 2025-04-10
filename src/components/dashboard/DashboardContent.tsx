
import { useDashboard } from "@/contexts/DashboardContext";
import OverviewTab from "./tabs/OverviewTab";
import LinksTab from "./tabs/LinksTab";
import NetworkTab from "./tabs/NetworkTab";
import AppearanceTab from "./tabs/AppearanceTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import SettingsTab from "./tabs/SettingsTab";

const DashboardContent = () => {
  const { 
    activeTab, 
    setActiveTab, 
    links, 
    userData, 
    openLinkEditor, 
    deleteLink
  } = useDashboard();

  return (
    <main className="flex-1 py-4 md:py-8 px-4 md:px-8 overflow-auto">
      {activeTab === "overview" && (
        <OverviewTab 
          userData={userData} 
          links={links}
          onOpenLinkEditor={openLinkEditor}
          onDeleteLink={deleteLink}
          onNavigateToTab={setActiveTab}
        />
      )}
      
      {activeTab === "links" && (
        <LinksTab 
          links={links}
          onOpenLinkEditor={openLinkEditor}
          onDeleteLink={deleteLink}
        />
      )}
      
      {activeTab === "network" && (
        <NetworkTab />
      )}
      
      {activeTab === "appearance" && (
        <AppearanceTab 
          userData={userData} 
          links={links}
        />
      )}
      
      {activeTab === "analytics" && (
        <AnalyticsTab />
      )}
      
      {activeTab === "settings" && (
        <SettingsTab 
          userData={userData}
        />
      )}
    </main>
  );
};

export default DashboardContent;
