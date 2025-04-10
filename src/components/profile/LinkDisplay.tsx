
import { LinkType } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Linkedin, Globe, Mail, User } from 'lucide-react';
import { incrementLinkClick } from '@/lib/supabase';
import { useProfileDesign } from '@/hooks/profile/useProfileDesign';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileDesignSettings } from '@/hooks/profile/useProfileDesign';

interface LinkDisplayProps {
  link: LinkType;
  onClick?: () => void;
  profileId?: string;
  designSettings?: ProfileDesignSettings;
}

const LinkDisplay = ({ link, onClick, profileId, designSettings }: LinkDisplayProps) => {
  const { settings: fallbackSettings } = useProfileDesign();
  const { user } = useAuth();
  
  // Use provided designSettings or fallback to the ones from the hook
  const settings = designSettings || fallbackSettings;
  
  const handleClick = async () => {
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    try {
      // Track the click with the correct user ID
      const userIdToTrack = profileId || (user?.id ? user.id : null);
      
      if (userIdToTrack) {
        await incrementLinkClick(link.id, userIdToTrack);
      }
      
      // Open the link in a new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  // Determine border style based on settings
  const getBorderStyle = () => {
    if (!settings?.button_border_color || settings?.button_border_style === 'none') {
      return 'none';
    }
    
    const borderValue = `1px solid ${settings.button_border_color}`;
    
    switch (settings?.button_border_style) {
      case 'all': return borderValue;
      case 'x': return `0 ${borderValue}`;
      case 'y': return `${borderValue} 0`;
      case 'top': return `${borderValue} 0 0 0`;
      case 'right': return `0 ${borderValue} 0 0`;
      case 'bottom': return `0 0 ${borderValue} 0`;
      case 'left': return `0 0 0 ${borderValue}`;
      default: return borderValue;
    }
  };

  // Render the appropriate icon based on the icon type
  const renderIcon = () => {
    if (typeof link.icon === 'string') {
      switch (link.icon) {
        case 'linkedin':
          return <Linkedin className="h-4 w-4" />;
        case 'globe':
          return <Globe className="h-4 w-4" />;
        case 'mail':
          return <Mail className="h-4 w-4" />;
        case 'user':
        default:
          return <User className="h-4 w-4" />;
      }
    }
    return link.icon;
  };

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow cursor-pointer link-card-container p-4"
      onClick={handleClick}
      style={{
        backgroundColor: "var(--profile-button-bg, var(--primary))",
        color: "var(--profile-button-text, white)",
        border: getBorderStyle()
      }}
    >
      <CardContent className="p-0 flex items-center justify-between">
        <div className={`flex items-center gap-3 link-title ${settings?.button_icon_position === 'right' ? 'flex-row-reverse' : 'flex-row'} flex-1 min-w-0`}>
          <div style={{ color: "var(--profile-button-icon, white)" }} className="link-icon shrink-0">
            {renderIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ color: "var(--profile-button-text, white)" }}>{link.title}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <ExternalLink className="h-4 w-4" style={{ color: "var(--profile-button-icon, white)" }} />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkDisplay;
