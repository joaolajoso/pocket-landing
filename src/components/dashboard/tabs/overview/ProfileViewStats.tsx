
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { getProfileViewStats } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart } from 'recharts';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileViewData {
  total: number;
  lastWeek: number;
  lastMonth: number;
  daily: {
    date: string;
    count: number;
  }[];
}

const ProfileViewStats = () => {
  const { user } = useAuth();
  const [viewStats, setViewStats] = useState<ProfileViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewStats = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        const stats = await getProfileViewStats(user.id);
        setViewStats(stats);
        setError(null);
      } catch (err) {
        setError("Failed to load profile view statistics");
        console.error("Error fetching profile views:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchViewStats();
    }

    // Set up real-time subscription for profile views
    if (user?.id) {
      const channel = supabase
        .channel('profile-view-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_views',
          filter: `profile_id=eq.${user.id}`
        }, (payload) => {
          console.log('New profile view:', payload);
          // Refresh stats when a new view comes in
          fetchViewStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Views
          </CardTitle>
          <CardDescription>Statistics about your profile page views</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display
  const formattedDailyData = viewStats?.daily.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  // Determine if views increased or decreased from previous week
  const weeklyTrend = viewStats?.lastWeek && viewStats.total > 0
    ? ((viewStats.lastWeek / viewStats.total) * 100) - 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Profile Views
        </CardTitle>
        <CardDescription>Statistics about your profile page views</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{viewStats?.total || 0}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{viewStats?.lastWeek || 0}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">{viewStats?.lastMonth || 0}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Daily Views (Last 7 Days)</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileViewStats;
