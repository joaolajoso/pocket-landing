import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { usePerformanceMetrics } from "@/hooks/organization/usePerformanceMetrics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronRight, Users, Eye, UserPlus, Link2, TrendingUp, TrendingDown, Minus, Mail, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { OrganizationMember } from "@/hooks/organization/useOrganization";
import GenerateInviteLinkDialog from "@/components/dashboard/tabs/business/GenerateInviteLinkDialog";

const CHECKLIST_STEPS = [
  { key: "org", label: "Criar organização", description: "Registe a sua empresa", path: "/business/settings" },
  { key: "logo", label: "Adicionar logo", description: "Faça upload do logotipo da empresa", path: "/business/settings" },
  { key: "members", label: "Convidar equipa", description: "Adicione pelo menos 1 membro à equipa", path: "/business/team" },
  { key: "public", label: "Publicar página", description: "Configure e publique a página da empresa", path: "/business/public-page" },
  { key: "lead", label: "Capturar lead", description: "Receba o primeiro contacto de um visitante", path: "/business/contacts" },
];

const BusinessHomePage = () => {
  const { organization, members, removeMember, userRole } = useOrganization();
  const { getOrganizationSummaryWithTrends, getEmployeeMetrics, loading: metricsLoading } = usePerformanceMetrics(organization?.id);
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summaryWithTrends, setSummaryWithTrends] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const canManage = userRole === 'owner' || userRole === 'admin';

  useEffect(() => {
    if (organization?.id) {
      getOrganizationSummaryWithTrends().then(setSummaryWithTrends).catch(() => {});
    }
  }, [organization?.id]);

  const completedSteps = [
    !!organization,
    !!organization?.logo_url,
    (members?.length || 0) > 1,
    false,
    (summaryWithTrends?.totalLeads || 0) > 0,
  ];
  const completedCount = completedSteps.filter(Boolean).length;

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    setRemoving(true);
    const result = await removeMember(selectedMember.id);
    setRemoving(false);
    if (result.success) {
      toast({ title: "Membro removido", description: `${selectedMember.profile?.name || 'Membro'} foi removido da organização.` });
      setSelectedMember(null);
      setConfirmRemove(false);
    } else {
      toast({ title: "Erro", description: "Não foi possível remover o membro.", variant: "destructive" });
    }
  };

  const getMemberMetrics = (member: OrganizationMember) => {
    const m = getEmployeeMetrics(member.user_id);
    return {
      views: m?.profile_views_count || 0,
      leads: m?.leads_generated_count || 0,
      connections: m?.connections_made_count || 0,
      clicks: m?.link_clicks_count || 0,
      conversion: m?.conversion_rate || 0,
      engagement: m?.engagement_score || 0,
    };
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Proprietário';
      case 'admin': return 'Admin';
      case 'manager': return 'Gestor';
      default: return 'Colaborador';
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
      case 'admin': return 'bg-red-500/15 text-red-400 border-red-500/20';
      case 'manager': return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
      default: return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Olá, {profile?.name?.split(' ')[0] || 'Business'} 👋
        </h1>
        <p className="text-white/50 text-sm mt-1">{organization?.name}</p>
      </div>

      {/* Get Started Checklist */}
      {completedCount < 5 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Começar com o PocketCV Business</h2>
              <p className="text-xs text-white/40 mt-0.5">Complete estes passos para configurar a sua empresa</p>
            </div>
            <span className="text-xs font-medium text-white/60">{completedCount}/5</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {CHECKLIST_STEPS.map((step, i) => (
              <button
                key={step.key}
                onClick={() => !completedSteps[i] && navigate(step.path)}
                className={cn(
                  "flex items-start gap-2.5 p-3 rounded-xl text-left transition-colors",
                  completedSteps[i]
                    ? "bg-white/5 opacity-60 cursor-default"
                    : "bg-white/5 hover:bg-white/10 cursor-pointer"
                )}
              >
                <div className={cn(
                  "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                  completedSteps[i] ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/30"
                )}>
                  {completedSteps[i] ? <Check className="h-3 w-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-medium", completedSteps[i] ? "text-white/40 line-through" : "text-white")}>{step.label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{step.description}</p>
                </div>
                {!completedSteps[i] && <ChevronRight className="h-3.5 w-3.5 text-white/20 mt-0.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Visualizações"
          value={summaryWithTrends?.totalViews?.toLocaleString() || "0"}
          icon={Eye}
          trend={summaryWithTrends?.viewsTrend}
          trendValue={summaryWithTrends?.viewsTrendValue}
          subtitle={`Média: ${summaryWithTrends?.averageViewsPerEmployee || 0}/colaborador`}
        />
        <StatCard
          title="Membros"
          value={members?.length || 0}
          icon={Users}
          subtitle="Ativos na organização"
        />
        <StatCard
          title="Leads"
          value={summaryWithTrends?.totalLeads?.toLocaleString() || "0"}
          icon={UserPlus}
          trend={summaryWithTrends?.leadsTrend}
          trendValue={summaryWithTrends?.leadsTrendValue}
          subtitle={`Média: ${summaryWithTrends?.averageLeadsPerEmployee || 0}/colaborador`}
        />
        <StatCard
          title="Conexões"
          value={summaryWithTrends?.totalConnections?.toLocaleString() || "0"}
          icon={Link2}
          subtitle="Últimos 7 dias"
        />
      </div>

      {/* Performance Summary */}
      {summaryWithTrends && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-white/60" />
              <h2 className="text-sm font-semibold text-white">Resumo de Performance</h2>
            </div>
            <p className="text-xs text-white/40">Últimos 7 dias vs semana anterior</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-white/50">Média de Visualizações por Colaborador</p>
              <p className="text-2xl font-bold text-white mt-1">{summaryWithTrends.averageViewsPerEmployee}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/50">Média de Leads por Colaborador</p>
              <p className="text-2xl font-bold text-white mt-1">{summaryWithTrends.averageLeadsPerEmployee}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/50">Total de Conexões</p>
              <p className="text-2xl font-bold text-white mt-1">{summaryWithTrends.totalConnections}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/50">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-white mt-1">{summaryWithTrends.conversionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Equipa</h2>
          <button onClick={() => navigate("/business/team")} className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 transition-colors">
            Ver todos <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members?.slice(0, 3).map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex items-center gap-3 text-left hover:bg-white/8 transition-colors w-full"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profile?.photo_url || ""} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary">{member.profile?.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{member.profile?.name || "Sem nome"}</p>
                <p className="text-xs text-white/40 truncate">{member.position || member.role}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />
            </button>
          ))}
          <button onClick={() => setShowInviteDialog(true)} className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 flex items-center justify-center gap-2 text-white/30 hover:text-white/50 hover:border-white/25 transition-all min-h-[68px]">
            <UserPlus className="h-4 w-4" />
            <span className="text-sm">Adicionar membro</span>
          </button>
        </div>
      </div>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => { if (!open) { setSelectedMember(null); setConfirmRemove(false); } }}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-white/10">
          {selectedMember && (() => {
            const metrics = getMemberMetrics(selectedMember);
            const isCurrentUser = selectedMember.user_id === user?.id;
            const isOwnerMember = selectedMember.role === 'owner';
            const canRemoveThis = canManage && !isCurrentUser && !isOwnerMember;

            return (
              <>
                <DialogHeader className="pb-0">
                  <DialogTitle className="sr-only">Detalhes do membro</DialogTitle>
                  <DialogDescription className="sr-only">Informações e métricas do membro da equipa</DialogDescription>
                </DialogHeader>

                {/* Profile Header */}
                <div className="flex flex-col items-center text-center pt-2 pb-4">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={selectedMember.profile?.photo_url || ""} />
                    <AvatarFallback className="text-lg bg-primary/20 text-primary">
                      {selectedMember.profile?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-base font-semibold text-white">{selectedMember.profile?.name || "Sem nome"}</h3>
                  {selectedMember.position && (
                    <p className="text-xs text-white/40 mt-0.5">{selectedMember.position}</p>
                  )}
                  <span className={cn(
                    "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border mt-2",
                    getRoleBadgeClass(selectedMember.role)
                  )}>
                    {getRoleLabel(selectedMember.role)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pb-3">
                  {selectedMember.profile?.email && (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                      <Mail className="h-4 w-4 text-white/30 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-white/30">Email</p>
                        <p className="text-xs text-white/70 truncate">{selectedMember.profile.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedMember.profile?.slug && (
                    <a
                      href={`/${selectedMember.profile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-white/30 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-white/30">Perfil público</p>
                        <p className="text-xs text-primary/70 truncate">pocketcv.pt/{selectedMember.profile.slug}</p>
                      </div>
                    </a>
                  )}
                  {selectedMember.joined_at && (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                      <Users className="h-4 w-4 text-white/30 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-white/30">Membro desde</p>
                        <p className="text-xs text-white/70">{new Date(selectedMember.joined_at).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2.5 px-1">Performance</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Views", value: metrics.views, icon: Eye },
                      { label: "Leads", value: metrics.leads, icon: UserPlus },
                      { label: "Conexões", value: metrics.connections, icon: Link2 },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                        <Icon className="h-3.5 w-3.5 mx-auto text-white/25 mb-1" />
                        <p className="text-lg font-bold text-white tabular-nums">{value}</p>
                        <p className="text-[10px] text-white/30">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <p className="text-sm font-bold text-white tabular-nums">{metrics.clicks}</p>
                      <p className="text-[10px] text-white/30">Cliques em links</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <p className="text-sm font-bold text-white tabular-nums">{metrics.conversion}%</p>
                      <p className="text-[10px] text-white/30">Taxa conversão</p>
                    </div>
                  </div>
                </div>

                {/* Remove Member */}
                {canRemoveThis && (
                  <div className="border-t border-white/5 pt-3">
                    {!confirmRemove ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmRemove(true)}
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Remover da organização
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-center text-red-400/70">
                          Tem a certeza? Esta ação não pode ser revertida.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmRemove(false)}
                            className="flex-1 text-xs text-white/50"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveMember}
                            disabled={removing}
                            className="flex-1 text-xs"
                          >
                            {removing ? 'Removendo...' : 'Confirmar'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {organization && (
        <GenerateInviteLinkDialog
          isOpen={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          organizationId={organization.id}
          onLinkGenerated={() => {}}
        />
      )}
    </div>
  );
};
export default BusinessHomePage;
