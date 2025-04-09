
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getProfileViewStats } from "@/lib/supabase";

interface StatisticsCardsProps {
  profileViews: number;
  totalClicks: number;
}

const StatisticsCards = ({ profileViews: initialViews, totalClicks }: StatisticsCardsProps) => {
  const { user } = useAuth();
  const [profileViews, setProfileViews] = useState(initialViews);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  
  useEffect(() => {
    // Get real-time profile view stats from Supabase
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
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
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      }
    };
    
    fetchStats();
  }, [user]);

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
          <p className="text-xs text-muted-foreground mt-1">+5% from last week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">80%</div>
          <Progress value={80} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
