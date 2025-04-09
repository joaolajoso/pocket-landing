
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useNetworkPrivacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allowNetworkSaves, setAllowNetworkSaves] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch the current privacy setting
  useEffect(() => {
    const fetchPrivacySetting = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('allow_network_saves')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setAllowNetworkSaves(data.allow_network_saves ?? true);
        }
      } catch (err: any) {
        console.error('Error fetching network privacy setting:', err);
      }
    };
    
    fetchPrivacySetting();
  }, [user]);

  // Toggle the privacy setting
  const toggleAllowNetworkSaves = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const newValue = !allowNetworkSaves;
      
      const { error } = await supabase
        .from('profiles')
        .update({ allow_network_saves: newValue })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setAllowNetworkSaves(newValue);
      
      toast({
        title: newValue ? "Profile can be saved" : "Profile cannot be saved",
        description: newValue 
          ? "Others can now save your profile to their network" 
          : "Others can no longer save your profile to their network",
      });
    } catch (err: any) {
      console.error('Error updating network privacy setting:', err);
      toast({
        title: "Error updating setting",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    allowNetworkSaves,
    toggleAllowNetworkSaves,
    loading
  };
};
