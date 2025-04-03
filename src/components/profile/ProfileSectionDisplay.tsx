
import LinkDisplay from './LinkDisplay';
import { LinkType } from '@/components/LinkCard';

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
      <h2 className="text-xl font-medium border-b pb-2 mb-4 text-primary">{section.title}</h2>
      <div className="space-y-3">
        {section.links.map(link => (
          <LinkDisplay key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
};

export default ProfileSectionDisplay;
