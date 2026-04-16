import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Copy, Check, Share2, Loader2 } from "lucide-react";
import { useInviteLink } from "@/hooks/organization/useInviteLink";
import { useDepartments } from "@/hooks/organization/useDepartments";
import { useToast } from "@/hooks/use-toast";

interface GenerateInviteLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onLinkGenerated?: (link: string) => void;
}

const PERMISSION_OPTIONS = [
  { id: 'view_profile', label: 'Ver Perfil Completo', description: 'Permite à organização ver informações do perfil' },
  { id: 'view_connections', label: 'Ver Conexões', description: 'Permite ver a rede de conexões' },
  { id: 'view_analytics', label: 'Ver Analytics', description: 'Permite ver estatísticas de desempenho' },
  { id: 'contact_info', label: 'Informações de Contacto', description: 'Permite acesso a email e telefone' },
];

const GenerateInviteLinkDialog = ({
  isOpen,
  onClose,
  organizationId,
  onLinkGenerated
}: GenerateInviteLinkDialogProps) => {
  const { toast } = useToast();
  const { generateInviteLink, buildInviteUrl, loading } = useInviteLink();
  const { departments } = useDepartments(organizationId);

  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['view_profile', 'view_analytics']);
  
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(p => p !== permissionId)
    );
  };

  const handleGenerate = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    const result = await generateInviteLink({
      organizationId,
      role,
      department: department === 'none' ? undefined : department || undefined,
      position: position || undefined,
      permissionsRequested: selectedPermissions,
      email: email.trim() || undefined
    });

    if (result.success && result.token) {
      const url = buildInviteUrl(result.token);
      setGeneratedLink(url);
      onLinkGenerated?.(url);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!generatedLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite PocketCV',
          text: 'Junte-se à nossa organização no PocketCV!',
          url: generatedLink,
        });
      } catch (err) {
        // User cancelled or error
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    setRole('employee');
    setDepartment('');
    setPosition('');
    setEmail('');
    setSelectedPermissions(['view_profile', 'view_analytics']);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Gerar Link de Convite
          </DialogTitle>
          <DialogDescription>
            {generatedLink 
              ? "Partilhe este link com o novo membro da equipa."
              : "Configure as opções do convite e gere um link partilhável."
            }
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4 py-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Função na Organização</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            {departments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="department">Departamento (opcional)</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Cargo (opcional)</Label>
              <Input
                id="position"
                placeholder="Ex: Developer, Designer, Manager"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            {/* Email (optional) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email do convidado (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: colaborador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se preenchido, o convite será associado a este email.
              </p>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>Permissões Solicitadas</Label>
              <p className="text-xs text-muted-foreground">
                O funcionário poderá escolher quais permissões aceitar ao entrar.
              </p>
              <div className="space-y-3">
                {PERMISSION_OPTIONS.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission.id, !!checked)
                      }
                    />
                    <div className="grid gap-0.5 leading-none">
                      <Label
                        htmlFor={permission.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {/* Generated Link Display */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Link gerado com sucesso!
              </div>
              <div className="bg-background rounded border p-3">
                <p className="text-xs text-muted-foreground break-all font-mono">
                  {generatedLink}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button type="button" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partilhar
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Este link expira em 7 dias.
            </p>
          </div>
        )}

        <DialogFooter>
          {!generatedLink ? (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleGenerate} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gerar Link
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={handleClose} className="w-full">
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateInviteLinkDialog;
