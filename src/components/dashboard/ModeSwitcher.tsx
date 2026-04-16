import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Building2, Calendar, ChevronDown, Check } from "lucide-react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardMode = "solo" | "business" | "organizer";

interface ModeSwitcherProps {
  collapsed?: boolean;
}

const ModeSwitcher = ({ collapsed = false }: ModeSwitcherProps) => {
  const { organization } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  // Determine current mode based on route
  const currentMode: DashboardMode = location.pathname.startsWith("/business")
    ? "business"
    : location.pathname.startsWith("/events") && !location.pathname.startsWith("/events/")
      ? "organizer"
      : "solo";

  const modes: { id: DashboardMode; label: string; description: string; icon: typeof User; route: string; available: boolean }[] = [
    {
      id: "solo",
      label: "Solo",
      description: isPortuguese(language) ? "Perfil pessoal e networking" : "Personal profile & networking",
      icon: User,
      route: "/dashboard",
      available: true,
    },
    {
      id: "business",
      label: "Business",
      description: isPortuguese(language) ? "Gestão de equipa e CRM" : "Team management & CRM",
      icon: Building2,
      route: "/business",
      available: Boolean(organization),
    },
    {
      id: "organizer",
      label: isPortuguese(language) ? "Organizador" : "Organizer",
      description: isPortuguese(language) ? "Criar e gerir eventos" : "Create & manage events",
      icon: Calendar,
      route: "/events",
      available: true,
    },
  ];

  const activeModeData = modes.find((m) => m.id === currentMode) || modes[0];
  const ActiveIcon = activeModeData.icon;

  const handleModeChange = (mode: typeof modes[0]) => {
    if (mode.id === currentMode) return;
    navigate(mode.route);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-left transition-colors",
            "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            "bg-accent/20 border border-border/30",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/15 text-primary shrink-0">
            <ActiveIcon className="h-4 w-4" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 hidden sm:block">
                <span className="text-sm font-semibold text-foreground block truncate">
                  {activeModeData.label}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[260px] p-1.5"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = mode.id === currentMode;

          return (
            <DropdownMenuItem
              key={mode.id}
              disabled={!mode.available}
              onClick={() => handleModeChange(mode)}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                isActive && "bg-primary/10",
                !mode.available && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 mt-0.5",
                isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {mode.label}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {mode.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeSwitcher;
