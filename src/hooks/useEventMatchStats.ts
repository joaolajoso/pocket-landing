import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MatchStats {
  totalWithTags: number;
  goodMatches: number;
  topRoles: string[];
  topIndustries: string[];
}

export const useEventMatchStats = (eventIds: string[]) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, MatchStats>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || eventIds.length === 0) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('event-match-stats', {
          body: { event_ids: eventIds },
        });

        if (error) {
          console.error('Error fetching match stats:', error);
          return;
        }

        setStats(data || {});
      } catch (err) {
        console.error('Error fetching match stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, eventIds.join(',')]);

  return { stats, loading };
};
