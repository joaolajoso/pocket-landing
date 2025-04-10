
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StatsData {
  profileViews: number;
  totalClicks: number;
}

const StatisticsCards = () => {
  const { profile } = useProfile();
  const [stats, setStats] = useState<StatsData>({
    profileViews: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    setLoading(true);
    
    const fromDate = format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd');
    const toDate = format(new Date(), 'yyyy-MM-dd');

    try {
      const [profileViewsResponse, linkClicksResponse] = await Promise.all([
        fetchProfileViews(fromDate, toDate),
        fetchLinkClicks(fromDate, toDate)
      ]);

      const totalProfileViews = profileViewsResponse.data?.reduce((sum: number, item: any) => sum + (item.views || 0), 0) || 0;
      const totalLinkClicks = linkClicksResponse.data?.reduce((sum: number, item: any) => sum + (item.clicks || 0), 0) || 0;

      setStats({
        profileViews: totalProfileViews,
        totalClicks: totalLinkClicks,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileViews = async (dateFrom: string, dateTo: string) => {
    return await supabase.rpc('get_profile_views_by_date_range', {
      date_from: dateFrom,
      date_to: dateTo
    });
  };

  const fetchLinkClicks = async (dateFrom: string, dateTo: string) => {
    return await supabase.rpc('get_link_clicks_by_date_range', {
      date_from: dateFrom,
      date_to: dateTo
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Total Profile Views
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "Loading..." : stats.profileViews}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Total Link Clicks
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "Loading..." : stats.totalClicks}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
