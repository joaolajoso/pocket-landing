
import { LinkType } from "@/hooks/profile/types/profileSectionTypes";
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";
import ProfileLink from "./ProfileLink";

interface ProfileSectionProps {
  title: string;
  displayTitle: boolean;
  links: LinkType[];
  designSettings?: ProfileDesignSettings;
  profileOwnerId?: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  title, 
  displayTitle, 
  links, 
  designSettings,
  profileOwnerId 
}) => {
  // Debug the section data
  console.log('ProfileSection rendering:', { title, displayTitle, linksCount: links.length, links });
  
  // Don't render sections with no links
  if (!links || links.length === 0) {
    console.log(`Section "${title}" has no links, not rendering`);
    return null;
  }
  
  return (
    <div className="space-y-3">
      {displayTitle && (
        <h3 
          className="text-lg font-medium section-title"
          style={{ color: designSettings?.section_title_color || 'inherit' }}
        >
          {title}
        </h3>
      )}
      
      {links.map((link) => (
        <ProfileLink 
          key={link.id} 
          link={link}
          designSettings={designSettings}
          profileOwnerId={profileOwnerId}
        />
      ))}
    </div>
  );
};

export default ProfileSection;
