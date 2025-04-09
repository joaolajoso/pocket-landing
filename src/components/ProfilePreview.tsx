
import { useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LinkCard, { LinkType } from "./LinkCard";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProfileUrl } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";

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
  designSettings?: ProfileDesignSettings;
}

const ProfilePreview = ({ 
  profile: initialProfile, 
  isPreview = false,
  designSettings 
}: ProfilePreviewProps) => {
  const { toast } = useToast();
  const { profile: supabaseProfile } = useProfile();
  
  // Apply design settings
  useEffect(() => {
    if (designSettings) {
      // Apply background
      let backgroundStyle = '';
      if (designSettings.background_type === 'solid') {
        backgroundStyle = designSettings.background_color;
        document.documentElement.style.setProperty('--profile-bg', designSettings.background_color);
      } else if (designSettings.background_type === 'gradient' && designSettings.background_gradient_start && designSettings.background_gradient_end) {
        backgroundStyle = `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`;
        document.documentElement.style.setProperty('--profile-bg', `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`);
      } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
        backgroundStyle = `url(${designSettings.background_image_url}) center/cover no-repeat`;
        document.documentElement.style.setProperty('--profile-bg', `url(${designSettings.background_image_url})`);
        document.documentElement.style.setProperty('--profile-bg-position', 'center');
        document.documentElement.style.setProperty('--profile-bg-size', 'cover');
      }
      
      // Set text colors
      document.documentElement.style.setProperty('--profile-name-color', designSettings.name_color);
      document.documentElement.style.setProperty('--profile-description-color', designSettings.description_color);
      document.documentElement.style.setProperty('--profile-section-title-color', designSettings.section_title_color);
      document.documentElement.style.setProperty('--profile-link-text-color', designSettings.link_text_color);
      
      // Set button styles
      document.documentElement.style.setProperty('--profile-button-bg', designSettings.button_background_color);
      document.documentElement.style.setProperty('--profile-button-text', designSettings.button_text_color);
      document.documentElement.style.setProperty('--profile-button-icon', designSettings.button_icon_color);
      
      if (designSettings.button_border_color) {
        document.documentElement.style.setProperty('--profile-button-border', `1px solid ${designSettings.button_border_color}`);
      }
      
      // Set layout
      document.documentElement.style.setProperty('--profile-text-align', designSettings.text_alignment);
      document.documentElement.style.setProperty('--profile-font-family', designSettings.font_family);
    }
    
    // Clean up
    return () => {
      if (isPreview) {
        // Clear styles when component unmounts
        document.documentElement.style.removeProperty('--profile-bg');
        document.documentElement.style.removeProperty('--profile-bg-position');
        document.documentElement.style.removeProperty('--profile-bg-size');
        document.documentElement.style.removeProperty('--profile-name-color');
        document.documentElement.style.removeProperty('--profile-description-color');
        document.documentElement.style.removeProperty('--profile-section-title-color');
        document.documentElement.style.removeProperty('--profile-link-text-color');
        document.documentElement.style.removeProperty('--profile-button-bg');
        document.documentElement.style.removeProperty('--profile-button-text');
        document.documentElement.style.removeProperty('--profile-button-icon');
        document.documentElement.style.removeProperty('--profile-button-border');
        document.documentElement.style.removeProperty('--profile-text-align');
        document.documentElement.style.removeProperty('--profile-font-family');
      }
    };
  }, [designSettings, isPreview]);
  
  // Merge initial profile with Supabase profile data if available
  const profile = useMemo(() => {
    if (!supabaseProfile) return initialProfile;
    
    return {
      ...initialProfile,
      name: supabaseProfile.name || initialProfile.name,
      bio: supabaseProfile.bio || initialProfile.bio,
      avatarUrl: supabaseProfile.photo_url || initialProfile.avatarUrl,
      username: supabaseProfile.slug || initialProfile.username,
    };
  }, [initialProfile, supabaseProfile]);
  
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
    
    const shareUrl = getProfileUrl(profile.username);
    
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
          description: `Link copied: ${shareUrl}`
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Get the text alignment style
  const getAlignmentStyle = () => {
    const alignment = designSettings?.text_alignment || 'center';
    return { textAlign: alignment as 'left' | 'center' | 'right' };
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto w-full">
      {isPreview && (
        <div className="w-full bg-primary/10 text-primary px-4 py-2 text-center text-sm rounded-lg mb-8">
          Preview Mode - This is how your profile will look at {profile.username ? getProfileUrl(profile.username) : 'your PocketCV page'}
        </div>
      )}
      
      <div className="text-center mb-8" style={getAlignmentStyle()}>
        <Avatar className="w-24 h-24 mb-4 mx-auto">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <h2 
          className="text-2xl font-bold"
          style={{ color: designSettings?.name_color || 'inherit' }}
        >
          {profile.name}
        </h2>
        {profile.bio && (
          <p 
            className="mt-2 max-w-xs mx-auto"
            style={{ color: designSettings?.description_color || 'var(--muted-foreground)' }}
          >
            {profile.bio}
          </p>
        )}
      </div>
      
      <div className="w-full space-y-3 mb-8">
        {profile.links.length > 0 ? (
          profile.links.map(link => (
            <LinkCard 
              key={link.id} 
              link={link} 
              isEditable={false} 
              style={{
                backgroundColor: designSettings?.button_background_color || 'var(--primary)',
                color: designSettings?.button_text_color || 'white',
                border: designSettings?.button_border_color ? `1px solid ${designSettings.button_border_color}` : 'none'
              }}
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
