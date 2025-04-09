
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Link2, Palette, BarChart2, Settings, UserPlus, MenuIcon } from "lucide-react";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  // Navigation items including the new network tab
  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "links", label: "Links", icon: <Link2 className="h-5 w-5" /> },
    { id: "network", label: "My Network", icon: <UserPlus className="h-5 w-5" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="hidden md:block w-64 border-r bg-background p-6 pt-0 shrink-0">
      <div className="flex h-16 items-center border-b">
        <MenuIcon className="h-6 w-6" />
        <span className="font-medium ml-2">Dashboard</span>
      </div>
      
      <nav className="flex flex-col gap-1 mt-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
