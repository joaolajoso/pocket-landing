import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const StatisticsCards = () => {
  const [profileViews, setProfileViews] = useState<number>(0);
  const [linkClicks, setLinkClicks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    // Get dates for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const formattedFromDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
    const formattedToDate = format(today, 'yyyy-MM-dd');
    
    try {
      // Fetch profile views for the last 30 days
      const profileViewsResponse = await supabase.rpc('get_profile_views_count_by_date_range', {
        date_from: formattedFromDate,
        date_to: formattedToDate
      });
      
      // Fetch link clicks for the last 30 days
      const linkClicksResponse = await supabase.rpc('get_link_clicks_count_by_date_range', {
        date_from: formattedFromDate,
        date_to: formattedToDate
      });
      
      if (profileViewsResponse.error) throw profileViewsResponse.error;
      if (linkClicksResponse.error) throw linkClicksResponse.error;
      
      // Update state with fetched data, using null checks
      setProfileViews(profileViewsResponse.data && profileViewsResponse.data.count ? profileViewsResponse.data.count : 0);
      setLinkClicks(linkClicksResponse.data && linkClicksResponse.data.count ? linkClicksResponse.data.count : 0);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Views</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
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
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-gray-500" />
              <span>{linkClicks}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
