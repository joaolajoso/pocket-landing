
import React from 'react';

export interface ProfileSectionDisplayProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSectionDisplay: React.FC<ProfileSectionDisplayProps> = ({ 
  title,
  children 
}) => {
  return (
    <div className="mb-6">
      <h3 
        className="text-lg font-medium mb-3"
        style={{ color: "var(--profile-section-title-color, var(--foreground))" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

export default ProfileSectionDisplay;
