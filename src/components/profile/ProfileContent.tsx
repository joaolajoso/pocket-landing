
import ProfileSectionDisplay from './ProfileSectionDisplay';
import ProfileFooter from './ProfileFooter';

interface ProfileSection {
  id: string;
  title: string;
  links: {
    id: string;
    title: string;
    url: string;
    icon: string | null;
  }[];
}

interface ProfileContentProps {
  sections: ProfileSection[];
  username: string;
}

const ProfileContent = ({ sections, username }: ProfileContentProps) => {
  return (
    <>
      <div className="space-y-8">
        {sections.map(section => (
          <ProfileSectionDisplay key={section.id} section={section} />
        ))}
      </div>
      
      <ProfileFooter username={username} />
    </>
  );
};

export default ProfileContent;
