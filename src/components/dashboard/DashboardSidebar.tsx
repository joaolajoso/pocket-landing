
import { Button } from "@/components/ui/button";
import { BarChart, LayoutDashboard, Link as LinkIcon, Palette, QrCode, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { getProfileUrl } from "@/integrations/supabase/client";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();

  const handleCopyProfileLink = () => {
    if (!profile?.slug) {
      toast({
        title: "Username not set",
        description: "Please set a username in your profile settings first",
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(profile.slug);
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copied",
      description: "Your profile link has been copied to clipboard",
    });
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r flex-col">
      <div className="py-6 px-4 flex-1">
        <nav className="space-y-1">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "ghost"} 
            className="w-full justify-start mb-1"
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
          
          <Button 
            variant={activeTab === "links" ? "secondary" : "ghost"} 
            className="w-full justify-start mb-1"
            onClick={() => setActiveTab("links")}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Links
          </Button>
          
          <Button 
            variant={activeTab === "appearance" ? "secondary" : "ghost"} 
            className="w-full justify-start mb-1"
            onClick={() => setActiveTab("appearance")}
          >
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </Button>
          
          <Button 
            variant={activeTab === "analytics" ? "secondary" : "ghost"} 
            className="w-full justify-start mb-1"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          
          <Button 
            variant={activeTab === "settings" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <div className="bg-secondary/80 rounded-md p-4 text-center">
          <QrCode className="h-6 w-6 mx-auto mb-2 text-primary" />
          <h4 className="text-sm font-medium">Share your profile</h4>
          <p className="text-xs text-muted-foreground mb-3">Scan or share your PocketCV</p>
          <Button size="sm" className="w-full" onClick={handleCopyProfileLink}>
            Copy Link
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
