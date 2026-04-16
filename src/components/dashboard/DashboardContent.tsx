
import { useDashboard } from "@/contexts/dashboard";
import OverviewTab from "./tabs/OverviewTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import NetworkTab from "./tabs/NetworkTab";
import EventsTab from "./tabs/EventsTab";
import BusinessTab from "./tabs/BusinessTab";
import AppearanceTab from "./tabs/AppearanceTab";
import SettingsTab from "./tabs/SettingsTab";
import TipsTab from "./tabs/TipsTab";
import ShopTab from "./tabs/ShopTab";
import QATestsTab from "./tabs/qa/QATestsTab";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DashboardContent = () => {
  const { 
    activeTab, 
    userData, 
    links, 
    openLinkEditor, 
    deleteLink, 
    setActiveTab,
    refreshData,
    networkSubTab
  } = useDashboard();
  const { organization } = useOrganization();
  const isMobile = useIsMobile();

  const swipeTabs = useMemo(() => {
    return ["overview", "network", "events"];
  }, []);

  const swipeHandlers = useSwipeNavigation({
    tabs: swipeTabs,
    activeTab,
    onTabChange: setActiveTab,
  });

  // Convert SectionWithLinks to LinkType array for components that need it
  const flatLinks = links?.flatMap(section => section.links) || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab 
            userData={userData}
            links={flatLinks}
            onOpenLinkEditor={openLinkEditor}
            onDeleteLink={deleteLink}
            onNavigateToTab={setActiveTab}
            onRefreshData={refreshData}
          />
        );
      case "analytics":
        // Analytics tab is only for business users - redirect personal users to overview
        return organization ? <AnalyticsTab /> : (
          <OverviewTab 
            userData={userData}
            links={flatLinks}
            onOpenLinkEditor={openLinkEditor}
            onDeleteLink={deleteLink}
            onNavigateToTab={setActiveTab}
            onRefreshData={refreshData}
          />
        );
      case "network":
        return <NetworkTab initialSubTab={networkSubTab} />;
      case "events":
        return <EventsTab />;
      case "business":
        // Only render business tab if user is part of an organization
        return organization ? <BusinessTab /> : (
          <OverviewTab 
            userData={userData}
            links={flatLinks}
            onOpenLinkEditor={openLinkEditor}
            onDeleteLink={deleteLink}
            onNavigateToTab={setActiveTab}
            onRefreshData={refreshData}
          />
        );
      case "appearance":
        // Redirect to overview — appearance is now merged into My PocketCV
        return (
          <OverviewTab 
            userData={userData}
            links={flatLinks}
            onOpenLinkEditor={openLinkEditor}
            onDeleteLink={deleteLink}
            onNavigateToTab={setActiveTab}
            onRefreshData={refreshData}
          />
        );
      case "settings":
        return <SettingsTab userData={userData} />;
      case "tips":
        return <TipsTab />;
      case "shop":
        return <ShopTab />;
      case "qa-tests":
        return <QATestsTab />;
      default:
        return (
          <OverviewTab 
            userData={userData}
            links={flatLinks}
            onOpenLinkEditor={openLinkEditor}
            onDeleteLink={deleteLink}
            onNavigateToTab={setActiveTab}
            onRefreshData={refreshData}
          />
        );
    }
  };

  const isOverview = activeTab === "overview" || activeTab === "appearance";

  return (
    <div 
      className={`flex-1 w-full max-w-full overflow-x-hidden ${isOverview ? '' : 'p-3 sm:p-4 md:p-6 lg:p-8'}`}
      {...(isMobile ? swipeHandlers : {})}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardContent;
