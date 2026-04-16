import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceMetrics } from "@/hooks/organization/usePerformanceMetrics";
import { OrganizationMember } from "@/hooks/organization/useOrganization";
import { TrendingUp, Users, Eye, Target } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface PerformanceDashboardProps {
  organizationId: string;
  members: OrganizationMember[];
}

const PerformanceDashboard = ({ organizationId, members }: PerformanceDashboardProps) => {
  const { metrics, loading, getOrganizationSummary } = usePerformanceMetrics(organizationId);
  const summary = getOrganizationSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Views"
          value={summary.totalViews}
          subtitle="Past 30 days"
          icon={Eye}
        />

        <StatCard
          title="Total Leads"
          value={summary.totalLeads}
          subtitle="Past 30 days"
          icon={Target}
        />

        <StatCard
          title="Avg. per Employee"
          value={summary.averageLeadsPerEmployee}
          subtitle="Leads per employee"
          icon={Users}
        />

        <StatCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          subtitle="Views to leads"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>
            Latest performance metrics from your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No performance data available yet
            </p>
          ) : (
            <div className="space-y-4">
              {metrics.slice(0, 10).map((metric) => (
                <div key={metric.employee_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{metric.employee_name || 'Unknown Employee'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(metric.joined_at).toLocaleDateString('pt-PT')}
                      {metric.left_at && ` - ${new Date(metric.left_at).toLocaleDateString('pt-PT')}`}
                    </p>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span>{metric.profile_views_count} views</span>
                    <span>{metric.leads_generated_count} leads</span>
                    <span>{metric.connections_made_count} connections</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
