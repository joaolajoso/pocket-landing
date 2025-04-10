
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, CheckCircle2, Loader2, LogIn, Share2 } from 'lucide-react';
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  
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

  // New function to share your profile
  const handleShareProfile = async () => {
    if (!user) return;
    
    setSharingLoading(true);
    
    try {
      // First get target user's profile to include in notification
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', profileId)
        .single();
      
      if (profileError) throw profileError;
      
      // Create a connection from the target user to the current user
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: profileId,
          connected_user_id: user.id,
          note: 'Shared profile',
        });
      
      if (error) throw error;
      
      toast({
        title: "Profile shared",
        description: `Your profile has been shared with ${targetProfile.name || 'this user'}`,
      });
      
      setShareDialogOpen(false);
    } catch (err: any) {
      console.error('Error sharing profile:', err);
      toast({
        title: "Error sharing profile",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSharingLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
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
      
      {/* Share Profile Button */}
      {user && (
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          Share My Profile
        </Button>
      )}
      
      {/* Share Consent Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Profile</DialogTitle>
            <DialogDescription>
              You're about to share your profile with someone in the Pocket CV network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              By sharing your profile, you consent to making your profile data available to this user in their network. 
              This includes your name, bio, links, and other profile information.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)} disabled={sharingLoading}>
              Cancel
            </Button>
            <Button onClick={handleShareProfile} disabled={sharingLoading}>
              {sharingLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              I Consent to Sharing My Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaveProfileButton;
