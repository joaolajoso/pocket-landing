import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Share2, ExternalLink, ScanLine } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

import QRCodeDialog from "@/components/profile/QRCodeDialog";
import QRScannerDialog from "@/components/event-public/QRScannerDialog";
import { getProfileUrl } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { ProfileBannerUpload } from "./ProfileBannerUpload";
import { ProfilePhotoUploader } from "./profile-form/ProfilePhotoUploader";
import { useProfilePhoto } from "@/hooks/profile/useProfilePhoto";
import AnimatedStatCounter from "./AnimatedStatCounter";

interface ProfileSectionProps {
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
  onEditProfile: () => void;
}

const ProfileSection = ({ userData, onEditProfile }: ProfileSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  // Total stats (all-time)
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  // Weekly growth (this week - previous week)
  const [weeklyGrowthViews, setWeeklyGrowthViews] = useState(0);
  const [weeklyGrowthClicks, setWeeklyGrowthClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { uploadProfilePhoto, deleteProfilePhoto } = useProfilePhoto();
  const [photoUrl, setPhotoUrl] = useState(userData.avatarUrl);

  const initials = useMemo(() => {
    if (!userData.name) return "?";
    return userData.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [userData.name]);

  // Update photoUrl when userData changes
  useEffect(() => {
    setPhotoUrl(userData.avatarUrl);
  }, [userData.avatarUrl]);

  // Fetch banner URL
  useEffect(() => {
    const fetchBanner = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("banner_url")
        .eq("id", user.id)
        .single();
      
      if (!error && data) {
        setBannerUrl(data.banner_url);
      }
    };
    
    fetchBanner();
  }, [user, refreshKey]);

  // Fetch all-time stats and weekly growth
  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get date ranges
        const now = new Date();
        const oneWeekAgo = subDays(now, 7);
        const twoWeeksAgo = subDays(now, 14);
        const oneWeekAgoStr = format(oneWeekAgo, "yyyy-MM-dd");
        const twoWeeksAgoStr = format(twoWeeksAgo, "yyyy-MM-dd");
        
        // TOTAL ALL-TIME: Fetch all profile views (not from link clicks)
        const { count: allTimeViews, error: allTimeViewsError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .not("source", "like", "click:%");
        
        if (!allTimeViewsError) {
          setTotalViews(allTimeViews || 0);
        }
        
        // TOTAL ALL-TIME: Fetch all link clicks
        const { count: allTimeClicks, error: allTimeClicksError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .like("source", "click:%");
        
        if (!allTimeClicksError) {
          setTotalClicks(allTimeClicks || 0);
        }
        
        // THIS WEEK: Profile views
        const { count: thisWeekViews, error: thisWeekViewsError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .not("source", "like", "click:%")
          .gte("timestamp", oneWeekAgoStr);
        
        // PREVIOUS WEEK: Profile views (between 2 weeks ago and 1 week ago)
        const { count: prevWeekViews, error: prevWeekViewsError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .not("source", "like", "click:%")
          .gte("timestamp", twoWeeksAgoStr)
          .lt("timestamp", oneWeekAgoStr);
        
        // Calculate weekly growth for views
        if (!thisWeekViewsError && !prevWeekViewsError) {
          const growth = (thisWeekViews || 0) - (prevWeekViews || 0);
          setWeeklyGrowthViews(growth);
        }
        
        // THIS WEEK: Link clicks
        const { count: thisWeekClicks, error: thisWeekClicksError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .like("source", "click:%")
          .gte("timestamp", oneWeekAgoStr);
        
        // PREVIOUS WEEK: Link clicks
        const { count: prevWeekClicks, error: prevWeekClicksError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .like("source", "click:%")
          .gte("timestamp", twoWeeksAgoStr)
          .lt("timestamp", oneWeekAgoStr);
        
        // Calculate weekly growth for clicks
        if (!thisWeekClicksError && !prevWeekClicksError) {
          const growth = (thisWeekClicks || 0) - (prevWeekClicks || 0);
          setWeeklyGrowthClicks(growth);
        }
        
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileStats();
  }, [user]);

  const handleGenerateQR = () => {
    if (!userData.username) {
      toast({
        title: t.messages.usernameNotSet,
        description: t.messages.usernameNotSetDescription,
        variant: "destructive"
      });
      return;
    }
    setQrDialogOpen(true);
  };

  const handleShareProfile = async () => {
    if (!userData.username) {
      toast({
        title: t.messages.usernameNotSet,
        description: t.messages.usernameNotSetDescription,
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(userData.username);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${userData.name}'s PocketCV profile`,
          url: profileUrl
        });
        toast({
          title: t.messages.sharedSuccessfully
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: t.messages.profileLinkCopied,
          description: `${t.messages.linkCopiedFull} ${profileUrl}`
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBannerUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    try {
      const url = await uploadProfilePhoto(file);
      if (url) {
        setPhotoUrl(url);
        return url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
      return null;
    }
  };

  const handlePhotoDelete = async (): Promise<boolean> => {
    try {
      const success = await deleteProfilePhoto();
      if (success) {
        setPhotoUrl('');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting your profile picture",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <Card className="mb-4 md:mb-6 overflow-hidden">
      <CardContent className="p-3 md:p-6">
        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          {/* Main Profile Section */}
          <div className="flex items-start gap-3 md:gap-8 overflow-hidden">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <ProfilePhotoUploader
              displayName={userData.name || "User"}
              photoUrl={photoUrl}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
              disabled={!user}
              className="lg:w-32 lg:h-32"
            />
          </div>

          {/* Profile Information */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-base md:text-2xl font-bold text-foreground mb-1 truncate">
                  {userData.name || t.overview.profile.addYourName}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  @{userData.username || "username-not-set"}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShareProfile}
                  className="gap-1 text-xs px-2 py-1 h-8"
                >
                  <Share2 className="h-3 w-3" />
                  <span className="hidden md:inline">{t.overview.profile.share}</span>
                </Button>
                
                <QRCodeDialog
                  open={qrDialogOpen}
                  onOpenChange={setQrDialogOpen}
                  profileUrl={`${getProfileUrl(userData.username)}?source=qr`}
                  profileName={userData.name || userData.username}
                  profilePhoto={userData.avatarUrl}
                  headline={userData.headline}
                  title={t.overview.profile.profileQRCode}
                  trigger={
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleGenerateQR}
                      className="gap-1.5 text-xs px-2 md:px-3 py-1 h-8 bg-gradient-to-r from-pocketcv-coral via-pocketcv-purple to-pocketcv-blue hover:opacity-90 text-white border-0 shadow-lg whitespace-nowrap"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span className="hidden xs:inline">Download QR</span>
                      <span className="xs:hidden">QR</span>
                    </Button>
                  }
                />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScannerOpen(true)}
                  className="gap-1 text-xs px-2 py-1 h-8"
                >
                  <ScanLine className="h-3 w-3" />
                  <span className="hidden md:inline">Scan QR</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(getProfileUrl(userData.username), '_blank')}
                  className="gap-1 text-xs px-2 py-1 h-8"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden md:inline">Ver Perfil</span>
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-2 md:mb-4">
              <p className="text-xs md:text-base text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-3">
                {userData.bio || t.overview.profile.addBio}
              </p>
            </div>

            {/* Stats - Gamified animated counters */}
            <div className="flex items-center gap-3 md:gap-6 mt-2">
              <AnimatedStatCounter
                total={totalViews}
                weeklyNew={weeklyGrowthViews}
                label={t.overview.profile.profileViews || 'visualizações do perfil'}
                loading={loading}
                storageKey="profile_views"
              />
              <div className="h-10 w-px bg-border flex-shrink-0"></div>
              <AnimatedStatCounter
                total={totalClicks}
                weeklyNew={weeklyGrowthClicks}
                label={t.overview.profile.linkClicks || 'cliques em links'}
                loading={loading}
                storageKey="link_clicks"
              />
            </div>
          </div>
        </div>

        {/* Banner Section - Desktop Only */}
        <div className="hidden lg:block">
          <ProfileBannerUpload 
            bannerUrl={bannerUrl} 
            onUpdate={handleBannerUpdate}
          />
        </div>
        </div>
      </CardContent>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
      />
    </Card>
  );
};

export default ProfileSection;
