
import { LinkType } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

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

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-center justify-between cursor-pointer">
        <span className="font-medium">{link.title}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkDisplay;
