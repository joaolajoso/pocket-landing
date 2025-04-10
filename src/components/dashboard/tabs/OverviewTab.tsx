
import { LinkType } from "@/components/LinkCard";
import WelcomeHeader from "./overview/WelcomeHeader";
import { StatisticsCards } from "./overview/StatisticsCards";
import UserLinks from "./overview/UserLinks";
import QuickActions from "./overview/QuickActions";
import CompletionTasks from "./overview/CompletionTasks";
import ProfileViewStats from "./overview/ProfileViewStats";

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
  onNavigateToTab
}: OverviewTabProps) => {
  const firstName = userData.name.split(' ')[0];

  return (
    <div className="space-y-8">
      <WelcomeHeader firstName={firstName} />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6">
        <StatisticsCards 
          onNavigateToAnalytics={() => onNavigateToTab('analytics')}
        />
      </div>
      
      {/* Profile View Stats */}
      <ProfileViewStats />
      
      {/* Quick Actions & Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UserLinks 
          links={links} 
          onOpenLinkEditor={onOpenLinkEditor} 
          onDeleteLink={onDeleteLink}
          onNavigateToLinksTab={() => onNavigateToTab('links')}
        />
        
        <QuickActions 
          userData={userData} 
          onOpenLinkEditor={() => onOpenLinkEditor()} 
        />
      </div>
      
      {/* Completion Tasks */}
      <CompletionTasks onOpenLinkEditor={() => onOpenLinkEditor()} />
    </div>
  );
};

export default OverviewTab;
