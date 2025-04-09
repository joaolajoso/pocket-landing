
import { LinkType } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { incrementLinkClick } from '@/lib/supabase';
import { useProfileDesign } from '@/hooks/profile/useProfileDesign';
import { useAuth } from '@/contexts/AuthContext';

interface LinkDisplayProps {
  link: LinkType;
  onClick?: () => void;
}

const LinkDisplay = ({ link, onClick }: LinkDisplayProps) => {
  const { settings } = useProfileDesign();
  const { user } = useAuth();
  
  const handleClick = async () => {
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    } else {
      // If no onClick was provided, track the click directly
      await incrementLinkClick(link.id);
    }
    
    try {      
      // Open the link in a new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  // Determine button size from settings
  const getButtonPadding = () => {
    switch (settings.button_size) {
      case 'S': return 'p-2';
      case 'L': return 'p-6';
      case 'XL': return 'p-7';
      case '2XL': return 'p-8';
      case 'M':
      default: return 'p-4';
    }
  };

  // Determine border style based on settings
  const getBorderStyle = () => {
    if (!settings.button_border_color || settings.button_border_style === 'none') {
      return 'none';
    }
    
    const borderValue = `1px solid ${settings.button_border_color}`;
    
    switch (settings.button_border_style) {
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

  return (
    <Card
      className={`w-full hover:shadow-md transition-shadow cursor-pointer link-card-container ${getButtonPadding()}`}
      onClick={handleClick}
      style={{
        backgroundColor: "var(--profile-button-bg, var(--primary))",
        color: "var(--profile-button-text, white)",
        border: getBorderStyle()
      }}
    >
      <CardContent className="p-0 flex items-center justify-between">
        <div className={`flex items-center gap-3 link-title ${settings.button_icon_position === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
          {link.icon && <div style={{ color: "var(--profile-button-icon, white)" }} className="link-icon">{link.icon}</div>}
          <span style={{ color: "var(--profile-button-text, white)" }}>{link.title}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" style={{ color: "var(--profile-button-icon, white)" }} />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkDisplay;
