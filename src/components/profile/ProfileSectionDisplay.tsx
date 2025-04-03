
import LinkDisplay from './LinkDisplay';
import { LinkType } from '@/components/LinkCard';
import { Badge } from '@/components/ui/badge';

interface ProfileSection {
  id: string;
  title: string;
  links: LinkType[];
}

interface ProfileSectionDisplayProps {
  section: ProfileSection;
}

const ProfileSectionDisplay = ({ section }: ProfileSectionDisplayProps) => {
  return (
    <div className="profile-section">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-medium border-b pb-2 text-primary">{section.title}</h2>
        <Badge variant="outline" className="ml-2 text-xs">
          {section.links.length} {section.links.length === 1 ? 'link' : 'links'}
        </Badge>
      </div>
      <div className="space-y-3">
        {section.links.map(link => (
          <LinkDisplay key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
};

export default ProfileSectionDisplay;
