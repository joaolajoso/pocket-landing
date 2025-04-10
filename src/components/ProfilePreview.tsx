
import { useMemo, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LinkCard, { LinkType } from "./LinkCard";
import { Button } from "@/components/ui/button";
import { Share2, Linkedin, Globe, Mail, User } from "lucide-react";
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
  const [styleId] = useState(`profile-preview-styles-${Math.random().toString(36).substring(2, 9)}`);
  
  useEffect(() => {
    if (!designSettings) return;
    
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
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
    
    let borderStyle = 'none';
    if (designSettings.button_border_color && designSettings.button_border_style !== 'none') {
      borderStyle = `1px solid ${designSettings.button_border_color}`;
    }
    
    const profileClass = `profile-preview-${styleId}`;
    
    const css = `
      .${profileClass} {
        background: ${backgroundStyle};
        background-position: center;
        background-size: cover;
        font-family: ${designSettings.font_family || 'Inter, sans-serif'};
      }
      
      .${profileClass} .name {
        color: ${designSettings.name_color};
      }
      
      .${profileClass} .bio {
        color: ${designSettings.description_color};
      }
      
      .${profileClass} .section-title {
        color: ${designSettings.section_title_color};
      }
      
      .${profileClass} .link-card {
        background-color: ${designSettings.button_background_color};
        color: ${designSettings.button_text_color};
      }
    `;
    
    styleEl.textContent = css;
    
    return () => {
      if (styleEl && document.getElementById(styleId)) {
        styleEl.remove();
      }
    };
  }, [designSettings, styleId, isPreview]);
  
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

  const getTextAlignClass = () => {
    const alignment = designSettings?.text_alignment || 'center';
    return {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }[alignment];
  };

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

  const getButtonStyle = (link: LinkType) => {
    if (!designSettings) return {};
    
    let style: React.CSSProperties = {
      backgroundColor: designSettings.button_background_color || '#0ea5e9',
      color: designSettings.button_text_color || 'white',
    };
    
    if (designSettings.button_border_color) {
      style.border = `1px solid ${designSettings.button_border_color}`;
    }
    
    if (designSettings.button_border_style === 'all') {
      style.borderRadius = '0.375rem';
    }
    
    return style;
  };

  const profileClass = `profile-preview-${styleId}`;
  
  const processedLinks = useMemo(() => {
    if (!initialProfile.links) return [];
    
    return initialProfile.links.map(link => {
      return {
        ...link
      };
    });
  }, [initialProfile.links]);
  
  return (
    <div 
      className={`flex flex-col items-center max-w-md mx-auto w-full ${profileClass}`}
      style={getContainerStyle()}
    >
      {isPreview && (
        <div className="w-full bg-primary/10 text-primary px-4 py-2 text-center text-sm rounded-lg mb-8">
          Preview Mode - This is how your profile will look at {profile.username ? getProfileUrl(profile.username) : 'your PocketCV page'}
        </div>
      )}
      
      <div className={`mb-8 w-full ${getTextAlignClass()}`} style={{ textAlign: designSettings?.text_alignment || 'center' as any }}>
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
      
      <div className="w-full space-y-3 mb-8 px-4">
        {processedLinks.length > 0 ? (
          processedLinks.map(link => (
            <LinkCard 
              key={link.id} 
              link={link} 
              isEditable={false} 
              style={getButtonStyle(link)}
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
