
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "@/types/date-range";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AnalyticsTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [viewData, setViewData] = useState<any[]>([]);
  const [clickData, setClickData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !dateRange.from || !dateRange.to) return;

      try {
        setLoading(true);
        setError(null);

        // Format dates for query
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');

        // Fetch profile views
        const { data: viewsData, error: viewsError } = await supabase
          .from('profile_views')
          .select('date, views')
          .eq('profile_id', user.id)
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: true });

        if (viewsError) {
          console.error('Error fetching view data:', viewsError);
          setError('Failed to load view statistics');
          return;
        }

        // Fetch link clicks
        const { data: clicksData, error: clicksError } = await supabase
          .from('link_clicks')
          .select('date, link_id, clicks')
          .eq('profile_id', user.id)
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: true });

        if (clicksError) {
          console.error('Error fetching click data:', clicksError);
          setError('Failed to load click statistics');
          return;
        }

        // Process and set data
        setViewData(viewsData || []);
        setClickData(clicksData || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <p>Please try again later or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View detailed statistics about your profile's performance
          </p>
        </div>
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="views">Profile Views</TabsTrigger>
          <TabsTrigger value="links">Link Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Views Over Time</CardTitle>
                <CardDescription>
                  Daily view count for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} Views`, '']}
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Link Clicks</CardTitle>
                <CardDescription>
                  Distribution of clicks across your links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clickData}
                      dataKey="clicks"
                      nameKey="link_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {clickData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed View Statistics</CardTitle>
              <CardDescription>
                Daily profile views for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={viewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} Views`, '']}
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link Performance</CardTitle>
              <CardDescription>
                Click statistics for your profile links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="link_id" 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} Clicks`, '']}
                  />
                  <Bar dataKey="clicks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
