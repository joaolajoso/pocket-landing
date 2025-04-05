
import { LinkType } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { incrementLinkClick } from '@/lib/supabase';

interface LinkDisplayProps {
  link: LinkType;
  onClick?: () => void;
}

const LinkDisplay = ({ link, onClick }: LinkDisplayProps) => {
  const handleClick = async () => {
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    try {
      // Track the click in the database
      await incrementLinkClick(link.id);
      
      // Open the link in a new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking link click:', error);
      // Still open the link even if tracking fails
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {link.icon && <div className="text-primary">{link.icon}</div>}
          <span className="font-medium">{link.title}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkDisplay;
