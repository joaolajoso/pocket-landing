
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PreviewHeaderProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  isFrameVisible: boolean;
  toggleFrameVisibility: () => void;
}

const PreviewHeader = ({
  viewMode,
  setViewMode,
  isFrameVisible,
  toggleFrameVisibility,
}: PreviewHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleReturn = () => {
    navigate('/dashboard');
  };

  const handleOpenActual = () => {
    toast({
      title: "Opening profile",
      description: "Your public profile would open in a new tab",
    });
  };

  return (
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
                    <Eye className="h-4 w-4 mr-2 line-through" />
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
  );
};

export default PreviewHeader;
