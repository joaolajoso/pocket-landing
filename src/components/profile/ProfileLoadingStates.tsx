
import { Skeleton } from '@/components/ui/skeleton';

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
    // Themed skeleton that matches the public page design
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C41E5C] via-[#8B1E4B] to-[#1A1A1A]">
        <div className="max-w-md mx-auto px-4 py-8 animate-pulse">
          {/* Banner skeleton */}
          <div className="h-32 w-full bg-white/10 rounded-2xl mb-6" />
          
          {/* Avatar skeleton */}
          <div className="flex justify-center -mt-16 mb-4">
            <Skeleton className="h-24 w-24 rounded-full bg-white/20" />
          </div>
          
          {/* Name skeleton */}
          <div className="flex justify-center mb-2">
            <Skeleton className="h-7 w-48 bg-white/20 rounded-lg" />
          </div>
          
          {/* Bio skeleton */}
          <div className="flex justify-center mb-6">
            <Skeleton className="h-4 w-64 bg-white/10 rounded-lg" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex justify-center gap-8 mb-8">
            <Skeleton className="h-12 w-20 bg-white/10 rounded-xl" />
            <Skeleton className="h-12 w-20 bg-white/10 rounded-xl" />
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex justify-center gap-3 mb-8">
            <Skeleton className="h-10 w-10 bg-white/10 rounded-full" />
            <Skeleton className="h-10 w-10 bg-white/10 rounded-full" />
            <Skeleton className="h-10 w-10 bg-white/10 rounded-full" />
          </div>
          
          {/* Links skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-14 w-full bg-white/10 rounded-xl" />
            <Skeleton className="h-14 w-full bg-white/10 rounded-xl" />
            <Skeleton className="h-14 w-full bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#C41E5C] via-[#8B1E4B] to-[#1A1A1A]">
        <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
        <p className="text-white/70 mt-2">The requested profile does not exist.</p>
      </div>
    );
  }
  
  return null;
};

export default ProfileLoadingStates;
