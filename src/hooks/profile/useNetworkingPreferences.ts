import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TAG_LIMITS } from '@/constants/matchmaking-tags';

export interface NetworkingPreferences {
  professional_roles: string[];
  industries: string[];
  networking_goals: string[];
}

const defaultPreferences: NetworkingPreferences = {
  professional_roles: [],
  industries: [],
  networking_goals: []
};

export const useNetworkingPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NetworkingPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences from Supabase on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_interests')
          .select('professional_roles, industries, networking_goals')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching preferences:', error);
          return;
        }

        if (data) {
          setPreferences({
            professional_roles: data.professional_roles || [],
            industries: data.industries || [],
            networking_goals: data.networking_goals || []
          });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  // Save preferences to Supabase
  const savePreferences = useCallback(async (newPreferences: NetworkingPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_interests')
        .upsert({
          user_id: user.id,
          professional_roles: newPreferences.professional_roles,
          industries: newPreferences.industries,
          networking_goals: newPreferences.networking_goals,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Erro ao salvar preferências');
        return;
      }

      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Erro ao salvar preferências');
    }
  }, [user]);


  // Toggle a single tag
  const toggleTag = useCallback((category: keyof NetworkingPreferences, tag: string) => {
    const currentTags = preferences[category];
    const isRemoving = currentTags.includes(tag);
    
    if (!isRemoving && currentTags.length >= TAG_LIMITS[category]) {
      toast.error(`Máximo de ${TAG_LIMITS[category]} tags nesta categoria`);
      return;
    }

    const newTags = isRemoving
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    const newPreferences = {
      ...preferences,
      [category]: newTags
    };

    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Check if user has any preferences set
  const hasPreferences = 
    preferences.professional_roles.length > 0 ||
    preferences.industries.length > 0 ||
    preferences.networking_goals.length > 0;

  return {
    preferences,
    loading,
    savePreferences,
    toggleTag,
    hasPreferences
  };
};
