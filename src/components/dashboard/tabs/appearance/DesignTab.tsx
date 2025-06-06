
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { useProfileDesign, ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UploadButton } from "@/components/UploadButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  applyImmediately?: boolean;
}

interface DesignTabProps {
  onExternalColorChange?: (property: string, value: string) => void;
  externalBackgroundColor?: string;
  externalButtonColor?: string;
}

const ColorPicker = ({ label, value, onChange, applyImmediately = false }: ColorPickerProps) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={`color-${label}`}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={`color-${label}`}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
        <div className="relative flex items-center">
          <Input
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="block h-9 w-9 cursor-pointer overflow-hidden rounded-md p-0 opacity-0 absolute inset-0"
          />
          <div
            className="h-9 w-9 rounded-md border"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    </div>
  );
};

const DesignTab = ({ 
  onExternalColorChange, 
  externalBackgroundColor, 
  externalButtonColor 
}: DesignTabProps = {}) => {
  const { settings, saving, saveDesignSettings, resetDesignSettings } = useProfileDesign();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("background");
  const [tempSettings, setTempSettings] = useState<ProfileDesignSettings | null>(null);
  
  // Initialize tempSettings from settings
  useEffect(() => {
    if (settings) {
      setTempSettings(settings);
    }
  }, [settings]);
  
  // Update tempSettings when external values change
  useEffect(() => {
    if (!tempSettings) return;
    
    if (externalBackgroundColor) {
      setTempSettings(prev => prev ? {
        ...prev,
        background_color: externalBackgroundColor
      } : null);
    }
    
    if (externalButtonColor) {
      setTempSettings(prev => prev ? {
        ...prev,
        button_background_color: externalButtonColor
      } : null);
    }
  }, [externalBackgroundColor, externalButtonColor]);
  
  const updateSetting = <K extends keyof ProfileDesignSettings>(
    key: K,
    value: ProfileDesignSettings[K]
  ) => {
    if (!tempSettings) return;
    
    // Update local state immediately
    setTempSettings(prev => prev ? {
      ...prev,
      [key]: value
    } : null);
    
    // Apply changes immediately
    const updateObj = { [key]: value } as Partial<ProfileDesignSettings>;
    
    // Save to database immediately for real-time updates
    saveDesignSettings(updateObj)
      .then(() => {
        // Update external state for coordinating with parent components
        if (onExternalColorChange) {
          if (key === 'background_color' || key === 'button_background_color') {
            onExternalColorChange(key, value as string);
          }
        }
      })
      .catch(error => {
        console.error('Error saving design setting:', error);
        toast({
          title: "Error saving design",
          description: "Your changes couldn't be saved automatically.",
          variant: "destructive"
        });
      });
  };
  
  const handleResetDesign = async () => {
    if (confirm("Are you sure you want to reset your design to defaults?")) {
      await resetDesignSettings();
      if (tempSettings) {
        setTempSettings(settings);
      }
    }
  };
  
  const handleImageUpload = async (file: File) => {
    try {
      if (!file) return;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `background_images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);
      
      await saveDesignSettings({
        background_image_url: data.publicUrl,
        background_type: 'image'
      });
      
      if (tempSettings) {
        setTempSettings(prev => prev ? {
          ...prev,
          background_image_url: data.publicUrl,
          background_type: 'image'
        } : null);
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error uploading image",
        description: "There was a problem uploading your background image.",
        variant: "destructive"
      });
    }
  };

  if (!tempSettings) {
    return <div>Loading design settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Design</h2>
          <p className="text-muted-foreground">Customize the look and feel of your profile</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetDesign}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="background">
          <Card>
            <CardHeader>
              <CardTitle>Background</CardTitle>
              <CardDescription>Customize the background of your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Background Type</Label>
                <RadioGroup 
                  value={tempSettings.background_type} 
                  onValueChange={(value) => updateSetting('background_type', value as 'solid' | 'gradient' | 'image')}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="solid" id="bg-solid" className="sr-only" />
                    <Label
                      htmlFor="bg-solid"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.background_type === "solid" ? "border-primary" : ""
                      }`}
                    >
                      <div className="w-full h-16 rounded-md" style={{ backgroundColor: tempSettings.background_color }}></div>
                      <span className="mt-2">Solid</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="gradient" id="bg-gradient" className="sr-only" />
                    <Label
                      htmlFor="bg-gradient"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.background_type === "gradient" ? "border-primary" : ""
                      }`}
                    >
                      <div 
                        className="w-full h-16 rounded-md" 
                        style={{ 
                          background: `linear-gradient(135deg, ${tempSettings.background_gradient_start || '#ffffff'}, ${tempSettings.background_gradient_end || '#f0f9ff'})` 
                        }}
                      ></div>
                      <span className="mt-2">Gradient</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="image" id="bg-image" className="sr-only" />
                    <Label
                      htmlFor="bg-image"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.background_type === "image" ? "border-primary" : ""
                      }`}
                    >
                      <div 
                        className="w-full h-16 rounded-md bg-cover bg-center" 
                        style={{ 
                          backgroundImage: tempSettings.background_image_url ? 
                            `url(${tempSettings.background_image_url})` : 
                            'none',
                          backgroundColor: '#e5e7eb'
                        }}
                      ></div>
                      <span className="mt-2">Image</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              {tempSettings.background_type === "solid" && (
                <div className="space-y-4">
                  <ColorPicker 
                    label="Background Color" 
                    value={tempSettings.background_color} 
                    onChange={(value) => updateSetting('background_color', value)} 
                    applyImmediately
                  />
                </div>
              )}
              
              {tempSettings.background_type === "gradient" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <ColorPicker 
                    label="Gradient Start" 
                    value={tempSettings.background_gradient_start || '#ffffff'} 
                    onChange={(value) => updateSetting('background_gradient_start', value)} 
                    applyImmediately
                  />
                  <ColorPicker 
                    label="Gradient End" 
                    value={tempSettings.background_gradient_end || '#f0f9ff'} 
                    onChange={(value) => updateSetting('background_gradient_end', value)} 
                    applyImmediately
                  />
                </div>
              )}
              
              {tempSettings.background_type === "image" && (
                <div className="space-y-4">
                  <Label>Background Image</Label>
                  {tempSettings.background_image_url && (
                    <div className="mb-4 relative">
                      <img 
                        src={tempSettings.background_image_url} 
                        alt="Background Preview" 
                        className="w-full max-h-48 object-cover rounded-md" 
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateSetting('background_image_url', null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <UploadButton
                    onUpload={handleImageUpload}
                    uploadText="Upload Background Image"
                    accept="image/*"
                    maxSize={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Text Settings</CardTitle>
              <CardDescription>Customize the fonts and colors of text elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ColorPicker 
                  label="Name Color" 
                  value={tempSettings.name_color} 
                  onChange={(value) => updateSetting('name_color', value)} 
                  applyImmediately
                />
                <ColorPicker 
                  label="Description Color" 
                  value={tempSettings.description_color} 
                  onChange={(value) => updateSetting('description_color', value)} 
                  applyImmediately
                />
                <ColorPicker 
                  label="Section Title Color" 
                  value={tempSettings.section_title_color} 
                  onChange={(value) => updateSetting('section_title_color', value)} 
                  applyImmediately
                />
                <ColorPicker 
                  label="Link Text Color" 
                  value={tempSettings.link_text_color} 
                  onChange={(value) => updateSetting('link_text_color', value)} 
                  applyImmediately
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Font Family</Label>
                <Select 
                  value={tempSettings.font_family} 
                  onValueChange={(value) => updateSetting('font_family', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                    <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label>Text Alignment</Label>
                <RadioGroup 
                  value={tempSettings.text_alignment} 
                  onValueChange={(value) => updateSetting('text_alignment', value as 'left' | 'center' | 'right')}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="left" id="align-left" className="sr-only" />
                    <Label
                      htmlFor="align-left"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.text_alignment === "left" ? "border-primary" : ""
                      }`}
                    >
                      <div className="w-full text-left">
                        <div className="h-2 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                      <span className="mt-2">Left</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="center" id="align-center" className="sr-only" />
                    <Label
                      htmlFor="align-center"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.text_alignment === "center" ? "border-primary" : ""
                      }`}
                    >
                      <div className="w-full flex flex-col items-center">
                        <div className="h-2 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                      <span className="mt-2">Center</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="right" id="align-right" className="sr-only" />
                    <Label
                      htmlFor="align-right"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.text_alignment === "right" ? "border-primary" : ""
                      }`}
                    >
                      <div className="w-full flex flex-col items-end">
                        <div className="h-2 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                      <span className="mt-2">Right</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="buttons">
          <Card>
            <CardHeader>
              <CardTitle>Button Settings</CardTitle>
              <CardDescription>Customize how buttons appear on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ColorPicker 
                  label="Button Background" 
                  value={tempSettings.button_background_color} 
                  onChange={(value) => updateSetting('button_background_color', value)} 
                  applyImmediately
                />
                <ColorPicker 
                  label="Button Text" 
                  value={tempSettings.button_text_color} 
                  onChange={(value) => updateSetting('button_text_color', value)} 
                  applyImmediately
                />
                <ColorPicker 
                  label="Button Icon" 
                  value={tempSettings.button_icon_color} 
                  onChange={(value) => updateSetting('button_icon_color', value)} 
                  applyImmediately
                />
                <ColorPicker 
                  label="Button Border" 
                  value={tempSettings.button_border_color || '#e5e7eb'} 
                  onChange={(value) => updateSetting('button_border_color', value)} 
                  applyImmediately
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Icon Position</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <RadioGroup 
                      value={tempSettings.button_icon_position} 
                      onValueChange={(value) => updateSetting('button_icon_position', value as 'left' | 'right')}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="left" id="icon-left" className="sr-only" />
                        <Label
                          htmlFor="icon-left"
                          className={`flex items-center justify-center gap-2 h-10 rounded-md border border-muted hover:bg-accent hover:text-accent-foreground ${
                            tempSettings.button_icon_position === "left" ? "border-primary bg-primary/10" : ""
                          }`}
                        >
                          <span className="h-4 w-4 bg-muted rounded-full"></span>
                          <span>Text</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="right" id="icon-right" className="sr-only" />
                        <Label
                          htmlFor="icon-right"
                          className={`flex items-center justify-center gap-2 h-10 rounded-md border border-muted hover:bg-accent hover:text-accent-foreground ${
                            tempSettings.button_icon_position === "right" ? "border-primary bg-primary/10" : ""
                          }`}
                        >
                          <span>Text</span>
                          <span className="h-4 w-4 bg-muted rounded-full"></span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Border Style</Label>
                <RadioGroup 
                  value={tempSettings.button_border_style || 'all'} 
                  onValueChange={(value) => updateSetting('button_border_style', value as ProfileDesignSettings['button_border_style'])}
                  className="grid grid-cols-4 gap-2"
                >
                  <div>
                    <RadioGroupItem value="none" id="border-none" className="sr-only" />
                    <Label
                      htmlFor="border-none"
                      className={`flex items-center justify-center h-10 rounded-md bg-muted/20 hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "none" ? "border-primary bg-primary/10" : "border border-dashed border-muted"
                      }`}
                    >
                      None
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="all" id="border-all" className="sr-only" />
                    <Label
                      htmlFor="border-all"
                      className={`flex items-center justify-center h-10 rounded-md border border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "all" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      All
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="x" id="border-x" className="sr-only" />
                    <Label
                      htmlFor="border-x"
                      className={`flex items-center justify-center h-10 rounded-md border-x border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "x" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      X
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="y" id="border-y" className="sr-only" />
                    <Label
                      htmlFor="border-y"
                      className={`flex items-center justify-center h-10 rounded-md border-y border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "y" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      Y
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="top" id="border-top" className="sr-only" />
                    <Label
                      htmlFor="border-top"
                      className={`flex items-center justify-center h-10 rounded-md border-t border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "top" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      Top
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="right" id="border-right" className="sr-only" />
                    <Label
                      htmlFor="border-right"
                      className={`flex items-center justify-center h-10 rounded-md border-r border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "right" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      Right
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="bottom" id="border-bottom" className="sr-only" />
                    <Label
                      htmlFor="border-bottom"
                      className={`flex items-center justify-center h-10 rounded-md border-b border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "bottom" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      Bottom
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="left" id="border-left" className="sr-only" />
                    <Label
                      htmlFor="border-left"
                      className={`flex items-center justify-center h-10 rounded-md border-l border-muted hover:bg-accent hover:text-accent-foreground ${
                        tempSettings.button_border_style === "left" ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      Left
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Adjust general layout options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preview-animation">Preview Animation</Label>
                  <Switch id="preview-animation" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-profile-stats">Show Profile Stats</Label>
                  <Switch id="show-profile-stats" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-branding">Show PocketCV Branding</Label>
                  <Switch id="show-branding" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignTab;
