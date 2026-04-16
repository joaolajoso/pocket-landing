import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Mail, Linkedin, Instagram, Github, Twitter, Facebook, Youtube, Briefcase, Sparkles, Link as LinkIcon, ChevronDown, ChevronUp, Share2, ExternalLink, GraduationCap, FolderKanban, Award, Users, Zap, Globe, ArrowLeft, UserPlus, MessageCircle, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ConnectOptionsDialog from "@/components/profile/ConnectOptionsDialog";
import ProfileFileSection from "@/components/profile/ProfileFileSection";
import { downloadVCard } from "@/lib/vcard";
import { incrementLinkClick } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicPageTranslations } from "@/translations/publicPage";

import { Experience } from "@/hooks/useExperiences";
import { NetworkingPreferences } from "@/hooks/profile/useNetworkingPreferences";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
}

interface LinkGroup {
  id: string;
  title: string;
  displayTitle: boolean;
  position: number;
  links: LinkItem[];
}

interface NewPublicPageProps {
  profile: {
    id: string;
    name: string;
    bio: string;
    headline?: string;
    job_title?: string;
    photo_url?: string;
    avatar_url?: string;
    phone_number?: string;
    email?: string;
    share_email_publicly?: boolean;
    share_phone_publicly?: boolean;
    slug?: string;
    profile_file_url?: string;
    profile_file_name?: string;
  };
  sections: LinkGroup[];
  experiences: Experience[];
  interests: NetworkingPreferences | null;
  socialLinks: LinkItem[];
  ungroupedLinks?: LinkItem[];
  viewerInterests?: NetworkingPreferences | null;
  designSettings?: {
    background_color?: string;
    button_background_color?: string;
  } | null;
}

// TikTok custom icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Social platforms config
const socialPlatforms: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
}> = {
  linkedin: { icon: Linkedin, bgColor: "bg-primary/10", iconColor: "text-primary" },
  github: { icon: Github, bgColor: "bg-muted", iconColor: "text-foreground" },
  instagram: { icon: Instagram, bgColor: "bg-[#E4405F]/10", iconColor: "text-[#E4405F]" },
  twitter: { icon: Twitter, bgColor: "bg-muted", iconColor: "text-foreground" },
  facebook: { icon: Facebook, bgColor: "bg-[#1877F2]/10", iconColor: "text-[#1877F2]" },
  youtube: { icon: Youtube, bgColor: "bg-[#FF0000]/10", iconColor: "text-[#FF0000]" },
  tiktok: { icon: TikTokIcon, bgColor: "bg-muted", iconColor: "text-foreground" },
  whatsapp: { icon: MessageCircle, bgColor: "bg-[#25D366]/10", iconColor: "text-[#25D366]" },
  telegram: { icon: Send, bgColor: "bg-[#0088cc]/10", iconColor: "text-[#0088cc]" },
  website: { icon: Globe, bgColor: "bg-muted", iconColor: "text-foreground" }
};

import { resolveTheme } from "@/config/profileThemes";

const NewPublicPage = ({ profile, sections, experiences, interests, socialLinks, ungroupedLinks = [], viewerInterests, designSettings }: NewPublicPageProps) => {
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [profileViewsCount, setProfileViewsCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = publicPageTranslations[language] || publicPageTranslations.en;

  // Determine theme from design settings
  const theme = useMemo(() => resolveTheme(null, designSettings?.background_color), [designSettings?.background_color]);

  // Fetch real connections and profile views counts - FULLY PARALLELIZED
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (!profile.id) return;

      try {
        // Execute ALL queries in parallel for maximum performance
        const [connectionsResult, totalEventsResult, clickEventsResult] = await Promise.all([
          supabase
            .from("connections")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profile.id),
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", profile.id),
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", profile.id)
            .like("source", "click:%"),
        ]);

        if (!isMounted) return;

        const connections = connectionsResult.count || 0;
        const totalEvents = totalEventsResult.count || 0;
        const clickEvents = clickEventsResult.count || 0;
        const viewsOnly = Math.max(0, totalEvents - clickEvents);

        setConnectionsCount(connections);
        setProfileViewsCount(viewsOnly);
      } catch (error) {
        console.error("[NewPublicPage] Error fetching profile stats:", error);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [profile.id]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    return `https://${url}`;
  };

  // Sanitize phone number for tel: links (remove spaces, parentheses, dashes but keep + and digits)
  const sanitizePhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  // Sanitize email for mailto: links
  const sanitizeEmail = (email: string) => {
    if (!email) return '';
    return email.trim();
  };

  // Combine grouped and ungrouped links for "My Links" section
  const allLinks = [...sections.flatMap(section => section.links), ...ungroupedLinks];

  const formatDateRange = (startDate: string | null, endDate: string | null, isCurrent: boolean) => {
    if (!startDate) return '';
    const start = format(new Date(startDate), 'MMM yyyy', { locale: ptBR });
    if (isCurrent) return `${start} - ${t.present}`;
    if (endDate) {
      const end = format(new Date(endDate), 'MMM yyyy', { locale: ptBR });
      return `${start} - ${end}`;
    }
    return start;
  };

  // Profile owner's interests
  const profileInterestsTags = interests 
    ? [...interests.professional_roles, ...interests.industries, ...interests.networking_goals] 
    : [];

  // Viewer's interests
  const viewerInterestsTags = viewerInterests 
    ? [...viewerInterests.professional_roles, ...viewerInterests.industries, ...viewerInterests.networking_goals] 
    : [];

  // Calculate matching interests
  const matchingInterests = profileInterestsTags.filter(interest => 
    viewerInterestsTags.some(viewerInterest => 
      viewerInterest.toLowerCase() === interest.toLowerCase()
    )
  );

  // Show connect card for everyone except when viewing own profile
  const showConnectCard = user?.id !== profile.id;
  const hasMatchingInterests = matchingInterests.length > 0;

  const firstName = (profile.name || 'User').split(" ")[0];

  const parseJobTitle = (jobTitle?: string) => {
    if (!jobTitle) return { company: '', role: '' };
    const parts = jobTitle.split(/\s+at\s+|\s+·\s+|\s+-\s+/i);
    if (parts.length >= 2) {
      return { role: parts[0], company: parts[1] };
    }
    return { role: jobTitle, company: '' };
  };

  const { role: displayRole, company: displayCompany } = parseJobTitle(profile.job_title);

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!user || !profile.id) return;
      
      const { data } = await supabase
        .from('connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('connected_user_id', profile.id)
        .maybeSingle();
      
      setIsAlreadyConnected(!!data);
    };

    checkConnection();
  }, [user, profile.id]);

   const handleConnect = async () => {
    if (!user) {
      setShowConnectDialog(true);
      return;
    }

    if (isAlreadyConnected) {
      toast({
        title: t.alreadyConnected,
        description: `${firstName} ${t.alreadyConnectedDesc}`,
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Insert forward connection (me -> them)
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: profile.id,
        });

      if (error) throw error;

      // Insert reverse connection (them -> me), ignore if already exists
      await supabase
        .from('connections')
        .insert({
          user_id: profile.id,
          connected_user_id: user.id,
        })
        .then(() => {}); // ignore errors (duplicate)

      setIsAlreadyConnected(true);
      toast({
        title: t.connected,
        description: `${firstName} ${t.connectedDesc}`,
      });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || t.couldNotConnect,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Save pending connection to localStorage
    localStorage.setItem('pendingConnectionId', profile.id);
    localStorage.setItem('pendingConnectionSlug', profile.slug || '');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding-setup`,
      },
    });
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLinkedInLogin = async () => {
    // Save pending connection to localStorage
    localStorage.setItem('pendingConnectionId', profile.id);
    localStorage.setItem('pendingConnectionSlug', profile.slug || '');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/onboarding-setup`,
      },
    });
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className={`min-h-screen bg-gradient-to-b ${theme.gradient}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <Link to="/" className="p-2 text-white/90 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/30 transition-all"
            >
              {t.home}
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/30 transition-all"
            >
              {t.signUp}
            </button>
          )}
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center px-6 pt-8 pb-8">
          <div className="relative mb-3">
            <Avatar className={`w-40 h-40 border-4 ${theme.border} shadow-2xl`}>
              <AvatarImage src={profile.photo_url || profile.avatar_url} alt={profile.name || 'User'} className="object-cover" />
              <AvatarFallback className={`text-4xl ${theme.accent} text-white font-bold`}>
                {getInitials(profile.name || 'User')}
              </AvatarFallback>
            </Avatar>
          </div>

          <Badge className={`${theme.accent} ${theme.accentHover} text-white text-sm px-4 py-1.5 rounded-full mb-4`}>
            Early Adopter
          </Badge>

          <h1 className="text-3xl font-bold text-white mb-2">{profile.name || 'User'}</h1>

          <p className={`text-lg ${theme.textLight} font-medium mb-2 text-center px-4`}>
            {profile.headline || profile.bio || t.yourHeadline}
          </p>

          {(displayCompany || displayRole) && (
            <p className={`text-sm ${theme.textMuted} mb-5`}>
              {displayCompany && displayRole ? `${displayCompany} · ${displayRole}` : displayRole || displayCompany}
            </p>
          )}

          <div className="flex items-center gap-6 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className={`w-4 h-4 ${theme.textLight}`} />
              <span className="font-bold">{connectionsCount}</span>
              <span className="text-white/60">{t.connections}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className={`w-4 h-4 ${theme.textLight}`} />
              <span className="font-bold">{profileViewsCount}</span>
              <span className="text-white/60">{t.taps}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-8 space-y-4 max-w-md mx-auto">
          {/* Call & Email Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {profile.share_phone_publicly !== false && profile.phone_number ? (
              <>
                <button 
                  onClick={() => setShowCallDialog(true)}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-full ${theme.accentLight} flex items-center justify-center`}>
                    <Phone className={`w-7 h-7 ${theme.textAccent}`} />
                  </div>
                  <span className="text-white font-semibold text-base">{t.call}</span>
                </button>

                <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
                  <DialogContent hideClose className="max-w-xs rounded-3xl border-0 bg-[#2A2A2A]/95 backdrop-blur-xl p-4 gap-3">
                    <DialogTitle className="sr-only">{t.contactOptions}</DialogTitle>
                    <a
                      href={`tel:${sanitizePhone(profile.phone_number)}`}
                      onClick={() => setShowCallDialog(false)}
                      className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl ${theme.accent} text-white font-semibold text-base transition-colors`}
                    >
                      <Phone className="w-5 h-5" />
                      {t.callNumber} {profile.phone_number}
                    </a>
                    <button
                      onClick={() => setShowCallDialog(false)}
                      className="flex items-center justify-center w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-medium text-sm transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/40">
                <div className={`w-14 h-14 rounded-full ${theme.accentLight} opacity-50 flex items-center justify-center`}>
                  <Phone className={`w-7 h-7 ${theme.textAccent} opacity-50`} />
                </div>
                <span className="text-white/50 font-semibold text-base">{t.call}</span>
              </div>
            )}
            
            {profile.share_email_publicly !== false && profile.email ? (
              <a 
                href={`mailto:${sanitizeEmail(profile.email)}`}
                onClick={(e) => {
                  // Fallback for webviews that don't handle mailto: links properly
                  const sanitized = sanitizeEmail(profile.email!);
                  if (sanitized) {
                    window.location.href = `mailto:${sanitized}`;
                  }
                }}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-full ${theme.accentLight} flex items-center justify-center`}>
                  <Mail className={`w-7 h-7 ${theme.textAccent}`} />
                </div>
                <span className="text-white font-semibold text-base">{t.email}</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#2A2A2A]/40">
                <div className={`w-14 h-14 rounded-full ${theme.accentLight} opacity-50 flex items-center justify-center`}>
                  <Mail className={`w-7 h-7 ${theme.textAccent} opacity-50`} />
                </div>
                <span className="text-white/50 font-semibold text-base">{t.email}</span>
              </div>
            )}
          </div>

          {/* Experience Card */}
          {experiences.length > 0 && (
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${theme.accentLight} flex items-center justify-center`}>
                  <Briefcase className={`w-4 h-4 ${theme.textAccent}`} />
                </div>
                <h2 className="text-base font-bold text-white">{t.experience}</h2>
              </div>
              
              <div className="space-y-3">
                {experiences.map((experience) => (
                  <div key={experience.id} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${theme.accent} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {experience.company_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm">{experience.company_name}</h3>
                      <p className="text-white/60 text-xs">
                        {experience.role}
                        {(experience.start_date || experience.is_current) && (
                          <> · {formatDateRange(experience.start_date, experience.end_date, experience.is_current || false)}</>
                        )}
                      </p>
                      {experience.description && (
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{experience.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Networks */}
          {socialLinks.length > 0 && (
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <h2 className="text-base font-bold text-white mb-3">{t.socialNetworks}</h2>
              <div className="grid grid-cols-3 gap-2">
                {socialLinks.slice(0, 6).map(link => {
                  const platform = socialPlatforms[link.icon.toLowerCase()] || socialPlatforms.website;
                  const IconComponent = platform.icon;
                  return (
                    <a key={link.id} href={normalizeUrl(link.url)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors">
                      <div className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                      </div>
                      <span className="text-white/70 text-[11px] font-medium text-center leading-tight line-clamp-1">{link.title}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connect Card - Show for all users except when viewing own profile */}
          {showConnectCard && (
            <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                {hasMatchingInterests && user ? (
                  <>
                    <Sparkles className={`w-5 h-5 ${theme.textAccent}`} />
                    <h2 className="text-base font-bold text-white">{t.match}</h2>
                  </>
                ) : (
                  <>
                    <UserPlus className={`w-5 h-5 ${theme.textAccent}`} />
                    <h2 className="text-base font-bold text-white">{t.connect}</h2>
                  </>
                )}
              </div>
              
              {hasMatchingInterests && user ? (
                <>
                  <p className="text-white/60 text-xs mb-3">
                    {firstName} {t.lookingSameThings}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-white text-xs font-medium">{matchingInterests.length} {t.commonInterests}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {matchingInterests.slice(0, 4).map((interest, index) => (
                      <span key={index} className={`${theme.textLight} text-xs`}>{interest}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-white/60 text-xs mb-3">
                  {t.addToNetwork} {firstName}
                </p>
              )}

              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white font-medium py-4 rounded-lg text-sm`}
              >
                {isAlreadyConnected ? t.viewNetwork : isConnecting ? t.connecting : `${t.connectWith} ${firstName}`}
              </Button>
            </div>
          )}

          {/* Profile File Download */}
          {profile.profile_file_url && profile.profile_file_name && (
            <ProfileFileSection
              fileUrl={profile.profile_file_url}
              fileName={profile.profile_file_name}
              theme={theme}
            />
          )}

          {/* My Links - Collapsible */}
          {allLinks.length > 0 && (
            <Collapsible open={isLinksOpen} onOpenChange={setIsLinksOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors">
                  <div className="flex items-center gap-2">
                    <LinkIcon className={`w-5 h-5 ${theme.textAccent}`} />
                    <span className="text-white font-bold text-base">{t.myLinks}</span>
                    <span className="text-white/50 text-xs">({allLinks.length})</span>
                  </div>
                  {isLinksOpen ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {allLinks.map(link => (
                  <a
                    key={link.id}
                    href={normalizeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#2A2A2A]/60 hover:bg-[#2A2A2A] transition-colors group"
                    onClick={() => {
                      incrementLinkClick(link.id, profile.id, user?.id);
                    }}
                  >
                    <div className={`w-9 h-9 rounded-lg ${theme.accent} flex items-center justify-center shrink-0`}>
                      <LinkIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{link.title}</p>
                      <p className="text-white/50 text-xs truncate">{link.url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  </a>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Create Your Digital Profile CTA - only show for non-authenticated users */}
          {!user && <div className="rounded-xl bg-[#2A2A2A]/80 p-5 text-center">
            <Share2 className="w-8 h-8 text-white/80 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">
              {t.createDigitalProfile}
            </h2>
            <p className="text-white/60 text-xs mb-3">
              {t.joinProfessionals}
            </p>
            <p className="text-white/80 font-semibold text-sm mb-4">
              {t.startFree}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleGoogleLogin}
                variant="outline" 
                className="w-full bg-white hover:bg-gray-100 text-gray-800 border-0 py-4 rounded-full font-medium text-sm"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t.continueGoogle}
              </Button>
              
              <Button 
                onClick={handleLinkedInLogin}
                className="w-full bg-[#0077B5] hover:bg-[#006097] text-white py-4 rounded-full font-medium text-sm"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                {t.continueLinkedIn}
              </Button>
            </div>
          </div>}

          {/* Footer */}
          <div className="text-center pt-6 pb-24">
            <a href="https://pocketcv.pt" target="_blank" rel="noopener noreferrer" className="inline-block">
              <img 
                src="/lovable-uploads/pocketcv-logo-white.png" 
                alt="PocketCV" 
                className="h-6 opacity-60 hover:opacity-100 transition-opacity mx-auto"
              />
            </a>
            <p className="text-white/40 text-xs mt-2">
              © {new Date().getFullYear()} PocketCV. {t.allRightsReserved}
            </p>
          </div>
        </div>

        {/* Sticky Save Contact Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => {
                const allLinks = [
                  ...socialLinks.map(l => ({ title: l.title, url: l.url })),
                  ...ungroupedLinks.map(l => ({ title: l.title, url: l.url })),
                  ...sections.flatMap(s => s.links.map(l => ({ title: l.title, url: l.url }))),
                ];
                downloadVCard({
                  name: profile.name || '',
                  phone: profile.phone_number,
                  email: profile.email,
                  website: profile.slug ? window.location.origin + '/' + profile.slug : undefined,
                  bio: profile.bio,
                  photoUrl: profile.photo_url,
                  jobTitle: profile.job_title,
                  headline: profile.headline,
                  profileUrl: window.location.href,
                  publicLinks: allLinks,
                });
              }}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r ${theme.buttonGradient} text-white font-semibold text-base shadow-lg shadow-black/30 active:scale-[0.98] transition-transform`}
            >
              <Download className="w-5 h-5" />
              {t.saveContact}
            </button>
          </div>
        </div>
      </div>

      {/* Connect Options Dialog */}
      <ConnectOptionsDialog 
        open={showConnectDialog} 
        onOpenChange={setShowConnectDialog}
        profile={{
          id: profile.id,
          name: profile.name || 'User',
          slug: profile.slug,
          email: profile.email,
          photo_url: profile.photo_url,
        }}
      />
    </div>
  );
};

export default NewPublicPage;
