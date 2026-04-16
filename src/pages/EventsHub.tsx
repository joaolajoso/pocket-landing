import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Search, MapPin, Users, Eye, Link2, ArrowUpRight, Crown, User, Building2, UsersRound, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useEventManagement, EventWithSource, EventSource } from '@/hooks/useEventManagement';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { isPortuguese } from '@/utils/languageHelpers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { eventPageThemes } from '@/config/eventPageThemes';
import UpgradePricingPopup from '@/components/pricing/UpgradePricingPopup';
import { toast } from 'sonner';
import ModeSwitcher from '@/components/dashboard/ModeSwitcher';

const theme = eventPageThemes.purple;

interface EventWithStats extends EventWithSource {
  participantCount: number;
  viewCount: number;
  connectionCount: number;
}

interface AggregatedMetrics {
  totalEvents: number;
  totalParticipants: number;
  totalViews: number;
  totalConnections: number;
}

const PLAN_LIMITS: Record<string, { label: string; maxStaff: number; maxParticipants: string }> = {
  free: { label: 'Free', maxStaff: 1, maxParticipants: '50' },
  xs: { label: 'XS', maxStaff: 3, maxParticipants: '500' },
  s: { label: 'S', maxStaff: 10, maxParticipants: '2,000' },
  m: { label: 'M', maxStaff: 30, maxParticipants: '6,000' },
  l: { label: 'L', maxStaff: 80, maxParticipants: '15,000' },
  xl: { label: 'XL', maxStaff: -1, maxParticipants: '∞' },
};

function detectPlan(staffCount: number): string {
  if (staffCount <= 1) return 'free';
  if (staffCount <= 3) return 'xs';
  if (staffCount <= 10) return 's';
  if (staffCount <= 30) return 'm';
  if (staffCount <= 80) return 'l';
  return 'xl';
}

type SourceFilter = 'all' | 'personal' | 'organization' | 'co-organizer';

const EventsHub = () => {
  const navigate = useNavigate();
  const { fetchMyEvents } = useEventManagement();
  const { language } = useLanguage();
  const { user } = useAuth();
  const pt = isPortuguese(language);

  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [search, setSearch] = useState('');
  const [staffCount, setStaffCount] = useState(1);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [allOrgs, setAllOrgs] = useState<{ id: string; name: string; logo_url: string | null }[]>([]);
  const [selectedOrgContext, setSelectedOrgContext] = useState<string>('all');
  const [showPricingPopup, setShowPricingPopup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Re-fetch staff count when org context changes
  useEffect(() => {
    const fetchContextStaffCount = async () => {
      if (selectedOrgContext === 'solo' || selectedOrgContext === 'all') {
        // For 'all', keep the primary org staff count (already set by loadData)
        // For 'solo', staff count doesn't matter (cards hidden)
        if (selectedOrgContext === 'solo') setStaffCount(0);
        return;
      }
      // Specific org selected — fetch that org's staff count
      const { count } = await supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', selectedOrgContext)
        .eq('status', 'active');
      setStaffCount(count || 1);
    };
    if (!loading) fetchContextStaffCount();
  }, [selectedOrgContext]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, profileData, orgsData] = await Promise.all([
        fetchMyEvents(),
        user ? supabase.from('profiles').select('organization_id').eq('id', user.id).single() : null,
        user ? supabase.from('organization_members').select('organization_id, role, organizations(id, name, logo_url)').eq('user_id', user.id).eq('status', 'active') : null,
      ]);

      const organizationId = profileData?.data?.organization_id;
      setOrgId(organizationId || null);

      // Build org list
      const orgList = (orgsData?.data || [])
        .filter((m: any) => m.organizations)
        .map((m: any) => ({
          id: m.organizations.id,
          name: m.organizations.name,
          logo_url: m.organizations.logo_url,
        }));
      setAllOrgs(orgList);

      // Check if user is org admin
      let userIsAdmin = false;
      const staffPromise = organizationId
        ? supabase.from('organization_members').select('id, role', { count: 'exact' }).eq('organization_id', organizationId).eq('status', 'active')
        : null;

      const eventsWithStats = await Promise.all(
        (eventsData || []).map(async (event) => {
          const [participantRes, metricsRes] = await Promise.all([
            supabase.from('event_participants').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
            supabase.from('event_participant_metrics').select('metric_type').eq('event_id', event.id),
          ]);

          const metrics = metricsRes.data || [];
          const viewCount = metrics.filter((m: any) => m.metric_type === 'profile_view').length;
          const connectionCount = metrics.filter((m: any) => m.metric_type === 'connection').length;

          return {
            ...event,
            participantCount: participantRes.count || 0,
            viewCount,
            connectionCount,
          };
        })
      );

      if (staffPromise) {
        const staffRes = await staffPromise;
        setStaffCount(staffRes.count || 1);
        if (user && organizationId) {
          const { data: myRole } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          userIsAdmin = myRole?.role === 'owner' || myRole?.role === 'admin';
        }
      }

      // Default context: if user has orgs, start on 'all'; otherwise solo is implicit
      if (orgList.length === 0) {
        setSelectedOrgContext('solo');
      }

      setIsOrgAdmin(userIsAdmin);
      setEvents(eventsWithStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const currentPlan = detectPlan(staffCount);
  const planInfo = PLAN_LIMITS[currentPlan];

  // Check which source filters have events
  const availableSources = useMemo(() => {
    const sources = new Set(events.map(e => e.source));
    return sources;
  }, [events]);

  // Context-aware owned events for metrics
  const contextOwnedEvents = useMemo(() => {
    return events
      .filter(e => e.source !== 'co-organizer')
      .filter(e => {
        if (selectedOrgContext === 'solo') return e.source === 'personal';
        if (selectedOrgContext !== 'all') return e.organization_id === selectedOrgContext;
        return true;
      });
  }, [events, selectedOrgContext]);

  const metrics: AggregatedMetrics = useMemo(() => {
    return {
      totalEvents: contextOwnedEvents.length,
      totalParticipants: contextOwnedEvents.reduce((sum, e) => sum + e.participantCount, 0),
      totalViews: contextOwnedEvents.reduce((sum, e) => sum + e.viewCount, 0),
      totalConnections: contextOwnedEvents.reduce((sum, e) => sum + e.connectionCount, 0),
    };
  }, [contextOwnedEvents]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        // Org context filter
        if (selectedOrgContext === 'solo') return e.source === 'personal';
        if (selectedOrgContext !== 'all') return e.organization_id === selectedOrgContext;
        return true;
      })
      .filter((e) => {
        const endDate = e.end_date ? new Date(e.end_date) : new Date(e.event_date);
        if (filter === 'upcoming') return endDate >= now;
        return endDate < now;
      })
      .filter((e) => sourceFilter === 'all' || e.source === sourceFilter)
      .filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (filter === 'upcoming') return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
      });
  }, [events, filter, sourceFilter, search, selectedOrgContext]);

  const showOrgSwitcher = allOrgs.length > 0;

  const selectedOrgLabel = useMemo(() => {
    if (selectedOrgContext === 'all') return pt ? 'Todos' : 'All';
    if (selectedOrgContext === 'solo') return 'Solo';
    const org = allOrgs.find(o => o.id === selectedOrgContext);
    return org?.name || '';
  }, [selectedOrgContext, allOrgs, pt]);

  const selectedOrgLogo = useMemo(() => {
    if (selectedOrgContext === 'all' || selectedOrgContext === 'solo') return null;
    return allOrgs.find(o => o.id === selectedOrgContext)?.logo_url || null;
  }, [selectedOrgContext, allOrgs]);


  const getStatusBadge = (event: EventWithStats) => {
    const eventDate = new Date(event.event_date);
    const endDate = event.end_date ? new Date(event.end_date) : eventDate;
    if (now >= eventDate && now <= endDate) return { label: pt ? 'Ao Vivo' : 'Live', color: 'bg-green-500/20 text-green-300' };
    if (endDate < now) return { label: pt ? 'Encerrado' : 'Closed', color: 'bg-white/5 text-white/40' };
    return { label: pt ? 'Próximo' : 'Upcoming', color: 'bg-purple-500/20 text-purple-300' };
  };

  const getSourceLabel = (source: EventSource) => {
    switch (source) {
      case 'personal': return { label: pt ? 'Meu' : 'Mine', icon: User, color: 'bg-blue-500/20 text-blue-300' };
      case 'organization': return { label: pt ? 'Organização' : 'Organization', icon: Building2, color: 'bg-amber-500/20 text-amber-300' };
      case 'co-organizer': return { label: pt ? 'Co-organizador' : 'Co-organizer', icon: UsersRound, color: 'bg-emerald-500/20 text-emerald-300' };
    }
  };

  const sourceFilterOptions: { key: SourceFilter; label: string; icon: any }[] = [
    { key: 'all', label: pt ? 'Todos' : 'All', icon: Calendar },
    { key: 'personal', label: pt ? 'Meus' : 'Mine', icon: User },
    ...(isOrgAdmin && availableSources.has('organization') ? [{ key: 'organization' as SourceFilter, label: pt ? 'Organização' : 'Organization', icon: Building2 }] : []),
    ...(availableSources.has('co-organizer') ? [{ key: 'co-organizer' as SourceFilter, label: pt ? 'Co-org' : 'Co-org', icon: UsersRound }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: theme.pageBg }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: theme.headerBg, borderColor: theme.cardBorder }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-[140px] sm:w-[180px]">
            <ModeSwitcher />
          </div>

          {/* Org Switcher */}
          {showOrgSwitcher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {selectedOrgLogo ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={selectedOrgLogo} />
                      <AvatarFallback className="text-[9px] bg-white/10" style={{ color: theme.textMuted }}>
                        {selectedOrgLabel.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {selectedOrgContext === 'solo' ? (
                        <User className="h-3 w-3" style={{ color: theme.textMuted }} />
                      ) : (
                        <Calendar className="h-3 w-3" style={{ color: theme.textMuted }} />
                      )}
                    </div>
                  )}
                  <span className="text-xs font-medium hidden sm:block max-w-[100px] truncate" style={{ color: theme.textPrimary }}>
                    {selectedOrgLabel}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0" style={{ color: theme.textMuted }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-slate-900 border-white/10">
                <DropdownMenuItem
                  onClick={() => setSelectedOrgContext('all')}
                  className={cn("text-sm cursor-pointer gap-2", selectedOrgContext === 'all' ? 'text-white bg-white/10' : 'text-white/60')}
                >
                  <Calendar className="h-4 w-4" />
                  {pt ? 'Todos os eventos' : 'All events'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedOrgContext('solo')}
                  className={cn("text-sm cursor-pointer gap-2", selectedOrgContext === 'solo' ? 'text-white bg-white/10' : 'text-white/60')}
                >
                  <User className="h-4 w-4" />
                  Solo
                </DropdownMenuItem>
                {allOrgs.map(org => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setSelectedOrgContext(org.id)}
                    className={cn("text-sm cursor-pointer gap-2", selectedOrgContext === org.id ? 'text-white bg-white/10' : 'text-white/60')}
                  >
                    <Avatar className="h-4 w-4">
                      {org.logo_url && <AvatarImage src={org.logo_url} />}
                      <AvatarFallback className="text-[8px] bg-white/10">{org.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{org.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex-1" />
          <h1 className="hidden sm:block text-lg font-semibold" style={{ color: theme.textPrimary }}>
            {pt ? 'Meus Eventos' : 'My Events'}
          </h1>
          <div className="flex-1 hidden sm:block" />
          <Button
            onClick={() => navigate('/events/create')}
            size="sm"
            className="gap-2 rounded-full text-xs font-medium"
            style={{ background: theme.ctaBg, color: theme.ctaText }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{pt ? 'Criar' : 'Create'}</span>
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Plan Card — hidden in solo context */}
        {selectedOrgContext !== 'solo' && (
          <div
            className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" style={{ color: theme.accentDot }} />
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {pt ? 'Plano' : 'Plan'} {planInfo.label}
                </span>
                <button
                  onClick={() => setShowPricingPopup(true)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors"
                  style={{ color: theme.accentDot, background: 'rgba(255,255,255,0.05)' }}
                >
                  Upgrade
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]" style={{ color: theme.textMuted }}>
                  <span>{pt ? 'Equipa' : 'Staff'}: {staffCount} / {planInfo.maxStaff === -1 ? '∞' : planInfo.maxStaff}</span>
                  <span>{pt ? 'Limite participantes' : 'Participant limit'}: {planInfo.maxParticipants}</span>
                </div>
                <Progress
                  value={planInfo.maxStaff === -1 ? 10 : (staffCount / planInfo.maxStaff) * 100}
                  className="h-1.5 bg-white/5"
                  indicatorClassName="rounded-full"
                  style={{ '--tw-bg-opacity': 1 } as any}
                />
              </div>
            </div>
          </div>
        )}

        {/* Aggregated Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: pt ? 'Eventos' : 'Events', value: metrics.totalEvents, icon: Calendar },
            { label: pt ? 'Participantes' : 'Participants', value: metrics.totalParticipants, icon: Users },
            { label: pt ? 'Visualizações' : 'Views', value: metrics.totalViews, icon: Eye },
            { label: pt ? 'Conexões' : 'Connections', value: metrics.totalConnections, icon: Link2 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-3 space-y-1"
              style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            >
              <stat.icon className="h-3.5 w-3.5" style={{ color: theme.textMuted }} />
              <p className="text-xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
                {loading ? '—' : stat.value.toLocaleString()}
              </p>
              <p className="text-[11px]" style={{ color: theme.textMuted }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Team Overview Card — hidden in solo context */}
        {selectedOrgContext !== 'solo' && (
          <div
            className="rounded-2xl p-4 space-y-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            onClick={() => navigate('/events/team')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: theme.textMuted }} />
                <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                  {pt ? 'Equipa' : 'Team'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: theme.textMuted }}>
                  {staffCount} {pt ? 'membros' : 'members'}
                </span>
                <ArrowUpRight className="h-4 w-4" style={{ color: theme.textMuted }} />
              </div>
            </div>
            <p className="text-[11px]" style={{ color: theme.textMuted }}>
              {pt ? 'Gerir equipa, convites e permissões dos co-organizadores.' : 'Manage team, invites and co-organizer permissions.'}
            </p>
          </div>
        )}

        {/* Filters + Source Tabs + Search */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['upcoming', 'past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                    filter === f ? "shadow-sm" : ""
                  )}
                  style={{
                    background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: filter === f ? theme.textPrimary : theme.textMuted,
                  }}
                >
                  {f === 'upcoming' ? (pt ? 'Próximos' : 'Upcoming') : (pt ? 'Passados' : 'Past')}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: theme.textMuted }} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={pt ? 'Pesquisar...' : 'Search...'}
                className="pl-9 h-9 text-sm rounded-xl border-0"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: theme.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Source filter tabs */}
          {sourceFilterOptions.length > 2 && (
            <div className="flex gap-1.5 flex-wrap">
              {sourceFilterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSourceFilter(opt.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all",
                  )}
                  style={{
                    background: sourceFilter === opt.key ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    color: sourceFilter === opt.key ? theme.textPrimary : theme.textMuted,
                  }}
                >
                  <opt.icon className="h-3 w-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Calendar className="h-8 w-8" style={{ color: theme.textMuted }} />
            </div>
            <p style={{ color: theme.textMuted }}>
              {filter === 'upcoming'
                ? (pt ? 'Nenhum evento próximo' : 'No upcoming events')
                : (pt ? 'Nenhum evento passado' : 'No past events')}
            </p>
            {filter === 'upcoming' && (
              <Button
                onClick={() => navigate('/events/create')}
                className="rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: theme.textPrimary }}
              >
                {pt ? 'Criar o primeiro evento' : 'Create your first event'}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => {
              const eventDate = new Date(event.event_date);
              const endDate = event.end_date ? new Date(event.end_date) : eventDate;
              const isPast = endDate < now;
              const status = getStatusBadge(event);
              const sourceInfo = getSourceLabel(event.source);

              return (
                <button
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}/dashboard`)}
                  className={cn(
                    "group text-left rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
                    isPast && "opacity-50"
                  )}
                  style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                >
                  {/* Image */}
                  <div className="aspect-[16/9] relative overflow-hidden">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full" style={{ background: theme.coverGradient }}>
                        <Calendar className="h-10 w-10" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xl", status.color)}>
                        {status.label}
                      </span>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xl", sourceInfo.color)}>
                        {sourceInfo.label}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xl bg-black/30 text-white/70">
                        {event.access_type === 'invite_only' ? (pt ? 'Convite' : 'Invite') : (pt ? 'Público' : 'Public')}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 space-y-2">
                    <p className="text-[11px] font-medium" style={{ color: theme.accentDot }}>
                      {format(eventDate, 'MMM dd, yyyy · HH:mm')}
                    </p>
                    <h3 className="font-semibold text-sm line-clamp-2 transition-colors" style={{ color: theme.textPrimary }}>
                      {event.title}
                    </h3>

                    {(event.city || event.location) && (
                      <p className="flex items-center gap-1 text-[11px]" style={{ color: theme.textMuted }}>
                        <MapPin className="h-3 w-3" />
                        {event.city || event.location}
                      </p>
                    )}

                    {/* Mini metrics */}
                    <div className="flex items-center gap-3 pt-1 border-t" style={{ borderColor: theme.cardBorder }}>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                        <Users className="h-3 w-3" /> {event.participantCount}
                      </span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                        <Eye className="h-3 w-3" /> {event.viewCount}
                      </span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                        <Link2 className="h-3 w-3" /> {event.connectionCount}
                      </span>
                      <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.textMuted }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <UpgradePricingPopup open={showPricingPopup} onOpenChange={setShowPricingPopup} segment="org" />
    </div>
  );
};

export default EventsHub;
