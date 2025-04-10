
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
  const { settings: designSettings, saveDesignSettings, loading: designLoading } = useProfileDesign();

  // Set initial values from design settings
  useEffect(() => {
    if (designSettings) {
      // Attempt to extract primary color from button settings
      setPrimaryColor(designSettings.button_background_color);
      setBackgroundColor(designSettings.background_color);
      // Extract font name from font-family string
      const fontName = designSettings.font_family.split(',')[0].toLowerCase().replace(/['"]/g, '');
      setFont(fontName);
      // Map rounded/square based on design
      setButtonStyle(designSettings.button_border_style === 'all' ? 'rounded' : 'square');
    }
  }, [designSettings]);

  const handleSaveAppearance = async () => {
    setSaving(true);
    
    try {
      // Get current design settings to preserve gradient settings
      const currentSettings = designSettings || {};
      
      // Convert basic settings to design settings format
      const updatedSettings: Partial<ProfileDesignSettings> = {
        background_color: backgroundColor,
        button_background_color: primaryColor,
        font_family: `${font.charAt(0).toUpperCase() + font.slice(1)}, sans-serif`,
        button_border_style: buttonStyle === 'rounded' ? 'all' : 'none',
      };
      
      // If current background type is gradient, preserve gradient colors
      if (currentSettings.background_type === 'gradient') {
        updatedSettings.background_type = 'gradient';
        updatedSettings.background_gradient_start = currentSettings.background_gradient_start;
        updatedSettings.background_gradient_end = currentSettings.background_gradient_end;
      }
      
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
    // Navigate to the public profile instead of preview
    if (userData && userData.name) {
      const slug = userData.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/u/${slug}`);
    } else {
      toast({
        title: "Cannot preview profile",
        description: "Please set your name or username first",
        variant: "destructive"
      });
    }
  };

  // Handle color communication with DesignTab
  const handleExternalColorChange = (property: string, value: string) => {
    if (property === 'background_color') {
      setBackgroundColor(value);
    } else if (property === 'button_background_color') {
      setPrimaryColor(value);
    }
  };

  // Handle font and button style changes from LayoutSelector
  const handleFontChange = (newFont: string) => {
    setFont(newFont);
  };

  const handleButtonStyleChange = (newStyle: "rounded" | "square") => {
    setButtonStyle(newStyle);
  };

  // Create a preview design settings object that updates in real-time
  const livePreviewSettings: ProfileDesignSettings = {
    ...designSettings || {},
    background_color: backgroundColor,
    button_background_color: primaryColor,
    font_family: `${font.charAt(0).toUpperCase() + font.slice(1)}, sans-serif`,
    button_border_style: buttonStyle === 'rounded' ? 'all' : 'none',
    background_type: designSettings?.background_type || 'solid',
    background_gradient_start: designSettings?.background_gradient_start,
    background_gradient_end: designSettings?.background_gradient_end,
    name_color: designSettings?.name_color || '#000000',
    description_color: designSettings?.description_color || '#555555',
    section_title_color: designSettings?.section_title_color || '#333333',
    link_text_color: designSettings?.link_text_color || '#ffffff',
    button_text_color: designSettings?.button_text_color || '#ffffff',
    button_icon_color: designSettings?.button_icon_color || '#ffffff',
    button_icon_position: designSettings?.button_icon_position || 'left',
    text_alignment: designSettings?.text_alignment || 'center'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize how your profile looks</p>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handlePreview} variant="outline" className="mr-2">
          View Public Profile
        </Button>
        <Button
          onClick={handleSaveAppearance}
          disabled={saving || designLoading}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "design")}>
        <TabsList className="mb-4">
          <TabsTrigger value="design">Profile Design</TabsTrigger>
        </TabsList>
        
        <TabsContent value="design">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <DesignTab 
                onExternalColorChange={handleExternalColorChange}
                externalBackgroundColor={backgroundColor}
                externalButtonColor={primaryColor}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorSelector 
                  primaryColor={primaryColor}
                  setPrimaryColor={setPrimaryColor}
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                />
                
                <LayoutSelector 
                  font={font}
                  setFont={handleFontChange}
                  buttonStyle={buttonStyle}
                  setButtonStyle={handleButtonStyleChange}
                  saving={saving}
                  onSave={null} // Remove save button from LayoutSelector
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Live Preview</h3>
              <ProfileDesignPreview 
                userData={userData}
                links={links}
                designSettings={livePreviewSettings}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppearanceTab;
