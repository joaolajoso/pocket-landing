import { useState, useEffect } from "react";
import { Phone, Mail, Linkedin, Instagram, Github, Twitter, Facebook, Youtube, Briefcase, Sparkles, Link as LinkIcon, ChevronDown, ChevronUp, Share2, ExternalLink, GraduationCap, FolderKanban, Award, Users, Zap, Globe, Check, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LinkType } from "@/components/LinkCard";
import { Experience } from "@/hooks/useExperiences";
import { NetworkingPreferences } from "@/hooks/profile/useNetworkingPreferences";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileFileSection from "@/components/profile/ProfileFileSection";
interface LinkGroup {
  id: string;
  title: string;
  displayTitle: boolean;
  position: number;
  links: LinkType[];
}
interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
}
interface NewPublicPagePreviewProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
    phoneNumber?: string;
    headline?: string;
    jobTitle?: string;
    email?: string;
    shareEmailPublicly?: boolean;
    sharePhonePublicly?: boolean;
  };
  sections: LinkGroup[];
  experiences?: Experience[];
  interests?: NetworkingPreferences;
  socialLinks?: SocialLink[];
  onUpdateVisibility?: (field: 'share_email_publicly' | 'share_phone_publicly', value: boolean) => void;
  onUpdateTheme?: (themeKey: string, bgColor: string) => void;
  initialThemeColor?: string;
}
import { resolveTheme, profileThemes, PROFILE_THEME_LIST, type ThemeKey } from "@/config/profileThemes";

// Theme hex colors for persistence
const themeHexColors: Record<string, string> = Object.fromEntries(
  PROFILE_THEME_LIST.map(t => [t.key, t.hex])
);

// TikTok custom icon
const TikTokIcon = ({
  className
}: {
  className?: string;
}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>;

// Social platforms config matching dashboard SocialLinksCard style
const socialPlatforms: Record<string, {
  icon: React.ComponentType<{
    className?: string;
  }>;
  bgColor: string;
  iconColor: string;
}> = {
  linkedin: {
    icon: Linkedin,
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  github: {
    icon: Github,
    bgColor: "bg-muted",
    iconColor: "text-foreground"
  },
  instagram: {
    icon: Instagram,
    bgColor: "bg-[#E4405F]/10",
    iconColor: "text-[#E4405F]"
  },
  twitter: {
    icon: Twitter,
    bgColor: "bg-muted",
    iconColor: "text-foreground"
  },
  facebook: {
    icon: Facebook,
    bgColor: "bg-[#1877F2]/10",
    iconColor: "text-[#1877F2]"
  },
  youtube: {
    icon: Youtube,
    bgColor: "bg-[#FF0000]/10",
    iconColor: "text-[#FF0000]"
  },
  tiktok: {
    icon: TikTokIcon,
    bgColor: "bg-muted",
    iconColor: "text-foreground"
  },
  whatsapp: {
    icon: MessageCircle,
    bgColor: "bg-[#25D366]/10",
    iconColor: "text-[#25D366]"
  },
  telegram: {
    icon: Send,
    bgColor: "bg-[#0088cc]/10",
    iconColor: "text-[#0088cc]"
  },
  website: {
    icon: Globe,
    bgColor: "bg-muted",
    iconColor: "text-foreground"
  }
};
const experienceIcons: Record<string, React.ComponentType<{
  className?: string;
}>> = {
  current_job: Briefcase,
  past_job: Briefcase,
  education: GraduationCap,
  project: FolderKanban,
  award: Award,
  other: Briefcase
};

const normalizeUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }
  return `https://${url}`;
};
const NewPublicPagePreview = ({
  userData,
  sections,
  experiences = [],
  interests,
  socialLinks = [],
  onUpdateVisibility,
  onUpdateTheme,
  initialThemeColor
}: NewPublicPagePreviewProps) => {
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  // Initialize theme from saved color
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(() => resolveTheme(null, initialThemeColor).key as ThemeKey);
  // Initialize from userData props (database values)
  const [showCall, setShowCall] = useState(userData.sharePhonePublicly ?? false);
  const [showEmail, setShowEmail] = useState(userData.shareEmailPublicly ?? false);
  const [profileFile, setProfileFile] = useState<{ url: string; name: string } | null>(null);
  const theme = profileThemes[selectedTheme] || profileThemes.wine;
  const { user } = useAuth();

  // Fetch profile file
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_file_url, profile_file_name")
        .eq("id", user.id)
        .single();
      if (data?.profile_file_url && data?.profile_file_name) {
        setProfileFile({ url: data.profile_file_url, name: data.profile_file_name });
      }
    };
    fetch();
  }, [user]);

  // Sync with initial color when it changes
  useEffect(() => {
    if (initialThemeColor) {
      setSelectedTheme(resolveTheme(null, initialThemeColor).key as ThemeKey);
    }
  }, [initialThemeColor]);

  // Handle theme change with persistence
  const handleThemeChange = (themeKey: ThemeKey) => {
    setSelectedTheme(themeKey);
    const hexColor = themeHexColors[themeKey];
    onUpdateTheme?.(themeKey, hexColor);
  };

  // Keep local toggle state in sync with DB-driven props
  useEffect(() => {
    setShowCall(userData.sharePhonePublicly ?? false);
  }, [userData.sharePhonePublicly]);
  useEffect(() => {
    setShowEmail(userData.shareEmailPublicly ?? false);
  }, [userData.shareEmailPublicly]);

  // Handle toggle with database persistence
  const handleToggleCall = () => {
    const newValue = !showCall;
    setShowCall(newValue);
    onUpdateVisibility?.('share_phone_publicly', newValue);
  };
  const handleToggleEmail = () => {
    const newValue = !showEmail;
    setShowEmail(newValue);
    onUpdateVisibility?.('share_email_publicly', newValue);
  };
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Get all links from sections
  const allLinks = sections.flatMap(section => section.links);

  // Format date range for experience
  const formatDateRange = (startDate: string | null, endDate: string | null, isCurrent: boolean) => {
    if (!startDate) return '';
    const start = format(new Date(startDate), 'MMM yyyy', {
      locale: ptBR
    });
    if (isCurrent) {
      return `${start} - Present`;
    }
    if (endDate) {
      const end = format(new Date(endDate), 'MMM yyyy', {
        locale: ptBR
      });
      return `${start} - ${end}`;
    }
    return start;
  };

  // Get all selected interests tags
  const allInterestsTags = interests ? [...interests.professional_roles, ...interests.industries, ...interests.networking_goals] : [];

  // Get first experience for display
  const primaryExperience = experiences[0];

  // Get first name for personalization
  const firstName = userData.name.split(" ")[0];

  // Parse job title for company/role display
  const parseJobTitle = (jobTitle?: string) => {
    if (!jobTitle) return {
      company: '',
      role: ''
    };
    const parts = jobTitle.split(/\s+at\s+|\s+·\s+|\s+-\s+/i);
    if (parts.length >= 2) {
      return {
        role: parts[0],
        company: parts[1]
      };
    }
    return {
      role: jobTitle,
      company: ''
    };
  };
  const {
    role: displayRole,
    company: displayCompany
  } = parseJobTitle(userData.jobTitle);
  return <div className="w-full flex flex-col lg:flex-row gap-4">
      {/* Controls - Top on mobile */}
      <div className="flex lg:hidden flex-col gap-3 mb-2">
        {/* Color Picker */}
        <div className="flex justify-center gap-2">
          {PROFILE_THEME_LIST.map(t => <button key={t.key} onClick={() => handleThemeChange(t.key as ThemeKey)} className={`w-10 h-10 rounded-full ${t.swatch} transition-all duration-300 flex items-center justify-center ${selectedTheme === t.key ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`} title={t.name}>
              {selectedTheme === t.key && <Check className="w-5 h-5 text-white" />}
            </button>)}
        </div>
        
        {/* Call/Email Toggles */}
        <div className="flex justify-center gap-2">
          <button onClick={handleToggleCall} disabled={!userData.phoneNumber} className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${!userData.phoneNumber ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed" : showCall ? "bg-emerald-600 text-white" : "bg-muted/50 text-muted-foreground"}`} title={!userData.phoneNumber ? "Adicione um telefone primeiro" : showCall ? "Ocultar Call" : "Mostrar Call"}>
            <Phone className="w-4 h-4" />
            <span className="text-xs font-medium">{showCall ? "On" : "Off"}</span>
          </button>
          
          <button onClick={handleToggleEmail} disabled={!userData.email} className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${!userData.email ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed" : showEmail ? "bg-emerald-600 text-white" : "bg-muted/50 text-muted-foreground"}`} title={!userData.email ? "Adicione um email primeiro" : showEmail ? "Ocultar Email" : "Mostrar Email"}>
            <Mail className="w-4 h-4" />
            <span className="text-xs font-medium">{showEmail ? "On" : "Off"}</span>
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl">
        <div className={`min-h-[600px] bg-gradient-to-b ${theme.gradient} transition-all duration-500 ease-in-out`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <button className="p-2 text-white/90 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/30 transition-all">
              Sign Up
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center px-6 pt-8 pb-8">
            {/* Avatar */}
            <div className="relative mb-3">
              <Avatar className={`w-40 h-40 border-4 ${theme.border} shadow-2xl transition-all duration-500`}>
                <AvatarImage src={userData.avatarUrl} alt={userData.name} className="object-cover" />
                <AvatarFallback className={`text-4xl ${theme.accent} text-white font-bold transition-all duration-500`}>
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Badge */}
            <Badge className={`${theme.accent} ${theme.accentHover} text-white text-sm px-4 py-1.5 rounded-full mb-4 transition-all duration-500`}>
              Early Adopter
            </Badge>

            {/* Name */}
            <h1 className="text-3xl font-bold text-white mb-2">
              {userData.name}
            </h1>

            {/* Headline */}
            <p className={`text-lg ${theme.textLight} font-medium mb-2 text-center px-4 transition-all duration-500`}>
              {userData.headline || userData.bio || "Your professional headline"}
            </p>

            {/* Company & Role */}
            {(displayCompany || displayRole) && <p className={`text-sm ${theme.textMuted} mb-5 transition-all duration-500`}>
                {displayCompany && displayRole ? `${displayCompany} · ${displayRole}` : displayRole || displayCompany}
              </p>}

            {/* Stats - Static for now */}
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className={`w-4 h-4 ${theme.textLight} transition-all duration-500`} />
                <span className="font-bold">128</span>
                <span className="text-white/60">connections</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${theme.textLight} transition-all duration-500`} />
                <span className="font-bold">45</span>
                <span className="text-white/60">taps</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 pb-8 space-y-4">
            {/* Call & Email Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Call Button */}
              {showCall && userData.sharePhonePublicly !== false && userData.phoneNumber ? <a href={`tel:${userData.phoneNumber}`} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors">
                  <div className={`w-14 h-14 rounded-full ${theme.accentLight} flex items-center justify-center transition-all duration-500`}>
                    <Phone className={`w-7 h-7 ${theme.textAccent} transition-all duration-500`} />
                  </div>
                  <span className="text-white font-semibold text-base">Call</span>
                </a> : <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/40">
                  <div className={`w-14 h-14 rounded-full ${theme.accentLight} opacity-50 flex items-center justify-center transition-all duration-500`}>
                    <Phone className={`w-7 h-7 ${theme.textAccent} opacity-50 transition-all duration-500`} />
                  </div>
                  <span className="text-white/50 font-semibold text-base">Call</span>
                </div>}
              
              {/* Email Button */}
              {showEmail && userData.shareEmailPublicly !== false && userData.email ? <a href={`mailto:${userData.email}`} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors">
                  <div className={`w-14 h-14 rounded-full ${theme.accentLight} flex items-center justify-center transition-all duration-500`}>
                    <Mail className={`w-7 h-7 ${theme.textAccent} transition-all duration-500`} />
                  </div>
                  <span className="text-white font-semibold text-base">Email</span>
                </a> : <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/40">
                  <div className={`w-14 h-14 rounded-full ${theme.accentLight} opacity-50 flex items-center justify-center transition-all duration-500`}>
                    <Mail className={`w-7 h-7 ${theme.textAccent} opacity-50 transition-all duration-500`} />
                  </div>
                  <span className="text-white/50 font-semibold text-base">Email</span>
                </div>}
            </div>

            {/* Experience Card */}
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${theme.accentLight} flex items-center justify-center transition-all duration-500`}>
                  <Briefcase className={`w-4 h-4 ${theme.textAccent} transition-all duration-500`} />
                </div>
                <h2 className="text-base font-bold text-white">Experience</h2>
              </div>
              
              {primaryExperience ? <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${theme.accent} flex items-center justify-center text-white font-bold text-sm shrink-0 transition-all duration-500`}>
                    {primaryExperience.company_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm">{primaryExperience.company_name}</h3>
                    <p className="text-white/60 text-xs">
                      {primaryExperience.role}
                      {(primaryExperience.start_date || primaryExperience.is_current) && <> · {formatDateRange(primaryExperience.start_date, primaryExperience.end_date, primaryExperience.is_current || false)}</>}
                    </p>
                    {primaryExperience.description && <p className="text-white/50 text-xs mt-1 line-clamp-2">
                        {primaryExperience.description}
                      </p>}
                  </div>
                </div> : <div className="flex items-center justify-center py-4">
                  <p className="text-white/50 text-xs">No experience added yet</p>
                </div>}
            </div>

            {/* Social Networks */}
            {socialLinks.length > 0 && <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
                <h2 className="text-base font-bold text-white mb-3">Social Networks</h2>
                
                <div className="grid grid-cols-3 gap-2">
                  {socialLinks.slice(0, 6).map(link => {
                const platform = socialPlatforms[link.icon.toLowerCase()] || socialPlatforms.website;
                const IconComponent = platform.icon;
                return <a key={link.id} href={normalizeUrl(link.url)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors">
                        <div className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                          <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                        </div>
                        <span className="text-white/70 text-[11px] font-medium text-center leading-tight line-clamp-1">{link.title}</span>
                      </a>;
              })}
                </div>
              </div>}

            {/* Match Card */}
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`w-5 h-5 ${theme.textAccent} transition-all duration-500`} />
                <h2 className="text-base font-bold text-white">Match</h2>
              </div>
              <p className="text-white/60 text-xs mb-3">
                {firstName} is looking for the same things as you
              </p>

              {allInterestsTags.length > 0 ? <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-white text-xs font-medium">
                      {allInterestsTags.length} interests
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {allInterestsTags.slice(0, 4).map((interest, index) => <span key={index} className={`${theme.textLight} text-xs transition-all duration-500`}>
                        {interest}
                      </span>)}
                  </div>
                </> : <p className="text-white/50 text-xs mb-3">No interests selected yet</p>}

              <Button className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white font-medium py-4 rounded-lg text-sm transition-all duration-500`}>
                Connect with {firstName}
              </Button>
            </div>

            {/* Profile File Download */}
            {profileFile && (
              <ProfileFileSection
                fileUrl={profileFile.url}
                fileName={profileFile.name}
                theme={theme}
              />
            )}

            {/* My Links - Collapsible */}
            {allLinks.length > 0 && <Collapsible open={isLinksOpen} onOpenChange={setIsLinksOpen}>
                <div className="rounded-xl bg-[#2A2A2A]/80">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${theme.accentLight} flex items-center justify-center transition-all duration-500`}>
                        <LinkIcon className={`w-4 h-4 ${theme.textAccent} transition-all duration-500`} />
                      </div>
                      <h2 className="text-base font-bold text-white">My Links</h2>
                      <span className="text-white/50 text-xs">({allLinks.length})</span>
                    </div>
                    {isLinksOpen ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="px-4 pb-4 space-y-2">
                    {allLinks.slice(0, 5).map(link => <a key={link.id} href={normalizeUrl(link.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors group">
                        <div className={`w-9 h-9 rounded-lg ${theme.accent} flex items-center justify-center shrink-0 transition-all duration-500`}>
                          <LinkIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{link.title}</p>
                          <p className="text-white/50 text-xs truncate">{link.url}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                      </a>)}
                  </CollapsibleContent>
                </div>
              </Collapsible>}

            {/* CTA Card */}
            <div className="rounded-xl bg-[#2A2A2A]/80 p-5 text-center">
              <Share2 className={`w-8 h-8 ${theme.textAccent} mx-auto mb-3 transition-all duration-500`} />
              <h2 className="text-lg font-bold text-white mb-1">
                Create Your Digital Profile
              </h2>
              <p className="text-white/60 text-xs mb-4">
                Join 10,000+ professionals networking smarter
              </p>
              
              <p className="text-white font-semibold text-sm mb-3">Get Started Free</p>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-gray-800 border-0 py-4 rounded-full font-medium text-sm">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>
                
                <Button className="w-full bg-[#0077B5] hover:bg-[#006097] text-white py-4 rounded-full font-medium text-sm">
                  <Linkedin className="w-4 h-4 mr-2" />
                  Continue with LinkedIn
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 pb-2">
              <div className="flex items-center justify-center mb-2">
                <img src="/lovable-uploads/pocketcv-logo-white.png" alt="PocketCV" className="h-8 opacity-60" />
              </div>
              <p className="text-white/40 text-xs">© 2025 PocketCV. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls - Side on desktop */}
      <div className="hidden lg:flex flex-col gap-4 justify-start pt-8">
        {/* Color Picker */}
        <div className="flex flex-col gap-2">
          {PROFILE_THEME_LIST.map(t => <button key={t.key} onClick={() => handleThemeChange(t.key as ThemeKey)} className={`w-10 h-10 rounded-full ${t.swatch} transition-all duration-300 flex items-center justify-center ${selectedTheme === t.key ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`} title={t.name}>
              {selectedTheme === t.key && <Check className="w-5 h-5 text-white" />}
            </button>)}
        </div>
        
        {/* Divider */}
        <div className="w-10 h-px bg-border/50" />
        
        {/* Call/Email Toggles */}
        <div className="flex flex-col gap-2">
          <button onClick={handleToggleCall} disabled={!userData.phoneNumber} className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${!userData.phoneNumber ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed" : showCall ? "bg-emerald-600 text-white ring-2 ring-emerald-400/50" : "bg-muted/50 text-muted-foreground"}`} title={!userData.phoneNumber ? "Adicione um telefone primeiro" : showCall ? "Ocultar Call" : "Mostrar Call"}>
            <Phone className="w-5 h-5" />
          </button>
          
          <button onClick={handleToggleEmail} disabled={!userData.email} className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${!userData.email ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed" : showEmail ? "bg-emerald-600 text-white ring-2 ring-emerald-400/50" : "bg-muted/50 text-muted-foreground"}`} title={!userData.email ? "Adicione um email primeiro" : showEmail ? "Ocultar Email" : "Mostrar Email"}>
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>;
};
export default NewPublicPagePreview;