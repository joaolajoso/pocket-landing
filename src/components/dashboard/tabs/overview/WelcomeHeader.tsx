
import { Link } from "react-router-dom";
import { Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { getProfileUrl } from "@/integrations/supabase/client";

interface WelcomeHeaderProps {
  firstName: string;
}

const WelcomeHeader = ({ firstName }: WelcomeHeaderProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  
  const handleShareProfile = () => {
    if (!profile?.slug) {
      toast({
        title: "Username not set",
        description: "Please set a username in your profile settings first",
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(profile.slug);
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copied",
      description: "Your profile link has been copied to clipboard",
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {firstName || 'there'}</h1>
        <p className="text-muted-foreground">Manage your PocketCV profile and links</p>
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link to="/preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
        
        <Button className="bg-[#8c52ff] hover:bg-[#8c52ff]/90">
          <Share2 className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;
