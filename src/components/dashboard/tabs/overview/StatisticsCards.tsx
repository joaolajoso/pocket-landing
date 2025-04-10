
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface StatisticsCardsProps {
  onNavigateToAnalytics?: () => void;
}

export function StatisticsCards({ onNavigateToAnalytics }: StatisticsCardsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    clicks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Get profile view count
        const { data: viewData, error: viewError } = await supabase.rpc(
          'get_profile_view_count',
          { user_id_param: user.id as string }
        );
        
        if (viewError) {
          console.error('Error fetching profile views:', viewError);
          return;
        }
        
        // Get link click count
        const { data: clickData, error: clickError } = await supabase.rpc(
          'get_total_link_clicks',
          { user_id_param: user.id as string }
        );
        
        if (clickError) {
          console.error('Error fetching link clicks:', clickError);
          return;
        }
        
        setStats({
          views: viewData || 0,
          clicks: clickData || 0
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  const handleNavigateToAnalytics = () => {
    if (onNavigateToAnalytics) {
      onNavigateToAnalytics();
    } else {
      navigate('/dashboard?tab=analytics');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.views}</div>
              <p className="text-xs text-muted-foreground">
                Total profile views
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.clicks}</div>
              <p className="text-xs text-muted-foreground">
                Total link clicks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNavigateToAnalytics}
        >
          View analytics
        </Button>
      </div>
    </div>
  );
}

// Add a default export that forwards to the named export
export default StatisticsCards;
