
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getProfileViewStats } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface StatisticsCardsProps {
  profileViews: number;
  totalClicks: number;
}

const StatisticsCards = ({ profileViews: initialViews, totalClicks: initialClicks }: StatisticsCardsProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [profileViews, setProfileViews] = useState(initialViews);
  const [totalClicks, setTotalClicks] = useState(initialClicks);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  useEffect(() => {
    // Get real-time profile view stats from Supabase
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch profile views
        const stats = await getProfileViewStats(user.id);
        setProfileViews(stats.total);
        
        // Calculate weekly growth percentage
        if (stats.lastWeek > 0 && stats.total > 0) {
          const previousWeekViews = stats.total - stats.lastWeek;
          if (previousWeekViews > 0) {
            const growthPercent = (stats.lastWeek / previousWeekViews - 1) * 100;
            setWeeklyGrowth(Math.round(growthPercent));
          }
        }

        // Fetch link clicks from database using raw counts to avoid table reference issues
        try {
          const { count, error } = await supabase
            .from('link_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (!error && count !== null) {
            setTotalClicks(count);
          }
        } catch (error) {
          console.error("Error fetching link clicks:", error);
        }
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      }
    };
    
    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
      if (!profile) return 0;
      
      let completedFields = 0;
      const totalFields = 7; // Total fields we're checking
      
      if (profile.name) completedFields++;
      if (profile.bio) completedFields++;
      if (profile.photo_url) completedFields++;
      if (profile.slug) completedFields++;
      if (profile.linkedin) completedFields++;
      if (profile.website) completedFields++;
      if (profile.headline) completedFields++;
      
      const percentage = Math.round((completedFields / totalFields) * 100);
      setProfileCompletion(percentage);
    };
    
    fetchStats();
    calculateProfileCompletion();
    
    // Set up real-time subscription for link clicks using client-side filtering
    // instead of direct table subscription (which would require updating Typescript types)
    const profileViewsChannel = supabase
      .channel('profile-views-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profile_views',
        filter: `profile_id=eq.${user?.id}`
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileViewsChannel);
    };
  }, [user, profile]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profileViews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {weeklyGrowth > 0 ? `+${weeklyGrowth}%` : weeklyGrowth < 0 ? `${weeklyGrowth}%` : "No change"} from last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Link Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClicks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalClicks > 0 ? "Tracking real-time clicks" : "No link clicks yet"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profileCompletion}%</div>
          <Progress value={profileCompletion} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
