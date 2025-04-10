
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define types for profile design settings
export interface ProfileDesignSettings {
  id?: string;
  user_id?: string;
  background_type: 'solid' | 'gradient' | 'image';
  background_color: string;
  background_gradient_start?: string | null;
  background_gradient_end?: string | null;
  background_image_url?: string | null;
  name_color: string;
  description_color: string;
  section_title_color: string;
  link_text_color: string;
  button_text_color: string;
  button_background_color: string;
  button_icon_color: string;
  button_icon_position: 'left' | 'right';
  button_border_color?: string | null;
  button_border_style?: 'none' | 'all' | 'left' | 'right' | 'top' | 'bottom' | 'x' | 'y' | null;
  text_alignment: 'left' | 'center' | 'right';
  font_family: string;
  created_at?: string;
  updated_at?: string;
}

// Default design settings
export const defaultDesignSettings: ProfileDesignSettings = {
  background_type: 'solid',
  background_color: '#f0f9ff',
  background_gradient_start: '#ffffff',
  background_gradient_end: '#f0f9ff',
  name_color: '#000000',
  description_color: '#555555',
  section_title_color: '#333333',
  link_text_color: '#000000',
  button_text_color: '#ffffff',
  button_background_color: '#0ea5e9',
  button_icon_color: '#ffffff',
  button_icon_position: 'left',
  button_border_color: '#e5e7eb',
  button_border_style: 'all',
  text_alignment: 'center',
  font_family: 'Inter, sans-serif',
};

export const useProfileDesign = (profileId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProfileDesignSettings>(defaultDesignSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch design settings
  const fetchDesignSettings = async () => {
    try {
      setLoading(true);
      
      // Determine which profile ID to fetch
      const targetId = profileId || user?.id;
      
      if (!targetId) {
        setSettings(defaultDesignSettings);
        return;
      }
      
      // Fix: Use type assertion to handle the response properly
      const { data, error } = await supabase
        .from('profile_design_settings')
        .select('*')
        .eq('user_id', targetId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching design settings:', error);
        }
        // If no settings found, we'll use defaults
        setSettings(defaultDesignSettings);
        return;
      }
      
      if (data) {
        // Cast the data to our expected type with type assertion
        // Remove the button_size field from the data if it exists
        const { button_size, ...cleanedData } = data as any;
        setSettings(cleanedData as ProfileDesignSettings);
      } else {
        setSettings(defaultDesignSettings);
      }
    } catch (err) {
      console.error('Error in fetchDesignSettings:', err);
      setSettings(defaultDesignSettings);
    } finally {
      setLoading(false);
    }
  };

  // Save design settings
  const saveDesignSettings = async (updatedSettings: Partial<ProfileDesignSettings>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Cannot save design settings",
        description: "You must be logged in to save profile design settings",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setSaving(true);
      
      // Check if settings already exist for this user
      const { data, error: checkError } = await supabase
        .from('profile_design_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Ensure gradient values are included when background_type is gradient
      const settingsToSave = { ...updatedSettings };
      if (settingsToSave.background_type === 'gradient') {
        if (!settingsToSave.background_gradient_start) {
          settingsToSave.background_gradient_start = settings.background_gradient_start || defaultDesignSettings.background_gradient_start;
        }
        if (!settingsToSave.background_gradient_end) {
          settingsToSave.background_gradient_end = settings.background_gradient_end || defaultDesignSettings.background_gradient_end;
        }
      }
      
      let result;
      
      if (data) {
        // Update existing settings
        result = await supabase
          .from('profile_design_settings')
          .update({
            ...settingsToSave,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('profile_design_settings')
          .insert({
            ...defaultDesignSettings,
            ...settingsToSave,
            user_id: user.id
          });
      }
      
      if (result.error) throw result.error;
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        ...settingsToSave
      }));
      
      toast({
        title: "Design settings saved",
        description: "Your profile appearance has been updated"
      });
      
      return true;
    } catch (err: any) {
      console.error('Error saving design settings:', err);
      toast({
        title: "Error saving design settings",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Reset design to defaults
  const resetDesignSettings = async (): Promise<boolean> => {
    return await saveDesignSettings(defaultDesignSettings);
  };

  // Set up realtime subscription to design settings changes
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('design-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profile_design_settings',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('Design settings updated in real-time:', payload);
        // Remove button_size from the payload data if it exists
        const { button_size, ...cleanedData } = payload.new as any;
        setSettings(cleanedData as ProfileDesignSettings);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchDesignSettings();
  }, [user?.id, profileId]);

  return {
    settings,
    loading,
    saving,
    saveDesignSettings,
    resetDesignSettings,
    refreshSettings: fetchDesignSettings
  };
};
