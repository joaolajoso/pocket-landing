
import { useState, useEffect } from "react";
import PreviewHeader from "@/components/preview/PreviewHeader";
import ProfilePreview from "@/components/ProfilePreview";
import DeviceFrame from "@/components/preview/DeviceFrame";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileDesign } from "@/hooks/profile/useProfileDesign";

const Preview = () => {
  const [viewMode, setViewMode] = useState("desktop");
  const [isFrameVisible, setIsFrameVisible] = useState(true);
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const isMobile = useIsMobile();
  const { settings: designSettings, loading: designLoading } = useProfileDesign();

  // Automatically switch to mobile view on small screens
  useEffect(() => {
    if (isMobile) {
      setViewMode("mobile");
    }
  }, [isMobile]);

  const toggleFrameVisibility = () => {
    setIsFrameVisible(!isFrameVisible);
  };

  if (loading || designLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile preview...</p>
      </div>
    );
  }

  // Get profile URL helper function
  const getProfileUrl = (slug: string) => {
    return `https://pocketcv.pt/u/${slug}`;
  };

  // Construct links from profile data to match the actual published page
  const constructLinksFromProfile = () => {
    const links = [];
    
    // Add LinkedIn link if available
    if (profile?.linkedin) {
      links.push({
        id: "linkedin-link",
        title: "LinkedIn",
        url: profile.linkedin.startsWith('http') 
          ? profile.linkedin 
          : `https://linkedin.com/in/${profile.linkedin}`,
        icon: "Linkedin",
      });
    }
    
    // Add Website link if available
    if (profile?.website) {
      links.push({
        id: "website-link",
        title: "Website",
        url: profile.website.startsWith('http') 
          ? profile.website 
          : `https://${profile.website}`,
        icon: "Globe",
      });
    }
    
    return links;
  };

  // Preview data that exactly matches the published page
  const previewData = {
    name: profile?.name || "Your Name",
    bio: profile?.bio || "Your professional headline here",
    avatarUrl: profile?.photo_url || "/placeholder.svg",
    username: profile?.slug || "username",
    links: constructLinksFromProfile(),
    profileUrl: profile?.slug ? getProfileUrl(profile.slug) : ""
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PreviewHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFrameVisible={isFrameVisible}
        toggleFrameVisibility={toggleFrameVisibility}
      />

      <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8">
        <div className="flex justify-center items-start">
          <DeviceFrame
            deviceType={viewMode}
            isFrameVisible={isFrameVisible}
            key={viewMode}
          >
            <div
              className={`bg-white min-h-full overflow-auto ${
                viewMode === "mobile" ? "max-w-[100%]" : ""
              }`}
            >
              <div className="p-4 md:p-6">
                <ProfilePreview 
                  profile={previewData} 
                  isPreview={true} 
                  designSettings={designSettings}
                />
              </div>
            </div>
          </DeviceFrame>
        </div>
      </div>
    </div>
  );
};

export default Preview;
