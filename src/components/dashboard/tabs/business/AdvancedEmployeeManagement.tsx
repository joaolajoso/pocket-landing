import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Link2, Plus, UserRound, Copy, Share2, Check, Info, Search, Trophy, Eye, UserPlus, Link as LinkIcon, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Organization, OrganizationMember, useOrganization } from "@/hooks/organization/useOrganization";
import { usePerformanceMetrics, PerformanceMetric } from "@/hooks/organization/usePerformanceMetrics";
import { useDepartments } from "@/hooks/organization/useDepartments";
import GenerateInviteLinkDialog from "./GenerateInviteLinkDialog";
import EmployeePerformanceCard from "./EmployeePerformanceCard";
import { EditMemberDialog } from "./EditMemberDialog";
import { DepartmentManagement } from "./DepartmentManagement";
import { PermissionsTab } from "./PermissionsTab";
import PendingInvitationsList from "./PendingInvitationsList";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdvancedEmployeeManagementProps {
  organization: Organization;
  members: OrganizationMember[];
  userRole: string | null;
  onRefresh: () => void;
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
const AdvancedEmployeeManagement = ({
  organization,
  members,
  userRole,
  onRefresh,
  summary,
  metrics
}: AdvancedEmployeeManagementProps) => {
  const EMPLOYEE_TAB_STORAGE_KEY = "pocketcv_employee_management_active_tab";
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem(EMPLOYEE_TAB_STORAGE_KEY);
    return saved || "performance";
  });

  useEffect(() => {
    sessionStorage.setItem(EMPLOYEE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionsInfo, setShowPermissionsInfo] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [lastGeneratedLink, setLastGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("score");

  const handleCopyLink = async () => {
    if (!lastGeneratedLink) return;
    try {
      await navigator.clipboard.writeText(lastGeneratedLink);
      setCopied(true);
      toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar o link.", variant: "destructive" });
    }
  };

  const handleShareLink = async () => {
    if (!lastGeneratedLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite PocketCV',
          text: 'Junte-se à nossa organização no PocketCV!',
          url: lastGeneratedLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleLinkGenerated = (link: string) => {
    setLastGeneratedLink(link);
  };
  const {
    getEmployeeMetrics
  } = usePerformanceMetrics(organization.id);
  const {
    departments
  } = useDepartments(organization.id);
  const {
    updateMemberRole,
    updateMemberDepartment,
    removeMember
  } = useOrganization();
  const canManageEmployees = userRole === 'owner' || userRole === 'admin';
  const canViewPerformance = userRole === 'owner' || userRole === 'admin' || userRole === 'manager';
  const isOwner = userRole === 'owner';
  const handleEditMember = (member: OrganizationMember) => {
    setEditingMember(member);
  };
  const activeMembers = members.filter(member => member.status === 'active');
  const pendingMembers = members.filter(member => member.status === 'pending');

  // Calculate top networker based on total metrics
  const getTopNetworker = () => {
    const memberMetrics = activeMembers.map(member => {
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
  return <div className="space-y-6 min-w-0 overflow-x-hidden">
      <div className="mb-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão da Equipa</h2>
          <p className="text-muted-foreground text-sm">
            Gerir membros, permissões e performance da equipa
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide" data-no-swipe>
          <TabsList className="w-max min-w-full">
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance Individual</TabsTrigger>
            <TabsTrigger value="management" className="text-xs sm:text-sm">
              Gestão de Equipa
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowPermissionsInfo(true); }}
                className="ml-1.5 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-colors"
                title="Sobre permissões"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="performance" className="space-y-4">
          {canViewPerformance ? (() => {
          const maxViews = Math.max(...activeMembers.map(m => {
            const metric = getEmployeeMetrics(m.user_id);
            return metric ? metric.profile_views_count || 0 : 0;
          }), 1);
          const maxLeads = Math.max(...activeMembers.map(m => {
            const metric = getEmployeeMetrics(m.user_id);
            return metric ? metric.leads_generated_count || 0 : 0;
          }), 1);
          const maxConnections = Math.max(...activeMembers.map(m => {
            const metric = getEmployeeMetrics(m.user_id);
            return metric ? metric.connections_made_count || 0 : 0;
          }), 1);
          const maxValues = {
            views: maxViews,
            leads: maxLeads,
            connections: maxConnections
          };

          const SORT_OPTIONS = [
            { value: "score", label: "Top Networker", icon: Trophy },
            { value: "views", label: "Mais Views", icon: Eye },
            { value: "leads", label: "Mais Leads", icon: UserPlus },
            { value: "connections", label: "Mais Conexões", icon: LinkIcon },
            { value: "conversion", label: "Melhor Conversão", icon: TrendingUp },
          ];

          const filteredAndSorted = activeMembers
            .filter(m => {
              if (!searchQuery) return true;
              const name = m.profile?.name?.toLowerCase() || "";
              return name.includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
              const mA = getEmployeeMetrics(a.user_id);
              const mB = getEmployeeMetrics(b.user_id);
              switch (sortBy) {
                case "views":
                  return (mB?.profile_views_count || 0) - (mA?.profile_views_count || 0);
                case "leads":
                  return (mB?.leads_generated_count || 0) - (mA?.leads_generated_count || 0);
                case "connections":
                  return (mB?.connections_made_count || 0) - (mA?.connections_made_count || 0);
                case "conversion":
                  return (mB?.conversion_rate || 0) - (mA?.conversion_rate || 0);
                case "score":
                default: {
                  const scoreA = (mA?.profile_views_count || 0) + (mA?.leads_generated_count || 0) * 2 + (mA?.connections_made_count || 0) * 3;
                  const scoreB = (mB?.profile_views_count || 0) + (mB?.leads_generated_count || 0) * 2 + (mB?.connections_made_count || 0) * 3;
                  return scoreB - scoreA;
                }
              }
            });

          return <>
            {/* Search & Sort Bar */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar colaborador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" data-no-swipe>
                {SORT_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isActive = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredAndSorted.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Nenhum colaborador encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSorted.map((member, index) => {
                  const employeeMetric = getEmployeeMetrics(member.user_id);
                  return <EmployeePerformanceCard key={member.id} member={member} metrics={employeeMetric ? [employeeMetric] : []} maxValues={maxValues} />;
                })}
              </div>
            )}
          </>;
        })() : <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Não tem permissões para ver dados de performance dos colaboradores.
                </p>
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Convites & Equipa</h3>
              <p className="text-sm text-muted-foreground">Adicionar novos membros e gerir a equipa.</p>
            </div>

            {canManageEmployees && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  onClick={() => setShowInviteDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Gerar Link</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  disabled={!lastGeneratedLink}
                  className="gap-2"
                  title={lastGeneratedLink ? "Copiar link" : "Gere um link primeiro"}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleShareLink}
                  disabled={!lastGeneratedLink}
                  className="gap-2"
                  title={lastGeneratedLink ? "Partilhar link" : "Gere um link primeiro"}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Partilhar</span>
                </Button>
              </div>
            )}
          </div>

          {canManageEmployees && (
            <PendingInvitationsList 
              organizationId={organization.id} 
              onRefresh={onRefresh}
            />
          )}
          
          <DepartmentManagement organizationId={organization.id} />
          
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Membros da Equipa</h3>
            {activeMembers.map(member => {
            const dept = departments.find(d => d.id === member.department_id);
            return <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                          <AvatarImage src={member.profile?.photo_url || ""} />
                          <AvatarFallback>
                            {member.profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{member.profile?.name || 'Nome não disponível'}</h4>
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mt-1 ${
                            member.role === 'owner' ? 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-950/40' :
                            member.role === 'admin' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/40' :
                            member.role === 'manager' ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40' :
                            'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950/40'
                          }`}>
                            {member.role === 'owner' ? 'Proprietário' : member.role === 'admin' ? 'Admin' : member.role === 'manager' ? 'Gestor' : 'Colaborador'}
                          </span>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                            {member.profile?.email}
                            {member.position && <span className="ml-2">• {member.position}</span>}
                            {dept && <span className="ml-2">• {dept.name}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {canManageEmployees && <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)}>
                            <Settings className="h-4 w-4" />
                          </Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </TabsContent>

      </Tabs>

      <Dialog open={showPermissionsInfo} onOpenChange={setShowPermissionsInfo}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Permissões da Equipa
            </DialogTitle>
          </DialogHeader>
          <PermissionsTab />
        </DialogContent>
      </Dialog>

      <GenerateInviteLinkDialog 
        isOpen={showInviteDialog} 
        onClose={() => setShowInviteDialog(false)} 
        onLinkGenerated={(link) => {
          handleLinkGenerated(link);
          onRefresh();
        }}
        organizationId={organization.id}
      />

      {editingMember && <EditMemberDialog open={true} onOpenChange={open => !open && setEditingMember(null)} member={editingMember} departments={departments} organizationId={organization.id} onUpdateRole={updateMemberRole} onUpdateDepartment={updateMemberDepartment} onRemove={removeMember} isOwner={isOwner} />}
    </div>;
};
export default AdvancedEmployeeManagement;