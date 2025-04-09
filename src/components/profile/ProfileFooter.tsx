
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProfileUrl } from '@/integrations/supabase/client';
import ProfileQRCode from './ProfileQRCode';

interface ProfileFooterProps {
  username: string;
}

const ProfileFooter = ({ username }: ProfileFooterProps) => {
  const { toast } = useToast();
  
  const handleShare = async () => {
    try {
      const profileUrl = getProfileUrl(username);
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my PocketCV profile',
          url: profileUrl
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: 'Link copied',
          description: 'Profile link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <div className="mt-8 text-center space-y-4">
      <Button variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share Profile
      </Button>
      
      <ProfileQRCode 
        profileUrl={getProfileUrl(username)} 
        profileName={username}
      />
      
      <p className="text-sm text-muted-foreground">
        Powered by <a href="/" className="font-medium hover:underline">PocketCV</a>
      </p>
    </div>
  );
};

export default ProfileFooter;
