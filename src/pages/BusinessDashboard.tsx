import { useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/organization/useOrganization";
import BusinessDashboardLayout from "@/components/business-dashboard/BusinessDashboardLayout";
import BusinessHomePage from "@/components/business-dashboard/pages/BusinessHomePage";
import BusinessTeamPage from "@/components/business-dashboard/pages/BusinessTeamPage";
import BusinessContactsPage from "@/components/business-dashboard/pages/BusinessContactsPage";
import BusinessInsightsPage from "@/components/business-dashboard/pages/BusinessInsightsPage";
import BusinessEventsPage from "@/components/business-dashboard/pages/BusinessEventsPage";
import BusinessEventDetailPage from "@/components/business-dashboard/pages/BusinessEventDetailPage";
import BusinessPublicPageSettings from "@/components/business-dashboard/pages/BusinessPublicPageSettings";
import BusinessSettingsPage from "@/components/business-dashboard/pages/BusinessSettingsPage";

const BusinessDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { organization, loading: orgLoading } = useOrganization();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Conta Business necessária</h2>
          <p className="text-muted-foreground text-sm">
            Precisa de uma conta Business para aceder a este dashboard.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <BusinessDashboardLayout>
      <Routes>
        <Route index element={<BusinessHomePage />} />
        <Route path="team" element={<BusinessTeamPage />} />
        <Route path="contacts" element={<BusinessContactsPage />} />
        <Route path="insights" element={<BusinessInsightsPage />} />
        <Route path="events" element={<BusinessEventsPage />} />
        <Route path="events/:eventId" element={<BusinessEventDetailPage />} />
        <Route path="public-page" element={<BusinessPublicPageSettings />} />
        <Route path="settings" element={<BusinessSettingsPage />} />
        <Route path="*" element={<Navigate to="/business" replace />} />
      </Routes>
    </BusinessDashboardLayout>
  );
};

export default BusinessDashboard;
