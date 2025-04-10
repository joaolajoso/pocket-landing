
import { Loader2 } from 'lucide-react';

interface ProfileLoadingProps {
  loading: boolean;
  error: any;
  profile: any;
}

const ProfileLoadingStates: React.FC<ProfileLoadingProps> = ({ 
  loading, 
  error, 
  profile 
}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested profile does not exist.</p>
      </div>
    );
  }
  
  return null;
};

export default ProfileLoadingStates;
