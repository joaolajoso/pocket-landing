import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link2, Trash2, RefreshCw, Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useInviteLink } from "@/hooks/organization/useInviteLink";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PendingInvitation {
  id: string;
  invitation_token: string;
  role: string;
  department: string | null;
  position: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  permissions_requested: string[] | null;
}

interface PendingInvitationsListProps {
  organizationId: string;
  onRefresh?: () => void;
}

type InvitationStatus = 'active' | 'expired' | 'used';

const getInvitationStatus = (invitation: PendingInvitation): InvitationStatus => {
  if (invitation.accepted_at) return 'used';
  if (new Date(invitation.expires_at) < new Date()) return 'expired';
  return 'active';
};

const getStatusBadge = (status: InvitationStatus) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ativo</Badge>;
    case 'expired':
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Expirado</Badge>;
    case 'used':
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Usado</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return <Badge variant="outline" className="border-red-500/30 text-red-600">Admin</Badge>;
    case 'manager':
      return <Badge variant="outline" className="border-amber-500/30 text-amber-600">Gestor</Badge>;
    default:
      return <Badge variant="outline">Funcionário</Badge>;
  }
};

const PendingInvitationsList = ({ organizationId, onRefresh }: PendingInvitationsListProps) => {
  const { toast } = useToast();
  const { generateInviteLink, buildInviteUrl } = useInviteLink();
  
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<PendingInvitation | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convites.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchInvitations();
    }
  }, [organizationId]);

  const handleCopyLink = async (token: string, invitationId: string) => {
    try {
      const url = buildInviteUrl(token);
      await navigator.clipboard.writeText(url);
      setCopiedId(invitationId);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = async () => {
    if (!invitationToDelete) return;

    try {
      setRevoking(invitationToDelete.id);
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationToDelete.id);

      if (error) throw error;

      toast({
        title: "Convite revogado",
        description: "O link de convite foi removido com sucesso.",
      });

      fetchInvitations();
      onRefresh?.();
    } catch (err) {
      console.error('Error revoking invitation:', err);
      toast({
        title: "Erro",
        description: "Não foi possível revogar o convite.",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  const handleRegenerate = async (invitation: PendingInvitation) => {
    try {
      setRegenerating(invitation.id);

      // Delete old invitation
      await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitation.id);

      // Generate new one with same settings
      const result = await generateInviteLink({
        organizationId,
        role: invitation.role,
        department: invitation.department || undefined,
        position: invitation.position || undefined,
        permissionsRequested: invitation.permissions_requested || []
      });

      if (result.success && result.token) {
        const url = buildInviteUrl(result.token);
        await navigator.clipboard.writeText(url);
        
        toast({
          title: "Link regenerado!",
          description: "Um novo link foi criado e copiado para a área de transferência.",
        });

        fetchInvitations();
        onRefresh?.();
      }
    } catch (err) {
      console.error('Error regenerating invitation:', err);
      toast({
        title: "Erro",
        description: "Não foi possível regenerar o convite.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(null);
    }
  };

  const openDeleteDialog = (invitation: PendingInvitation) => {
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Convites Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Links de convite gerados para novos membros
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInvitations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum convite gerado ainda.</p>
              <p className="text-sm">Gere um link de convite para adicionar novos membros.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Função</TableHead>
                    <TableHead className="hidden md:table-cell">Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Criado</TableHead>
                    <TableHead className="hidden md:table-cell">Expira</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => {
                    const status = getInvitationStatus(invitation);
                    const isActive = status === 'active';

                    return (
                      <TableRow key={invitation.id}>
                        <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invitation.position || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {format(new Date(invitation.created_at), "d MMM", { locale: pt })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {format(new Date(invitation.expires_at), "d MMM", { locale: pt })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isActive && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyLink(invitation.invitation_token, invitation.id)}
                                title="Copiar link"
                              >
                                {copiedId === invitation.id ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {(status === 'expired') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRegenerate(invitation)}
                                disabled={regenerating === invitation.id}
                                title="Regenerar link"
                              >
                                {regenerating === invitation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(invitation)}
                              disabled={revoking === invitation.id}
                              title="Revogar convite"
                              className="text-destructive hover:text-destructive"
                            >
                              {revoking === invitation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar convite?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O link deixará de funcionar e qualquer pessoa que o tenha não poderá usá-lo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PendingInvitationsList;
