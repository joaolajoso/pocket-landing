import { useOrganization } from "@/hooks/organization/useOrganization";
import { usePerformanceMetrics } from "@/hooks/organization/usePerformanceMetrics";
import AdvancedEmployeeManagement from "@/components/dashboard/tabs/business/AdvancedEmployeeManagement";

const BusinessTeamPage = () => {
  const { organization, members, userRole, refetch } = useOrganization();
  const { metrics, getOrganizationSummary } = usePerformanceMetrics(organization?.id);

  if (!organization) return null;

  const summary = getOrganizationSummary();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdvancedEmployeeManagement
        organization={organization}
        members={members}
        userRole={userRole}
        onRefresh={refetch}
        summary={summary}
        metrics={metrics}
      />
    </div>
  );
};

export default BusinessTeamPage;
