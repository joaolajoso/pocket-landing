
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LinkIcon, MapPin, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfileViewStats } from "@/lib/supabase";

const AnalyticsTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viewStats, setViewStats] = useState({
    total: 0,
    lastWeek: 0,
    lastMonth: 0,
    daily: []
  });
  const [topLinks, setTopLinks] = useState([]);
  const [referrers, setReferrers] = useState([]);
  
  // Load analytics data
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch profile view stats
        const stats = await getProfileViewStats(user.id);
        setViewStats(stats);
        
        // Fetch top links
        const { data: linksData, error: linksError } = await supabase.rpc(
          'get_top_clicked_links',
          { user_id_param: user.id }
        );
        
        if (linksError) {
          console.error('Error fetching top links:', linksError);
        } else if (linksData) {
          setTopLinks(linksData || []);
        }
        
        // Fetch referrers
        const { data: referrerData, error: referrerError } = await supabase.rpc(
          'get_profile_referrers',
          { user_id_param: user.id }
        );
        
        if (referrerError) {
          console.error('Error fetching referrers:', referrerError);
        } else if (referrerData) {
          setReferrers(referrerData || []);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
    
    // Set up realtime subscription for analytics updates
    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profile_views',
        filter: `profile_id=eq.${user.id}`
      }, payload => {
        console.log('New profile view:', payload);
        // Refresh analytics
        fetchAnalytics();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'link_clicks',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('New link click:', payload);
        // Refresh analytics
        fetchAnalytics();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Prepare chart data
  const chartData = viewStats.daily && viewStats.daily.length > 0 
    ? viewStats.daily.map(item => ({
        name: formatDate(item.date),
        views: item.count
      }))
    : [];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your profile performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Profile Views</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full border-2 rounded-md border-dashed flex items-center justify-center">
                <p className="text-muted-foreground">No profile views data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : topLinks.length > 0 ? (
              <div className="space-y-4">
                {topLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <LinkIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{link.link_title || link.link_id.split("-")[0]}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold">{link.click_count}</span>
                      <span className="text-muted-foreground ml-1">clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No link clicks recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : referrers.length > 0 ? (
              <div className="space-y-4">
                {referrers.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{referrer.source || 'Direct'}</span>
                    <div className="flex items-center">
                      <span className="font-bold">{referrer.view_count}</span>
                      <span className="text-muted-foreground ml-1">visits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No referrer data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Access Methods</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">NFC Taps</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold">{
                      referrers.find(r => r.source === 'nfc')?.view_count || 0
                    }</span>
                    <span className="text-muted-foreground ml-1">taps</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">QR Code Scans</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold">{
                      referrers.find(r => r.source === 'qr')?.view_count || 0
                    }</span>
                    <span className="text-muted-foreground ml-1">scans</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
