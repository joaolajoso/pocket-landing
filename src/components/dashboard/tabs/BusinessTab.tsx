
import { useState, useEffect } from "react";
import { Users, Building2, PencilIcon, Plus, RefreshCw, Pencil, Check, X, ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { usePerformanceMetrics } from "@/hooks/organization/usePerformanceMetrics";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import BusinessOverview from "./business/BusinessOverview";
import BusinessAnalytics from "./business/BusinessAnalytics";
import AdvancedEmployeeManagement from "./business/AdvancedEmployeeManagement";
import CreateOrganizationForm from "./business/CreateOrganizationForm";
import { PublicPageTab } from "./business/PublicPageTab";
import { OrganizationBannerCard } from "./business/OrganizationBannerCard";

const BusinessTab = () => {
  const { toast } = useToast();
  const { organization, members, userRole, loading, createOrganization, updateOrganizationName, refetch, allOrganizations, switchOrganization } = useOrganization();
  const { getOrganizationSummary, getOrganizationSummaryWithTrends, updateMetrics, loading: metricsLoading, metrics } = usePerformanceMetrics(organization?.id);

  const BUSINESS_TAB_STORAGE_KEY = "pocketcv_business_active_tab";
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem(BUSINESS_TAB_STORAGE_KEY);
    return saved || "overview";
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [summaryWithTrends, setSummaryWithTrends] = useState<any>(null);

  useEffect(() => {
    sessionStorage.setItem(BUSINESS_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (organization) {
      setEditedName(organization.name);
    }
  }, [organization]);

  useEffect(() => {
    const fetchSummaryWithTrends = async () => {
      if (organization?.id) {
        const data = await getOrganizationSummaryWithTrends();
        if (data) {
          setSummaryWithTrends(data);
        }
      }
    };
    fetchSummaryWithTrends();
  }, [organization?.id, metrics]);

  const handleRefresh = async () => {
    if (!organization?.id) return;
    
    setIsRefreshing(true);
    setIsCalculating(true);
    
    try {
      // Force refetch organization data to get updated banner
      await refetch(true);
      
      const result = await updateMetrics();
      if (result.success) {
        setLastUpdated(new Date());
        
        // Refetch summary with trends
        const data = await getOrganizationSummaryWithTrends();
        if (data) {
          setSummaryWithTrends(data);
        }
        
        toast({
          title: "Métricas atualizadas",
          description: "As métricas foram recalculadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar métricas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar métricas",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setIsCalculating(false), 500);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    
    const result = await updateOrganizationName(editedName.trim());
    if (result.success) {
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(organization?.name || "");
    setIsEditingName(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar dashboard business...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Criar Conta Business</CardTitle>
            <CardDescription>
              Configure a sua organização para gerir colaboradores, acompanhar performance 
              e supervisionar atividades de networking da equipa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showCreateForm ? (
              <CreateOrganizationForm
                onSubmit={createOrganization}
                onCancel={() => setShowCreateForm(false)}
              />
            ) : (
              <div className="text-center">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-left">
                    <h4 className="font-medium text-blue-900 mb-2">O que inclui a conta Business:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Gestão completa de colaboradores</li>
                      <li>• Dashboard de performance detalhado</li>
                      <li>• Controlo de permissões de dados</li>
                      <li>• Sistema de convites e aprovações</li>
                      <li>• Analytics avançados da equipa</li>
                    </ul>
                  </div>
                  <Button onClick={() => setShowCreateForm(true)} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Organização
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = getOrganizationSummary();

  return (
    <div className="space-y-6">
      {/* Organization Switcher - only show when user has multiple orgs */}
      {allOrganizations.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Empresa:</span>
          <Select
            value={organization?.id || ''}
            onValueChange={async (orgId) => {
              const result = await switchOrganization(orgId);
              if (result.success) {
                toast({ title: "Empresa alterada", description: "A visualizar outra organização." });
              }
            }}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Selecionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {allOrganizations.map((org) => (
                <SelectItem key={org.organization_id} value={org.organization_id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      {org.org_logo && <AvatarImage src={org.org_logo} />}
                      <AvatarFallback className="text-[10px]">
                        {org.org_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{org.org_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Banner Card */}
      <OrganizationBannerCard
        organizationId={organization.id}
        bannerUrl={organization.banner_url}
        logoUrl={organization.logo_url}
        organizationName={organization.name}
        onUpdate={handleRefresh}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold h-auto py-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{organization.name}</h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsEditingName(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mb-1">
              Atualizado {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: pt })}
            </p>
          )}
          <p className="text-muted-foreground">{organization.description}</p>
          {organization.industry && (
            <Badge variant="outline" className="mt-2">
              {organization.industry}
            </Badge>
          )}
        </div>
        {organization.size_category && (
          <Badge variant="secondary" className="capitalize h-fit flex-shrink-0">
            {organization.size_category}
          </Badge>
        )}
      </div>

      {isCalculating && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="animate-spin h-5 w-5 text-blue-600" />
              <span className="text-blue-900 font-medium">
                A calcular métricas de performance...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex w-full overflow-x-auto md:grid md:w-full md:grid-cols-4">
          <TabsTrigger value="overview" className="whitespace-nowrap">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
          <TabsTrigger value="employees" className="whitespace-nowrap">Equipa</TabsTrigger>
          <TabsTrigger value="public-page" className="whitespace-nowrap">Página Pública</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BusinessOverview 
            organization={organization}
            members={members}
            summary={summary}
            metrics={metrics}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BusinessAnalytics 
            organizationId={organization.id}
            memberIds={members.map(m => m.user_id)}
            membersCount={members.length}
            summaryWithTrends={summaryWithTrends}
            metricsLoading={metricsLoading || isRefreshing}
            summary={summary}
          />
        </TabsContent>

        <TabsContent value="employees">
          <AdvancedEmployeeManagement 
            organization={organization}
            members={members}
            userRole={userRole}
            onRefresh={refetch}
            summary={summary}
            metrics={metrics}
          />
        </TabsContent>

        <TabsContent value="public-page">
          <PublicPageTab 
            organizationId={organization.id}
            organizationName={organization.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessTab;
