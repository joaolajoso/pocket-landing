import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Link } from "lucide-react";

interface StatisticCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

const StatisticCard = ({ title, value, icon, className }: StatisticCardProps) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const StatisticsCards = () => {
  const [totalProfileViews, setTotalProfileViews] = useState<number>(0);
  const [totalLinkClicks, setTotalLinkClicks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Update the queries with proper type arguments
  const fetchTotalProfileViews = async () => {
    return await supabase.rpc('get_total_profile_views');
  };

  const fetchTotalLinkClicks = async () => {
    return await supabase.rpc('get_total_link_clicks');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileViewsResult = await fetchTotalProfileViews();
        const linkClicksResult = await fetchTotalLinkClicks();

        if (profileViewsResult.data) {
          setTotalProfileViews(profileViewsResult.data as number);
        }

        if (linkClicksResult.data) {
          setTotalLinkClicks(linkClicksResult.data as number);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatisticCard
        title="Profile Views"
        value={totalProfileViews}
        icon={<Globe className="h-4 w-4 text-gray-500" />}
        className="bg-white shadow-md"
      />
      <StatisticCard
        title="Link Clicks"
        value={totalLinkClicks}
        icon={<Link className="h-4 w-4 text-gray-500" />}
        className="bg-white shadow-md"
      />
    </div>
  );
};

export default StatisticsCards;
