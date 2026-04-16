
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users } from "lucide-react";
import { OrganizationMember } from "@/hooks/organization/useOrganization";
import { PerformanceMetric } from "@/hooks/organization/usePerformanceMetrics";

interface EmployeePerformanceCardProps {
  member: OrganizationMember;
  metrics: PerformanceMetric[];
  maxValues?: {
    views: number;
    leads: number;
    connections: number;
  };
}

const EmployeePerformanceCard = ({ member, metrics, maxValues }: EmployeePerformanceCardProps) => {
  // Calculate totals for the last 30 days
  const totalViews = metrics.reduce((sum, metric) => sum + (metric.profile_views_count || 0), 0);
  const totalClicks = metrics.reduce((sum, metric) => sum + (metric.link_clicks_count || 0), 0);
  const totalLeads = metrics.reduce((sum, metric) => sum + (metric.leads_generated_count || 0), 0);
  const totalConnections = metrics.reduce((sum, metric) => sum + (metric.connections_made_count || 0), 0);
  
  const avgEngagement = metrics.length > 0 
    ? metrics.reduce((sum, metric) => sum + (metric.engagement_score || 0), 0) / metrics.length 
    : 0;

  // Calculate conversion rate (leads/views)
  const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

  // Calculate progress percentages based on max values
  const viewsProgress = maxValues?.views ? (totalViews / maxValues.views) * 100 : 0;
  const leadsProgress = maxValues?.leads ? (totalLeads / maxValues.leads) * 100 : 0;
  const connectionsProgress = maxValues?.connections ? (totalConnections / maxValues.connections) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarImage src={member.profile?.photo_url || ""} />
            <AvatarFallback>
              {member.profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{member.profile?.name || 'Nome não disponível'}</CardTitle>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mt-1 ${
              member.role === 'owner' ? 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-950/40' :
              member.role === 'admin' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/40' :
              member.role === 'manager' ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40' :
              'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950/40'
            }`}>
              {member.role === 'owner' && 'Proprietário'}
              {member.role === 'admin' && 'Admin'}
              {member.role === 'manager' && 'Gestor'}
              {member.role === 'employee' && 'Colaborador'}
            </span>
            <CardDescription className="mt-1">
              {member.position && <span>{member.position}</span>}
              {member.department && member.position && ' • '}
              {member.department && <span>{member.department}</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Views Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Views</span>
            <span className="font-semibold">{totalViews}</span>
          </div>
          <Progress value={viewsProgress} indicatorClassName="bg-blue-500" className="h-2" />
        </div>

        {/* Leads Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Leads</span>
            <span className="font-semibold">{totalLeads}</span>
          </div>
          <Progress value={leadsProgress} indicatorClassName="bg-orange-500" className="h-2" />
        </div>

        {/* Connections Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Connections</span>
            <span className="font-semibold">{totalConnections}</span>
          </div>
          <Progress value={connectionsProgress} indicatorClassName="bg-green-500" className="h-2" />
        </div>

        {/* Engagement Metrics */}
        <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span>Engagement: <span className="font-medium text-foreground">{avgEngagement.toFixed(1)}%</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-purple-600" />
            <span>Engagement: <span className="font-medium text-foreground">{conversionRate.toFixed(1)}%</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeePerformanceCard;
