
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
      
      // Map username to slug if provided
      const dataToUpdate: any = { ...updatedData };
      
      if (updatedData.username) {
        // Create URL-friendly slug
        dataToUpdate.slug = updatedData.username.toLowerCase()
            .normalize("NFD") // separa acento de letra
            .replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/\s+/g, "") // remove espaços
            .replace(/[^a-z0-9]/g, "");
        delete dataToUpdate.username; // Remove username since we're using slug
        
        // Check if slug is available using database function
        const { data: isAvailable, error: availabilityError } = await supabase
          .rpc('is_slug_available', { 
            slug_to_check: dataToUpdate.slug, 
            excluding_user_id: user.id 
          });
        
        if (availabilityError) {
          console.error("Error checking slug availability:", availabilityError);
          toast({
            title: "Error checking username availability",
            description: "Please try again",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
        
        if (!isAvailable) {
          toast({
            title: "Username not available",
            description: "This username is already taken or reserved. Please choose a different one.",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
      }
      
      // Include updated_at timestamp
      const dataWithTimestamp = {
        ...dataToUpdate,
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
