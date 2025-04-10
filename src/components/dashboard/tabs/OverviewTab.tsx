
import { useState } from "react";
import WelcomeHeader from "./overview/WelcomeHeader";
import StatisticsCards from "./overview/StatisticsCards";
import ProfileViewStats from "./overview/ProfileViewStats";
import QuickActions from "./overview/QuickActions";
import UserLinks from "./overview/UserLinks";
import CompletionTasks from "./overview/CompletionTasks";
import { UserProfileForm } from "./overview/UserProfileForm";
import { LinkType } from "@/components/LinkCard";

interface OverviewTabProps {
  userData: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  };
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string) => void;
  onDeleteLink: (linkId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

const OverviewTab = ({
  userData,
  links,
  onOpenLinkEditor,
  onDeleteLink,
  onNavigateToTab,
}: OverviewTabProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleNavigateToAnalytics = () => {
    onNavigateToTab("analytics");
  };

  const handleNavigateToLinksTab = () => {
    onNavigateToTab("links");
  };

  return (
    <div className="space-y-6">
      <WelcomeHeader firstName={userData.name?.split(' ')[0] || ''} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatisticsCards />
          
          <ProfileViewStats onNavigateToAnalytics={handleNavigateToAnalytics} />
          
          <UserLinks 
            links={links} 
            onNavigateToLinksTab={handleNavigateToLinksTab}
            onOpenLinkEditor={onOpenLinkEditor}
            onDeleteLink={onDeleteLink}
          />
        </div>
        
        <div className="space-y-6">
          <QuickActions 
            userData={userData}
            onEditProfile={() => setIsFormVisible(true)} 
            onOpenLinkEditor={() => onOpenLinkEditor()}
          />
          
          <CompletionTasks 
            onEditProfile={() => setIsFormVisible(true)}
            onOpenLinkEditor={() => onOpenLinkEditor()}
          />
        </div>
      </div>
      
      {isFormVisible && (
        <UserProfileForm 
          userData={userData}
          onClose={() => setIsFormVisible(false)}
        />
      )}
    </div>
  );
};

export default OverviewTab;
