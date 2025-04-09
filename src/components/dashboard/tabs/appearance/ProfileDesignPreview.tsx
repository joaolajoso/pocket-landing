
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
    // Prepare background style
    let backgroundStyle = '';
    if (designSettings.background_type === 'solid') {
      backgroundStyle = designSettings.background_color;
    } else if (designSettings.background_type === 'gradient') {
      backgroundStyle = `linear-gradient(135deg, ${designSettings.background_gradient_start || '#ffffff'}, ${designSettings.background_gradient_end || '#f0f9ff'})`;
    } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
      backgroundStyle = `url(${designSettings.background_image_url}) center/cover no-repeat`;
    }
    
    // Generate border style for buttons
    let borderStyle = 'none';
    switch (designSettings.button_border_style) {
      case 'all':
        borderStyle = `1px solid ${designSettings.button_border_color || '#e5e7eb'}`;
        break;
      case 'x':
        borderStyle = `0 1px solid ${designSettings.button_border_color || '#e5e7eb'}`;
        break;
      case 'y':
        borderStyle = `1px solid ${designSettings.button_border_color || '#e5e7eb'} 0`;
        break;
      case 'top':
        borderStyle = `1px solid ${designSettings.button_border_color || '#e5e7eb'} 0 0 0`;
        break;
      case 'right':
        borderStyle = `0 1px solid ${designSettings.button_border_color || '#e5e7eb'} 0 0`;
        break;
      case 'bottom':
        borderStyle = `0 0 1px solid ${designSettings.button_border_color || '#e5e7eb'} 0`;
        break;
      case 'left':
        borderStyle = `0 0 0 1px solid ${designSettings.button_border_color || '#e5e7eb'}`;
        break;
      default:
        borderStyle = 'none';
    }
    
    // Calculate button padding based on size
    let buttonPadding = '0.5rem 1rem';
    switch (designSettings.button_size) {
      case 'S':
        buttonPadding = '0.25rem 0.5rem';
        break;
      case 'M':
        buttonPadding = '0.5rem 1rem';
        break;
      case 'L':
        buttonPadding = '0.75rem 1.5rem';
        break;
      case 'XL':
        buttonPadding = '1rem 2rem';
        break;
      case '2XL':
        buttonPadding = '1.25rem 2.5rem';
        break;
    }
    
    const styles = `
      .profile-preview {
        background: ${backgroundStyle};
        font-family: ${designSettings.font_family};
        color: ${designSettings.description_color};
        text-align: ${designSettings.text_alignment};
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
        padding: ${buttonPadding};
        border: ${borderStyle};
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 0.375rem;
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
      }
      
      .profile-preview .link-icon {
        color: ${designSettings.button_icon_color};
        ${designSettings.button_icon_position === 'right' ? 'order: 1;' : 'order: 0;'}
      }
      
      .profile-preview .external-icon {
        color: ${designSettings.button_icon_color};
      }
    `;
    
    setCssStyles(styles);
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
