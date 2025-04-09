
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsCardsProps {
  userData: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  };
  onNavigateToTab: (tab: string) => void;
}

const StatisticsCards = ({ userData, onNavigateToTab }: StatisticsCardsProps) => {
  const [profileViews, setProfileViews] = useState<number>(0);
  const [linkClicks, setLinkClicks] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!userData.id) return;
      
      try {
        // Explicitly type the parameters to fix type errors
        const { data: viewData, error: viewError } = await supabase.rpc('get_profile_view_count', {
          user_id_param: userData.id
        });
        
        if (viewError) throw viewError;
        setProfileViews(viewData || 0);
        
        const { data: linkData, error: linkError } = await supabase.rpc('get_total_link_clicks', {
          user_id_param: userData.id
        });
        
        if (linkError) throw linkError;
        setLinkClicks(linkData || 0);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, [userData.id]);

  return (
    <>
      <Card className="col-span-4 md:col-span-2">
        <CardHeader>
          <CardTitle>Profile Views</CardTitle>
          <CardDescription>
            Total number of profile views
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-6 w-16" /> : profileViews}
          </div>
          <Button variant="outline" onClick={() => onNavigateToTab("analytics")}>
            View Analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <Card className="col-span-4 md:col-span-2">
        <CardHeader>
          <CardTitle>Link Clicks</CardTitle>
          <CardDescription>
            Total number of clicks on your links
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-6 w-16" /> : linkClicks}
          </div>
          <Button variant="outline" onClick={() => onNavigateToTab("analytics")}>
            View Analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default StatisticsCards;
