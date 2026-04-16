
import { LinkType } from "@/hooks/profile/types/profileSectionTypes";
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";
import LinkCard from "../LinkCard";
import { getButtonStyle } from "./utils/ProfileButtonStyle";
import { incrementLinkClick } from "@/lib/supabase";

interface ProfileLinkProps {
  link: LinkType;
  designSettings?: ProfileDesignSettings;
  profileOwnerId?: string;
}

const ProfileLink: React.FC<ProfileLinkProps> = ({ link, designSettings, profileOwnerId }) => {
  const style = getButtonStyle(designSettings);
  
  return (
    <LinkCard 
      key={link.id} 
      link={link} 
      isEditable={false} 
      style={style}
      onLinkClick={(linkId) => {
        if (profileOwnerId) {
          incrementLinkClick(linkId, profileOwnerId);
        }
      }}
    />
  );
};

export default ProfileLink;
