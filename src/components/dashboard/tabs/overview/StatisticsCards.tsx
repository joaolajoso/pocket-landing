
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ArrowUpRight, MousePointer } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const StatsCard = ({ title, value, description, icon, trend, trendValue }: StatsCardProps) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trendValue && (
          <div className={`flex items-center mt-1 text-xs ${getTrendColor()}`}>
            <ArrowUpRight className="h-3 w-3 mr-1" />
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StatisticsCards = () => {
  const { user } = useAuth();
  const [profileViews, setProfileViews] = useState(0);
  const [linkClicks, setLinkClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch profile views count
        const { count: viewsCount, error: viewsError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: false })
          .eq("profile_id", user.id);
        
        if (viewsError) {
          console.error("Error fetching profile views:", viewsError);
        } else {
          setProfileViews(viewsCount || 0);
        }
        
        // Fetch link clicks from profile_views table where source starts with "click:"
        const { count: clicksCount, error: clicksError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: false })
          .eq("profile_id", user.id)
          .like("source", "click:%");
        
        if (clicksError) {
          console.error("Error fetching link clicks:", clicksError);
        } else {
          setLinkClicks(clicksCount || 0);
        }
        
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-pulse">
          <CardHeader className="h-12"></CardHeader>
          <CardContent className="h-24"></CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="h-12"></CardHeader>
          <CardContent className="h-24"></CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="h-12"></CardHeader>
          <CardContent className="h-24"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Profile Views"
        value={profileViews}
        description="Total profile views"
        icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        trend="up"
        trendValue="+12.5% from last week"
      />
      <StatsCard
        title="Link Clicks"
        value={linkClicks}
        description="Total link clicks"
        icon={<MousePointer className="h-4 w-4 text-muted-foreground" />}
        trend="up"
        trendValue="+7.2% from last week"
      />
      <StatsCard
        title="Conversion Rate"
        value={profileViews > 0 ? `${((linkClicks / profileViews) * 100).toFixed(1)}%` : "0%"}
        description="Clicks per profile view"
        icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
        trend="neutral"
        trendValue="Same as last week"
      />
    </div>
  );
};

export default StatisticsCards;
