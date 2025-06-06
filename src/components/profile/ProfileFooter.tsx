
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProfileUrl } from '@/lib/supabase';
import ProfileQRCode from './ProfileQRCode';

interface ProfileFooterProps {
  username: string;
}

const ProfileFooter = ({ username }: ProfileFooterProps) => {
  const { toast } = useToast();
  
  const handleShare = async () => {
    try {
      if (!username) {
        toast({
          title: 'Error sharing profile',
          description: 'Username is not available',
          variant: 'destructive'
        });
        return;
      }
      
      const profileUrl = getProfileUrl(username);
      
      if (navigator.share && navigator.canShare({ url: profileUrl })) {
        // For mobile devices that support web share API
        await navigator.share({
          title: 'Check out my PocketCV profile',
          url: profileUrl
        });
        toast({
          title: 'Profile shared successfully',
        });
      } else {
        // Fallback to clipboard copy for desktop
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: 'Link copied',
          description: `Profile link copied: ${profileUrl}`
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Error sharing profile',
        description: 'An error occurred while trying to share',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="mt-8 text-center space-y-4">
      <Button variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share Profile
      </Button>
      
      {username && (
        <ProfileQRCode 
          profileUrl={getProfileUrl(username)} 
          profileName={username}
        />
      )}
      
      <p className="text-sm text-muted-foreground">
        Powered by <a href="/" className="font-medium hover:underline">PocketCV</a>
      </p>
    </div>
  );
};

export default ProfileFooter;
