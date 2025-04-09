
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkConnections } from '@/hooks/network/useNetworkConnections';
import { UserPlus, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SaveProfileButtonProps {
  profileId: string;
  requiresLogin?: boolean;
}

const SaveProfileButton = ({ profileId, requiresLogin = false }: SaveProfileButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addConnection, isConnected } = useNetworkConnections();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if this profile is already saved
  useEffect(() => {
    if (user) {
      setSaved(isConnected(profileId));
    }
  }, [profileId, isConnected, user]);

  // Don't show button if viewing own profile
  if (user?.id === profileId) {
    return null;
  }

  // Show login button if not logged in
  if (requiresLogin && !user) {
    return (
      <Button
        variant="outline"
        className="gap-2"
        asChild
      >
        <Link to="/login?redirect=back">
          <LogIn className="h-4 w-4" />
          Login to Save Profile
        </Link>
      </Button>
    );
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
