
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SaveProfileButtonProps {
  profileId: string;
  requiresLogin?: boolean;
}

const SaveProfileButton = ({ profileId, requiresLogin = false }: SaveProfileButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if this profile is already saved
  useEffect(() => {
    const checkConnection = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('connected_user_id', profileId)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking connection:', error);
          return;
        }
        
        setSaved(!!data);
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };
    
    checkConnection();
  }, [profileId, user]);

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
    
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user!.id,
          connected_user_id: profileId,
          note: '',
        });
      
      if (error) throw error;
      
      setSaved(true);
      
      toast({
        title: "Profile saved",
        description: "This profile has been added to your network",
      });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast({
        title: "Error saving profile",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
