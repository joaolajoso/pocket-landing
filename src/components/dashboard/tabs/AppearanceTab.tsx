
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { LinkType } from "@/components/LinkCard";
import { useState } from "react";
import { Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppearanceTabProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
}

// Array of color options
const colorOptions = [
  { name: "Purple", bg: "bg-purple-500", value: "#8b5cf6" },
  { name: "Blue", bg: "bg-blue-500", value: "#3b82f6" },
  { name: "Green", bg: "bg-green-500", value: "#22c55e" },
  { name: "Yellow", bg: "bg-yellow-500", value: "#eab308" },
  { name: "Red", bg: "bg-red-500", value: "#ef4444" },
];

// Array of background color options
const bgColorOptions = [
  { name: "Light Purple", bg: "bg-purple-50", value: "#faf5ff" },
  { name: "Light Blue", bg: "bg-blue-50", value: "#eff6ff" },
  { name: "Light Green", bg: "bg-green-50", value: "#f0fdf4" },
  { name: "Light Yellow", bg: "bg-yellow-50", value: "#fefce8" },
  { name: "Light Red", bg: "bg-red-50", value: "#fef2f2" },
];

const AppearanceTab = ({ userData, links }: AppearanceTabProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [primaryColor, setPrimaryColor] = useState<string>(colorOptions[0].value);
  const [backgroundColor, setBackgroundColor] = useState<string>(bgColorOptions[0].value);
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "square">("rounded");
  const [font, setFont] = useState<string>("inter");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="w-72 h-[500px] border rounded-xl shadow-sm bg-background overflow-hidden"
                 style={{ backgroundColor: backgroundColor }}>
              <div className="p-4 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                  <AvatarFallback className="text-xl">
                    {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-sm text-center text-muted-foreground mt-1">{userData.bio}</p>
                
                <div className="w-full mt-8 space-y-3">
                  {links.map(link => (
                    <div 
                      key={link.id} 
                      className={`w-full p-3 border flex items-center gap-3 hover:bg-muted/50 transition-colors`}
                      style={{ 
                        borderRadius: buttonStyle === "rounded" ? "0.375rem" : "0.125rem",
                        fontFamily: font === "inter" ? "Inter, sans-serif" : 
                                  font === "roboto" ? "Roboto, sans-serif" : 
                                  font === "poppins" ? "Poppins, sans-serif" : "Open Sans, sans-serif"
                      }}
                    >
                      {link.icon}
                      <span>{link.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handlePreview} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Open Full Preview
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className={`border rounded-md p-2 cursor-pointer ${theme === "light" ? "border-primary" : "hover:border-primary"}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="h-12 bg-white rounded mb-2"></div>
                  <p className="text-xs font-medium text-center">Light</p>
                </div>
                <div 
                  className={`border rounded-md p-2 cursor-pointer ${theme === "dark" ? "border-primary" : "hover:border-primary"}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="h-12 bg-zinc-900 rounded mb-2"></div>
                  <p className="text-xs font-medium text-center">Dark</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {bgColorOptions.map((color) => (
                      <div 
                        key={color.name}
                        className={`h-6 w-6 rounded-full ${color.bg} cursor-pointer relative`}
                        onClick={() => setBackgroundColor(color.value)}
                        style={{ boxShadow: backgroundColor === color.value ? "0 0 0 2px white, 0 0 0 4px currentColor" : "none" }}
                      >
                        {backgroundColor === color.value && (
                          <Check className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Button Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <div 
                        key={color.name}
                        className={`h-6 w-6 rounded-full ${color.bg} cursor-pointer relative`}
                        onClick={() => setPrimaryColor(color.value)}
                        style={{ boxShadow: primaryColor === color.value ? "0 0 0 2px white, 0 0 0 4px currentColor" : "none" }}
                      >
                        {primaryColor === color.value && (
                          <Check className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Font</Label>
                  <select 
                    className="w-full mt-2 p-2 border rounded-md"
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                  >
                    <option value="inter">Inter (Default)</option>
                    <option value="roboto">Roboto</option>
                    <option value="poppins">Poppins</option>
                    <option value="opensans">Open Sans</option>
                  </select>
                </div>
                
                <div>
                  <Label>Button Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div 
                      className={`border rounded-md p-2 cursor-pointer ${buttonStyle === "rounded" ? "border-primary" : "hover:border-primary"}`}
                      onClick={() => setButtonStyle("rounded")}
                    >
                      <div className="h-8 border rounded-md mb-1"></div>
                      <p className="text-xs font-medium text-center">Rounded</p>
                    </div>
                    <div 
                      className={`border rounded-md p-2 cursor-pointer ${buttonStyle === "square" ? "border-primary" : "hover:border-primary"}`}
                      onClick={() => setButtonStyle("square")}
                    >
                      <div className="h-8 border rounded-sm mb-1"></div>
                      <p className="text-xs font-medium text-center">Square</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSaveAppearance}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;
