import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileViewStatsProps {
  onNavigateToAnalytics: () => void;
}

const ProfileViewStats = ({ onNavigateToAnalytics }: ProfileViewStatsProps) => {
  const { user } = useAuth();
  const [viewStats, setViewStats] = useState({
    total: 0,
    lastWeek: 0,
    lastMonth: 0,
    daily: [] as ViewData[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const stats = await getProfileViewStats(user.id);
        const safeStats = {
          ...stats,
          daily: Array.isArray(stats.daily) ? stats.daily : []
        };
        setViewStats(safeStats);
      } catch (error) {
        console.error('Error fetching profile view stats:', error);
        setViewStats({
          total: 0,
          lastWeek: 0,
          lastMonth: 0,
          daily: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user?.id]);
  
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
        getProfileViewStats(user.id).then(stats => {
          const safeStats = {
            ...stats,
            daily: Array.isArray(stats.daily) ? stats.daily : []
          };
          setViewStats(safeStats);
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = viewStats.daily && viewStats.daily.length > 0 
    ? viewStats.daily.map(item => ({
        name: formatDate(item.date),
        views: item.count
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Views</CardTitle>
        <CardDescription>See how many people viewed your profile</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
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
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No view data available yet</p>
                </div>
              )}
            </div>
          </>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="ghost" size="sm" onClick={onNavigateToAnalytics}>
            View detailed analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileViewStats;
