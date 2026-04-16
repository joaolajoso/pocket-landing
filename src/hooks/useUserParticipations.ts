import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserParticipations = () => {
  const [participatingEventIds, setParticipatingEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchParticipations();
  }, [user?.id]);

  const fetchParticipations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setParticipatingEventIds(new Set((data || []).map(p => p.event_id)));
    } catch (error) {
      console.error('Error fetching user participations:', error);
    } finally {
      setLoading(false);
    }
  };

  return { participatingEventIds, loading, refetch: fetchParticipations };
};
