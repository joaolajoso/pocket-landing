
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileViewStats } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

type ViewData = {
  date: string;
  count: number;
}

const ProfileViewStats = () => {
  const { user } = useAuth();
  const [viewStats, setViewStats] = useState({
    total: 0,
    lastWeek: 0,
    lastMonth: 0,
    daily: [] as ViewData[]
  });
  const [loading, setLoading] = useState(true);

  // Load initial stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const stats = await getProfileViewStats(user.id);
        setViewStats(stats);
      } catch (error) {
        console.error('Error fetching profile view stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user?.id]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('profile-view-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profile_views',
        filter: `profile_id=eq.${user.id}`
      }, payload => {
        console.log('New profile view:', payload);
        // Refresh stats on new view
        getProfileViewStats(user.id).then(stats => {
          setViewStats(stats);
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare chart data with formatted dates
  const chartData = viewStats.daily.map(item => ({
    name: formatDate(item.date),
    views: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Views</CardTitle>
        <CardDescription>See how many people viewed your profile</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading stats...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{viewStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{viewStats.lastWeek}</p>
                <p className="text-xs text-muted-foreground">Last 7 Days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{viewStats.lastMonth}</p>
                <p className="text-xs text-muted-foreground">Last 30 Days</p>
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileViewStats;
