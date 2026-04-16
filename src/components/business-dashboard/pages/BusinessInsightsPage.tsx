import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { usePerformanceMetrics } from "@/hooks/organization/usePerformanceMetrics";
import BusinessAnalytics from "@/components/dashboard/tabs/business/BusinessAnalytics";

const BusinessInsightsPage = () => {
  const { organization, members } = useOrganization();
  const { metrics, loading, getOrganizationSummary, getOrganizationSummaryWithTrends } = usePerformanceMetrics(organization?.id);
  const [summaryWithTrends, setSummaryWithTrends] = useState<any>(null);

  useEffect(() => {
    if (organization?.id) {
      getOrganizationSummaryWithTrends().then(setSummaryWithTrends).catch(() => {});
    }
  }, [organization?.id]);

  if (!organization) return null;

  const summary = getOrganizationSummary();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-white">Métricas</h1>
        <p className="text-white/50 text-sm mt-1">Performance da equipa e da empresa</p>
      </div>
      <BusinessAnalytics
        organizationId={organization.id}
        memberIds={members.map(m => m.user_id)}
        membersCount={members.length}
        summaryWithTrends={summaryWithTrends}
        metricsLoading={loading}
        summary={summary}
      />
    </div>
  );
};

export default BusinessInsightsPage;
