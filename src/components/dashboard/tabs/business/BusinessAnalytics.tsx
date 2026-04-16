import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "@/components/ui/charts";
import { DateRange } from "@/types/date-range";
import { addDays, format, subDays } from "date-fns";
import { Loader2, Info, Calendar, Users, Eye, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessAnalyticsProps {
  organizationId: string;
  memberIds: string[];
  membersCount: number;
  summaryWithTrends: any;
  metricsLoading: boolean;
  summary: any;
}

const KPICardSkeleton = () => (
  <div className="p-6 border rounded-lg">
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton className="h-10 w-24 mb-2" />
    <Skeleton className="h-4 w-40" />
  </div>
);

const BusinessAnalytics = ({ organizationId, memberIds, membersCount, summaryWithTrends, metricsLoading, summary }: BusinessAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [profileViews, setProfileViews] = useState<any[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!organizationId || memberIds.length === 0) return;
      
      try {
        setLoading(true);
        
        // Fetch profile views from all organization members
        const { data: viewsData, error: viewsError } = await supabase
          .from("profile_views")
          .select("*")
          .in("profile_id", memberIds)
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
  }, [organizationId, memberIds, dateRange]);

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
      
      // Skip click data - we only want actual referral sources
      if (source.startsWith("click:")) {
        return;
      }
      
      // Clean up and categorize referral sources
      let cleanSource = source;
      if (source === "direct" || source === "") {
        cleanSource = "Direto";
      } else if (source === "qr") {
        cleanSource = "Código QR";
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
        cleanSource = source.replace("utm_", "").replace("_", " ");
        cleanSource = cleanSource.charAt(0).toUpperCase() + cleanSource.slice(1);
      } else {
        cleanSource = source.charAt(0).toUpperCase() + source.slice(1);
      }
      
      referrerMap.set(cleanSource, (referrerMap.get(cleanSource) || 0) + 1);
    });
    
    // Convert to array and sort by count
    return Array.from(referrerMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5);
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
      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricsLoading || !summaryWithTrends ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total de Colaboradores"
              value={membersCount}
              subtitle="Ativos na organização"
              icon={Users}
            />
            <StatCard
              title="Visualizações (30d)"
              value={summaryWithTrends.totalViews.toLocaleString()}
              subtitle={`Média: ${summaryWithTrends.averageViewsPerEmployee}/colaborador`}
              icon={Eye}
              trend={summaryWithTrends.viewsTrend}
              trendValue={summaryWithTrends.viewsTrendValue}
            />
            <StatCard
              title="Leads Gerados (30d)"
              value={summaryWithTrends.totalLeads.toLocaleString()}
              subtitle={`Média: ${summaryWithTrends.averageLeadsPerEmployee}/colaborador`}
              icon={Target}
              trend={summaryWithTrends.leadsTrend}
              trendValue={summaryWithTrends.leadsTrendValue}
            />
            <StatCard
              title="Taxa de Conversão"
              value={`${summaryWithTrends.conversionRate}%`}
              subtitle={summaryWithTrends.totalViews > 0 ? 'Performance da equipa' : 'Sem dados'}
              icon={TrendingUp}
              trend={summaryWithTrends.conversionTrend}
              trendValue={summaryWithTrends.conversionTrendValue}
            />
          </>
        )}
      </div>

      {/* Performance Summary */}
      {summaryWithTrends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo de Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground/70 mt-1">Últimos 7 dias vs semana anterior</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Média de Visualizações por Colaborador</p>
                <p className="text-2xl font-bold">{summaryWithTrends.averageViewsPerEmployee}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Média de Leads por Colaborador</p>
                <p className="text-2xl font-bold">{summaryWithTrends.averageLeadsPerEmployee}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total de Conexões</p>
                <p className="text-2xl font-bold">{summaryWithTrends.totalConnections}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{summaryWithTrends.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold">Analytics da Equipa</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Dados agregados de todos os colaboradores da organização. 
                  Acompanhe visualizações de perfil e origens do tráfego.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              {format(dateRange.from || new Date(), "dd/MM")} - {format(dateRange.to || new Date(), "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end" side="bottom" sideOffset={4}>
            <CalendarComponent
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={1}
              className="max-w-[280px]"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="referrers">Origens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações de Perfil</CardTitle>
              <CardDescription>
                Visualizações diárias de todos os perfis da equipa
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
              <CardTitle>Principais Origens</CardTitle>
              <CardDescription>
                De onde vêm os visitantes dos perfis da equipa
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
                  Sem dados de origem disponíveis para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessAnalytics;
