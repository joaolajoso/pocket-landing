
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export const useNetworkPrivacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  
  // Toggle whether others can save your profile
  const toggleAllowNetworkSaves = async (): Promise<boolean> => {
    if (!user || !profile) return false;
    
    try {
      setLoading(true);
      
      const newValue = !(profile.allow_network_saves ?? true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ allow_network_saves: newValue })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: newValue ? "Profile can be saved" : "Profile cannot be saved",
        description: newValue 
          ? "Others can now save your profile to their network" 
          : "Others cannot save your profile to their network",
      });
      
      // Refresh profile data
      await refreshProfile();
      return true;
    } catch (err: any) {
      console.error('Error updating privacy setting:', err);
      toast({
        title: "Error updating privacy setting",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    allowNetworkSaves: profile?.allow_network_saves ?? true,
    toggleAllowNetworkSaves,
    loading
  };
};
