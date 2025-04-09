
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LinkType } from "@/components/LinkCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our components
import ThemeSelector from "./appearance/ThemeSelector";
import ColorSelector from "./appearance/ColorSelector";
import LayoutSelector from "./appearance/LayoutSelector";
import ProfilePreviewCard from "./appearance/ProfilePreviewCard";
import DesignTab from "./appearance/DesignTab";
import ProfileDesignPreview from "./appearance/ProfileDesignPreview";
import { useProfileDesign } from "@/hooks/profile/useProfileDesign";

interface AppearanceTabProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
}

const AppearanceTab = ({ userData, links }: AppearanceTabProps) => {
  const [activeTab, setActiveTab] = useState<"basic" | "design">("basic");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [primaryColor, setPrimaryColor] = useState<string>("#8b5cf6");
  const [backgroundColor, setBackgroundColor] = useState<string>("#faf5ff");
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "square">("rounded");
  const [font, setFont] = useState<string>("inter");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings: designSettings } = useProfileDesign();

  const handleSaveAppearance = () => {
    setSaving(true);
    
    // Save theme settings to localStorage for demo purposes
    localStorage.setItem('pocketcv-theme', JSON.stringify({
      theme,
      primaryColor,
      backgroundColor,
      buttonStyle,
      font
    }));
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Theme saved",
        description: "Your profile appearance has been updated"
      });
    }, 1000);
  };

  const handlePreview = () => {
    // Save current settings before preview
    localStorage.setItem('pocketcv-theme', JSON.stringify({
      theme,
      primaryColor,
      backgroundColor,
      buttonStyle,
      font
    }));
    
    // Navigate to preview page
    navigate('/preview');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize how your profile looks</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "basic" | "design")}>
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="design">Advanced Design</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfilePreviewCard 
              userData={userData}
              links={links}
              backgroundColor={backgroundColor}
              buttonStyle={buttonStyle}
              font={font}
              onPreview={handlePreview}
            />
            
            <div className="space-y-6">
              <ThemeSelector 
                theme={theme}
                setTheme={setTheme}
              />
              
              <ColorSelector 
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
              />
              
              <LayoutSelector 
                font={font}
                setFont={setFont}
                buttonStyle={buttonStyle}
                setButtonStyle={setButtonStyle}
                saving={saving}
                onSave={handleSaveAppearance}
              />
            </div>
          </div>
        </TabsContent>
        
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
