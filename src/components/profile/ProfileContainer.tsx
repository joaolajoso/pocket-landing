
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";
import { ReactNode } from "react";

interface ProfileContainerProps {
  styleId: string;
  children: ReactNode;
  textAlignment?: string;
  isPreview?: boolean;
  username?: string;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ 
  styleId, 
  children, 
  textAlignment = 'center',
  isPreview = false,
  username
}) => {
  const profileClass = `profile-preview-${styleId}`;
  
  const getTextAlignClass = () => {
    return {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }[textAlignment as 'left' | 'center' | 'right'] || 'text-center';
  };
  
  return (
    <div className={`flex flex-col items-center max-w-md mx-auto w-full ${profileClass}`}>
      {isPreview && (
        <div className="w-full bg-primary/10 text-primary px-4 py-2 text-center text-sm rounded-lg mb-8">
          Preview Mode - This is how your profile will look at {username ? getProfileUrl(username) : 'your PocketCV page'}
        </div>
      )}
      
      <div className={`w-full ${getTextAlignClass()}`}>
        {children}
      </div>
    </div>
  );
};

export default ProfileContainer;

function getProfileUrl(username: string): string {
  return `https://pocketcv.pt/u/${username}`;
}
