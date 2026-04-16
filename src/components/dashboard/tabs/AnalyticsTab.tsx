
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "@/components/ui/charts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "@/types/date-range";
import { addDays, format, subDays } from "date-fns";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatisticsCards from "./overview/StatisticsCards";

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
          
          // Process views data to get referrer counts (excluding click data)
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

  // Process views data to get counts by referrer (excluding click data)
  const processViewsByReferrer = (views: any[]) => {
    const referrerMap = new Map();
    
    views.forEach(view => {
      const source = view.source || "direct";
      
      // Skip click data - we only want actual referral sources
      if (source.startsWith("click:")) {
        return;
      }
      
      // Clean up and categorize referral sources
      let cleanSource = source;
      if (source === "direct" || source === "") {
        cleanSource = "Direct";
      } else if (source === "qr") {
        cleanSource = "QR Code";
      } else if (source === "nfc") {
        cleanSource = "NFC Tap";
      } else if (source.includes("google")) {
        cleanSource = "Google";
      } else if (source.includes("linkedin")) {
        cleanSource = "LinkedIn";
      } else if (source.includes("facebook")) {
        cleanSource = "Facebook";
      } else if (source.includes("twitter")) {
        cleanSource = "Twitter";
      } else if (source.includes("instagram")) {
        cleanSource = "Instagram";
      } else if (source.startsWith("utm_")) {
        // Handle UTM parameters
        cleanSource = source.replace("utm_", "").replace("_", " ");
        cleanSource = cleanSource.charAt(0).toUpperCase() + cleanSource.slice(1);
      } else {
        // For other sources, just capitalize first letter
        cleanSource = source.charAt(0).toUpperCase() + source.slice(1);
      }
      
      referrerMap.set(cleanSource, (referrerMap.get(cleanSource) || 0) + 1);
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
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Track your profile's performance! See how many people view your profile and where your visitors are coming from. Use these insights to optimize your profile.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <StatisticsCards />

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
                Where your profile visitors are coming from
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
