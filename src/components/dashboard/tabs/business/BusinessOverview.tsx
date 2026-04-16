import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Target, Award, Eye, UserPlus, Link, Smartphone, Globe, ChevronRight } from "lucide-react";
import { Organization, OrganizationMember } from "@/hooks/organization/useOrganization";
import { PerformanceMetric } from "@/hooks/organization/usePerformanceMetrics";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/translations/dashboard';
import { getTranslation } from '@/translations';
import { useOrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";
import { BusinessPagePreview } from "./BusinessPagePreview";
import { Button } from "@/components/ui/button";
import MemberProfileSheet from "./MemberProfileSheet";

interface BusinessOverviewProps {
  organization: Organization;
  members: OrganizationMember[];
  summary: {
    totalViews: number;
    totalClicks: number;
    totalLeads: number;
    totalConnections: number;
    employeeCount: number;
    averageViewsPerEmployee: number;
    averageLeadsPerEmployee: number;
    conversionRate: number;
  };
  metrics: PerformanceMetric[];
}

const BusinessOverview = ({
  organization,
  members,
  summary,
  metrics
}: BusinessOverviewProps) => {
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const { website } = useOrganizationWebsite(organization.id);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  // Calculate top networker based on total metrics
  const getTopNetworker = () => {
    const memberMetrics = members.map(member => {
      const memberMetric = metrics.find(m => m.employee_id === member.user_id);
      const totalScore = (memberMetric?.profile_views_count || 0) + (memberMetric?.leads_generated_count || 0) * 2 + (memberMetric?.connections_made_count || 0) * 3;
      return {
        member,
        metrics: memberMetric,
        totalScore
      };
    });
    return memberMetrics.sort((a, b) => b.totalScore - a.totalScore)[0];
  };
  
  const topNetworker = getTopNetworker();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Networker */}
      <Card className="border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Award className="h-5 w-5" />
            {t.business.topNetworker}
          </CardTitle>
          <CardDescription>{t.business.bestPerformance}</CardDescription>
        </CardHeader>
        <CardContent>
          {topNetworker && topNetworker.totalScore > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-12 w-12 border-2 border-yellow-500">
                  <AvatarImage src={topNetworker.member.profile?.photo_url || ""} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-700">
                    {topNetworker.member.profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-lg">{topNetworker.member.profile?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{topNetworker.member.role}</p>
                </div>
                <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                  <Award className="h-3 w-3 mr-1" />
                  #1
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-medium">{t.business.views}</span>
                  </div>
                  <p className="text-2xl font-bold">{topNetworker.metrics?.profile_views_count || 0}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">{t.business.leads}</span>
                  </div>
                  <p className="text-2xl font-bold">{topNetworker.metrics?.leads_generated_count || 0}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <UserPlus className="h-4 w-4" />
                    <span className="text-xs font-medium">{t.business.connections}</span>
                  </div>
                  <p className="text-2xl font-bold">{topNetworker.metrics?.connections_made_count || 0}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                    <Link className="h-4 w-4" />
                    <span className="text-xs font-medium">{t.business.clicks}</span>
                  </div>
                  <p className="text-2xl font-bold">{topNetworker.metrics?.link_clicks_count || 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t.business.noPerformanceData}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Business Page Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Página Pública
          </CardTitle>
          <CardDescription>
            {website ? 'Pré-visualização da sua página business' : 'Configure a sua página pública'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {website ? (
            <div className="space-y-4">
              <BusinessPagePreview data={website} className="scale-[0.65] origin-top -mb-48" />
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/c/${website.subdomain}`} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    pocketcv.pt/c/{website.subdomain}
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Ainda não tem uma página pública configurada
              </p>
              <p className="text-sm text-muted-foreground">
                Aceda à aba "Página Pública" para criar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.business.teamMembers}
          </CardTitle>
          <CardDescription>
            {members.length} {t.business.activeMembers}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map(member => (
              <button
                key={member.id}
                type="button"
                onClick={() => { setSelectedMember(member); setShowMemberSheet(true); }}
                className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg min-w-0 w-full text-left hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="shrink-0">
                    <AvatarImage src={member.profile?.photo_url || ""} />
                    <AvatarFallback>
                      {member.profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{member.profile?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <Badge variant="outline" className="capitalize mb-1 text-xs">
                      {member.role}
                    </Badge>
                    {member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Profile Sheet */}
      <MemberProfileSheet
        member={selectedMember}
        open={showMemberSheet}
        onOpenChange={setShowMemberSheet}
      />
    </div>
  );
};

export default BusinessOverview;