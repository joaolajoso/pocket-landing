import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Search, Download, UserPlus, Mail, Phone, QrCode, CreditCard,
  CalendarCheck, Sparkles, Settings2, Clock, AlertTriangle,
  CheckCircle2, Calendar, ChevronDown, ChevronUp, Bell, BellOff,
  CalendarDays, X
} from "lucide-react";
import BusinessQRCodeDialog from "@/components/business-dashboard/BusinessQRCodeDialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInDays, format, addDays, isToday, isPast, isTomorrow } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { useFollowUpSettings } from "@/hooks/organization/useFollowUpSettings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useRolePermissions } from "@/hooks/organization/useRolePermissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FollowUpStatus = "overdue" | "today" | "tomorrow" | "upcoming" | "done" | "none";

const getFollowUpStatus = (followUpDate: string | null): FollowUpStatus => {
  if (!followUpDate) return "none";
  const date = new Date(followUpDate);
  if (isPast(date) && !isToday(date)) return "overdue";
  if (isToday(date)) return "today";
  if (isTomorrow(date)) return "tomorrow";
  return "upcoming";
};

const getStatusConfig = (status: FollowUpStatus) => {
  switch (status) {
    case "overdue":
      return { label: "Atrasado", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", badgeColor: "border-red-500/30 text-red-400" };
    case "today":
      return { label: "Hoje", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", badgeColor: "border-amber-500/30 text-amber-400" };
    case "tomorrow":
      return { label: "Amanhã", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", badgeColor: "border-yellow-500/30 text-yellow-400" };
    case "upcoming":
      return { label: "Agendado", icon: CalendarCheck, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", badgeColor: "border-blue-500/30 text-blue-400" };
    default:
      return { label: "Sem data", icon: Calendar, color: "text-white/30", bg: "bg-white/5 border-white/10", badgeColor: "border-white/10 text-white/30" };
  }
};

const BusinessContactsPage = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { isOwner, isAdmin: isAdminRole } = useRolePermissions();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuide, setShowGuide] = useState(() => {
    return sessionStorage.getItem("pocketcv_leads_guide_dismissed") !== "true";
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FollowUpStatus | "all">("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showManualLeadForm, setShowManualLeadForm] = useState(false);
  const [manualLead, setManualLead] = useState({ name: "", email: "", phone: "", message: "" });
  const [savingLead, setSavingLead] = useState(false);

  const isAdmin = isOwner || isAdminRole;

  const { settings, defaultDays, emailEnabled, webappEnabled, reminderDaysBefore, upsertSettings } = useFollowUpSettings(organization?.id);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["business-contacts", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id,
  });

  // Fetch organization website for QR code
  const { data: orgWebsite } = useQuery({
    queryKey: ["org-website-qr", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const { data } = await supabase
        .from("organization_websites")
        .select("subdomain, company_name, logo_url, slogan, primary_color")
        .eq("organization_id", organization.id)
        .maybeSingle();
      return data;
    },
    enabled: !!organization?.id,
  });

  const companyPageUrl = orgWebsite?.subdomain
    ? `${window.location.origin}/company/${orgWebsite.subdomain}`
    : null;

  // Fetch events where org participated (for event filter)
  const { data: orgEvents = [] } = useQuery({
    queryKey: ["business-lead-events", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      // Get org member user IDs
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organization.id)
        .eq("status", "active");
      const memberIds = members?.map((m) => m.user_id) || [];
      if (!memberIds.length) return [];

      // Get lead_capture metrics for these members to find event associations
      const { data: metrics } = await supabase
        .from("event_participant_metrics")
        .select("event_id, metadata, participant_id")
        .eq("metric_type", "lead_capture")
        .in("participant_id", memberIds);

      if (!metrics?.length) return [];

      // Get unique event IDs that have leads
      const eventIds = [...new Set(metrics.map((m) => m.event_id))];

      const { data: events } = await supabase
        .from("events")
        .select("id, title")
        .in("id", eventIds)
        .order("event_date", { ascending: false });

      return events || [];
    },
    enabled: !!organization?.id,
  });

  // Build a map of contact emails to event titles (for filtering and display)
  const { data: eventLeadMap = {} } = useQuery({
    queryKey: ["business-lead-event-map", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return {};
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organization.id)
        .eq("status", "active");
      const memberIds = members?.map((m) => m.user_id) || [];
      if (!memberIds.length) return {};

      const { data: metrics } = await supabase
        .from("event_participant_metrics")
        .select("event_id, metadata")
        .eq("metric_type", "lead_capture")
        .in("participant_id", memberIds);

      if (!metrics?.length) return {};

      // Get event titles
      const eventIds = [...new Set(metrics.map((m) => m.event_id))];
      const { data: events } = await supabase
        .from("events")
        .select("id, title")
        .in("id", eventIds);

      const eventTitleMap: Record<string, string> = {};
      events?.forEach((e) => { eventTitleMap[e.id] = e.title; });

      // Map: email -> { eventId, eventTitle }
      const result: Record<string, { eventId: string; eventTitle: string }> = {};
      metrics.forEach((m: any) => {
        const email = (m.metadata as any)?.contact_email;
        if (email) {
          result[email.toLowerCase()] = {
            eventId: m.event_id,
            eventTitle: eventTitleMap[m.event_id] || "Evento",
          };
        }
      });

      return result;
    },
    enabled: !!organization?.id,
  });

  const updateFollowUpDate = useMutation({
    mutationFn: async ({ contactId, date }: { contactId: string; date: Date | null }) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ follow_up_date: date ? date.toISOString().split("T")[0] : null })
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-contacts", organization?.id] });
      toast.success("Data de follow-up atualizada");
    },
  });

  // Stats
  const stats = useMemo(() => {
    const overdue = contacts.filter((c: any) => getFollowUpStatus(c.follow_up_date) === "overdue").length;
    const today = contacts.filter((c: any) => getFollowUpStatus(c.follow_up_date) === "today").length;
    const upcoming = contacts.filter((c: any) => ["tomorrow", "upcoming"].includes(getFollowUpStatus(c.follow_up_date))).length;
    return { overdue, today, upcoming };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let list = contacts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") {
      list = list.filter((c: any) => {
        const s = getFollowUpStatus(c.follow_up_date);
        if (filterStatus === "upcoming") return s === "upcoming" || s === "tomorrow";
        return s === filterStatus;
      });
    }
    // Event filter
    if (filterEvent !== "all") {
      list = list.filter((c: any) => {
        const emailKey = c.email?.toLowerCase();
        const eventInfo = emailKey ? (eventLeadMap as Record<string, any>)[emailKey] : null;
        if (filterEvent === "no-event") return !eventInfo;
        return eventInfo?.eventId === filterEvent;
      });
    }
    // Sort: overdue first, then today, then tomorrow, then upcoming, then none
    const priority: Record<FollowUpStatus, number> = { overdue: 0, today: 1, tomorrow: 2, upcoming: 3, none: 4, done: 5 };
    list = [...list].sort((a: any, b: any) => {
      const sa = getFollowUpStatus(a.follow_up_date);
      const sb = getFollowUpStatus(b.follow_up_date);
      return priority[sa] - priority[sb];
    });
    return list;
  }, [contacts, searchQuery, filterStatus, filterEvent, eventLeadMap]);

  const handleExport = () => {
    const csv = [
      ["Nome", "Email", "Telefone", "Descrição", "Follow-up", "Data"].join(","),
      ...filteredContacts.map((c: any) =>
        [c.name, c.email, c.phone || "", c.description || "", c.follow_up_date || "", c.created_at].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  const handleSaveManualLead = async () => {
    if (!manualLead.name.trim() || !manualLead.email.trim()) {
      toast.error("Nome e email são obrigatórios");
      return;
    }
    if (!user?.id || !organization?.id) return;
    setSavingLead(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: manualLead.name.trim(),
        email: manualLead.email.trim(),
        phone: manualLead.phone.trim() || null,
        message: manualLead.message.trim() || null,
        profile_owner_id: user.id,
        organization_id: organization.id,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["business-contacts", organization.id] });
      toast.success("Lead adicionado com sucesso");
      setManualLead({ name: "", email: "", phone: "", message: "" });
      setShowManualLeadForm(false);
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err.message || ""));
    } finally {
      setSavingLead(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Leads</h1>
          <p className="text-white/50 text-sm mt-1">{contacts.length} lead{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualLeadForm(!showManualLeadForm)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              showManualLeadForm ? "bg-primary/20 text-primary" : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                showSettings ? "bg-primary/20 text-primary" : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Configurações</span>
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 text-xs font-medium transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Manual Lead Form */}
      {showManualLeadForm && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-semibold text-white">Adicionar lead manualmente</p>
          <Input
            placeholder="Nome *"
            value={manualLead.name}
            onChange={(e) => setManualLead(prev => ({ ...prev, name: e.target.value }))}
            className="h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          <Input
            placeholder="Email *"
            type="email"
            value={manualLead.email}
            onChange={(e) => setManualLead(prev => ({ ...prev, email: e.target.value }))}
            className="h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          <Input
            placeholder="Telefone (opcional)"
            value={manualLead.phone}
            onChange={(e) => setManualLead(prev => ({ ...prev, phone: e.target.value }))}
            className="h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          <Input
            placeholder="Nota (opcional)"
            value={manualLead.message}
            onChange={(e) => setManualLead(prev => ({ ...prev, message: e.target.value }))}
            className="h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowManualLeadForm(false); setManualLead({ name: "", email: "", phone: "", message: "" }); }}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveManualLead}
              disabled={savingLead}
              className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {savingLead ? "Salvando..." : "Salvar lead"}
            </button>
          </div>
        </div>
      )}

      {/* QR Code for Lead Capture */}
      {companyPageUrl && (
        <button
          onClick={() => setShowQRDialog(true)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col items-center gap-3 hover:bg-white/[0.08] transition-colors group"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: (orgWebsite?.primary_color || '#8c52ff') + '1a' }}>
            <QrCode className="h-8 w-8" style={{ color: orgWebsite?.primary_color || '#8c52ff' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">QR Code para captura de leads</p>
            <p className="text-[11px] text-white/40 mt-0.5">Toque para gerar, descarregar ou partilhar</p>
          </div>
        </button>
      )}

      <BusinessQRCodeDialog
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        companyUrl={companyPageUrl || ''}
        companyName={orgWebsite?.company_name || organization?.name || ''}
        companyLogo={orgWebsite?.logo_url}
        slogan={orgWebsite?.slogan}
        primaryColor={orgWebsite?.primary_color}
      />

      {/* Follow-up Settings Panel */}
      {showSettings && isAdmin && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Follow-up & Notificações</h3>
              <p className="text-[11px] text-white/30">Configure lembretes automáticos para os seus leads</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default follow-up days */}
            <div className="rounded-xl bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70">Dias padrão de follow-up</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => upsertSettings.mutate({ default_follow_up_days: Math.max(1, defaultDays - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 flex items-center justify-center text-sm transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-white w-8 text-center">{defaultDays}</span>
                  <button
                    onClick={() => upsertSettings.mutate({ default_follow_up_days: Math.min(30, defaultDays + 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 flex items-center justify-center text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-white/25 leading-relaxed">
                Novos leads terão follow-up automático após {defaultDays} dia{defaultDays !== 1 ? "s" : ""} úteis.
              </p>
            </div>

            {/* Reminder days before */}
            <div className="rounded-xl bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70">Lembrete antecipado</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => upsertSettings.mutate({ reminder_days_before: Math.max(0, reminderDaysBefore - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 flex items-center justify-center text-sm transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-white w-8 text-center">{reminderDaysBefore}</span>
                  <button
                    onClick={() => upsertSettings.mutate({ reminder_days_before: Math.min(7, reminderDaysBefore + 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 flex items-center justify-center text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-white/25 leading-relaxed">
                Receba lembretes {reminderDaysBefore} dia{reminderDaysBefore !== 1 ? "s" : ""} antes da data de follow-up.
              </p>
            </div>
          </div>

          {/* Notification toggles */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 rounded-xl bg-white/5 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-white/40" />
                <div>
                  <p className="text-xs font-medium text-white/70">Notificações por email</p>
                  <p className="text-[10px] text-white/25">Email diário consolidado com leads urgentes</p>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={(checked) => upsertSettings.mutate({ email_notifications_enabled: checked })}
              />
            </div>
            <div className="flex-1 rounded-xl bg-white/5 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="h-3.5 w-3.5 text-white/40" />
                <div>
                  <p className="text-xs font-medium text-white/70">Notificações na app</p>
                  <p className="text-[10px] text-white/25">Avisos dentro da plataforma</p>
                </div>
              </div>
              <Switch
                checked={webappEnabled}
                onCheckedChange={(checked) => upsertSettings.mutate({ webapp_notifications_enabled: checked })}
              />
            </div>
          </div>

          <p className="text-[10px] text-white/20 flex items-center gap-1.5">
            <BellOff className="h-3 w-3" />
            Não enviamos emails separados por lead — receberá um único email diário com todos os follow-ups pendentes.
          </p>
        </div>
      )}

      {/* Follow-up Stats */}
      {(stats.overdue > 0 || stats.today > 0 || stats.upcoming > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus(filterStatus === "all" ? "all" : "all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              filterStatus === "all" ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            Todos ({contacts.length})
          </button>
          {stats.overdue > 0 && (
            <button
              onClick={() => setFilterStatus(filterStatus === "overdue" ? "all" : "overdue")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                filterStatus === "overdue" ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-400/60 hover:bg-red-500/15"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Atrasados ({stats.overdue})
            </button>
          )}
          {stats.today > 0 && (
            <button
              onClick={() => setFilterStatus(filterStatus === "today" ? "all" : "today")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                filterStatus === "today" ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/10 text-amber-400/60 hover:bg-amber-500/15"
              }`}
            >
              <Clock className="h-3 w-3" />
              Hoje ({stats.today})
            </button>
          )}
          {stats.upcoming > 0 && (
            <button
              onClick={() => setFilterStatus(filterStatus === "upcoming" ? "all" : "upcoming")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                filterStatus === "upcoming" ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/10 text-blue-400/60 hover:bg-blue-500/15"
              }`}
            >
              <CalendarCheck className="h-3 w-3" />
              Agendados ({stats.upcoming})
            </button>
          )}
        </div>
      )}

      {/* How it works guide */}
      {showGuide && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Como capturar leads?</h3>
                <p className="text-[11px] text-white/30">Comece a receber contactos automaticamente</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowGuide(false);
                sessionStorage.setItem("pocketcv_leads_guide_dismissed", "true");
              }}
              className="text-white/20 hover:text-white/40 text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/5 p-3.5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-white/50" />
              </div>
              <p className="text-xs font-medium text-white">1. Partilhe o seu perfil</p>
              <p className="text-[11px] text-white/30 leading-relaxed">
                Use o seu cartão NFC, QR Code ou link do perfil para partilhar com potenciais clientes.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3.5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <QrCode className="h-3.5 w-3.5 text-white/50" />
              </div>
              <p className="text-xs font-medium text-white">2. Formulário de captura</p>
              <p className="text-[11px] text-white/30 leading-relaxed">
                A pessoa preenche o formulário com nome, email e telefone — os dados aparecem aqui automaticamente.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3.5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <CalendarCheck className="h-3.5 w-3.5 text-white/50" />
              </div>
              <p className="text-xs font-medium text-white">3. Follow-up</p>
              <p className="text-[11px] text-white/30 leading-relaxed">
                Configure datas de follow-up, adicione notas e acompanhe cada lead para converter em cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      {!showGuide && (
        <button
          onClick={() => {
            setShowGuide(true);
            sessionStorage.removeItem("pocketcv_leads_guide_dismissed");
          }}
          className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/40 transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          Como capturar leads?
        </button>
      )}

      {/* Search + Event Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Pesquisar leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20"
          />
        </div>
        {orgEvents.length > 0 && (
          <div className="relative">
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-xs h-10">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-white/40" />
                  <SelectValue placeholder="Evento" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                <SelectItem value="all" className="text-white text-xs">Todos os eventos</SelectItem>
                {orgEvents.map((ev: any) => (
                  <SelectItem key={ev.id} value={ev.id} className="text-white text-xs">
                    {ev.title}
                  </SelectItem>
                ))}
                <SelectItem value="no-event" className="text-white/50 text-xs">Sem evento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Contacts List */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2.5 text-xs font-medium text-white/40 border-b border-white/10">
          <span>Nome</span>
          <span>Contacto</span>
          <span className="w-28 text-center">Follow-up</span>
          <span className="w-24 text-right">Data</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-white/30 text-sm">A carregar...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="h-8 w-8 mx-auto text-white/20 mb-3" />
            <p className="text-white/40 text-sm">Sem leads ainda</p>
            <p className="text-white/20 text-xs mt-1">Os leads aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredContacts.map((contact: any) => {
              const status = getFollowUpStatus(contact.follow_up_date);
              const config = getStatusConfig(status);
              const StatusIcon = config.icon;
              const eventInfo = contact.email ? (eventLeadMap as Record<string, any>)[contact.email.toLowerCase()] : null;

              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {contact.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {contact.email && (
                        <span className="flex items-center gap-1 text-xs text-white/40 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Phone className="h-3 w-3 shrink-0" />
                          {contact.phone}
                        </span>
                      )}
                      {eventInfo && (
                        <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/70 px-1.5 py-0">
                          <CalendarDays className="h-2.5 w-2.5 mr-0.5" />
                          {eventInfo.eventTitle}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Follow-up badge with date picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-colors hover:opacity-80 ${config.bg}`}>
                        <StatusIcon className={`h-3 w-3 ${config.color}`} />
                        <span className={config.color}>
                          {contact.follow_up_date
                            ? format(new Date(contact.follow_up_date), "dd/MM", { locale: pt })
                            : "Agendar"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1a1a2e] border-white/10" align="end">
                      <div className="p-2 border-b border-white/10">
                        <p className="text-[11px] text-white/50 text-center">Data de follow-up</p>
                      </div>
                      <CalendarComponent
                        mode="single"
                        selected={contact.follow_up_date ? new Date(contact.follow_up_date) : undefined}
                        onSelect={(date) => {
                          updateFollowUpDate.mutate({ contactId: contact.id, date: date || null });
                        }}
                        className="pointer-events-auto"
                      />
                      {contact.follow_up_date && (
                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={() => updateFollowUpDate.mutate({ contactId: contact.id, date: null })}
                            className="w-full text-[11px] text-red-400/60 hover:text-red-400 transition-colors py-1"
                          >
                            Remover data
                          </button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  <div className="hidden sm:block">
                    <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">
                      {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: pt })}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessContactsPage;
