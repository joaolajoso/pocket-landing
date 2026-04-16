
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProfileUrl } from "@/lib/supabase";

interface ProfileShareButtonProps {
  username?: string;
}

const ProfileShareButton: React.FC<ProfileShareButtonProps> = ({ username }) => {
  const { toast } = useToast();
  
  const handleShare = async () => {
    if (!username) {
      toast({
        title: "Cannot share profile",
        description: "This profile doesn't have a username set",
        variant: "destructive"
      });
      return;
    }
    
    const shareUrl = getProfileUrl(username);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username}'s PocketCV profile`,
          url: shareUrl
        });
        toast({
          title: "Shared successfully!"
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Profile link copied!",
          description: `Link copied: ${shareUrl}`
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  if (!username) return null;
  
  return (
    <Button variant="outline" className="gap-2" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      Share Profile
    </Button>
  );
};

export default ProfileShareButton;
