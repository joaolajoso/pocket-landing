
import { Button } from "@/components/ui/button";
import { BarChart, LayoutDashboard, Link as LinkIcon, Palette, Settings, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, setActiveTab }: MobileNavigationProps) => {
  return (
    <div className="md:hidden sticky top-0 bg-background z-30">
      <Card className="rounded-none border-t-0 border-x-0 shadow-sm">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 py-3 px-3 overflow-x-auto">
            <Button 
              variant={activeTab === "overview" ? "secondary" : "outline"} 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Button>
            
            <Button 
              variant={activeTab === "links" ? "secondary" : "outline"} 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab("links")}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Links
            </Button>
            
            <Button 
              variant={activeTab === "appearance" ? "secondary" : "outline"} 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab("appearance")}
            >
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </Button>
            
            <Button 
              variant={activeTab === "analytics" ? "secondary" : "outline"} 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            
            <Button 
              variant={activeTab === "business" ? "secondary" : "outline"} 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab("business")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Business
            </Button>
            
            <Button 
              variant={activeTab === "settings" ? "secondary" : "outline"} 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default MobileNavigation;
