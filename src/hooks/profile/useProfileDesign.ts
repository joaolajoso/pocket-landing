
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
// Cache key prefix for localStorage
const DESIGN_CACHE_PREFIX = 'pocketcv_design_';

// Get cached design settings from localStorage
const getCachedDesign = (userId: string): ProfileDesignSettings | null => {
  try {
    const cached = localStorage.getItem(`${DESIGN_CACHE_PREFIX}${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache TTL: 7 days for better performance on public profiles
      const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed.settings;
      }
    }
  } catch (e) {
    console.error('Error reading design cache:', e);
  }
  return null;
};

// Save design settings to localStorage cache
const setCachedDesign = (userId: string, settings: ProfileDesignSettings) => {
  try {
    localStorage.setItem(`${DESIGN_CACHE_PREFIX}${userId}`, JSON.stringify({
      settings,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error saving design cache:', e);
  }
};

export const useProfileDesign = (profileId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize with cached value if available
  const getInitialSettings = (): ProfileDesignSettings => {
    const targetId = profileId || user?.id;
    if (targetId) {
      const cached = getCachedDesign(targetId);
      if (cached) return cached;
    }
    return defaultDesignSettings;
  };
  
  const [settings, setSettings] = useState<ProfileDesignSettings>(getInitialSettings);
  const [loading, setLoading] = useState(() => {
    // If we have cached data, don't show loading
    const targetId = profileId || user?.id;
    return targetId ? !getCachedDesign(targetId) : true;
  });
  const [saving, setSaving] = useState(false);

  // Fetch design settings
  const fetchDesignSettings = async () => {
    // Determine which profile ID to fetch
    const targetId = profileId || user?.id;
    
    if (!targetId) {
      setSettings(defaultDesignSettings);
      setLoading(false);
      return;
    }
    
    // Check cache first - if we have cached data, use it immediately
    const cached = getCachedDesign(targetId);
    if (cached) {
      setSettings(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch fresh data from server
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
        if (!cached) {
          setSettings(defaultDesignSettings);
        }
        return;
      }
      
      if (data) {
        // Cast the data to our expected type with type assertion
        // Remove the button_size field from the data if it exists
        const { button_size, ...cleanedData } = data as any;
        const newSettings = cleanedData as ProfileDesignSettings;
        setSettings(newSettings);
        // Update cache with fresh data
        setCachedDesign(targetId, newSettings);
      } else if (!cached) {
        setSettings(defaultDesignSettings);
      }
    } catch (err) {
      console.error('Error in fetchDesignSettings:', err);
      if (!cached) {
        setSettings(defaultDesignSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save design settings
  const saveDesignSettings = async (updatedSettings: Partial<ProfileDesignSettings>): Promise<boolean> => {
    if (!user) {
      console.error('SaveDesignSettings: No user logged in');
      toast({
        title: "Cannot save design settings",
        description: "You must be logged in to save profile design settings",
        variant: "destructive"
      });
      return false;
    }
    
    // Optimistic update: apply immediately before DB call
    const optimisticSettings = { ...settings, ...updatedSettings };
    setSettings(optimisticSettings);
    if (user.id) setCachedDesign(user.id, optimisticSettings);
    window.dispatchEvent(new CustomEvent('pocketcv-design-updated', { detail: optimisticSettings }));
    
    try {
      setSaving(true);
      
      // Check if settings already exist for this user
      const { data, error: checkError } = await supabase
        .from('profile_design_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('SaveDesignSettings: Error checking existing settings:', checkError);
        throw checkError;
      }
      
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
        console.log('SaveDesignSettings: Updating existing settings with ID:', data.id);
        result = await supabase
          .from('profile_design_settings')
          .update({
            ...settingsToSave,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new settings
        console.log('SaveDesignSettings: Creating new settings record');
        result = await supabase
          .from('profile_design_settings')
          .insert({
            ...defaultDesignSettings,
            ...settingsToSave,
            user_id: user.id
          });
      }
      
      if (result.error) {
        console.error('SaveDesignSettings: Database operation failed:', result.error);
        throw result.error;
      }
      
      console.log('SaveDesignSettings: Database operation successful');
      
      // Update local state
      const newSettings = {
        ...settings,
        ...settingsToSave
      };
      setSettings(newSettings);
      
      // Update cache
      setCachedDesign(user.id, newSettings);
      
      // Broadcast to other components
      window.dispatchEvent(new CustomEvent('pocketcv-design-updated', { detail: newSettings }));
      
      console.log('SaveDesignSettings: Local state and cache updated');
      
      return true;
    } catch (err: any) {
      console.error('SaveDesignSettings: Error occurred:', err);
      console.error('SaveDesignSettings: Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      });
      
      // Don't show toast here - let the calling component handle it
      throw err;
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

  // Listen for cross-component design updates
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ProfileDesignSettings;
      setSettings(detail);
    };
    window.addEventListener('pocketcv-design-updated', handler);
    return () => window.removeEventListener('pocketcv-design-updated', handler);
  }, []);

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
