import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AcceptInvitationDialog from "@/components/organization/AcceptInvitationDialog";
import { Loader2, Building2, ArrowRight, Mail, LogOut, Calendar, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/contexts/dashboard";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PendingInvitation {
  id: string;
  invitation_token: string;
  organization_id: string;
  organization_name: string;
  role: string;
  permissions_requested: string[];
}

interface OrgMembership {
  id: string;
  organization_id: string;
  org_name: string;
  org_logo: string | null;
  role: string;
  status: string;
  joined_at: string;
  updated_at: string;
  department: string | null;
  position: string | null;
  permissions: { type: string; granted: boolean }[];
}

const PERMISSION_LABELS: Record<string, string> = {
  'profile_views': 'Visualizações do Perfil',
  'view_profile': 'Ver Perfil Completo',
  'link_clicks': 'Cliques em Links',
  'leads': 'Leads Gerados',
  'connections': 'Conexões de Rede',
  'view_connections': 'Ver Conexões',
  'contact_info': 'Informações de Contacto',
  'analytics': 'Analytics Completo',
  'view_analytics': 'Ver Analytics',
  'performance_metrics': 'Métricas de Performance',
  'view_company_metrics': 'Ver Métricas da Empresa',
  'view_employee_metrics': 'Ver Métricas de Colaboradores',
  'manage_employees': 'Gerir Colaboradores',
  'edit_company_website': 'Editar Website da Empresa',
  'manage_departments': 'Gerir Departamentos',
};

const ROLE_LABELS: Record<string, string> = {
  'owner': 'Proprietário',
  'admin': 'Administrador',
  'manager': 'Gestor',
  'employee': 'Funcionário',
};

const OrganizationsTab = () => {
  const { toast } = useToast();
  const { setActiveTab } = useDashboard();
  const { leaveOrganization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [selectedInvite, setSelectedInvite] = useState<PendingInvitation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leavingOrg, setLeavingOrg] = useState(false);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile?.email) return;

        // Fetch all memberships with org info and permissions
        const { data: members, error: membersError } = await supabase
          .from('organization_members')
          .select(`
            id, organization_id, role, status, joined_at, updated_at, department, position,
            organizations(name, logo_url),
            employee_data_permissions(permission_type, granted)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (membersError) {
          console.error('Error fetching memberships:', membersError);
        } else {
          const formatted: OrgMembership[] = (members || []).map((m: any) => ({
            id: m.id,
            organization_id: m.organization_id,
            org_name: m.organizations?.name || 'Organização',
            org_logo: m.organizations?.logo_url || null,
            role: m.role,
            status: m.status,
            joined_at: m.joined_at || m.created_at,
            updated_at: m.updated_at,
            department: m.department,
            position: m.position,
            permissions: (m.employee_data_permissions || []).map((p: any) => ({
              type: p.permission_type,
              granted: p.granted,
            })),
          }));
          setMemberships(formatted);
        }

        // Pending invitations
        const { data: invites, error: invitesError } = await supabase
          .from('organization_invitations')
          .select(`id, invitation_token, organization_id, role, permissions_requested, organizations(name)`)
          .eq('email', profile.email)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString());

        if (invitesError) {
          console.error('Error fetching invitations:', invitesError);
        } else {
          setPendingInvites((invites || []).map((inv: any) => ({
            id: inv.id,
            invitation_token: inv.invitation_token,
            organization_id: inv.organization_id,
            organization_name: inv.organizations?.name || 'Organização',
            role: inv.role,
            permissions_requested: inv.permissions_requested || [],
          })));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const openAccept = (inv: PendingInvitation) => {
    setSelectedInvite(inv);
    setDialogOpen(true);
  };

  const onDialogClose = () => {
    setDialogOpen(false);
    setSelectedInvite(null);
  };

  const handleLeaveOrganization = async () => {
    setLeavingOrg(true);
    try {
      const result = await leaveOrganization();
      if (result.success) {
        setMemberships(prev => prev.map(m => 
          m.status === 'active' ? { ...m, status: 'inactive', updated_at: new Date().toISOString() } : m
        ));
        toast({ title: "Saiu da organização", description: "Você saiu da organização com sucesso." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Erro", description: error instanceof Error ? error.message : "Erro ao sair da organização", variant: "destructive" });
    } finally {
      setLeavingOrg(false);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase.from('organization_invitations').delete().eq('id', inviteId);
      if (error) throw error;
      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
      toast({ title: "Convite recusado", description: "O convite foi recusado com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Erro ao recusar convite", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: pt });
    } catch {
      return dateStr;
    }
  };

  const activeMemberships = memberships.filter(m => m.status === 'active');
  const pastMemberships = memberships.filter(m => m.status !== 'active');

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> A carregar organizações...
      </div>
    );
  }

  const renderMembershipCard = (m: OrgMembership, isActive: boolean) => {
    const isExpanded = expandedOrg === m.id;
    const grantedPermissions = m.permissions.filter(p => p.granted);

    return (
      <div key={m.id} className="rounded-xl border bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {m.org_logo ? (
                <img src={m.org_logo} alt={m.org_name} className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{m.org_name}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant={isActive ? "secondary" : "outline"} className={!isActive ? "opacity-60" : ""}>
                  {ROLE_LABELS[m.role] || m.role}
                </Badge>
                {!isActive && (
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedOrg(isExpanded ? null : m.id)}
              className="gap-1.5 text-muted-foreground"
            >
              Detalhes
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {isActive && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setActiveTab('business')}
                >
                  Ir para Business
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {m.role !== 'owner' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        disabled={leavingOrg}
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sair da Organização?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem a certeza que deseja sair de {m.org_name}? Perderá acesso a todos os recursos e dados da organização.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLeaveOrganization}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Sair da Organização
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
            {/* Dates */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Entrou: <span className="text-foreground font-medium">{formatDate(m.joined_at)}</span></span>
              </div>
              {!isActive && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Saiu: <span className="text-foreground font-medium">{formatDate(m.updated_at)}</span></span>
                </div>
              )}
            </div>

            {/* Position / Department */}
            {(m.position || m.department) && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {m.position && <span className="text-muted-foreground">Cargo: <span className="text-foreground font-medium">{m.position}</span></span>}
                {m.department && <span className="text-muted-foreground">Departamento: <span className="text-foreground font-medium">{m.department}</span></span>}
              </div>
            )}

            {/* Shared permissions */}
            {grantedPermissions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-primary" />
                  Dados partilhados com a organização
                </div>
                <div className="flex flex-wrap gap-2">
                  {grantedPermissions.map((p) => (
                    <Badge key={p.type} variant="secondary" className="text-xs font-normal">
                      {PERMISSION_LABELS[p.type] || p.type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {m.permissions.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem permissões de dados registadas.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Organizations */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {activeMemberships.length > 1 ? 'Organizações Ativas' : 'Organização Atual'}
              </CardTitle>
              <CardDescription className="text-sm">
                {activeMemberships.length > 1 ? 'Empresas onde está atualmente ativo' : 'Sua empresa ativa e função'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeMemberships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium mb-1">Nenhuma organização vinculada</p>
              <p className="text-xs text-muted-foreground">
                Ainda não faz parte de nenhuma empresa na PocketCV
              </p>
            </div>
          ) : (
            activeMemberships.map(m => renderMembershipCard(m, true))
          )}
        </CardContent>
      </Card>

      {/* Past Organizations */}
      {pastMemberships.length > 0 && (
        <Card className="border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Organizações Anteriores</CardTitle>
                <CardDescription className="text-sm">Empresas onde esteve anteriormente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastMemberships.map(m => renderMembershipCard(m, false))}
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">Convites Pendentes</CardTitle>
                {pendingInvites.length > 0 && (
                  <Badge variant="default" className="rounded-full">
                    {pendingInvites.length}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">Aceite convites enviados ao seu email</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingInvites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium mb-1">Nenhum convite pendente</p>
              <p className="text-xs text-muted-foreground">
                Quando você receber convites de empresas, eles aparecerão aqui
              </p>
            </div>
          ) : (
            pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{inv.organization_name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Função: <span className="font-medium text-foreground">
                        {ROLE_LABELS[inv.role] || inv.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDeclineInvite(inv.id)}>
                    Recusar
                  </Button>
                  <Button size="sm" onClick={() => openAccept(inv)} className="shadow-sm">
                    Aceitar Convite
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selectedInvite && (
        <AcceptInvitationDialog
          isOpen={dialogOpen}
          onClose={onDialogClose}
          invitationToken={selectedInvite.invitation_token}
          organizationName={selectedInvite.organization_name}
          role={selectedInvite.role}
          permissionsRequested={selectedInvite.permissions_requested}
        />
      )}
    </div>
  );
};

export default OrganizationsTab;
