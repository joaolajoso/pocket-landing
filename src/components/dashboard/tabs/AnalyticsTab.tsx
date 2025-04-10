
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { DateRange } from "react-day-picker";

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#a45de2'
];

interface ProfileView {
  date: string;
  views: number;
  source?: string;
  count?: number;
}

interface LinkClick {
  date: string;
  clicks: number;
  source?: string;
  count?: number;
}

const AnalyticsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  
  const [analyticsData, setAnalyticsData] = useState<Array<{ date: string, views: number }>>([]);
  const [viewData, setViewData] = useState<ProfileView[] | null>(null);
  const [linkData, setLinkData] = useState<LinkClick[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch analytics data from Supabase
  const fetchData = async () => {
    setLoading(true);
    
    const fromDate = dateRange?.from 
      ? format(dateRange.from, 'yyyy-MM-dd') 
      : format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd');
    
    const toDate = dateRange?.to 
      ? format(dateRange.to, 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd');

    try {
      const [profileViews, linkClicks] = await Promise.all([
        fetchProfileViews(fromDate, toDate),
        fetchLinkClicks(fromDate, toDate)
      ]);

      if (profileViews.error || linkClicks.error) {
        console.error("Error fetching data:", profileViews.error, linkClicks.error);
        return;
      }

      // Process profile views data
      const profileViewsData = profileViews.data?.map((item: ProfileView) => ({
        date: item.date,
        views: item.views
      })) || [];
      
      setAnalyticsData(profileViewsData);
      
      // Process source data for profile views
      setViewData(profileViews.data || []);
      
      // Process source data for link clicks
      setLinkData(linkClicks.data || []);
    } catch (error) {
      console.error("Error during data fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update the query calls with proper type arguments and null checks
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

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Format date for display
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd');
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded shadow p-2">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm">{`Views: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Fix the referrer chart data
  const referrerData = viewData 
    ? viewData
        .filter((item) => item.source !== null)
        .map((item) => ({
          source: item.source || 'Unknown',
          count: item.count || 0
        })) 
    : [];

  // Fix the link clicks chart data
  const linkClicksData = linkData 
    ? linkData
        .filter((item) => item.source !== null)
        .map((item) => ({
          source: item.source || 'Unknown',
          count: item.count || 0
        })) 
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your profile performance over time</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Views</CardTitle>
          <CardDescription>Number of views to your profile over a period</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Label>Date Range</Label>
              <DateRangePicker 
                date={dateRange} 
                onDateChange={setDateRange}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={analyticsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Referrers for Profile Views</CardTitle>
            <CardDescription>Where your profile views are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={referrerData}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {referrerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Referrers for Link Clicks</CardTitle>
            <CardDescription>Where your link clicks are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={linkClicksData}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label
                  >
                    {linkClicksData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
