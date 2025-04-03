
import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import ProfilePreview from "@/components/ProfilePreview";
import { LinkType } from "@/components/LinkCard";
import PreviewHeader from "@/components/preview/PreviewHeader";
import DeviceFrame from "@/components/preview/DeviceFrame";
import { Eye } from "lucide-react";

const Preview = () => {
  const [viewMode, setViewMode] = useState("desktop");
  const [isFrameVisible, setIsFrameVisible] = useState(true);
  
  // Mock user profile data
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    bio: "Product Designer & Developer",
    avatarUrl: "",
    links: [] as LinkType[]
  });
  
  // Load profile data on mount (mock data)
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setProfile({
        name: "Alex Johnson",
        bio: "Product Designer & Developer",
        avatarUrl: "",
        links: [
          {
            id: "1",
            title: "My LinkedIn",
            url: "https://linkedin.com/in/alexjohnson",
            icon: <Eye className="h-4 w-4" />,
          },
          {
            id: "2",
            title: "Portfolio Website",
            url: "https://alexjohnson.design",
            icon: <Eye className="h-4 w-4" />,
          },
          {
            id: "3",
            title: "Resume/CV",
            url: "https://alexjohnson.design/resume.pdf",
            icon: <Eye className="h-4 w-4" />,
          },
        ]
      });
    }, 500);
  }, []);
  
  const toggleFrameVisibility = () => {
    setIsFrameVisible(!isFrameVisible);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <PreviewHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFrameVisible={isFrameVisible}
        toggleFrameVisibility={toggleFrameVisibility}
      />
      
      {/* Preview Content */}
      <div className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <TabsContent value="desktop" className="w-full mt-0">
            <DeviceFrame isFrameVisible={isFrameVisible} viewMode="desktop">
              <ProfilePreview profile={profile} isPreview={true} />
            </DeviceFrame>
          </TabsContent>
          
          <TabsContent value="mobile" className="w-full mt-0">
            <DeviceFrame isFrameVisible={isFrameVisible} viewMode="mobile">
              <ProfilePreview profile={profile} isPreview={true} />
            </DeviceFrame>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default Preview;
