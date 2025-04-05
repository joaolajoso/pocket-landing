
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileFooterProps {
  username: string;
}

const ProfileFooter = ({ username }: ProfileFooterProps) => {
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setSharing(true);
    const shareUrl = `${window.location.origin}/u/${username}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my PocketCV profile',
          url: shareUrl
        });
        toast({
          title: "Shared successfully!"
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Profile link copied!",
          description: "Link copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mt-12 mb-6 text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Powered by <span className="font-semibold">PocketCV</span>
      </p>
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleShare}
          disabled={sharing}
        >
          <Share2 className="h-4 w-4" />
          {sharing ? 'Sharing...' : 'Share Profile'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileFooter;
