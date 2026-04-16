
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Smartphone, 
  Settings, 
  Users, 
  Building2,
  Calendar,
  Menu,
  X
} from "lucide-react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useNewConnections } from "@/hooks/network/useNewConnections";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, setActiveTab }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { organization } = useOrganization();
  const { newConnectionsCount, hasNewConnections, markNetworkAsViewed } = useNewConnections();

  // Mark network as viewed when user clicks on network tab
  useEffect(() => {
    if (activeTab === 'network') {
      markNetworkAsViewed();
    }
  }, [activeTab, markNetworkAsViewed]);

  const baseMenuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "network", label: "Network", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "appearance", label: "Public Page", icon: Smartphone },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Only add business tab if user is part of an organization
  const menuItems = organization 
    ? [
        ...baseMenuItems.slice(0, 4), // overview, analytics, network, events
        { id: "business", label: "Business", icon: Building2 },
        ...baseMenuItems.slice(4) // appearance, settings
      ]
    : baseMenuItems;

  const handleItemClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="md:hidden bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b">
          <nav className="px-4 py-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const showBadge = item.id === 'network' && hasNewConnections && activeTab !== 'network';
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start relative",
                    activeTab === item.id && "bg-secondary"
                  )}
                  onClick={() => handleItemClick(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                  {showBadge && (
                    <span className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full animate-scale-in">
                      {newConnectionsCount > 99 ? '99+' : newConnectionsCount}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
