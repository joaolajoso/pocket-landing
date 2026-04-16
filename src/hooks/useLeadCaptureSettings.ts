
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLeadCaptureSettings = () => {
  const { user } = useAuth();
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(true);
  const [followUpReminderDays, setFollowUpReminderDays] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchLeadCaptureSettings();
  }, [user]);

  const fetchLeadCaptureSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('lead_capture_enabled, follow_up_reminder_days')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      setLeadCaptureEnabled(data?.lead_capture_enabled ?? true);
      setFollowUpReminderDays(data?.follow_up_reminder_days ?? 5);
    } catch (err) {
      console.error('Error fetching lead capture settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadCaptureSettings = async (enabled: boolean) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ lead_capture_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;

      setLeadCaptureEnabled(enabled);
      return true;
    } catch (err) {
      console.error('Error updating lead capture settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFollowUpReminderDays = async (days: number) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ follow_up_reminder_days: days })
        .eq('id', user.id);

      if (error) throw error;

      setFollowUpReminderDays(days);
      return true;
    } catch (err) {
      console.error('Error updating follow-up reminder days:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    leadCaptureEnabled,
    followUpReminderDays,
    loading,
    error,
    updateLeadCaptureSettings,
    updateFollowUpReminderDays,
    refreshSettings: fetchLeadCaptureSettings
  };
};
