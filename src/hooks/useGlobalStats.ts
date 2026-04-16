
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalStats {
  totalUsers: number;
  totalViews: number;
  totalConnections: number;
}

// Default fallback stats for landing page performance
const DEFAULT_STATS: GlobalStats = {
  totalUsers: 150,
  totalViews: 3700,
  totalConnections: 99
};

export const useGlobalStats = () => {
  const [stats, setStats] = useState<GlobalStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip database queries on landing page for performance
    // The StatsSection uses mostly fixed values anyway
    const isLandingPage = window.location.pathname === '/' || window.location.pathname === '';
    
    if (isLandingPage) {
      setStats(DEFAULT_STATS);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Only fetch user count - views and connections use fixed values
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .not('name', 'is', null);

        if (userError) {
          console.error('Error counting profiles:', userError);
        }

        setStats({
          totalUsers: userCount || DEFAULT_STATS.totalUsers,
          totalViews: DEFAULT_STATS.totalViews,
          totalConnections: DEFAULT_STATS.totalConnections
        });
      } catch (error) {
        console.error('Error fetching global stats:', error);
        setStats(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
