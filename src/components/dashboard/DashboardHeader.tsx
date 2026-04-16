
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Bell, MoreVertical, Building2, ShoppingBag, CalendarPlus, Languages, Download, Check, CreditCard, QrCode, Calendar, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useDashboard } from "@/contexts/dashboard";
import NotificationsSidebar from "./NotificationsSidebar";
import { useState } from "react";
import QRCodeDialog from "@/components/profile/QRCodeDialog";
import { getProfileUrl } from "@/lib/supabase";
import { useNotifications } from "@/hooks/useNotifications";
import { useEventNotifications } from "@/hooks/useEventNotifications";
import { useOrganization } from "@/hooks/organization/useOrganization";

import { useLanguage, languages, Language } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { useProfileDesign } from "@/hooks/profile/useProfileDesign";
import pocketcvLogoBlack from "@/assets/pocketcv-logo-black-slogan.png";
import pocketcvLogoWhite from "@/assets/pocketcv-logo-white-slogan.png";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { PROFILE_THEME_LIST, resolveTheme } from "@/config/profileThemes";

interface DashboardHeaderProps {
  userData?: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  } | null;
}

const DashboardHeader = ({ userData }: DashboardHeaderProps) => {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const { setActiveTab, activeTab } = useDashboard();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const { totalNotifications, markAsRead } = useNotifications();
  const { totalEventNotifications } = useEventNotifications();
  const combinedNotifications = totalNotifications + totalEventNotifications;
  
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { settings: designSettings, saveDesignSettings } = useProfileDesign();
  const { organization } = useOrganization();

  // Mode switcher logic for mobile
  const currentMode = "solo" as "solo" | "business" | "organizer";
  const mobileModeSwitcherModes = [
    { id: "solo" as const, label: "Solo", icon: User, route: "/dashboard", available: true },
    { id: "business" as const, label: "Business", icon: Building2, route: "/business", available: Boolean(organization) },
    { id: "organizer" as const, label: isPortuguese(language) ? "Organizador" : "Organizer", icon: Calendar, route: "/events", available: true },
  ];
  const activeMobileMode = mobileModeSwitcherModes.find(m => m.id === currentMode) || mobileModeSwitcherModes[0];
  const ActiveModeIcon = activeMobileMode.icon;

  const displayName = userData?.name || profile?.name;
  const displayEmail = userData?.email || profile?.email || user?.email;
  const displayAvatar = userData?.avatarUrl || profile?.photo_url;

  const avatarInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : displayEmail?.substring(0, 2).toUpperCase() || "?";

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
    markAsRead();
  };

  const handleMenuNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const langEntries: Language[] = ['pt', 'en', 'fr', 'es'];

  const currentTheme = resolveTheme((designSettings as any).theme_key, designSettings.background_color);

  const handleColorChange = (themeKey: string, hex: string) => {
    saveDesignSettings({
      background_color: hex,
      button_background_color: hex,
      theme_key: themeKey,
    } as any).catch(console.error);
  };

  const menuItems = [
    {
      label: isPortuguese(language) ? 'Empresa' : 'Business',
      icon: Building2,
      onClick: () => { window.open('https://business.pocketcv.pt', '_blank'); setIsMenuOpen(false); },
    },
    {
      label: isPortuguese(language) ? 'Loja NFC' : 'NFC Shop',
      icon: ShoppingBag,
      onClick: () => { navigate('/shop'); setIsMenuOpen(false); },
    },
    {
      label: language === 'pt' ? 'Planos' : language === 'es' ? 'Planes' : language === 'fr' ? 'Forfaits' : 'Plans',
      icon: CreditCard,
      onClick: () => { navigate('/pricing'); setIsMenuOpen(false); },
    },
  ];

  const eventsHubItem = {
    label: isPortuguese(language) ? 'Eventos' : 'Events',
    icon: CalendarPlus,
    onClick: () => { navigate('/events'); setIsMenuOpen(false); },
  };

  const tabTitle = activeTab === 'overview'
    ? 'My PocketCV'
    : activeTab === 'network'
      ? (isPortuguese(language) ? 'Rede' : language === 'es' ? 'Red' : language === 'fr' ? 'Réseau' : 'Network')
      : activeTab === 'events'
        ? (isPortuguese(language) ? 'Eventos' : language === 'es' ? 'Eventos' : language === 'fr' ? 'Événements' : 'Events')
        : activeTab === 'settings'
          ? (isPortuguese(language) ? 'Definições' : 'Settings')
          : 'PocketCV';

  return (
    <>
      {/* Desktop Header Bar - inspired by ElevenLabs top bar */}
      <header className="hidden md:flex items-center justify-between h-14 px-6 border-b border-border/20 bg-background/40 backdrop-blur-xl sticky top-0 z-30">
        {/* Left: Page title */}
        <h1 className="text-base font-semibold text-foreground">
          {tabTitle}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Quick links */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => navigate('/shop')}
          >
            {isPortuguese(language) ? 'Loja' : 'Shop'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => navigate('/pricing')}
          >
            {isPortuguese(language) ? 'Planos' : 'Plans'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => setQrDialogOpen(true)}
          >
            QR Code
          </Button>

          <div className="w-px h-5 bg-border/40 mx-1" />

          {/* Color theme selector */}
          <div className="flex items-center gap-1.5">
            {PROFILE_THEME_LIST.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleColorChange(t.key, t.hex)}
                className={cn(
                  "h-5 w-5 rounded-full transition-all duration-200 flex items-center justify-center",
                  currentTheme.key === t.key
                    ? "ring-2 ring-offset-1 ring-offset-background ring-foreground scale-110"
                    : "hover:scale-110 opacity-60 hover:opacity-100"
                )}
                style={{ backgroundColor: t.hex }}
                title={t.name}
              >
                {currentTheme.key === t.key && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-border/40 mx-1" />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
            onClick={handleNotificationsClick}
          >
            <Bell className="h-4 w-4" />
            {combinedNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold">
                {combinedNotifications > 99 ? '99+' : combinedNotifications}
              </span>
            )}
          </Button>

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={displayAvatar || ""} alt={displayName || displayEmail || ""} />
                  <AvatarFallback className="text-[10px]">{avatarInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("settings")} className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                {isPortuguese(language) ? 'Definições' : 'Settings'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {isPortuguese(language) ? 'Sair' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 px-2 md:hidden border-none"
        style={activeTab === 'overview' ? { backgroundColor: `${currentTheme.hex}` } : { backgroundColor: 'transparent' }}
      >
        <div className="flex h-14 items-center justify-between">
          {/* Left: Mode Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-xl backdrop-blur-xl transition-colors",
                  activeTab === 'overview'
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-foreground/5 text-foreground hover:bg-foreground/10"
                )}
              >
                <ActiveModeIcon className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-[220px] p-1.5">
              {mobileModeSwitcherModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = mode.id === currentMode;
                return (
                  <DropdownMenuItem
                    key={mode.id}
                    disabled={!mode.available}
                    onClick={() => { if (mode.id !== currentMode) navigate(mode.route); }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                      isActive && "bg-primary/10",
                      !mode.available && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-lg shrink-0",
                      isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {mode.label}
                    </span>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Center: Page title */}
          <span className={cn(
            "text-base font-semibold absolute left-1/2 -translate-x-1/2",
            activeTab === 'overview' ? "text-white" : "text-foreground"
          )}>
            {tabTitle}
          </span>

          {/* Right: Three dots menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className={cn("relative h-9 w-9", activeTab === 'overview' ? "text-white hover:bg-white/20" : "text-foreground hover:bg-accent")}
          >
            <MoreVertical className="h-5 w-5" />
            {combinedNotifications > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            )}
          </Button>
        </div>
      </header>

      {/* Slide-out Menu Panel */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-72 p-0 flex flex-col overflow-y-auto">
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="text-left text-base font-semibold">Menu</SheetTitle>
          </SheetHeader>

          {/* User info */}
          <div className="px-5 pb-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayAvatar || ""} alt={displayName || ""} />
              <AvatarFallback className="text-sm">{avatarInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
            </div>
          </div>

          <Separator />

          {/* Color Palette */}
          <div className="px-5 py-3">
            <div className="flex items-center justify-between gap-2">
              {PROFILE_THEME_LIST.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleColorChange(t.key, t.hex)}
                  className={cn(
                    "h-9 w-9 rounded-full transition-all duration-200 flex items-center justify-center",
                    currentTheme.key === t.key
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: t.hex }}
                  title={t.name}
                >
                  {currentTheme.key === t.key && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="px-3 py-2">
            <button
              onClick={handleNotificationsClick}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/10 transition-colors"
            >
              <div className="relative h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                <Bell className="h-3 w-3 text-muted-foreground" />
                {combinedNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[9px] font-bold">
                    {combinedNotifications > 99 ? '99+' : combinedNotifications}
                  </span>
                )}
              </div>
              {isPortuguese(language) ? 'Notificações' : language === 'es' ? 'Notificaciones' : language === 'fr' ? 'Notifications' : 'Notifications'}
            </button>
          </div>

          <Separator />

          {/* Menu Items */}
          <nav className="px-3 py-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/10 transition-colors"
                >
                  <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <Separator />

          {/* Events Hub */}
          <div className="px-3 py-3">
            <button
              onClick={eventsHubItem.onClick}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/10 transition-colors"
            >
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
              {eventsHubItem.label}
            </button>
          </div>

          <Separator />

          {/* Bottom controls: Language + Theme side by side */}
          <div className="px-3 py-3">
            <button
              onClick={() => {
                const currentIndex = langEntries.indexOf(language);
                const nextIndex = (currentIndex + 1) % langEntries.length;
                setLanguage(langEntries[nextIndex]);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
            >
              <Languages className="h-4 w-4 text-muted-foreground" />
              {language.toUpperCase()}
            </button>
          </div>

          <Separator />

          {/* Settings & Logout */}
          <div className="px-3 py-3 flex gap-2">
            <button
              onClick={() => { handleMenuNavigate('settings'); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <Settings className="h-4 w-4" />
              {isPortuguese(language) ? 'Definições' : 'Settings'}
            </button>
            <button
              onClick={() => { signOut(); setIsMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {isPortuguese(language) ? 'Sair' : 'Logout'}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <NotificationsSidebar
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        profileUrl={profile?.slug ? getProfileUrl(profile.slug) : ''}
        profileName={displayName || ''}
        profilePhoto={displayAvatar}
        headline={profile?.headline}
        title={isPortuguese(language) ? 'Partilhar Perfil' : 'Share Profile'}
      />
    </>
  );
};

export default DashboardHeader;
