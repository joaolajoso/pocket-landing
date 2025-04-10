
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays } from 'date-fns';
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
        
        // Get the past 7 days for display
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const date = subDays(new Date(), i);
          return format(date, 'yyyy-MM-dd');
        }).reverse();
        
        // Count views by date for the current user's profile
        const { data: viewsData, error: viewsError } = await supabase
          .from('profile_views')
          .select('timestamp')
          .eq('profile_id', user.id);
        
        if (viewsError) {
          console.error('Error getting view data:', viewsError);
          setError('Failed to load view statistics');
          return;
        }

        // Process the view data to count by day
        const viewsByDay: Record<string, number> = {};
        
        // Initialize all days with 0 views
        last7Days.forEach(day => {
          viewsByDay[day] = 0;
        });
        
        // Count views per day
        if (viewsData) {
          viewsData.forEach(view => {
            const viewDate = format(new Date(view.timestamp), 'yyyy-MM-dd');
            if (last7Days.includes(viewDate)) {
              viewsByDay[viewDate] = (viewsByDay[viewDate] || 0) + 1;
            }
          });
        }
        
        // Format the data for the chart
        const formattedData: ViewData[] = Object.entries(viewsByDay).map(([date, views]) => ({
          date,
          views
        }));
        
        // Sort by date
        formattedData.sort((a, b) => a.date.localeCompare(b.date));
        
        setViewData(formattedData);
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
