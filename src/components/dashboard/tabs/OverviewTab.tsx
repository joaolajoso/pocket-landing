import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Briefcase, Plus, Link as LinkIcon, Pencil, FileText, Upload, Users, Zap, Share2, ExternalLink, QrCode, ChevronDown, ChevronUp, Download, GraduationCap, FolderKanban, Award, ScanLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useExperiences } from "@/hooks/useExperiences";
import { useCustomLinks } from "@/hooks/useCustomLinks";
import { useProfileDesign } from "@/hooks/profile/useProfileDesign";
import { useProfilePhoto } from "@/hooks/profile/useProfilePhoto";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { getProfileUrl } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { LinkType } from "@/components/LinkCard";
import QRCodeDialog from "@/components/profile/QRCodeDialog";
import QRScannerDialog from "@/components/event-public/QRScannerDialog";
import { ProfilePhotoUploader } from "./overview/profile-form/ProfilePhotoUploader";
import { ProfileBannerUpload } from "./overview/ProfileBannerUpload";
import AnimatedStatCounter from "./overview/AnimatedStatCounter";

// Inline edit dialogs - reuse existing components
import SocialLinksCard from "./overview/SocialLinksCard";
import ExperienceCard from "./overview/ExperienceCard";
import ProfileFileCard from "./overview/ProfileFileCard";
import UserLinks from "./overview/UserLinks";
import MatchmakingTagsOverview from "./overview/MatchmakingTagsOverview";
import ConnectionCard from "./network/ConnectionCard";
import ConnectionDetailSheet from "./network/ConnectionDetailSheet";
import PWAInstallGuide from "./overview/PWAInstallGuide";
import PaymentMethodCard from "./overview/PaymentMethodCard";
import { useNetworkConnections } from "@/hooks/network/useNetworkConnections";

// Social platforms config (mirrors NewPublicPage)
import { Linkedin, Github, Instagram, Twitter, Facebook, Youtube, MessageCircle, Send, Globe } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialPlatformsConfig: Record<string, {
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
  website: { icon: Globe, bgColor: "bg-muted", iconColor: "text-foreground" },
};

import { resolveTheme } from "@/config/profileThemes";

interface OverviewTabProps {
  userData: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
    headline?: string;
  };
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string) => void;
  onDeleteLink: (linkId: string) => void;
  onNavigateToTab: (tab: string, subTab?: string) => void;
  onRefreshData?: () => void;
}

const OverviewTab = ({
  userData,
  links,
  onOpenLinkEditor,
  onDeleteLink,
  onNavigateToTab,
  onRefreshData,
}: OverviewTabProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const dateLocale = language === 'pt' ? ptBR : enUS;
  const { toast } = useToast();
  const { organization } = useOrganization();
  const { connections, loading: connectionsLoading, updateConnection, removeConnection } = useNetworkConnections();
  const [detailConnection, setDetailConnection] = useState<any>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Data hooks
  const { socialLinks, loading: socialLoading } = useSocialLinks();
  const { experiences, loading: expLoading } = useExperiences();
  const { customLinks, loading: linksLoading } = useCustomLinks();
  const { settings: designSettings } = useProfileDesign(user?.id);
  const { uploadProfilePhoto, deleteProfilePhoto } = useProfilePhoto();

  // State
  const [photoUrl, setPhotoUrl] = useState(userData.avatarUrl);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [weeklyGrowthViews, setWeeklyGrowthViews] = useState(0);
  const [weeklyGrowthClicks, setWeeklyGrowthClicks] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Which section is being edited (opens the respective card editor as overlay)
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Theme
  const theme = useMemo(() => resolveTheme((designSettings as any)?.theme_key, designSettings?.background_color), [designSettings]);

  // Update photo when userData changes
  useEffect(() => { setPhotoUrl(userData.avatarUrl); }, [userData.avatarUrl]);

  // Fetch file & banner
  useEffect(() => {
    if (!user) return;
    const fetchProfileData = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_file_url, profile_file_name, banner_url")
        .eq("id", user.id)
        .single();
      if (data) {
        setFileUrl(data.profile_file_url);
        setFileName(data.profile_file_name);
        setBannerUrl(data.banner_url);
      }
    };
    fetchProfileData();
  }, [user, refreshKey]);

  // Fetch stats
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const now = new Date();
        const oneWeekAgo = subDays(now, 7);
        const twoWeeksAgo = subDays(now, 14);
        const oneWeekAgoStr = format(oneWeekAgo, "yyyy-MM-dd");
        const twoWeeksAgoStr = format(twoWeeksAgo, "yyyy-MM-dd");

        const [allViews, allClicks, thisWeekViews, prevWeekViews, thisWeekClicks, prevWeekClicks] = await Promise.all([
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", user.id).not("source", "like", "click:%"),
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", user.id).like("source", "click:%"),
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", user.id).not("source", "like", "click:%").gte("timestamp", oneWeekAgoStr),
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", user.id).not("source", "like", "click:%").gte("timestamp", twoWeeksAgoStr).lt("timestamp", oneWeekAgoStr),
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", user.id).like("source", "click:%").gte("timestamp", oneWeekAgoStr),
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", user.id).like("source", "click:%").gte("timestamp", twoWeeksAgoStr).lt("timestamp", oneWeekAgoStr),
        ]);

        setTotalViews(allViews.count || 0);
        setTotalClicks(allClicks.count || 0);
        setWeeklyGrowthViews((thisWeekViews.count || 0) - (prevWeekViews.count || 0));
        setWeeklyGrowthClicks((thisWeekClicks.count || 0) - (prevWeekClicks.count || 0));
      } catch (e) {
        console.error("Stats error:", e);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const initials = useMemo(() => {
    if (!userData.name) return "?";
    return userData.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  }, [userData.name]);

  const handlePhotoUpload = async (file: File) => {
    const url = await uploadProfilePhoto(file);
    if (url) setPhotoUrl(url);
    return url;
  };
  const handlePhotoDelete = async () => {
    const ok = await deleteProfilePhoto();
    if (ok) setPhotoUrl('');
    return ok;
  };

  const handleShareProfile = async () => {
    if (!userData.username) return;
    const profileUrl = getProfileUrl(userData.username);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${userData.name}'s PocketCV`, url: profileUrl });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        toast({ title: t.messages.profileLinkCopied });
      }
    } catch (e) { /* noop */ }
  };

  const formatDateRange = (startDate: string | null, endDate: string | null, isCurrent: boolean) => {
    if (!startDate) return '';
    const start = format(new Date(startDate), 'MMM yyyy', { locale: dateLocale });
    if (isCurrent) return `${start} - ${language === 'pt' ? 'Presente' : 'Present'}`;
    if (endDate) return `${start} - ${format(new Date(endDate), 'MMM yyyy', { locale: dateLocale })}`;
    return start;
  };

  const experienceTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    current_job: Briefcase,
    past_job: Briefcase,
    education: GraduationCap,
    project: FolderKanban,
    award: Award,
    other: Briefcase,
  };

  // Helper: dashed empty-state card wrapper
  const EmptyCard = ({ label, icon: Icon, onClick }: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 p-5 rounded-xl border border-dashed border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-lg ${theme.accentLight} flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity`}>
        <Icon className={`w-5 h-5 ${theme.textAccent}`} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-medium text-sm group-hover:text-white/70 transition-colors">{label}</span>
        <Plus className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
      </div>
    </button>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Public page mirror container — edge-to-edge */}
      <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} overflow-hidden`}>
        
        {/* Profile Header Section */}
        <div className="flex flex-col items-center px-6 pt-8 pb-8">
          {/* Profile Photo - Editable */}
          <div className="relative mb-3">
            <ProfilePhotoUploader
              displayName={userData.name || "User"}
              photoUrl={photoUrl}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
              disabled={!user}
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </div>

          <Badge className={`${theme.accent} ${theme.accentHover} text-white text-sm px-4 py-1.5 rounded-full mb-4`}>
            Early Adopter
          </Badge>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            {userData.name || (language === 'pt' ? 'Adicione o seu nome' : 'Add your name')}
          </h1>

          <p className={`text-base md:text-lg ${theme.textLight} font-medium mb-2 text-center px-4`}>
            {userData.bio || (language === 'pt' ? 'Adicione a sua bio' : 'Add your bio')}
          </p>

          <p className={`text-sm ${theme.textMuted} mb-5`}>
            @{userData.username || "username"}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-white/70" />
              <AnimatedStatCounter
                total={totalViews}
                weeklyNew={weeklyGrowthViews}
                label={t.overview?.profile?.profileViews || 'views'}
                loading={statsLoading}
                storageKey="profile_views"
                valueClassName="text-white font-extrabold"
                labelClassName="text-white/60"
              />
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-white/70" />
              <AnimatedStatCounter
                total={totalClicks}
                weeklyNew={weeklyGrowthClicks}
                label={t.overview?.profile?.linkClicks || 'clicks'}
                loading={statsLoading}
                storageKey="link_clicks"
                valueClassName="text-white font-extrabold"
                labelClassName="text-white/60"
              />
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareProfile}
              className="gap-1.5 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Share2 className="h-3.5 w-3.5" />
              {language === 'pt' ? 'Partilhar' : 'Share'}
            </Button>
            <Button
              size="sm"
              onClick={() => setQrDialogOpen(true)}
              className="gap-1.5 text-xs bg-gradient-to-r from-pocketcv-coral via-pocketcv-purple to-pocketcv-blue hover:opacity-90 text-white border-0"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScannerOpen(true)}
              className="gap-1.5 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ScanLine className="h-3.5 w-3.5" />
              Scan QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getProfileUrl(userData.username), '_blank')}
              className="gap-1.5 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {language === 'pt' ? 'Ver' : 'View'}
            </Button>
          </div>
        </div>

        {/* Main Content — mirrors public page layout */}
        <div className="px-4 sm:px-6 pb-8 space-y-4 max-w-lg mx-auto">

          {/* Call & Email - always visible, show status */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigateToTab("settings")}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-colors cursor-pointer ${
                userData.email ? 'bg-[#2A2A2A]/80 hover:bg-[#2A2A2A]' : 'bg-[#2A2A2A]/30 border-2 border-dashed border-white/20 hover:border-white/40'
              }`}
            >
              <div className={`w-14 h-14 rounded-full ${theme.accentLight} flex items-center justify-center ${!userData.email ? 'opacity-50' : ''}`}>
                <Phone className={`w-7 h-7 ${theme.textAccent}`} />
              </div>
              <span className={`font-semibold text-base ${userData.email ? 'text-white' : 'text-white/40'}`}>
                {language === 'pt' ? 'Ligar' : 'Call'}
              </span>
            </button>

            <button
              onClick={() => onNavigateToTab("settings")}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-colors cursor-pointer ${
                userData.email ? 'bg-[#2A2A2A]/80 hover:bg-[#2A2A2A]' : 'bg-[#2A2A2A]/30 border-2 border-dashed border-white/20 hover:border-white/40'
              }`}
            >
              <div className={`w-14 h-14 rounded-full ${theme.accentLight} flex items-center justify-center ${!userData.email ? 'opacity-50' : ''}`}>
                <Mail className={`w-7 h-7 ${theme.textAccent}`} />
              </div>
              <span className={`font-semibold text-base ${userData.email ? 'text-white' : 'text-white/40'}`}>
                Email
              </span>
            </button>
          </div>

          {/* Experience Section - editable */}
          <AnimatePresence mode="wait">
          {editingSection === 'experience' ? (
            <motion.div
              key="experience-editor"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 p-4 shadow-lg"
            >
              <ExperienceCard />
              <button onClick={() => setEditingSection(null)} className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                {language === 'pt' ? '← Fechar edição' : '← Close editor'}
              </button>
            </motion.div>
          ) : experiences.length > 0 ? (
            <button onClick={() => setEditingSection('experience')} className="w-full text-left rounded-xl bg-[#2A2A2A]/80 p-4 hover:bg-[#2A2A2A] transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${theme.accentLight} flex items-center justify-center`}>
                    <Briefcase className={`w-4 h-4 ${theme.textAccent}`} />
                  </div>
                  <h2 className="text-base font-bold text-white">{t.experience?.title || 'Experience'}</h2>
                </div>
                <Pencil className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
              <div className="space-y-3">
                {experiences.map((exp) => {
                  const ExpIcon = experienceTypeIcons[exp.experience_type] || Briefcase;
                  return (
                    <div key={exp.id} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${theme.accent} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {exp.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-sm">{exp.company_name}</h3>
                        <p className="text-white/60 text-xs">
                          {exp.role}
                          {(exp.start_date || exp.is_current) && (
                            <> · {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          ) : (
             <EmptyCard
              label={language === 'pt' ? 'Adicionar experiência' : 'Add experience'}
              icon={Briefcase}
              onClick={() => setEditingSection('experience')}
            />
          )}
          </AnimatePresence>

          {/* Social Networks - editable */}
          <AnimatePresence mode="wait">
          {editingSection === 'social' ? (
            <motion.div
              key="social-editor"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 p-4 shadow-lg"
            >
              <SocialLinksCard />
              <button onClick={() => setEditingSection(null)} className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                {language === 'pt' ? '← Fechar edição' : '← Close editor'}
              </button>
            </motion.div>
          ) : socialLinks.length > 0 ? (
            <button onClick={() => setEditingSection('social')} className="w-full text-left rounded-xl bg-[#2A2A2A]/80 p-4 hover:bg-[#2A2A2A] transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white">{t.socialLinks?.title || 'Social Networks'}</h2>
                <Pencil className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {socialLinks.slice(0, 6).map(link => {
                  const platform = socialPlatformsConfig[link.icon.toLowerCase()] || socialPlatformsConfig.website;
                  const IconComponent = platform.icon;
                  return (
                    <div key={link.id} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#1A1A1A]/60">
                      <div className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                      </div>
                      <span className="text-white/70 text-[11px] font-medium text-center leading-tight line-clamp-1">{link.title}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          ) : (
             <EmptyCard
              label={language === 'pt' ? 'Adicionar redes sociais' : 'Add social networks'}
              icon={Instagram}
              onClick={() => setEditingSection('social')}
            />
          )}
          </AnimatePresence>

          {/* Document / File - editable */}
          <AnimatePresence mode="wait">
          {editingSection === 'file' ? (
            <motion.div
              key="file-editor"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 p-4 shadow-lg"
            >
              <ProfileFileCard />
              <button onClick={() => setEditingSection(null)} className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                {language === 'pt' ? '← Fechar edição' : '← Close editor'}
              </button>
            </motion.div>
          ) : fileUrl && fileName ? (
            <button onClick={() => setEditingSection('file')} className="w-full text-left flex items-center gap-3 p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors group cursor-pointer">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1A1A1A]/60 flex-shrink-0 border border-white/10">
                {fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe src={`${fileUrl}#page=1&view=FitH`} className="w-full h-full pointer-events-none scale-[1.5] origin-top-left" title="Preview" tabIndex={-1} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className={`w-6 h-6 ${theme.textAccent}`} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{fileName}</p>
                <p className="text-white/50 text-xs">{language === 'pt' ? 'Documento público' : 'Public document'}</p>
              </div>
              <Pencil className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
            </button>
          ) : (
             <EmptyCard
              label={language === 'pt' ? 'Adicionar documento público' : 'Add public document'}
              icon={FileText}
              onClick={() => setEditingSection('file')}
            />
          )}
          </AnimatePresence>

          {/* My Links - editable */}
          <AnimatePresence mode="wait">
          {editingSection === 'links' ? (
            <motion.div
              key="links-editor"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 p-4 shadow-lg"
            >
              <UserLinks />
              <button onClick={() => setEditingSection(null)} className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                {language === 'pt' ? '← Fechar edição' : '← Close editor'}
              </button>
            </motion.div>
          ) : customLinks.length > 0 ? (
            <button onClick={() => setEditingSection('links')} className="w-full text-left flex items-center justify-between p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors group cursor-pointer">
              <div className="flex items-center gap-2">
                <LinkIcon className={`w-5 h-5 ${theme.textAccent}`} />
                <span className="text-white font-bold text-base">{t.customLinks?.title || 'My Links'}</span>
                <span className="text-white/50 text-xs">({customLinks.length})</span>
              </div>
              <Pencil className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
          ) : (
             <EmptyCard
              label={language === 'pt' ? 'Adicionar links' : 'Add links'}
              icon={LinkIcon}
              onClick={() => setEditingSection('links')}
            />
          )}
          </AnimatePresence>

          {/* Payment Method - business only, wrapper is inside the component */}
          {organization && <PaymentMethodCard />}
        </div>

        {/* Fade-out from theme gradient to dashboard bg */}
        <div className="h-16 bg-gradient-to-b from-transparent to-background -mb-px" />
      </div>

      {/* Dashboard-native section — outside the themed gradient */}
      <div className="space-y-4 px-3 sm:px-4 md:px-6 lg:px-8 py-6">

        {/* Matchmaking */}
        <MatchmakingTagsOverview onNavigateToMatchmaking={() => onNavigateToTab("network", "preferences")} />

        {/* Connections Grid */}
        {connectionsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center p-4 rounded-2xl border border-border">
                <Skeleton className="h-16 w-16 rounded-full mb-3" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : connections.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connections
                <span className="text-sm font-normal text-muted-foreground">({connections.length})</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => onNavigateToTab("network")}
              >
                View all
                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {connections.slice(0, 6).map(connection => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onSelect={(c) => {
                    setDetailConnection(c);
                    setShowDetailSheet(true);
                  }}
                />
              ))}
            </div>
            {connections.length > 6 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onNavigateToTab("network")}
              >
                View all {connections.length} connections
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {/* Connection Detail Sheet */}
      <ConnectionDetailSheet
        connection={detailConnection}
        open={showDetailSheet}
        onOpenChange={setShowDetailSheet}
        onEdit={() => {}}
        onRemove={(id) => removeConnection(id)}
        onUpdateFollowUp={(connectionId, date) =>
          updateConnection(connectionId, { follow_up_date: date })
        }
      />

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        profileUrl={`${getProfileUrl(userData.username)}?source=qr`}
        profileName={userData.name || userData.username}
        profilePhoto={userData.avatarUrl}
        headline={userData.headline}
        title={t.overview?.profile?.profileQRCode || 'QR Code'}
      />
      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
      />
    </div>
  );
};

export default OverviewTab;
