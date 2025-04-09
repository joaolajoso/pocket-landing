
import { useState } from "react";
import PreviewHeader from "@/components/preview/PreviewHeader";
import ProfilePreview from "@/components/ProfilePreview";
import DeviceFrame from "@/components/preview/DeviceFrame";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const Preview = () => {
  const [viewMode, setViewMode] = useState("desktop");
  const [isFrameVisible, setIsFrameVisible] = useState(true);
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  const toggleFrameVisibility = () => {
    setIsFrameVisible(!isFrameVisible);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  // Default profile data, will be overridden by real data from useProfile()
  const previewData = {
    name: profile?.name || "Your Name",
    bio: profile?.bio || "Your professional headline here",
    avatarUrl: profile?.photo_url || "/placeholder.svg",
    username: profile?.slug || "username",
    links: [
      // Sample links - in a real app, these would come from the user's data
      {
        id: "1",
        title: "LinkedIn",
        url: profile?.linkedin || "https://linkedin.com",
        icon: "Linkedin",
      },
      {
        id: "2",
        title: "Website",
        url: profile?.website || "https://example.com",
        icon: "Globe",
      },
    ],
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
            viewMode={viewMode}
            isFrameVisible={isFrameVisible}
            key={viewMode}
          >
            <div
              className={`bg-white min-h-full overflow-auto ${
                viewMode === "mobile" ? "max-w-[100%]" : ""
              }`}
            >
              <div className="p-6">
                <ProfilePreview profile={previewData} isPreview={true} />
              </div>
            </div>
          </DeviceFrame>
        </div>
      </div>
    </div>
  );
};

export default Preview;
