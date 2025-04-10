
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "@/components/ui/chart";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "@/types/date-range";
import { addDays, format, subDays } from "date-fns";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileViews, setProfileViews] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch profile views from the profile_views table
        const { data: viewsData, error: viewsError } = await supabase
          .from("profile_views")
          .select("*")
          .eq("profile_id", user.id)
          .gte("timestamp", format(dateRange.from || subDays(new Date(), 30), "yyyy-MM-dd"))
          .lte("timestamp", format(dateRange.to || new Date(), "yyyy-MM-dd"));
        
        if (viewsError) {
          console.error("Error fetching profile views:", viewsError);
        } else {
          // Process views data to get daily counts
          const dailyCounts = processViewsByDate(viewsData || []);
          setProfileViews(dailyCounts);
          
          // Process views data to get referrer counts
          const referrerCounts = processViewsByReferrer(viewsData || []);
          setTopReferrers(referrerCounts);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, dateRange]);

  // Process views data to get counts by date
  const processViewsByDate = (views: any[]) => {
    const dateMap = new Map();
    
    // Initialize map with all dates in range
    let currentDate = new Date(dateRange.from || subDays(new Date(), 30));
    const endDate = new Date(dateRange.to || new Date());
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      dateMap.set(dateStr, 0);
      currentDate = addDays(currentDate, 1);
    }
    
    // Fill in actual counts
    views.forEach(view => {
      const dateStr = format(new Date(view.timestamp), "yyyy-MM-dd");
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, dateMap.get(dateStr) + 1);
      }
    });
    
    // Convert to array format for chart
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      name: date,
      total: count
    }));
  };

  // Process views data to get counts by referrer
  const processViewsByReferrer = (views: any[]) => {
    const referrerMap = new Map();
    
    views.forEach(view => {
      const source = view.source || "direct";
      referrerMap.set(source, (referrerMap.get(source) || 0) + 1);
    });
    
    // Convert to array and sort by count
    return Array.from(referrerMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5);  // Get top 5
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Track your profile engagement</p>
        </div>
        <CalendarDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Views</CardTitle>
              <CardDescription>
                Daily profile views during selected date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={profileViews}
                categories={["total"]}
                index="name"
                valueFormatter={(value) => `${value} views`}
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>
                Where your profile views are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topReferrers.length > 0 ? (
                <PieChart 
                  data={topReferrers}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} views`}
                  height={350}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No referrer data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
