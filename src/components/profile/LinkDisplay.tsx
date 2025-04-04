
import { LinkType } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { getLinkTypeById } from '../link-editor/LinkTypes';
import { incrementLinkClick } from '@/lib/supabase';

interface LinkDisplayProps {
  link: LinkType;
  onClick?: () => void;
}

const LinkDisplay = ({ link, onClick }: LinkDisplayProps) => {
  const handleClick = () => {
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    // Open the link in a new tab
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  // Determine the icon based on the link type
  const icon = link.icon;

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
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
