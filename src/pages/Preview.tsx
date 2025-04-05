
import { useState, useEffect } from "react";
import ProfilePreview from "@/components/ProfilePreview";
import PreviewHeader from "@/components/preview/PreviewHeader";
import DeviceFrame from "@/components/preview/DeviceFrame";
import { LinkType } from "@/components/LinkCard";

// Mock user data for preview
const previewUserData = {
  id: "preview-user-1",
  name: "Victor Julio",
  bio: "Product Designer & Frontend Developer",
  email: "victor@example.com",
  username: "victorjulio",
  avatarUrl: "/lovable-uploads/98e0d60e-a584-4780-8e34-8ae81c3f7c21.png",
  profileViews: 128,
  totalClicks: 45,
};

// Mock links for preview
const previewLinks: LinkType[] = [
  {
    id: "1",
    title: "Portfolio Website",
    url: "https://victorjulio.com",
    icon: null,
  },
  {
    id: "2",
    title: "LinkedIn Profile",
    url: "https://linkedin.com/in/victorjulio",
    icon: null,
  },
  {
    id: "3",
    title: "Download Resume",
    url: "https://victorjulio.com/resume.pdf",
    icon: null,
  },
];

const Preview = () => {
  const [viewMode, setViewMode] = useState("mobile");
  const [isFrameVisible, setIsFrameVisible] = useState(true);
  const [theme, setTheme] = useState({
    theme: "light",
    primaryColor: "#8b5cf6",
    backgroundColor: "#faf5ff",
    buttonStyle: "rounded",
    font: "inter"
  });

  useEffect(() => {
    // Load theme settings from localStorage
    const savedTheme = localStorage.getItem('pocketcv-theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }

    // Apply theme variables to CSS
    document.documentElement.style.setProperty('--profile-primary-color', getHslFromHex(theme.primaryColor));
    document.documentElement.style.setProperty('--profile-bg-color', getHslFromHex(theme.backgroundColor));
    
    // Clean up when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--profile-primary-color');
      document.documentElement.style.removeProperty('--profile-bg-color');
    };
  }, [theme.primaryColor, theme.backgroundColor]);

  // Helper function to convert hex color to HSL format for CSS variables
  const getHslFromHex = (hex: string): string => {
    // This is a simplified conversion - in a real app, you'd use a more accurate conversion
    // For now, we'll return placeholder values based on the colors we're using
    const colorMap: Record<string, string> = {
      "#8b5cf6": "262.1 83.3% 57.8%", // Purple
      "#3b82f6": "217.2 91.2% 59.8%", // Blue
      "#22c55e": "142.1 70.6% 45.3%", // Green
      "#eab308": "47.9 95.8% 53.1%", // Yellow
      "#ef4444": "0 84.2% 60.2%", // Red
      "#faf5ff": "270 100% 97.6%", // Light Purple
      "#eff6ff": "213.8 100% 96.9%", // Light Blue
      "#f0fdf4": "142.1 76.2% 97.3%", // Light Green
      "#fefce8": "48 100% 96.1%", // Light Yellow
      "#fef2f2": "0 85.7% 97.3%", // Light Red
    };
    
    return colorMap[hex] || "262.1 83.3% 57.8%"; // Default to purple if not found
  };

  const toggleFrameVisibility = () => {
    setIsFrameVisible(!isFrameVisible);
  };

  return (
    <div className="flex flex-col h-screen">
      <PreviewHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFrameVisible={isFrameVisible}
        toggleFrameVisibility={toggleFrameVisibility}
      />
      
      <div 
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <DeviceFrame
          isFrameVisible={isFrameVisible}
          deviceType={viewMode}
        >
          <div className="h-full overflow-y-auto profile-page">
            <ProfilePreview
              profile={{
                name: previewUserData.name,
                bio: previewUserData.bio,
                avatarUrl: previewUserData.avatarUrl,
                links: previewLinks,
                username: previewUserData.username,
              }}
              isPreview={true}
            />
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
};

export default Preview;
