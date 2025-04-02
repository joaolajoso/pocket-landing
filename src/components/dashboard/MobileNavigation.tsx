
import { Button } from "@/components/ui/button";
import { BarChart, LayoutDashboard, Link as LinkIcon, Palette, Settings, Building2 } from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, setActiveTab }: MobileNavigationProps) => {
  return (
    <div className="md:hidden border-b sticky top-16 bg-background z-30">
      <ScrollArea className="px-4">
        <div className="flex items-center gap-4 py-2">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
          
          <Button 
            variant={activeTab === "links" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setActiveTab("links")}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Links
          </Button>
          
          <Button 
            variant={activeTab === "appearance" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setActiveTab("appearance")}
          >
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </Button>
          
          <Button 
            variant={activeTab === "analytics" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          
          <Button 
            variant={activeTab === "business" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setActiveTab("business")}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Business
          </Button>
          
          <Button 
            variant={activeTab === "settings" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

// Helper component for mobile scroll area
const ScrollArea = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`overflow-auto flex w-full ${className || ''}`}>
      {children}
    </div>
  );
};

export default MobileNavigation;
