
import { cn } from "@/lib/utils";
import { LayoutDashboard, Link2, Palette, BarChart2, Settings, UserPlus } from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, setActiveTab }: MobileNavigationProps) => {
  // Navigation items including the new network tab
  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "links", label: "Links", icon: <Link2 className="h-5 w-5" /> },
    { id: "network", label: "Network", icon: <UserPlus className="h-5 w-5" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="md:hidden overflow-x-auto flex border-b">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-4 py-3 text-xs flex-1 transition-colors",
            activeTab === item.id
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground border-b-2 border-transparent"
          )}
          onClick={() => setActiveTab(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default MobileNavigation;
