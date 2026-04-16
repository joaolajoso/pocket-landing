import { useState } from "react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/hooks/organization/useDepartments";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, Crown, Pencil, Check, X, Upload, Trash2,
  Link2, Copy, Share2, LogOut, AlertTriangle, CreditCard, Calendar,
  Globe, Mail, Briefcase, Hash
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import GenerateInviteLinkDialog from "@/components/dashboard/tabs/business/GenerateInviteLinkDialog";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
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

const SIZE_LABELS: Record<string, string> = {
  startup: "Startup (1-10)",
  small: "Pequena (11-50)",
  medium: "Média (51-200)",
  large: "Grande (201-500)",
  enterprise: "Enterprise (500+)",
};

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  startup: { name: "XS", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  small: { name: "S", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  medium: { name: "M", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  large: { name: "L", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  enterprise: { name: "XL", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
};

const BusinessSettingsPage = () => {
  const { organization, members, userRole, updateOrganizationName, leaveOrganization, refetch } = useOrganization();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { departments } = useDepartments(organization?.id || "");

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin" || isOwner;

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  const planInfo = PLAN_LABELS[organization?.size_category || "startup"] || PLAN_LABELS.startup;

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const result = await updateOrganizationName(newName.trim());
    setSaving(false);
    if (result.success) {
      toast({ title: "Nome atualizado" });
      setEditingName(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${organization.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("organization_logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("organization_logos")
        .getPublicUrl(filePath);

      const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("organizations")
        .update({ logo_url: logoUrl })
        .eq("id", organization.id);

      if (updateError) throw updateError;

      await refetch();
      toast({ title: "Logo atualizado" });
    } catch (err) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!organization) return;
    try {
      await supabase
        .from("organizations")
        .update({ logo_url: null })
        .eq("id", organization.id);
      await refetch();
      toast({ title: "Logo removido" });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleLeave = async () => {
    const result = await leaveOrganization();
    if (result.success) {
      toast({ title: "Saiu da organização" });
      navigate("/dashboard");
    }
  };

  if (!organization) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-xl font-bold text-white">Definições</h1>
          <p className="text-white/50 text-sm mt-1">Nenhuma organização encontrada</p>
        </div>
      </div>
    );
  }

  const orgInitials = organization.name?.substring(0, 2).toUpperCase() || "ORG";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Definições</h1>
        <p className="text-white/50 text-sm mt-1">Configurações da empresa</p>
      </div>

      {/* Company Profile Section */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-5">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Perfil da Empresa
        </h2>

        {/* Logo + Name */}
        <div className="flex items-start gap-4">
          <div className="relative group">
            <Avatar className="h-16 w-16 rounded-xl border border-white/10">
              <AvatarImage src={organization.logo_url || ""} alt={organization.name} />
              <AvatarFallback className="rounded-xl text-sm bg-white/10 text-white">{orgInitials}</AvatarFallback>
            </Avatar>
            {isAdmin && (
              <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <label className="cursor-pointer p-1 hover:bg-white/20 rounded">
                  <Upload className="h-3.5 w-3.5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
                {organization.logo_url && (
                  <button onClick={handleRemoveLogo} className="p-1 hover:bg-white/20 rounded">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 bg-white/10 border-white/20 text-white text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400" onClick={handleSaveName} disabled={saving}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50" onClick={() => setEditingName(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white truncate">{organization.name}</h3>
                {isAdmin && (
                  <button
                    onClick={() => { setNewName(organization.name); setEditingName(true); }}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-white/40">
              Criada em {format(new Date(organization.created_at), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem icon={Briefcase} label="Indústria" value={organization.industry || "Não definida"} />
          <InfoItem icon={Hash} label="Dimensão" value={SIZE_LABELS[organization.size_category || "startup"] || "Startup"} />
          <InfoItem icon={Globe} label="Website" value={organization.website || "Não definido"} isLink={!!organization.website} />
          <InfoItem icon={Mail} label="Criador" value={members.find(m => m.role === 'owner')?.profile?.email || "—"} />
        </div>
      </section>

      {/* Plan & Billing */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Plano & Faturação
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={cn("text-xs border px-3 py-1", planInfo.color)}>
              Business {planInfo.name}
            </Badge>
            <span className="text-xs text-white/40">
              Baseado na dimensão da empresa
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:text-white bg-transparent hover:bg-white/10"
            onClick={() => navigate("/pricing")}
          >
            Ver Planos
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Membros ativos" value={activeMembers.length} />
          <MiniStat label="Pendentes" value={pendingMembers.length} />
          <MiniStat label="Departamentos" value={departments.length} />
          <MiniStat label="Funções" value={[...new Set(activeMembers.map(m => m.role))].length} />
        </div>
      </section>

      {/* Team Management Quick Access */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <Users className="h-4 w-4" />
          Equipa
        </h2>

        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button
              onClick={() => setShowInviteDialog(true)}
              className="gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              variant="outline"
              size="sm"
            >
              <Link2 className="h-4 w-4" />
              Gerar Link de Convite
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:text-white bg-transparent hover:bg-white/10"
            onClick={() => navigate("/business/team")}
          >
            <Users className="h-4 w-4 mr-2" />
            Gerir Equipa
          </Button>
        </div>

        {/* Member roles summary */}
        <div className="flex flex-wrap gap-2">
          {["owner", "admin", "manager", "employee"].map((role) => {
            const count = activeMembers.filter((m) => m.role === role).length;
            if (count === 0) return null;
            return (
              <div key={role} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                {role === "owner" && <Crown className="h-3 w-3 text-amber-400" />}
                <span className="text-xs text-white/60 capitalize">{role === "owner" ? "Dono" : role === "admin" ? "Admin" : role === "manager" ? "Gestor" : "Colaborador"}</span>
                <span className="text-xs font-semibold text-white">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Quick member list */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {activeMembers.slice(0, 5).map((member) => (
            <div key={member.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={member.profile?.photo_url || ""} />
                <AvatarFallback className="text-[10px] bg-white/10 text-white">
                  {member.profile?.name?.substring(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{member.profile?.name || "Sem nome"}</p>
                <p className="text-[10px] text-white/40 truncate">{member.profile?.email || ""}</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/50 capitalize">
                {member.role}
              </Badge>
            </div>
          ))}
          {activeMembers.length > 5 && (
            <button
              onClick={() => navigate("/business/team")}
              className="w-full text-center text-xs text-primary hover:underline py-1"
            >
              Ver todos ({activeMembers.length})
            </button>
          )}
        </div>
      </section>

      {/* Your Role */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <Crown className="h-4 w-4" />
          O Seu Papel
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize border-white/20 text-white">
              {userRole === "owner" ? "Dono" : userRole === "admin" ? "Administrador" : userRole === "manager" ? "Gestor" : "Colaborador"}
            </Badge>
            <span className="text-xs text-white/40">
              {isOwner ? "Tem permissões totais sobre a organização" : isAdmin ? "Pode gerir membros e configurações" : "Acesso limitado"}
            </span>
          </div>
        </div>

        {!isOwner && (
          <>
            <Separator className="bg-white/10" />
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
              onClick={() => setShowLeaveDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Organização
            </Button>
          </>
        )}
      </section>

      {/* Invite Dialog */}
      <GenerateInviteLinkDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        organizationId={organization.id}
        onLinkGenerated={() => {
          refetch();
        }}
      />

      {/* Leave Confirmation */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Sair da Organização
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair de <strong>{organization.name}</strong>? Perderá acesso a todos os dados e funcionalidades da empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Helper components
const InfoItem = ({ icon: Icon, label, value, isLink }: { icon: any; label: string; value: string; isLink?: boolean }) => (
  <div className="flex items-start gap-2.5">
    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
      <Icon className="h-3.5 w-3.5 text-white/40" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
          {value}
        </a>
      ) : (
        <p className="text-sm text-white truncate">{value}</p>
      )}
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
  </div>
);

export default BusinessSettingsPage;
