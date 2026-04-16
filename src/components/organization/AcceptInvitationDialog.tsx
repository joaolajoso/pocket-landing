
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Building2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmployeePermissions } from "@/hooks/organization/useEmployeePermissions";

interface AcceptInvitationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invitationToken: string;
  organizationName: string;
  role: string;
  permissionsRequested: string[];
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
};

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'profile_views': 'A organização pode ver quantas pessoas visitaram o seu perfil',
  'view_profile': 'A organização poderá ver informações do seu perfil',
  'link_clicks': 'A organização pode ver estatísticas de cliques nos seus links',
  'leads': 'A organização pode aceder aos leads que você gerou',
  'connections': 'A organização pode ver as conexões de rede que estabeleceu',
  'view_connections': 'A organização poderá ver a sua rede de contactos',
  'contact_info': 'A organização pode aceder às suas informações de contacto',
  'analytics': 'A organização pode ver análises detalhadas da sua atividade',
  'view_analytics': 'A organização poderá ver as suas estatísticas de desempenho',
  'performance_metrics': 'A organização pode ver todas as suas métricas de desempenho',
};

const AcceptInvitationDialog = ({
  isOpen,
  onClose,
  invitationToken,
  organizationName,
  role,
  permissionsRequested
}: AcceptInvitationDialogProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(permissionsRequested);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { acceptInvitation } = useEmployeePermissions();

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const result = await acceptInvitation(invitationToken, selectedPermissions);
      
      if (result.success) {
        toast({
          title: "Convite Aceite",
          description: `Bem-vindo à ${organizationName}! Você foi adicionado como ${role}.`
        });
        onClose();
        // Refresh the page to update the user's organization status
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erro ao Aceitar Convite",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div>
              <DialogTitle>Convite para se Juntar à Organização</DialogTitle>
              <DialogDescription>
                Você foi convidado para se juntar à <strong>{organizationName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Detalhes do Convite</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Organização:</strong> {organizationName}</p>
              <p><strong>Função:</strong> <Badge variant="outline">{role}</Badge></p>
            </div>
          </div>

          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Controlo de Privacidade</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Pode escolher exactamente que dados partilhar com a organização. 
                  Pode alterar estas permissões a qualquer momento.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Permissões de Dados Solicitadas</h4>
            <p className="text-sm text-muted-foreground">
              Selecione os dados que aceita partilhar com {organizationName}:
            </p>
            
            <div className="space-y-3">
              {permissionsRequested.map((permission) => (
                <div key={permission} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={permission} className="font-medium cursor-pointer">
                      {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> Ao aceitar este convite, você será adicionado à organização 
              com as permissões selecionadas. Pode gerir as suas permissões de dados 
              a qualquer momento através das configurações da conta.
            </p>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Recusar Convite
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={loading || selectedPermissions.length === 0}
          >
            {loading ? "A processar..." : "Aceitar Convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcceptInvitationDialog;
