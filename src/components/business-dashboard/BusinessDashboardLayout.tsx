import { ReactNode, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Contact2, BarChart3, CalendarDays, Globe, Settings, Menu, X, LogOut, ArrowLeft, ShoppingBag, CreditCard, ChevronDown, ChevronLeft, Check, Ticket, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useOrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import pocketcvLogoWhite from "@/assets/pocketcv-logo-white-slogan.png";
import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { path: "/business", label: "Home", icon: Home, end: true },
  { path: "/business/team", label: "Equipa", icon: Users },
  { path: "/business/contacts", label: "Leads", icon: Contact2 },
  { path: "/business/insights", label: "Métricas", icon: BarChart3 },
  { path: "/business/events", label: "Eventos", icon: CalendarDays },
  { path: "/business/public-page", label: "Página Pública", icon: Globe },
  { path: "/business/settings", label: "Definições", icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { path: "/business", label: "Home", icon: Home, end: true },
  { path: "/business/team", label: "Equipa", icon: Users },
  { path: "/business/contacts", label: "Leads", icon: Contact2 },
  { path: "/business/insights", label: "Métricas", icon: BarChart3 },
  { path: "/business/events", label: "Eventos", icon: CalendarDays },
  { path: "/business/public-page", label: "Pública", icon: Globe },
];

interface Props {
  children: ReactNode;
}

const BusinessDashboardLayout = ({ children }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organization, allOrganizations, switchOrganization } = useOrganization();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { website } = useOrganizationWebsite(organization?.id);
  const businessPublicUrl = website?.subdomain ? `https://pocketcv.pt/c/${website.subdomain}` : null;

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === organization?.id || switching) return;
    setSwitching(true);
    setMobileMenuOpen(false);
    const result = await switchOrganization(orgId);
    if (result.success) {
      // Invalidate all cached queries so pages refetch with new org data
      await queryClient.invalidateQueries();
      // Navigate to force remount of child route components
      navigate("/business/_switch", { replace: true });
      setTimeout(() => {
        navigate("/business", { replace: true });
        setSwitching(false);
      }, 100);
    } else {
      setSwitching(false);
    }
  };

  const showOrgSwitcher = allOrganizations.length > 1;

  const OrgSwitcher = ({ mobile = false }: { mobile?: boolean }) => {
    if (!showOrgSwitcher) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-3 rounded-lg transition-all duration-200",
              mobile
                ? "px-4 py-3 hover:bg-white/5"
                : "px-3 py-2.5 hover:bg-white/10"
            )}
          >
            <Avatar className={mobile ? "h-9 w-9" : "h-7 w-7"}>
              <AvatarImage src={organization?.logo_url || ""} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {organization?.name?.charAt(0) || "B"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className={cn(
                "font-medium text-white truncate",
                mobile ? "text-sm" : "text-xs"
              )}>
                {organization?.name}
              </p>
              <p className={cn(
                "text-white/40 truncate",
                mobile ? "text-xs" : "text-[10px]"
              )}>
                Mudar empresa
              </p>
            </div>
            <ChevronDown className={cn(
              "shrink-0 text-white/40",
              mobile ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side={mobile ? "top" : "right"}
          className="w-64 bg-slate-900 border-white/10"
        >
          {allOrganizations.map((org) => (
            <DropdownMenuItem
              key={org.organization_id}
              onClick={() => handleSwitchOrg(org.organization_id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                org.organization_id === organization?.id
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={org.org_logo || ""} />
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {org.org_name?.charAt(0) || "B"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{org.org_name}</p>
                <p className="text-[10px] text-white/40 capitalize">{org.role}</p>
              </div>
              {org.organization_id === organization?.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 flex overflow-x-hidden relative">
      {/* Switching overlay */}
      {switching && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-white/60">A mudar de empresa...</p>
          </div>
        </div>
      )}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-30 border-r border-white/10 backdrop-blur-2xl bg-white/5">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors shrink-0"
            title="Voltar ao perfil pessoal"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <img src={pocketcvLogoWhite} alt="PocketCV" className="h-7" />
        </div>

        {/* Mode Switcher */}
        <div className="px-3 pb-2">
          <ModeSwitcher />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.end);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="px-3 pb-4 space-y-2">
          {showOrgSwitcher ? (
            <OrgSwitcher />
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={organization?.logo_url || ""} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {organization?.name?.charAt(0) || "B"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{organization?.name}</p>
                <p className="text-[10px] text-white/40 truncate">{profile?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 backdrop-blur-2xl bg-slate-950/80 border-b border-white/10">
        <div className="w-[140px]">
          <ModeSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => businessPublicUrl && setShowQR(true)}
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-xl transition-colors",
              businessPublicUrl ? "bg-white/10 text-white hover:bg-white/15" : "text-white/20 cursor-default"
            )}
          >
            <QrCode className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
            <img src={pocketcvLogoWhite} alt="PocketCV" className="h-6" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-white/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Org Switcher in mobile menu */}
          {showOrgSwitcher && (
            <div className="px-4 pt-4">
              <OrgSwitcher mobile />
            </div>
          )}

          <div className="flex-1" />
          <div className="px-4 pb-8 space-y-1 border-t border-white/10 pt-4">
            <button
              onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Página Pessoal
            </button>
            <button
              onClick={() => { navigate("/shop"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Loja NFC
            </button>
            <button
              onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              Planos
            </button>
            <button
              onClick={() => { navigate("/eventspocketcv"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
            >
              <Ticket className="h-5 w-5" />
              Criar Evento
            </button>
            <button
              onClick={() => { signOut(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-red-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 h-14 backdrop-blur-2xl bg-slate-950/80 border-t border-white/10">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.end);
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex items-center gap-1.5 py-2 px-2.5 rounded-xl transition-all duration-300",
                active ? "text-white bg-white/10" : "text-white/35"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {active && (
                <span className="text-[11px] font-semibold animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-4 md:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Business QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-xs bg-slate-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-sm">QR Code da Empresa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {organization?.logo_url && (
              <img src={organization.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover border border-white/10" />
            )}
            <p className="text-sm font-semibold text-white">{organization?.name}</p>
            {businessPublicUrl && (
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG
                  value={businessPublicUrl}
                  size={180}
                  level="H"
                  imageSettings={organization?.logo_url ? {
                    src: organization.logo_url,
                    height: 36,
                    width: 36,
                    excavate: true,
                  } : undefined}
                />
              </div>
            )}
            <p className="text-[11px] text-white/30 text-center">
              {website?.subdomain ? `pocketcv.pt/c/${website.subdomain}` : "Publique a página para gerar o QR Code"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessDashboardLayout;
