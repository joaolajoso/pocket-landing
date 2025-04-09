
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkConnections } from '@/hooks/network/useNetworkConnections';
import { UserPlus, CheckCircle2, Loader2 } from 'lucide-react';

interface SaveProfileButtonProps {
  profileId: string;
}

const SaveProfileButton = ({ profileId }: SaveProfileButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addConnection, isConnected } = useNetworkConnections();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if this profile is already saved
  useEffect(() => {
    setSaved(isConnected(profileId));
  }, [profileId, isConnected]);
  
  // Don't show button if viewing own profile
  if (user?.id === profileId) {
    return null;
  }

  // Don't show if not logged in
  if (!user) {
    return null;
  }

  const handleSaveProfile = async () => {
    if (saved) {
      toast({
        title: "Already saved",
        description: "This profile is already in your network",
      });
      return;
    }
    
    setLoading(true);
    const success = await addConnection(profileId);
    setLoading(false);
    
    if (success) {
      setSaved(true);
    }
  };

  return (
    <Button
      variant={saved ? "outline" : "default"}
      className="gap-2"
      onClick={handleSaveProfile}
      disabled={loading || saved}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {saved ? "Saved to Network" : "Save to Network"}
    </Button>
  );
};

export default SaveProfileButton;
