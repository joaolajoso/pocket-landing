import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";

const StatisticsCards = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const [profileViews, setProfileViews] = useState(0);
  const [linkClicks, setLinkClicks] = useState(0);
  const [profileViewsLastWeek, setProfileViewsLastWeek] = useState(0);
  const [linkClicksLastWeek, setLinkClicksLastWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get date ranges for current and previous week
        const now = new Date();
        const oneWeekAgo = subDays(now, 7);
        const twoWeeksAgo = subDays(now, 14);
        
        // Format dates for querying
        const oneWeekAgoStr = format(oneWeekAgo, "yyyy-MM-dd");
        const twoWeeksAgoStr = format(twoWeeksAgo, "yyyy-MM-dd");
        
        // Execute ALL 4 queries in parallel with head: true for optimal performance
        const [
          currentViewsResult,
          currentClicksResult,
          prevViewsResult,
          prevClicksResult
        ] = await Promise.all([
          // CURRENT WEEK: Profile views (not from link clicks)
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", user.id)
            .not("source", "like", "click:%")
            .gte("timestamp", oneWeekAgoStr),
          // CURRENT WEEK: Link clicks
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", user.id)
            .like("source", "click:%")
            .gte("timestamp", oneWeekAgoStr),
          // PREVIOUS WEEK: Profile views
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", user.id)
            .not("source", "like", "click:%")
            .gte("timestamp", twoWeeksAgoStr)
            .lt("timestamp", oneWeekAgoStr),
          // PREVIOUS WEEK: Link clicks
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", user.id)
            .like("source", "click:%")
            .gte("timestamp", twoWeeksAgoStr)
            .lt("timestamp", oneWeekAgoStr)
        ]);

        // Set all state at once
        setProfileViews(currentViewsResult.count || 0);
        setLinkClicks(currentClicksResult.count || 0);
        setProfileViewsLastWeek(prevViewsResult.count || 0);
        setLinkClicksLastWeek(prevClicksResult.count || 0);
        
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  // Calculate percentage changes from last week
  const getPercentChange = (current: number, previous: number): string => {
    if (previous === 0) {
      // Se não tinha dados na semana anterior, mostra "novo" ou o crescimento absoluto
      return current > 0 ? `${current * 100}%` : "0%";
    }
    
    const percentChange = ((current - previous) / previous) * 100;
    // Não adicionar "+" aqui pois o StatCard já adiciona quando trend é "up"
    return `${Math.abs(percentChange).toFixed(0)}%`;
  };

  // Determine trend direction
  const getTrend = (current: number, previous: number): "up" | "down" | "neutral" => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "neutral";
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate the percentage changes and trends
  const profileViewsChange = getPercentChange(profileViews, profileViewsLastWeek);
  const linkClicksChange = getPercentChange(linkClicks, linkClicksLastWeek);
  
  // Calculate conversion rate for current and previous week
  const conversionRate = profileViews > 0 ? (linkClicks / profileViews) * 100 : 0;
  const prevConversionRate = profileViewsLastWeek > 0 ? (linkClicksLastWeek / profileViewsLastWeek) * 100 : 0;
  const conversionRateChange = getPercentChange(conversionRate, prevConversionRate);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title={t.overview.stats.profileViews}
        value={profileViews}
        subtitle={t.overview.stats.totalViews}
        icon={Eye}
        trend={getTrend(profileViews, profileViewsLastWeek)}
        trendValue={`${profileViewsChange} ${t.overview.stats.fromLastWeek}`}
      />
      <StatCard
        title={t.overview.stats.linkClicks}
        value={linkClicks}
        subtitle={t.overview.stats.totalClicks}
        icon={MousePointerClick}
        trend={getTrend(linkClicks, linkClicksLastWeek)}
        trendValue={`${linkClicksChange} ${t.overview.stats.fromLastWeek}`}
      />
      <StatCard
        title={t.overview.stats.conversionRate}
        value={conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : "0%"}
        subtitle={t.overview.stats.clicksPerView}
        icon={TrendingUp}
        trend={getTrend(conversionRate, prevConversionRate)}
        trendValue={`${conversionRateChange} ${t.overview.stats.fromLastWeek}`}
      />
    </div>
  );
};

export default StatisticsCards;
