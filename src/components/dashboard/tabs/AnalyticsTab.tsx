
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarRange } from "@/components/dashboard/tabs/analytics/CalendarRange";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Define types for analytics data
interface AnalyticsData {
  viewsByDay: {
    date: string;
    count: number;
  }[];
  topLinks: {
    name: string;
    clicks: number;
  }[];
  referrers: {
    name: string;
    count: number;
  }[];
  totalViews: number;
  totalClicks: number;
}

const AnalyticsTab = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    viewsByDay: [],
    topLinks: [],
    referrers: [],
    totalViews: 0,
    totalClicks: 0
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Get profile view count by day
        const { data: viewData, error: viewError } = await supabase.rpc(
          'get_profile_views_by_day',
          { user_id_param: user.id }
        );
        
        if (viewError) throw viewError;
        
        // Get link click data
        const { data: linkData, error: linkError } = await supabase.rpc(
          'get_link_clicks_by_type',
          { user_id_param: user.id }
        );
        
        if (linkError) throw linkError;
        
        // Get referrers data
        const { data: referrersData, error: referrersError } = await supabase
          .from('profile_views')
          .select('source, count')
          .eq('profile_id', user.id)
          .group('source')
          .order('count', { ascending: false })
          .limit(5);
          
        if (referrersError) throw referrersError;
          
        // Process data
        const formattedViewData = Array.isArray(viewData) ? viewData.map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: Number(d.count)
        })) : [];
        
        const formattedLinkData = Array.isArray(linkData) ? linkData.map(d => ({
          name: d.link_type || 'Unknown',
          clicks: Number(d.count)
        })) : [];
        
        const formattedRefData = Array.isArray(referrersData) ? referrersData.map(d => ({
          name: d.source || 'Direct',
          count: Number(d.count)
        })) : [];
        
        // Calculate totals
        const totalViews = formattedViewData.reduce((acc, item) => acc + item.count, 0);
        const totalClicks = formattedLinkData.reduce((acc, item) => acc + item.clicks, 0);
        
        setAnalyticsData({
          viewsByDay: formattedViewData,
          topLinks: formattedLinkData,
          referrers: formattedRefData,
          totalViews,
          totalClicks
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [user, dateRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9B59B6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your profile's performance</p>
      </div>
      
      <div className="flex justify-end">
        <CalendarRange 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{analyticsData.totalViews}</CardTitle>
            <CardDescription>Total Profile Views</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{analyticsData.totalClicks}</CardTitle>
            <CardDescription>Total Link Clicks</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="views">
        <TabsList className="mb-4">
          <TabsTrigger value="views">Profile Views</TabsTrigger>
          <TabsTrigger value="links">Link Clicks</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="views">
          <Card>
            <CardHeader>
              <CardTitle>Profile Views Over Time</CardTitle>
              <CardDescription>
                Daily profile views for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analyticsData.viewsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.viewsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Views"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No profile view data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Link Clicks by Type</CardTitle>
              <CardDescription>
                Which links get the most engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analyticsData.topLinks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.topLinks}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" name="Clicks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No link click data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your profile visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analyticsData.referrers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.referrers}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.referrers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No referrer data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
