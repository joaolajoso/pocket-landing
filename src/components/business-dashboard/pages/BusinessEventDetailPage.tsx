import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, CalendarDays, MapPin, Globe, Users, Ticket, Clock,
  Building2, MessageSquare, BarChart3, Megaphone, QrCode, Mail,
  Phone, CheckCircle2, XCircle, User, ExternalLink, Eye, Link2, UserPlus, X,
  UserCheck, Plus
} from "lucide-react";
import { format, isWithinInterval, isFuture, isPast } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

type MetricDetailType = "profile_view" | "connection" | "lead_capture" | null;

const BusinessEventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [detailModal, setDetailModal] = useState<MetricDetailType>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [savingLead, setSavingLead] = useState(false);
  const [addingMember, setAddingMember] = useState<string | null>(null);

  const handleSaveManualLead = useCallback(async () => {
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      toast.error("Nome e email são obrigatórios");
      return;
    }
    if (!user?.id || !eventId) return;
    setSavingLead(true);
    try {
      // Insert into contact_submissions
      const { error: csError } = await supabase.from("contact_submissions").insert({
        name: leadForm.name.trim(),
        email: leadForm.email.trim(),
        phone: leadForm.phone.trim() || null,
        profile_owner_id: user.id,
        organization_id: organization?.id || null,
      });
      if (csError) throw csError;

      // Also insert metric for event tracking
      const { error: mError } = await supabase.from("event_participant_metrics").insert({
        event_id: eventId,
        participant_id: user.id,
        metric_type: "lead_capture" as any,
        is_during_event: true,
        metadata: {
          contact_name: leadForm.name.trim(),
          contact_email: leadForm.email.trim(),
          contact_phone: leadForm.phone.trim() || null,
          source: "manual",
        },
      });
      if (mError) throw mError;

      queryClient.invalidateQueries({ queryKey: ["business-event-metrics", eventId, user.id] });
      toast.success("Lead adicionado com sucesso");
      setLeadForm({ name: "", email: "", phone: "" });
      setShowLeadForm(false);
    } catch (err: any) {
      toast.error("Erro ao salvar lead: " + (err.message || ""));
    } finally {
      setSavingLead(false);
    }
  }, [leadForm, user?.id, eventId, organization?.id, queryClient]);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["business-event-detail", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data, error } = await supabase
        .from("events")
        .select("*, organizations(name, logo_url)")
        .eq("id", eventId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Fetch my participation
  const { data: myParticipation } = useQuery({
    queryKey: ["business-event-participation", eventId, organization?.id],
    queryFn: async () => {
      if (!eventId || !organization?.id) return null;
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organization.id)
        .eq("status", "active");
      const memberIds = members?.map((m) => m.user_id) || [];
      if (!memberIds.length) return null;

      const { data } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", eventId)
        .in("user_id", memberIds);
      return data?.[0] || null;
    },
    enabled: !!eventId && !!organization?.id,
  });

  // Fetch my stand info
  const { data: myStand } = useQuery({
    queryKey: ["business-event-stand", eventId, organization?.id],
    queryFn: async () => {
      if (!eventId || !organization?.id) return null;
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organization.id)
        .eq("status", "active");
      const memberIds = members?.map((m) => m.user_id) || [];

      const { data } = await supabase
        .from("event_stands")
        .select("*")
        .eq("event_id", eventId)
        .in("assigned_user_id", memberIds);
      return data?.[0] || null;
    },
    enabled: !!eventId && !!organization?.id,
  });

  // Fetch event areas
  const { data: areas = [] } = useQuery({
    queryKey: ["business-event-areas", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_areas")
        .select("*")
        .eq("event_id", eventId!);
      return data || [];
    },
    enabled: !!eventId,
  });

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ["business-event-announcements", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_announcements")
        .select("*")
        .eq("event_id", eventId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!eventId,
  });

  // Fetch meeting requests (sent/received)
  const { data: meetingRequests = [] } = useQuery({
    queryKey: ["business-event-meetings", eventId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("event_meeting_requests")
        .select("*, sender:profiles!event_meeting_requests_sender_id_fkey1(name, avatar_url, headline), receiver:profiles!event_meeting_requests_receiver_id_fkey1(name, avatar_url, headline)")
        .eq("event_id", eventId!)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      return data || [];
    },
    enabled: !!eventId && !!user?.id,
  });

  // Fetch participants (for organizers)
  const { data: participants = [] } = useQuery({
    queryKey: ["business-event-participants", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_participants")
        .select("*, profiles:user_id(name, avatar_url, headline, email)")
        .eq("event_id", eventId!)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!eventId,
  });

  // Fetch stands
  const { data: stands = [] } = useQuery({
    queryKey: ["business-event-stands", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_stands")
        .select("*")
        .eq("event_id", eventId!)
        .order("stand_number", { ascending: true });
      return data || [];
    },
    enabled: !!eventId,
  });

  // Fetch event metrics for my participation
  const { data: myMetrics = [] } = useQuery({
    queryKey: ["business-event-metrics", eventId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("event_participant_metrics")
        .select("*")
        .eq("event_id", eventId!)
        .eq("participant_id", user.id);
      return data || [];
    },
    enabled: !!eventId && !!user?.id,
  });

  // Fetch organization team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["business-event-team", eventId, organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data } = await supabase
        .from("organization_members")
        .select("id, user_id, role, position, profiles:user_id(id, name, avatar_url, headline, email, slug)")
        .eq("organization_id", organization.id)
        .eq("status", "active");
      return data || [];
    },
    enabled: !!organization?.id && !!eventId,
  });

  // Fetch team metrics for all org members in this event
  const teamUserIds = teamMembers.map((m: any) => m.user_id);
  const { data: teamMetrics = [] } = useQuery({
    queryKey: ["business-event-team-metrics", eventId, teamUserIds],
    queryFn: async () => {
      if (!teamUserIds.length || !eventId) return [];
      const { data } = await supabase
        .from("event_participant_metrics")
        .select("*")
        .eq("event_id", eventId)
        .in("participant_id", teamUserIds);
      return data || [];
    },
    enabled: teamUserIds.length > 0 && !!eventId,
    refetchInterval: 30000, // Real-time: refresh every 30s
  });

  // Check which team members are already event participants
  const teamParticipantIds = participants
    .filter((p: any) => teamUserIds.includes(p.user_id))
    .map((p: any) => p.user_id);

  const handleAddTeamMember = useCallback(async (memberId: string) => {
    if (!eventId) return;
    setAddingMember(memberId);
    try {
      const { error } = await supabase.from("event_participants").insert({
        event_id: eventId,
        user_id: memberId,
        role: "participant",
        status: "registered",
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["business-event-participants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["business-event-team", eventId, organization?.id] });
      toast.success("Membro adicionado ao evento");
    } catch (err: any) {
      toast.error("Erro ao adicionar: " + (err.message || ""));
    } finally {
      setAddingMember(null);
    }
  }, [eventId, queryClient, organization?.id]);

  // Fetch connection profiles for detail modal
  const connectionMetricsData = myMetrics.filter((m) => m.metric_type === "connection");
  const connectedUserIds = connectionMetricsData
    .map((m: any) => (m.metadata as any)?.connected_with || (m.metadata as any)?.connected_by)
    .filter(Boolean);
  // Deduplicate
  const uniqueConnectedIds = [...new Set(connectedUserIds)] as string[];

  const { data: connectedProfiles = [] } = useQuery({
    queryKey: ["business-event-connected-profiles", eventId, uniqueConnectedIds],
    queryFn: async () => {
      if (!uniqueConnectedIds.length) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, headline, email, slug")
        .in("id", uniqueConnectedIds);
      return data || [];
    },
    enabled: uniqueConnectedIds.length > 0,
  });

  // Lead metrics data
  const leadMetricsData = myMetrics.filter((m) => m.metric_type === "lead_capture");
  const profileViewMetricsData = myMetrics.filter((m) => m.metric_type === "profile_view");

  if (eventLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/business/events")} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-4 w-4 text-white/60" />
          </button>
          <p className="text-white/30 text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button onClick={() => navigate("/business/events")} className="flex items-center gap-2 text-white/50 hover:text-white/70 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/40 text-sm">Evento não encontrado</p>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : startDate;
  const now = new Date();
  const isActive = isWithinInterval(now, { start: startDate, end: endDate });
  const isUpcoming = isFuture(startDate);
  const statusLabel = isActive ? "A decorrer" : isUpcoming ? "Próximo" : "Terminado";
  const statusColor = isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : isUpcoming ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-white/40 border-white/10";

  const isOrganizer = event.organization_id === organization?.id;
  const myRole = isOrganizer ? "organizer" : myParticipation?.role || "participant";
  const roleBadge = myRole === "organizer"
    ? { label: "Organizador", color: "bg-primary/10 text-primary border-primary/20" }
    : myRole === "stand"
    ? { label: "Stand", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
    : { label: "Participante", color: "bg-white/5 text-white/50 border-white/10" };

  const connectionMetrics = connectionMetricsData.length;
  // Deduplicate connections (both connected_with and connected_by for same connection_id)
  const uniqueConnectionIds = new Set(connectionMetricsData.map((m: any) => (m.metadata as any)?.connection_id).filter(Boolean));
  const deduplicatedConnectionCount = uniqueConnectionIds.size;
  const profileViewMetrics = profileViewMetricsData.length;
  const leadMetrics = leadMetricsData.length;

  const getModalTitle = () => {
    switch (detailModal) {
      case "profile_view": return "Views do perfil";
      case "connection": return "Conexões no evento";
      case "lead_capture": return "Leads captados";
      default: return "";
    }
  };

  const getModalIcon = () => {
    switch (detailModal) {
      case "profile_view": return <Eye className="h-4 w-4 text-white/50" />;
      case "connection": return <Link2 className="h-4 w-4 text-primary" />;
      case "lead_capture": return <UserPlus className="h-4 w-4 text-green-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Back + Header */}
      <button onClick={() => navigate("/business/events")} className="flex items-center gap-2 text-white/40 hover:text-white/60 text-xs transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar aos eventos
      </button>

      {/* Event Hero */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        {event.image_url && (
          <div className="h-32 sm:h-44 bg-cover bg-center" style={{ backgroundImage: `url(${event.image_url})` }}>
            <div className="w-full h-full bg-gradient-to-t from-[#0d0d1a] to-transparent" />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-white">{event.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] ${statusColor}`}>{statusLabel}</Badge>
                <Badge variant="outline" className={`text-[10px] ${roleBadge.color}`}>{roleBadge.label}</Badge>
                {myStand && (
                  <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400">
                    <Ticket className="h-2.5 w-2.5 mr-1" />
                    {myStand.stand_name || `Stand #${myStand.stand_number}`}
                  </Badge>
                )}
              </div>
            </div>
            {event.event_url && (
              <a href={event.event_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/15 text-[11px] transition-colors shrink-0">
                <ExternalLink className="h-3 w-3" />
                Site
              </a>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div className="rounded-xl bg-white/5 p-3 space-y-1">
              <Clock className="h-3.5 w-3.5 text-white/30" />
              <p className="text-[11px] text-white/50">Data</p>
              <p className="text-xs font-medium text-white">
                {format(startDate, "dd MMM yyyy", { locale: pt })}
                {event.end_date && ` — ${format(endDate, "dd MMM", { locale: pt })}`}
              </p>
            </div>
            {(event.city || event.location) && (
              <div className="rounded-xl bg-white/5 p-3 space-y-1">
                <MapPin className="h-3.5 w-3.5 text-white/30" />
                <p className="text-[11px] text-white/50">Local</p>
                <p className="text-xs font-medium text-white truncate">
                  {[event.location, event.city].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            <div className="rounded-xl bg-white/5 p-3 space-y-1">
              <Users className="h-3.5 w-3.5 text-white/30" />
              <p className="text-[11px] text-white/50">Participantes</p>
              <p className="text-xs font-medium text-white">{participants.length}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 space-y-1">
              <Ticket className="h-3.5 w-3.5 text-white/30" />
              <p className="text-[11px] text-white/50">Stands</p>
              <p className="text-xs font-medium text-white">{stands.length} / {event.total_stands || "—"}</p>
            </div>
          </div>

          {event.description && (
            <p className="text-[11px] text-white/30 leading-relaxed mt-2">{event.description}</p>
          )}
        </div>
      </div>

      {/* My Event Metrics - Clickable */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setDetailModal("profile_view")}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 text-center hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
        >
          <p className="text-lg font-bold text-white">{profileViewMetrics}</p>
          <p className="text-[10px] text-white/40 mt-1 group-hover:text-white/60 transition-colors">Views do perfil</p>
        </button>
        <button
          onClick={() => setDetailModal("connection")}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 text-center hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
        >
          <p className="text-lg font-bold text-white">{deduplicatedConnectionCount}</p>
          <p className="text-[10px] text-white/40 mt-1 group-hover:text-white/60 transition-colors">Conexões</p>
        </button>
        <button
          onClick={() => setDetailModal("lead_capture")}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 text-center hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
        >
          <p className="text-lg font-bold text-white">{leadMetrics}</p>
          <p className="text-[10px] text-white/40 mt-1 group-hover:text-white/60 transition-colors">Leads captados</p>
        </button>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModal !== null} onOpenChange={(open) => !open && setDetailModal(null)}>
        <DialogContent className="bg-[#0d0d1a] border-white/10 text-white max-w-md max-h-[70vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              {getModalIcon()}
              {getModalTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {/* Connections Detail */}
            {detailModal === "connection" && (
              <>
                {connectedProfiles.length === 0 ? (
                  <div className="py-8 text-center">
                    <Link2 className="h-8 w-8 mx-auto text-white/15 mb-3" />
                    <p className="text-xs text-white/40">Sem conexões neste evento</p>
                  </div>
                ) : (
                  connectedProfiles.map((profile: any) => {
                    const metric = connectionMetricsData.find(
                      (m: any) => (m.metadata as any)?.connected_with === profile.id || (m.metadata as any)?.connected_by === profile.id
                    );
                    return (
                      <div key={profile.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:bg-white/8 transition-colors">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {profile.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{profile.name || "—"}</p>
                          <p className="text-[10px] text-white/30 truncate">{profile.headline || profile.email}</p>
                        </div>
                        {metric && (
                          <span className="text-[10px] text-white/20">
                            {format(new Date((metric as any).captured_at), "dd/MM HH:mm")}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Leads Detail */}
            {detailModal === "lead_capture" && (
              <>
                {/* Add lead button / form */}
                {!showLeadForm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-dashed border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    onClick={() => setShowLeadForm(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Adicionar lead manualmente
                  </Button>
                ) : (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                    <p className="text-xs font-medium text-white/70">Novo lead</p>
                    <Input
                      placeholder="Nome *"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                      className="h-9 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <Input
                      placeholder="Email *"
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="h-9 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <Input
                      placeholder="Telefone (opcional)"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-9 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs text-white/50 hover:text-white"
                        onClick={() => { setShowLeadForm(false); setLeadForm({ name: "", email: "", phone: "" }); }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        disabled={savingLead}
                        onClick={handleSaveManualLead}
                      >
                        {savingLead ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing leads list */}
                {leadMetricsData.length === 0 && !showLeadForm && (
                  <div className="py-6 text-center">
                    <UserPlus className="h-8 w-8 mx-auto text-white/15 mb-3" />
                    <p className="text-xs text-white/40">Sem leads captados neste evento</p>
                  </div>
                )}
                {leadMetricsData.map((metric: any, idx: number) => {
                  const meta = metric.metadata as any;
                  return (
                    <div key={metric.id || idx} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-green-500/20 text-green-400">
                          {meta?.contact_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{meta?.contact_name || "—"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {meta?.contact_email && (
                            <span className="flex items-center gap-1 text-[10px] text-white/30 truncate">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              {meta.contact_email}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-white/20">
                        {format(new Date(metric.captured_at), "dd/MM HH:mm")}
                      </span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Profile Views Detail */}
            {detailModal === "profile_view" && (
              <>
                {profileViewMetricsData.length === 0 ? (
                  <div className="py-8 text-center">
                    <Eye className="h-8 w-8 mx-auto text-white/15 mb-3" />
                    <p className="text-xs text-white/40">Sem visualizações neste evento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
                      <Eye className="h-6 w-6 mx-auto text-white/30 mb-2" />
                      <p className="text-2xl font-bold text-white">{profileViewMetrics}</p>
                      <p className="text-[11px] text-white/40 mt-1">visualizações do perfil durante o evento</p>
                    </div>
                    <div className="space-y-1.5">
                      {profileViewMetricsData.slice(0, 20).map((metric: any, idx: number) => (
                        <div key={metric.id || idx} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                          <span className="text-[10px] text-white/40">Visualização #{idx + 1}</span>
                          <span className="text-[10px] text-white/25">
                            {format(new Date(metric.captured_at), "dd/MM HH:mm")}
                          </span>
                        </div>
                      ))}
                      {profileViewMetricsData.length > 20 && (
                        <p className="text-[10px] text-white/20 text-center py-2">
                          + {profileViewMetricsData.length - 20} mais visualizações
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white/10">Geral</TabsTrigger>
          {announcements.length > 0 && (
            <TabsTrigger value="announcements" className="text-xs data-[state=active]:bg-white/10">
              Anúncios ({announcements.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="meetings" className="text-xs data-[state=active]:bg-white/10">
            Reuniões ({meetingRequests.length})
          </TabsTrigger>
          {(isOrganizer || myRole === "organizer") && (
            <TabsTrigger value="participants" className="text-xs data-[state=active]:bg-white/10">
              Participantes ({participants.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="team" className="text-xs data-[state=active]:bg-white/10">
            Equipa ({teamMembers.length})
          </TabsTrigger>
          <TabsTrigger value="stands" className="text-xs data-[state=active]:bg-white/10">
            Stands ({stands.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {/* My Stand Details */}
          {myStand && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">O meu stand</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-white/40">Número</p>
                  <p className="text-xs font-medium text-white">#{myStand.stand_number}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-white/40">Nome</p>
                  <p className="text-xs font-medium text-white">{myStand.stand_name || "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-white/40">Empresa</p>
                  <p className="text-xs font-medium text-white">{myStand.company_name || "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-white/40">Status</p>
                  <div className="flex items-center gap-1">
                    {myStand.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">Ativo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-400" />
                        <span className="text-xs text-red-400">Inativo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Areas */}
          {areas.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Áreas do evento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {areas.map((area: any) => (
                  <div key={area.id} className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs font-medium text-white">{area.name}</p>
                    {area.description && <p className="text-[10px] text-white/30 mt-1">{area.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizer info */}
          {!isOrganizer && event.organizations && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {(event.organizations as any)?.logo_url ? (
                    <img src={(event.organizations as any).logo_url} className="w-6 h-6 rounded" />
                  ) : (
                    <Building2 className="h-5 w-5 text-white/40" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-white/40">Organizado por</p>
                  <p className="text-sm font-medium text-white">{(event.organizations as any)?.name}</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-3">
          {announcements.map((ann: any) => (
            <div key={ann.id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Megaphone className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-white">{ann.title}</h4>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">{ann.message}</p>
              <p className="text-[10px] text-white/20">
                {format(new Date(ann.created_at), "dd MMM yyyy 'às' HH:mm", { locale: pt })}
              </p>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <Megaphone className="h-6 w-6 mx-auto text-white/20 mb-2" />
              <p className="text-xs text-white/40">Sem anúncios</p>
            </div>
          )}
        </TabsContent>

        {/* Meetings */}
        <TabsContent value="meetings" className="space-y-3">
          {meetingRequests.map((req: any) => {
            const isSender = req.sender_id === user?.id;
            const otherPerson = isSender ? req.receiver : req.sender;
            const statusMap: Record<string, { label: string; color: string }> = {
              pending: { label: "Pendente", color: "text-amber-400" },
              accepted: { label: "Aceite", color: "text-green-400" },
              rejected: { label: "Recusado", color: "text-red-400" },
            };
            const s = statusMap[req.status] || statusMap.pending;
            return (
              <div key={req.id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={otherPerson?.avatar_url} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {otherPerson?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{otherPerson?.name || "Utilizador"}</p>
                    <p className="text-[10px] text-white/30">{otherPerson?.headline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] border-white/10 ${s.color}`}>{s.label}</Badge>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-white/30">
                      {isSender ? "Enviado" : "Recebido"}
                    </Badge>
                  </div>
                </div>
                {req.message && (
                  <p className="text-[11px] text-white/30 mt-2 ml-11">{req.message}</p>
                )}
              </div>
            );
          })}
          {meetingRequests.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <MessageSquare className="h-6 w-6 mx-auto text-white/20 mb-2" />
              <p className="text-xs text-white/40">Sem pedidos de reunião</p>
            </div>
          )}
        </TabsContent>

        {/* Participants (organizer only) */}
        <TabsContent value="participants" className="space-y-2">
          {participants.map((p: any) => {
            const profile = p.profiles;
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {profile?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{profile?.name || "—"}</p>
                  <p className="text-[10px] text-white/30 truncate">{profile?.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-white/10 text-white/40 capitalize">{p.role}</Badge>
                <div className="flex items-center gap-1">
                  {p.checked_in ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-white/20" />
                  )}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">Membros no evento</h3>
              </div>
              <p className="text-[10px] text-white/30">Atualiza a cada 30s</p>
            </div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-6 w-6 mx-auto text-white/20 mb-2" />
                <p className="text-xs text-white/40">Sem membros na equipa</p>
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member: any) => {
                  const profile = member.profiles;
                  const isInEvent = teamParticipantIds.includes(member.user_id);
                  const memberMetrics = teamMetrics.filter((m: any) => m.participant_id === member.user_id);
                  const views = memberMetrics.filter((m: any) => m.metric_type === "profile_view").length;
                  const leads = memberMetrics.filter((m: any) => m.metric_type === "lead_capture").length;
                  const conns = new Set(
                    memberMetrics
                      .filter((m: any) => m.metric_type === "connection")
                      .map((m: any) => (m.metadata as any)?.connection_id)
                      .filter(Boolean)
                  ).size;

                  return (
                    <div key={member.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {profile?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{profile?.name || "—"}</p>
                          <p className="text-[10px] text-white/30 truncate">{member.position || profile?.headline || member.role}</p>
                        </div>
                        {isInEvent ? (
                          <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400 shrink-0">
                            <UserCheck className="h-2.5 w-2.5 mr-1" />
                            No evento
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] border-white/10 text-white/50 hover:text-white hover:bg-white/10 shrink-0"
                            disabled={addingMember === member.user_id}
                            onClick={() => handleAddTeamMember(member.user_id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {addingMember === member.user_id ? "..." : "Adicionar"}
                          </Button>
                        )}
                      </div>

                      {/* Real-time metrics for members in the event */}
                      {isInEvent && (
                        <div className="grid grid-cols-3 gap-2 mt-3 ml-12">
                          <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-center">
                            <p className="text-sm font-bold text-white">{views}</p>
                            <p className="text-[9px] text-white/30">Views</p>
                          </div>
                          <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-center">
                            <p className="text-sm font-bold text-white">{conns}</p>
                            <p className="text-[9px] text-white/30">Conexões</p>
                          </div>
                          <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-center">
                            <p className="text-sm font-bold text-white">{leads}</p>
                            <p className="text-[9px] text-white/30">Leads</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stands */}
        <TabsContent value="stands" className="space-y-2">
          {stands.map((stand: any) => (
            <div key={stand.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-amber-400">#{stand.stand_number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{stand.company_name || stand.stand_name || `Stand #${stand.stand_number}`}</p>
                {stand.company_email && (
                  <p className="text-[10px] text-white/30 truncate">{stand.company_email}</p>
                )}
              </div>
              {stand.is_active ? (
                <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] border-white/10 text-white/30">Inativo</Badge>
              )}
            </div>
          ))}
          {stands.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <Ticket className="h-6 w-6 mx-auto text-white/20 mb-2" />
              <p className="text-xs text-white/40">Sem stands registados</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessEventDetailPage;
