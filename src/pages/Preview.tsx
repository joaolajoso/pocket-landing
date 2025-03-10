
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Smartphone, Laptop, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePreview from "@/components/ProfilePreview";
import { useToast } from "@/hooks/use-toast";
import { LinkType } from "@/components/LinkCard";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Preview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  
  const handleReturn = () => {
    navigate('/dashboard');
  };
  
  const handleOpenActual = () => {
    toast({
      title: "Opening profile",
      description: "Your public profile would open in a new tab",
    });
  };
  
  const toggleFrameVisibility = () => {
    setIsFrameVisible(!isFrameVisible);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      {/* Header */}
      <header className="py-4 px-4 md:px-6 border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReturn}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={setViewMode} className="mr-2">
              <TabsList className="h-9">
                <TabsTrigger value="desktop" className="px-3">
                  <Laptop className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Desktop</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="px-3">
                  <Smartphone className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mobile</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  Options
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleFrameVisibility}>
                  {isFrameVisible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Device Frame
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Device Frame
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenActual}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleOpenActual}>
              View Public Page
            </Button>
          </div>
        </div>
      </header>
      
      {/* Preview Content */}
      <div className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <TabsContent value="desktop" className="w-full mt-0">
            <div 
              className={`mx-auto ${
                isFrameVisible 
                  ? "max-w-3xl bg-white/40 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg" 
                  : "max-w-md"
              }`}
            >
              {isFrameVisible && (
                <div className="flex items-center justify-start gap-2 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 mx-auto max-w-xs">
                    <div className="h-6 bg-muted/30 rounded-full w-full" />
                  </div>
                </div>
              )}
              
              <div 
                className={`bg-background rounded-lg ${
                  isFrameVisible ? "border border-border" : ""
                } overflow-hidden p-6`}
              >
                <ProfilePreview profile={profile} isPreview={true} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mobile" className="w-full mt-0">
            <div 
              className={`mx-auto ${
                isFrameVisible 
                  ? "max-w-xs bg-white/40 backdrop-blur-sm border-4 border-gray-800 rounded-[2.5rem] p-2 shadow-xl" 
                  : "max-w-xs"
              }`}
            >
              {isFrameVisible && (
                <div className="flex justify-center w-full mb-2">
                  <div className="w-24 h-6 bg-black rounded-full" />
                </div>
              )}
              
              <div 
                className={`bg-background rounded-2xl ${
                  isFrameVisible ? "border border-gray-300" : ""
                } overflow-hidden`}
                style={{ 
                  height: isFrameVisible ? "70vh" : "auto",
                  overflowY: "auto"
                }}
              >
                <div className="p-4">
                  <ProfilePreview profile={profile} isPreview={true} />
                </div>
              </div>
              
              {isFrameVisible && (
                <div className="flex justify-center w-full mt-4">
                  <div className="w-32 h-1 bg-black rounded-full" />
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default Preview;
