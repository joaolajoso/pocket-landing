
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';

interface ViewData {
  date: string;
  views: number;
}

interface ProfileViewStatsProps {
  onNavigateToAnalytics?: () => void;
}

const ProfileViewStats = ({ onNavigateToAnalytics }: ProfileViewStatsProps) => {
  const { user } = useAuth();
  const [viewData, setViewData] = useState<ViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile view statistics
  useEffect(() => {
    const fetchViewStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get daily view counts for the past 7 days
        const { data: dailyData, error: dailyError } = await supabase
          .from('profile_views')
          .select('date, views')
          .eq('profile_id', user.id)
          .order('date', { ascending: true })
          .limit(7);
        
        if (dailyError) {
          console.error('Error getting daily view data:', dailyError);
          setError('Failed to load view statistics');
          return;
        }
        
        // Format the data for the chart
        setViewData(
          Array.isArray(dailyData) 
            ? dailyData.map((item) => ({
                date: item.date,
                views: item.views || 0
              }))
            : []
        );
      } catch (err) {
        console.error('Error fetching profile views:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchViewStats();
    
    // Set up realtime subscription for profile views
    if (user) {
      const channel = supabase
        .channel('profile-views-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profile_views',
          filter: `profile_id=eq.${user.id}`
        }, () => {
          fetchViewStats();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">Profile Views</CardTitle>
          <CardDescription>Views over the last 7 days</CardDescription>
        </div>
        {onNavigateToAnalytics && (
          <Button variant="outline" size="sm" onClick={onNavigateToAnalytics}>
            <BarChart2 className="h-4 w-4 mr-2" />
            Full Analytics
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM d')} 
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} Views`, '']}
                labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
              />
              <Bar dataKey="views" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileViewStats;
