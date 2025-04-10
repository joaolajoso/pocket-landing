import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, MousePointer, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StatisticsCardsProps {
  onStatsLoaded?: (data: { profileViews: number, totalClicks: number }) => void;
}

const StatisticsCards = ({ onStatsLoaded }: StatisticsCardsProps) => {
  const { user } = useAuth();
  const [profileViews, setProfileViews] = useState(0);
  const [weeklyViews, setWeeklyViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch profile view statistics
        const { data: viewStats, error: viewsError } = await supabase.rpc(
          'get_profile_view_stats',
          { user_id_param: user.id }
        );
        
        if (viewsError) {
          console.error('Error fetching view stats:', viewsError);
          return;
        }
        
        // Fetch link click statistics
        const { data: clickStats, error: clicksError } = await supabase.rpc(
          'get_link_click_stats',
          { user_id_param: user.id }
        );
        
        if (clicksError) {
          console.error('Error fetching click stats:', clicksError);
          return;
        }
        
        // Fetch network connections count
        const { data: connections, error: connectionsError } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
        
        if (connectionsError) {
          console.error('Error fetching connections:', connectionsError);
          return;
        }
        
        // Update state with fetched data
        const totalViews = viewStats?.total || 0;
        const weeklyViewsCount = viewStats?.lastWeek || 0;
        const clicksCount = clickStats?.total || 0;
        const connectionsTotal = connections?.length || 0;
        
        setProfileViews(totalViews);
        setWeeklyViews(weeklyViewsCount);
        setTotalClicks(clicksCount);
        setConnectionsCount(connectionsTotal);
        
        // Notify parent component about loaded stats
        if (onStatsLoaded) {
          onStatsLoaded({
            profileViews: totalViews,
            totalClicks: clicksCount
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    
    // Set up a realtime subscription for profile views
    if (user) {
      const channel = supabase
        .channel('stats-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_views',
          filter: `profile_id=eq.${user.id}`
        }, () => {
          fetchStatistics();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, onStatsLoaded]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Views</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span>{profileViews}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex items-center space-x-2">
              <MousePointer className="h-4 w-4 text-gray-500" />
              <span>{totalClicks}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Views</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{weeklyViews}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{connectionsCount}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
