
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LinkType } from "@/components/LinkCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Import our components
import ThemeSelector from "./appearance/ThemeSelector";
import ColorSelector from "./appearance/ColorSelector";
import LayoutSelector from "./appearance/LayoutSelector";
import ProfilePreviewCard from "./appearance/ProfilePreviewCard";
import DesignTab from "./appearance/DesignTab";
import ProfileDesignPreview from "./appearance/ProfileDesignPreview";
import { useProfileDesign, ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";

interface AppearanceTabProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
}

const AppearanceTab = ({ userData, links }: AppearanceTabProps) => {
  const [activeTab, setActiveTab] = useState<"design">("design");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [primaryColor, setPrimaryColor] = useState<string>("#8b5cf6");
  const [backgroundColor, setBackgroundColor] = useState<string>("#faf5ff");
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "square">("rounded");
  const [font, setFont] = useState<string>("inter");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings: designSettings, saveDesignSettings } = useProfileDesign();

  // Set initial values from design settings
  useEffect(() => {
    if (designSettings) {
      // Attempt to extract primary color from button settings
      setPrimaryColor(designSettings.button_background_color);
      setBackgroundColor(designSettings.background_color);
      setFont(designSettings.font_family.split(',')[0].toLowerCase());
      // Map rounded/square based on design
      setButtonStyle(designSettings.button_border_style === 'all' ? 'rounded' : 'square');
    }
  }, [designSettings]);

  const handleSaveAppearance = async () => {
    setSaving(true);
    
    try {
      // Convert basic settings to design settings format
      const updatedSettings: Partial<ProfileDesignSettings> = {
        background_color: backgroundColor,
        button_background_color: primaryColor,
        font_family: `${font.charAt(0).toUpperCase() + font.slice(1)}, sans-serif`,
        button_border_style: buttonStyle === 'rounded' ? 'all' : 'none',
      };
      
      // Save to database
      const success = await saveDesignSettings(updatedSettings);
      
      if (success) {
        toast({
          title: "Theme saved",
          description: "Your profile appearance has been updated"
        });
      }
    } catch (error) {
      console.error('Error saving appearance:', error);
      toast({
        title: "Error saving theme",
        description: "There was a problem saving your profile appearance",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Navigate to preview page
    navigate('/preview');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize how your profile looks</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "design")}>
        <TabsList className="mb-4">
          <TabsTrigger value="design">Profile Design</TabsTrigger>
        </TabsList>
        
        <TabsContent value="design">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <DesignTab />
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Live Preview</h3>
              <ProfileDesignPreview 
                userData={userData}
                links={links}
                designSettings={designSettings}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppearanceTab;
