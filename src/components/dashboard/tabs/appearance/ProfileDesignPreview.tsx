
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkType } from "@/components/LinkCard";
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";
import { ExternalLink } from "lucide-react";

interface ProfileDesignPreviewProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
  designSettings: ProfileDesignSettings;
}

const ProfileDesignPreview = ({ userData, links, designSettings }: ProfileDesignPreviewProps) => {
  const [cssStyles, setCssStyles] = useState<string>("");
  
  // Generate CSS custom properties based on design settings
  useEffect(() => {
    if (!designSettings) return;
    
    // Prepare background style
    let backgroundStyle = '';
    if (designSettings.background_type === 'solid') {
      backgroundStyle = designSettings.background_color;
    } else if (designSettings.background_type === 'gradient' && 
               designSettings.background_gradient_start && 
               designSettings.background_gradient_end) {
      backgroundStyle = `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`;
      console.log('Setting gradient in preview:', backgroundStyle);
    } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
      backgroundStyle = `url(${designSettings.background_image_url}) center/cover no-repeat`;
    }
    
    // Generate border style for buttons
    let borderStyle = 'none';
    if (designSettings.button_border_color) {
      switch (designSettings.button_border_style) {
        case 'all':
          borderStyle = `1px solid ${designSettings.button_border_color}`;
          break;
        case 'x':
          borderStyle = `0 1px solid ${designSettings.button_border_color}`;
          break;
        case 'y':
          borderStyle = `1px solid ${designSettings.button_border_color} 0`;
          break;
        case 'top':
          borderStyle = `1px solid ${designSettings.button_border_color} 0 0 0`;
          break;
        case 'right':
          borderStyle = `0 1px solid ${designSettings.button_border_color} 0 0`;
          break;
        case 'bottom':
          borderStyle = `0 0 1px solid ${designSettings.button_border_color} 0`;
          break;
        case 'left':
          borderStyle = `0 0 0 1px solid ${designSettings.button_border_color}`;
          break;
        default:
          borderStyle = 'none';
      }
    }
    
    const styles = `
      .profile-preview {
        background: ${backgroundStyle};
        font-family: ${designSettings.font_family || 'Inter, sans-serif'};
        color: ${designSettings.description_color};
        text-align: ${designSettings.text_alignment};
        height: 100%;
      }
      
      .profile-preview .profile-name {
        color: ${designSettings.name_color};
      }
      
      .profile-preview .profile-bio {
        color: ${designSettings.description_color};
      }
      
      .profile-preview .section-title {
        color: ${designSettings.section_title_color};
      }
      
      .profile-preview .link-card {
        background-color: ${designSettings.button_background_color};
        color: ${designSettings.button_text_color};
        padding: 0.75rem 1rem;
        border: ${borderStyle};
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: ${designSettings.button_border_style === 'all' ? '0.375rem' : '0'};
        margin-bottom: 0.75rem;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      
      .profile-preview .link-card:hover {
        opacity: 0.9;
      }
      
      .profile-preview .link-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-direction: ${designSettings.button_icon_position === 'right' ? 'row-reverse' : 'row'};
      }
      
      .profile-preview .link-icon {
        color: ${designSettings.button_icon_color};
      }
      
      .profile-preview .external-icon {
        color: ${designSettings.button_icon_color};
      }
    `;
    
    setCssStyles(styles);
    
    // Apply styles directly to document for real-time preview
    const styleId = 'profile-design-preview-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = styles;
    
    return () => {
      if (styleEl && document.getElementById(styleId)) {
        styleEl.remove();
      }
    };
  }, [designSettings]);

  return (
    <Card className="overflow-hidden h-[520px] shadow-md border">
      <style>{cssStyles}</style>
      <CardContent className="p-0 h-full overflow-auto">
        <div className="profile-preview p-4 h-full">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={userData.avatarUrl} alt={userData.name} />
              <AvatarFallback className="text-xl">
                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="profile-name text-xl font-bold">{userData.name}</h2>
            <p className="profile-bio text-sm mt-1">{userData.bio}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="section-title text-lg font-medium mb-3">Links</h3>
            
            {links.map(link => (
              <div key={link.id} className="link-card">
                <div className="link-title">
                  {link.icon && <span className="link-icon">{link.icon}</span>}
                  <span>{link.title}</span>
                </div>
                <ExternalLink className="external-icon h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDesignPreview;
