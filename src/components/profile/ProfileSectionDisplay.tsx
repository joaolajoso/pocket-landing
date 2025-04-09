
import LinkDisplay from './LinkDisplay';
import { LinkType } from '@/components/LinkCard';
import { Badge } from '@/components/ui/badge';
import { incrementLinkClick } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSection {
  id: string;
  title: string;
  links: LinkType[];
}

interface ProfileSectionDisplayProps {
  section: ProfileSection;
}

const ProfileSectionDisplay = ({ section }: ProfileSectionDisplayProps) => {
  const { user } = useAuth();
  
  const handleLinkClick = async (linkId: string) => {
    // Increment the link click counter with user ID if available
    await incrementLinkClick(linkId, user?.id);
  };

  return (
    <div className="profile-section mb-8">
      <div className="flex items-center mb-4">
        <h2 
          className="text-xl font-medium border-b pb-2 text-primary"
          style={{ color: "var(--profile-section-title-color, var(--primary))" }}
        >
          {section.title}
        </h2>
        <Badge variant="outline" className="ml-2 text-xs">
          {section.links.length} {section.links.length === 1 ? 'link' : 'links'}
        </Badge>
      </div>
      <div className="space-y-3">
        {section.links.map(link => (
          <LinkDisplay 
            key={link.id} 
            link={link} 
            onClick={() => handleLinkClick(link.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfileSectionDisplay;
