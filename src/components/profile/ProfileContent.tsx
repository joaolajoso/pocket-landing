
import React from 'react';
import LinkDisplay from '@/components/profile/LinkDisplay';
import ProfileSectionDisplay from '@/components/profile/ProfileSectionDisplay';
import ProfileFooter from '@/components/profile/ProfileFooter';
import { ProfileDesignSettings } from '@/hooks/profile/useProfileDesign';

interface LinkType {
  id: string;
  title: string;
  url: string;
  icon: any;
}

interface ProfileSection {
  id: string;
  title: string;
  links: LinkType[];
}

interface ProfileContentProps {
  sections: ProfileSection[];
  username: string;
  profileId?: string;
  designSettings?: ProfileDesignSettings;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ 
  sections, 
  username,
  profileId,
  designSettings
}) => {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <ProfileSectionDisplay title={section.title}>
            <div className="space-y-3">
              {section.links.map((link) => (
                <LinkDisplay 
                  key={link.id} 
                  link={link} 
                  profileId={profileId}
                  designSettings={designSettings}
                />
              ))}
            </div>
          </ProfileSectionDisplay>
        </div>
      ))}
      
      <ProfileFooter username={username} />
    </div>
  );
};

export default ProfileContent;
