import { ExternalLink, MessageCircle, Send } from "lucide-react";
import { Linkedin, Github, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// TikTok custom icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialPlatform {
  id: string;
  label: string;
  icon: React.ElementType;
  url: string;
  color: string;
  bgColor: string;
  tip: string;
}

const socialPlatforms: SocialPlatform[] = [
  { 
    id: "linkedin", 
    label: "LinkedIn", 
    icon: Linkedin, 
    url: "https://www.linkedin.com/in/me",
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20",
    tip: "Abre o teu perfil e copia o URL do browser"
  },
  { 
    id: "github", 
    label: "GitHub", 
    icon: Github, 
    url: "https://github.com",
    color: "text-foreground",
    bgColor: "bg-muted hover:bg-muted/80",
    tip: "Vai ao teu perfil e copia o URL"
  },
  { 
    id: "instagram", 
    label: "Instagram", 
    icon: Instagram, 
    url: "https://www.instagram.com",
    color: "text-[#E4405F]",
    bgColor: "bg-[#E4405F]/10 hover:bg-[#E4405F]/20",
    tip: "Abre o teu perfil e copia o URL"
  },
  { 
    id: "twitter", 
    label: "Twitter/X", 
    icon: Twitter, 
    url: "https://x.com",
    color: "text-foreground",
    bgColor: "bg-muted hover:bg-muted/80",
    tip: "Vai ao teu perfil e copia o URL"
  },
  { 
    id: "facebook", 
    label: "Facebook", 
    icon: Facebook, 
    url: "https://www.facebook.com/me",
    color: "text-[#1877F2]",
    bgColor: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
    tip: "Abre o teu perfil e copia o URL"
  },
  { 
    id: "youtube", 
    label: "YouTube", 
    icon: Youtube, 
    url: "https://www.youtube.com/channel_switcher",
    color: "text-[#FF0000]",
    bgColor: "bg-[#FF0000]/10 hover:bg-[#FF0000]/20",
    tip: "Vai ao teu canal e copia o URL"
  },
  { 
    id: "tiktok", 
    label: "TikTok", 
    icon: TikTokIcon, 
    url: "https://www.tiktok.com",
    color: "text-foreground",
    bgColor: "bg-muted hover:bg-muted/80",
    tip: "Abre o teu perfil e copia o URL"
  },
  { 
    id: "whatsapp", 
    label: "WhatsApp", 
    icon: MessageCircle, 
    url: "",
    color: "text-[#25D366]",
    bgColor: "bg-[#25D366]/10 hover:bg-[#25D366]/20",
    tip: "Introduz o teu número de telefone (com código do país)"
  },
  { 
    id: "telegram", 
    label: "Telegram", 
    icon: Send, 
    url: "https://t.me",
    color: "text-[#0088cc]",
    bgColor: "bg-[#0088cc]/10 hover:bg-[#0088cc]/20",
    tip: "Abre o teu perfil e copia o URL"
  },
];

interface SocialShortcutsProps {
  selectedPlatform?: string;
  variant?: "default" | "compact" | "onboarding";
  showLabel?: boolean;
  className?: string;
}

export const SocialShortcuts = ({ 
  selectedPlatform, 
  variant = "default",
  showLabel = true,
  className = ""
}: SocialShortcutsProps) => {
  const handleOpenPlatform = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Filter platforms based on selection
  const platformsToShow = selectedPlatform 
    ? socialPlatforms.filter(p => p.id === selectedPlatform)
    : socialPlatforms;

  if (variant === "compact") {
    const platform = platformsToShow[0];
    if (!platform) return null;
    
    const Icon = platform.icon;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenPlatform(platform.url)}
              className={`h-8 gap-1.5 text-xs ${platform.color} ${className}`}
            >
              <ExternalLink className="h-3 w-3" />
              Ir para {platform.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] text-center">
            <p className="text-xs">{platform.tip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "onboarding") {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-xs text-white/50 text-center">
          Abre a rede social para copiar o teu link:
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {socialPlatforms.slice(0, 4).map((platform) => {
            const Icon = platform.icon;
            return (
              <TooltipProvider key={platform.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPlatform(platform.url)}
                      className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 rounded-lg"
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[180px] text-center">
                    <p className="text-xs font-medium">{platform.label}</p>
                    <p className="text-xs text-muted-foreground">{platform.tip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant - shows all platforms or filtered
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ExternalLink className="h-3 w-3" />
          Abre a rede social para copiar o teu link:
        </p>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {platformsToShow.map((platform) => {
          const Icon = platform.icon;
          return (
            <TooltipProvider key={platform.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPlatform(platform.url)}
                    className={`h-8 w-8 p-0 ${platform.bgColor} rounded-lg transition-colors`}
                  >
                    <Icon className={`h-4 w-4 ${platform.color}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[180px] text-center">
                  <p className="text-xs font-medium">Ir para {platform.label}</p>
                  <p className="text-xs text-muted-foreground">{platform.tip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export const getSocialPlatformUrl = (platformId: string): string | undefined => {
  const platform = socialPlatforms.find(p => p.id === platformId);
  return platform?.url;
};

export default SocialShortcuts;
