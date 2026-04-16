
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PerformanceMetric {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_photo: string | null;
  department: string | null;
  position: string | null;
  joined_at: string;
  left_at: string | null;
  profile_views_count: number;
  link_clicks_count: number;
  leads_generated_count: number;
  connections_made_count: number;
  conversion_rate: number;
  engagement_score: number;
}

export const usePerformanceMetrics = (organizationId?: string) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!user || !organizationId) return;

    try {
      setLoading(true);

      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          joined_at,
          status,
          updated_at,
          department,
          position,
          profiles!fk_organization_members_user_id (
            name,
            email,
            photo_url
          )
        `)
        .eq('organization_id', organizationId);

      if (membersError) throw membersError;
      if (!members) {
        setMetrics([]);
        return;
      }

      const metricsPromises = members.map(async (member: any) => {
        const employeeId = member.user_id;
        const startDate = member.joined_at;
        const endDate = member.status === 'inactive' ? member.updated_at : new Date().toISOString();
        
        // Fetch all metrics in parallel
        const [viewsResult, connectionsResult, leadsResult, clicksResult] = await Promise.all([
          supabase
            .from('profile_views')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', employeeId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate),
          supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', employeeId)
            .gte('created_at', startDate)
            .lte('created_at', endDate),
          // Only count leads that belong to this organization
          supabase
            .from('contact_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('profile_owner_id', employeeId)
            .eq('organization_id', organizationId)
            .gte('created_at', startDate)
            .lte('created_at', endDate),
          supabase
            .from('profile_views')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', employeeId)
            .like('source', 'click:%')
            .gte('timestamp', startDate)
            .lte('timestamp', endDate),
        ]);

        const views = viewsResult.count || 0;
        const clicks = clicksResult.count || 0;
        const leads = leadsResult.count || 0;
        const connections = connectionsResult.count || 0;

        const conversionRate = views > 0 ? (leads / views) * 100 : 0;
        const engagementScore = views > 0 ? ((clicks + connections + leads) / views) * 100 : 0;

        return {
          employee_id: employeeId,
          employee_name: member.profiles?.name || 'Unknown',
          employee_email: member.profiles?.email || '',
          employee_photo: member.profiles?.photo_url || null,
          department: member.department,
          position: member.position,
          joined_at: member.joined_at,
          left_at: member.status === 'inactive' ? member.updated_at : null,
          profile_views_count: views,
          link_clicks_count: clicks,
          leads_generated_count: leads,
          connections_made_count: connections,
          conversion_rate: conversionRate,
          engagement_score: engagementScore,
        } as PerformanceMetric;
      });

      const calculatedMetrics = await Promise.all(metricsPromises);
      setMetrics(calculatedMetrics);
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeMetrics = (employeeId: string) => {
    return metrics.find(metric => metric.employee_id === employeeId);
  };

  const getOrganizationSummary = () => {
    const summary = metrics.reduce(
      (acc, metric) => ({
        totalViews: acc.totalViews + metric.profile_views_count,
        totalClicks: acc.totalClicks + metric.link_clicks_count,
        totalLeads: acc.totalLeads + metric.leads_generated_count,
        totalConnections: acc.totalConnections + metric.connections_made_count,
        employeeCount: acc.employeeCount + 1
      }),
      {
        totalViews: 0,
        totalClicks: 0,
        totalLeads: 0,
        totalConnections: 0,
        employeeCount: 0
      }
    );

    return {
      totalViews: summary.totalViews,
      totalClicks: summary.totalClicks,
      totalLeads: summary.totalLeads,
      totalConnections: summary.totalConnections,
      employeeCount: summary.employeeCount,
      averageViewsPerEmployee: summary.employeeCount > 0 ? Math.round(summary.totalViews / summary.employeeCount) : 0,
      averageLeadsPerEmployee: summary.employeeCount > 0 ? Math.round(summary.totalLeads / summary.employeeCount) : 0,
      conversionRate: summary.totalViews > 0 ? Math.round((summary.totalLeads / summary.totalViews) * 100 * 100) / 100 : 0
    };
  };

  const getOrganizationSummaryWithTrends = async () => {
    if (!user || !organizationId) return null;

    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('user_id, joined_at, status, updated_at')
        .eq('organization_id', organizationId);

      if (membersError) throw membersError;
      if (!members || members.length === 0) {
        return {
          totalViews: 0,
          totalClicks: 0,
          totalLeads: 0,
          totalConnections: 0,
          employeeCount: 0,
          averageViewsPerEmployee: 0,
          averageLeadsPerEmployee: 0,
          conversionRate: 0,
          viewsTrend: 'neutral' as const,
          viewsTrendValue: '0% from last week',
          leadsTrend: 'neutral' as const,
          leadsTrendValue: '0% from last week',
          conversionTrend: 'neutral' as const,
          conversionTrendValue: '0% from last week'
        };
      }

      const memberIds = members.map(m => m.user_id);

      // Current week metrics — filter leads by organization_id
      const [currentViews, currentClicks, currentLeads, currentConnections] = await Promise.all([
        supabase.from('profile_views').select('*', { count: 'exact', head: true })
          .in('profile_id', memberIds)
          .gte('timestamp', oneWeekAgo.toISOString()),
        supabase.from('profile_views').select('*', { count: 'exact', head: true })
          .in('profile_id', memberIds)
          .like('source', 'click:%')
          .gte('timestamp', oneWeekAgo.toISOString()),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('connections').select('*', { count: 'exact', head: true })
          .in('user_id', memberIds)
          .gte('created_at', oneWeekAgo.toISOString())
      ]);

      // Previous week metrics — filter leads by organization_id
      const [prevViews, prevClicks, prevLeads, prevConnections] = await Promise.all([
        supabase.from('profile_views').select('*', { count: 'exact', head: true })
          .in('profile_id', memberIds)
          .gte('timestamp', twoWeeksAgo.toISOString())
          .lt('timestamp', oneWeekAgo.toISOString()),
        supabase.from('profile_views').select('*', { count: 'exact', head: true })
          .in('profile_id', memberIds)
          .like('source', 'click:%')
          .gte('timestamp', twoWeeksAgo.toISOString())
          .lt('timestamp', oneWeekAgo.toISOString()),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', twoWeeksAgo.toISOString())
          .lt('created_at', oneWeekAgo.toISOString()),
        supabase.from('connections').select('*', { count: 'exact', head: true })
          .in('user_id', memberIds)
          .gte('created_at', twoWeeksAgo.toISOString())
          .lt('created_at', oneWeekAgo.toISOString())
      ]);

      const currViews = currentViews.count || 0;
      const currClicks = currentClicks.count || 0;
      const currLeads = currentLeads.count || 0;
      const currConnections = currentConnections.count || 0;

      const prevViewsCount = prevViews.count || 0;
      const prevLeadsCount = prevLeads.count || 0;

      const viewsChange = prevViewsCount > 0 ? ((currViews - prevViewsCount) / prevViewsCount) * 100 : (currViews > 0 ? 100 : 0);
      const leadsChange = prevLeadsCount > 0 ? ((currLeads - prevLeadsCount) / prevLeadsCount) * 100 : (currLeads > 0 ? 100 : 0);
      
      const currConversion = currViews > 0 ? (currLeads / currViews) * 100 : 0;
      const prevConversion = prevViewsCount > 0 ? ((prevLeadsCount || 0) / prevViewsCount) * 100 : 0;
      const conversionChange = prevConversion > 0 ? ((currConversion - prevConversion) / prevConversion) * 100 : (currConversion > 0 ? 100 : 0);

      const getTrend = (change: number): 'up' | 'down' | 'neutral' => {
        if (change > 0) return 'up';
        if (change < 0) return 'down';
        return 'neutral';
      };

      return {
        totalViews: currViews,
        totalClicks: currClicks,
        totalLeads: currLeads,
        totalConnections: currConnections,
        employeeCount: members.length,
        averageViewsPerEmployee: members.length > 0 ? Math.round(currViews / members.length) : 0,
        averageLeadsPerEmployee: members.length > 0 ? Math.round(currLeads / members.length) : 0,
        conversionRate: Math.round(currConversion * 100) / 100,
        viewsTrend: getTrend(viewsChange),
        viewsTrendValue: `${viewsChange > 0 ? '+' : ''}${Math.round(viewsChange * 10) / 10}% from last week`,
        leadsTrend: getTrend(leadsChange),
        leadsTrendValue: `${leadsChange > 0 ? '+' : ''}${Math.round(leadsChange * 10) / 10}% from last week`,
        conversionTrend: getTrend(conversionChange),
        conversionTrendValue: `${conversionChange > 0 ? '+' : ''}${Math.round(conversionChange * 10) / 10}% from last week`
      };
    } catch (err) {
      console.error('Error fetching summary with trends:', err);
      return null;
    }
  };

  const updateMetrics = async () => {
    await fetchMetrics();
    return { success: true };
  };

  useEffect(() => {
    fetchMetrics();
  }, [user, organizationId]);

  return {
    metrics,
    loading,
    error,
    getEmployeeMetrics,
    getOrganizationSummary,
    getOrganizationSummaryWithTrends,
    updateMetrics,
    refetch: fetchMetrics
  };
};
