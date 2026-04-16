import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays, MapPin, Users, ExternalLink, ChevronRight,
  Building2, Ticket, Globe, Clock, Plus
} from "lucide-react";
import { RegisterExternalEventDialog } from "../components/RegisterExternalEventDialog";
import { format, isPast, isFuture, isWithinInterval } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

type EventWithRole = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  image_url: string | null;
  event_url: string | null;
  category: string | null;
  total_stands: number | null;
  organization_id: string | null;
  role: "organizer" | "stand" | "participant";
  participant_status: string;
  stand_name?: string | null;
  stand_number?: number | null;
  org_name?: string | null;
};

const getEventStatus = (event: EventWithRole) => {
  const now = new Date();
  const start = new Date(event.event_date);
  const end = event.end_date ? new Date(event.end_date) : start;

  if (isFuture(start)) return { label: "Próximo", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  if (isWithinInterval(now, { start, end })) return { label: "A decorrer", color: "bg-green-500/10 text-green-400 border-green-500/20" };
  return { label: "Terminado", color: "bg-white/5 text-white/40 border-white/10" };
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "organizer":
      return { label: "Organizador", color: "bg-primary/10 text-primary border-primary/20" };
    case "stand":
      return { label: "Stand", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    default:
      return { label: "Participante", color: "bg-white/5 text-white/50 border-white/10" };
  }
};

const BusinessEventsPage = () => {
  const { organization } = useOrganization();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "organizer" | "stand" | "participant">("all");
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["business-events", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      // Get all members of this org
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organization.id)
        .eq("status", "active");

      const memberIds = members?.map((m) => m.user_id) || [];
      if (memberIds.length === 0) return [];

      // Get events where org members are participants
      const { data: participations, error: partErr } = await supabase
        .from("event_participants")
        .select(`
          role, status, user_id,
          events (
            id, title, description, event_date, end_date, location, city, country,
            image_url, event_url, category, total_stands, organization_id,
            organizations (name)
          )
        `)
        .in("user_id", memberIds);

      if (partErr) throw partErr;

      // Also get events created by this org directly
      const { data: orgEvents, error: orgErr } = await supabase
        .from("events")
        .select("id, title, description, event_date, end_date, location, city, country, image_url, event_url, category, total_stands, organization_id, organizations (name)")
        .eq("organization_id", organization.id);

      if (orgErr) throw orgErr;

      // Merge and dedupe
      const eventsMap = new Map<string, EventWithRole>();

      // Add org-owned events as organizer
      for (const ev of orgEvents || []) {
        eventsMap.set(ev.id, {
          ...ev,
          role: "organizer",
          participant_status: "confirmed",
          org_name: (ev.organizations as any)?.name,
        });
      }

      // Add participant events
      for (const p of participations || []) {
        const ev = p.events as any;
        if (!ev?.id) continue;

        // Get stand info if role is stand
        let standInfo: any = null;
        if (p.role === "stand") {
          const { data: stand } = await supabase
            .from("event_stands")
            .select("stand_name, stand_number")
            .eq("event_id", ev.id)
            .eq("assigned_user_id", p.user_id)
            .maybeSingle();
          standInfo = stand;
        }

        const existing = eventsMap.get(ev.id);
        // Organizer role takes precedence
        if (!existing || (existing.role !== "organizer" && p.role === "organizer")) {
          eventsMap.set(ev.id, {
            ...ev,
            role: p.role as any,
            participant_status: p.status,
            stand_name: standInfo?.stand_name,
            stand_number: standInfo?.stand_number,
            org_name: ev.organizations?.name,
          });
        }
      }

      // Sort: active first, then upcoming, then past
      return Array.from(eventsMap.values()).sort((a, b) => {
        const now = new Date();
        const aStart = new Date(a.event_date);
        const bStart = new Date(b.event_date);
        const aEnd = a.end_date ? new Date(a.end_date) : aStart;
        const bEnd = b.end_date ? new Date(b.end_date) : bStart;

        const aActive = aStart <= now && aEnd >= now;
        const bActive = bStart <= now && bEnd >= now;
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        const aFuture = aStart > now;
        const bFuture = bStart > now;
        if (aFuture && !bFuture) return -1;
        if (!aFuture && bFuture) return 1;

        return bStart.getTime() - aStart.getTime();
      });
    },
    enabled: !!organization?.id,
  });

  const filteredEvents = filter === "all" ? events : events.filter((e) => e.role === filter);

  const roleCounts = {
    all: events.length,
    organizer: events.filter((e) => e.role === "organizer").length,
    stand: events.filter((e) => e.role === "stand").length,
    participant: events.filter((e) => e.role === "participant").length,
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Eventos</h1>
          <p className="text-white/50 text-sm mt-1">
            {events.length} evento{events.length !== 1 ? "s" : ""} associado{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRegisterDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Registar evento
          </button>
          <a
            href="https://events.pocketcv.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            Criar evento
          </a>
        </div>
      </div>

      {/* Filters */}
      {events.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "organizer", "stand", "participant"] as const).map((f) => {
            if (f !== "all" && roleCounts[f] === 0) return null;
            const labels = { all: "Todos", organizer: "Organizador", stand: "Stand", participant: "Participante" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  filter === f ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {labels[f]} ({roleCounts[f]})
              </button>
            );
          })}
        </div>
      )}

      {/* Events list */}
      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
          <p className="text-white/30 text-sm">A carregar eventos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
          <CalendarDays className="h-10 w-10 mx-auto text-white/20 mb-3" />
          <h2 className="text-sm font-semibold text-white mb-1">Sem eventos</h2>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            A sua empresa ainda não está associada a nenhum evento. Crie um evento ou aceite um convite para participar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const roleBadge = getRoleBadge(event.role);
            const startDate = new Date(event.event_date);
            const endDate = event.end_date ? new Date(event.end_date) : null;

            const isPastEvent = status.label === "Terminado";

            return (
              <div
                key={event.id}
                onClick={() => navigate(`/business/events/${event.id}`)}
                className={`group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer ${isPastEvent ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    <span className="text-[10px] font-medium text-white/40 uppercase">
                      {format(startDate, "MMM", { locale: pt })}
                    </span>
                    <span className="text-lg font-bold text-white leading-none">
                      {format(startDate, "dd")}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${roleBadge.color}`}>
                            {roleBadge.label}
                          </Badge>
                          {event.role === "stand" && event.stand_name && (
                            <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">
                              <Ticket className="h-2.5 w-2.5 mr-1" />
                              {event.stand_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors shrink-0 mt-0.5" />
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-white/35">
                        <Clock className="h-3 w-3" />
                        {format(startDate, "dd MMM yyyy", { locale: pt })}
                        {endDate && ` — ${format(endDate, "dd MMM yyyy", { locale: pt })}`}
                      </span>
                      {(event.city || event.location) && (
                        <span className="flex items-center gap-1 text-[11px] text-white/35">
                          <MapPin className="h-3 w-3" />
                          {[event.location, event.city, event.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {event.org_name && event.role !== "organizer" && (
                        <span className="flex items-center gap-1 text-[11px] text-white/35">
                          <Building2 className="h-3 w-3" />
                          {event.org_name}
                        </span>
                      )}
                      {event.total_stands && event.role === "organizer" && (
                        <span className="flex items-center gap-1 text-[11px] text-white/35">
                          <Users className="h-3 w-3" />
                          {event.total_stands} stands
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-[11px] text-white/25 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RegisterExternalEventDialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen} />
    </div>
  );
};

export default BusinessEventsPage;
