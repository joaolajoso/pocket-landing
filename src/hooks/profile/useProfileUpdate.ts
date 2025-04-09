
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from './useProfileData';

export const useProfileUpdate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Update profile data
  const updateProfile = async (updatedData: Partial<ProfileData>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log("Updating profile with data:", updatedData);
      
      // If updating slug, ensure it's unique and URL-friendly
      if (updatedData.slug) {
        // Create URL-friendly slug
        updatedData.slug = updatedData.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if slug is already taken
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', updatedData.slug)
          .neq('id', user.id)
          .single();
        
        if (data) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
      }
      
      // Include updated_at timestamp
      const dataWithTimestamp = {
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(dataWithTimestamp)
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      return true;
      
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading
  };
};
