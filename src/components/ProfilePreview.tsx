
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LinkCard, { LinkType } from "./LinkCard";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  links: LinkType[];
  username?: string;
}

interface ProfilePreviewProps {
  profile: UserProfile;
  isPreview?: boolean;
}

const ProfilePreview = ({ profile, isPreview = false }: ProfilePreviewProps) => {
  const { toast } = useToast();
  
  const initials = useMemo(() => {
    if (!profile.name) return "?";
    return profile.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [profile.name]);

  const handleShare = async () => {
    if (!profile.username) {
      toast({
        title: "Cannot share profile",
        description: "This profile doesn't have a username set",
        variant: "destructive"
      });
      return;
    }
    
    const shareUrl = `${window.location.origin}/u/${profile.username}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name}'s PocketCV profile`,
          url: shareUrl
        });
        toast({
          title: "Shared successfully!"
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Profile link copied!",
          description: "Link copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto w-full">
      {isPreview && (
        <div className="w-full bg-primary/10 text-primary px-4 py-2 text-center text-sm rounded-lg mb-8">
          Preview Mode - This is how your profile will look to others
        </div>
      )}
      
      <div className="text-center mb-8">
        <Avatar className="w-24 h-24 mb-4 mx-auto">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        {profile.bio && (
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">{profile.bio}</p>
        )}
      </div>
      
      <div className="w-full space-y-3 mb-8">
        {profile.links.length > 0 ? (
          profile.links.map(link => (
            <LinkCard 
              key={link.id} 
              link={link} 
              isEditable={false} 
            />
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            No links added yet.
            {isPreview && <p className="mt-2 text-sm">Return to dashboard to add links.</p>}
          </Card>
        )}
      </div>
      
      {!isPreview && (
        <Button variant="outline" className="gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share Profile
        </Button>
      )}
    </div>
  );
};

export default ProfilePreview;
