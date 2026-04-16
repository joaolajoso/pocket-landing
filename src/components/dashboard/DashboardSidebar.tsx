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
  Bell,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Info,
  ShoppingCart,
  FlaskConical
} from "lucide-react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useEventNotifications } from "@/hooks/useEventNotifications";
import { useNewConnections } from "@/hooks/network/useNewConnections";
import NotificationsSidebar from "./NotificationsSidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboard } from "@/contexts/dashboard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/contexts/ThemeContext";
import pocketcvLogoBlack from "@/assets/pocketcv-logo-black.png";
import pocketcvLogoWhite from "@/assets/pocketcv-logo-white.png";
import { QA_EMAILS } from "./tabs/qa/testDefinitions";
import ModeSwitcher from "./ModeSwitcher";


interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userData?: any;
}

const DashboardSidebar = ({ activeTab, setActiveTab, userData }: DashboardSidebarProps) => {
  const { organization, userRole } = useOrganization();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { totalNotifications, markAsRead } = useNotifications();
  const { totalEventNotifications } = useEventNotifications();
  const combinedNotifications = totalNotifications + totalEventNotifications;
  const { newConnectionsCount, hasNewConnections, markNetworkAsViewed } = useNewConnections();
  const { signOut, user } = useAuth();
  const { setActiveTab: setDashboardTab, sidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Mark network as viewed when user clicks on network tab
  useEffect(() => {
    if (activeTab === 'network') {
      markNetworkAsViewed();
    }
  }, [activeTab, markNetworkAsViewed]);
  
  // Core menu items for solo users
  const baseMenuItems = [
    { id: "overview", label: t.navigation.overview, icon: LayoutDashboard },
    { id: "network", label: t.navigation.network, icon: Users },
    { id: "events", label: t.navigation.events, icon: Calendar },
  ];
  
  const isQAUser = user?.email && QA_EMAILS.includes(user.email);
  
  const extraMenuItems = [
    { id: "tips", label: t.navigation.tips, icon: Info },
    { id: "shop", label: t.navigation.shop, icon: ShoppingCart },
    ...(isQAUser ? [{ id: "qa-tests", label: "QA Tests", icon: FlaskConical }] : []),
  ];

  // Organization users get same base items (no business tab - it's a separate page now)
  const mainMenuItems = organization 
    ? [
        { id: "overview", label: t.navigation.overview, icon: LayoutDashboard },
        { id: "network", label: t.navigation.network, icon: Users },
        { id: "events", label: t.navigation.events, icon: Calendar },
      ]
    : baseMenuItems;

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
    markAsRead();
  };

  const displayName = userData?.name;
  const displayEmail = userData?.email || user?.email;
  const displayAvatar = userData?.avatarUrl;
  
  const avatarInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : displayEmail?.substring(0, 2).toUpperCase() || "?";

  const handleNavigate = (tab: string) => {
    setDashboardTab(tab);
  };

  return (
    <>
      {/* Responsive Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:bg-background/60 md:backdrop-blur-2xl md:border-r md:border-white/10 md:shadow-2xl md:z-40 transition-all duration-300",
        sidebarCollapsed ? "md:w-20" : "md:w-64 lg:w-80"
      )}>
        {/* Logo + Mode Selector */}
        <div className="flex flex-col gap-4 p-4 border-b border-white/10">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center px-1">
              <img 
                src={theme === 'dark' ? pocketcvLogoWhite : pocketcvLogoBlack}
                alt="PocketCV Logo" 
                className="h-7 transition-all duration-200" 
              />
            </Link>
          )}
          <ModeSwitcher collapsed={sidebarCollapsed} />
        </div>


        {/* Navigation Menu */}
        <div className="flex flex-col flex-grow pt-2 pb-2">
          <div className={cn("flex-grow flex flex-col", sidebarCollapsed ? "px-2" : "px-6")}>
            <nav className="flex-1 space-y-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const showBadge = item.id === 'network' && hasNewConnections && activeTab !== 'network';
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full h-10 text-base font-medium rounded-xl transition-all duration-200 relative",
                      "hover:bg-accent hover:shadow-sm",
                      sidebarCollapsed ? "justify-center px-0" : "justify-start",
                      activeTab === item.id 
                        ? "bg-primary/10 text-primary border-r-4 border-primary shadow-sm" 
                        : "text-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className={cn("h-5 w-5", !sidebarCollapsed && "mr-4")} />
                    {!sidebarCollapsed && <span className="text-base">{item.label}</span>}
                    {showBadge && (
                      <span className={cn(
                        "absolute flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full animate-scale-in",
                        sidebarCollapsed ? "-top-1 -right-1 h-5 w-5" : "ml-auto h-5 min-w-5 px-1.5"
                      )}>
                        {newConnectionsCount > 99 ? '99+' : newConnectionsCount}
                      </span>
                    )}
                  </Button>
                );
              })}

              {/* Business is now handled by ModeSwitcher - no duplicate link needed */}

              {/* Extra Menu Items - Smaller, with info icon */}
              {!sidebarCollapsed && (
                <div className="pt-4 mt-4 border-t border-white/10/50">
                  {extraMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full h-8 text-sm font-normal rounded-lg transition-all duration-200",
                          "hover:bg-accent/50",
                          "justify-start pl-4",
                          activeTab === item.id 
                            ? "bg-primary/5 text-primary" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab(item.id)}
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2 text-purple-500" />}
                        <span className="text-sm">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </nav>
            
            {/* Collapse Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-2 self-center"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Footer Section - Theme Toggle & Language */}
        <div className="border-t border-white/10 p-3">
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
      
      <NotificationsSidebar 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  );
};

export default DashboardSidebar;
