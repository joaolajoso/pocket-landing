
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
    if (!designSettings) return;
    
    // Create a unique style ID for this component instance
    const styleId = 'profile-preview-realtime-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    // Prepare background style
    let backgroundStyle = '';
    if (designSettings.background_type === 'solid') {
      backgroundStyle = designSettings.background_color;
    } else if (designSettings.background_type === 'gradient' && 
               designSettings.background_gradient_start && 
               designSettings.background_gradient_end) {
      backgroundStyle = `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`;
      console.log('Setting gradient background:', backgroundStyle);
    } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
      backgroundStyle = `url(${designSettings.background_image_url}) center/cover no-repeat`;
    }
    
    // Generate border style
    let borderStyle = 'none';
    if (designSettings.button_border_color && designSettings.button_border_style !== 'none') {
      borderStyle = `1px solid ${designSettings.button_border_color}`;
    }
    
    // Create CSS
    const css = `
      .profile-preview-${isPreview ? 'preview' : 'public'} {
        background: ${backgroundStyle};
        background-position: center;
        background-size: cover;
        font-family: ${designSettings.font_family || 'Inter, sans-serif'};
      }
      
      .profile-preview-${isPreview ? 'preview' : 'public'} .name {
        color: ${designSettings.name_color};
      }
      
      .profile-preview-${isPreview ? 'preview' : 'public'} .bio {
        color: ${designSettings.description_color};
      }
      
      .profile-preview-${isPreview ? 'preview' : 'public'} .section-title {
        color: ${designSettings.section_title_color};
      }
    `;
    
    styleEl.textContent = css;
    
    // Clean up
    return () => {
      if (styleEl && document.getElementById(styleId)) {
        styleEl.remove();
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

  // Determine background style for the outer container
  const getContainerStyle = () => {
    if (!designSettings) return {};
    
    let backgroundStyle: React.CSSProperties = {};
    
    if (designSettings.background_type === 'solid') {
      backgroundStyle.backgroundColor = designSettings.background_color;
    } else if (designSettings.background_type === 'gradient' && 
               designSettings.background_gradient_start && 
               designSettings.background_gradient_end) {
      backgroundStyle.background = `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`;
    } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
      backgroundStyle.backgroundImage = `url(${designSettings.background_image_url})`;
      backgroundStyle.backgroundPosition = 'center';
      backgroundStyle.backgroundSize = 'cover';
    }
    
    return backgroundStyle;
  };

  return (
    <div 
      className={`flex flex-col items-center max-w-md mx-auto w-full profile-preview-${isPreview ? 'preview' : 'public'}`}
      style={getContainerStyle()}
    >
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
          className="text-2xl font-bold name"
          style={{ color: designSettings?.name_color || 'inherit' }}
        >
          {profile.name}
        </h2>
        {profile.bio && (
          <p 
            className="mt-2 max-w-xs mx-auto bio"
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
