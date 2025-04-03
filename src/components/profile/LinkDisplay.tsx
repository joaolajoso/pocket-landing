
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { LinkType } from '@/components/LinkCard';
import { 
  Linkedin, 
  FileText, 
  Github, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Mail, 
  Globe, 
  Link as LinkIcon,
  ExternalLink, 
  Check 
} from 'lucide-react';

interface LinkDisplayProps {
  link: LinkType;
}

const LinkDisplay = ({ link }: LinkDisplayProps) => {
  const [clicked, setClicked] = useState(false);
  
  const handleLinkClick = () => {
    // Track analytics in a real implementation
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
    window.open(link.url, '_blank');
  };

  // Map link title to appropriate icon
  const getLinkIcon = () => {
    const title = link.title.toLowerCase();
    
    if (link.icon) return link.icon;
    
    if (title.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
    if (title.includes('github')) return <Github className="h-5 w-5" />;
    if (title.includes('cv') || title.includes('resume')) return <FileText className="h-5 w-5" />;
    if (title.includes('instagram')) return <Instagram className="h-5 w-5" />;
    if (title.includes('twitter')) return <Twitter className="h-5 w-5" />;
    if (title.includes('facebook')) return <Facebook className="h-5 w-5" />;
    if (title.includes('youtube')) return <Youtube className="h-5 w-5" />;
    if (title.includes('email') || title.includes('mail')) return <Mail className="h-5 w-5" />;
    if (title.includes('website')) return <Globe className="h-5 w-5" />;
    
    return <LinkIcon className="h-5 w-5" />;
  };
  
  return (
    <button
      onClick={handleLinkClick}
      className="w-full text-left transition-all"
      aria-label={`Open ${link.title}`}
    >
      <Card className={`flex items-center gap-3 p-4 hover:scale-[1.02] transition-transform ${
        clicked ? 'bg-primary/10' : ''
      }`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          {getLinkIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{link.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
        </div>
        
        <div className="flex-shrink-0">
          {clicked ? (
            <Check className="h-5 w-5" />
          ) : (
            <ExternalLink className="h-5 w-5" />
          )}
        </div>
      </Card>
    </button>
  );
};

export default LinkDisplay;
