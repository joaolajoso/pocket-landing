import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEventPublicData } from '@/hooks/useEventPublicData';
import { useEventPublicContent } from '@/hooks/useEventPublicContent';
import { useEventParticipation } from '@/hooks/useEventParticipation';
import { useEventFavorite } from '@/hooks/useEventFavorite';
import { useOrganizerFavorite } from '@/hooks/useOrganizerFavorite';
import { useEventMatchStats } from '@/hooks/useEventMatchStats';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Calendar, MapPin, Lock, Users, ArrowLeft, Ticket, ArrowRight,
  Clock, Heart, MoreHorizontal, Share2, Flag, Star, Mic, Coffee,
  Handshake, LogIn, ChevronLeft,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Helmet } from 'react-helmet';
import EventRegistrationForm from '@/components/event-landing/EventRegistrationForm';
import EventLoginForm from '@/components/event-landing/EventLoginForm';
import EventPaymentSection from '@/components/event-landing/EventPaymentSection';
import pocketcvLogoBlack from '@/assets/pocketcv-logo-black.png';

interface Participant {
  id: string;
  name: string;
  photo: string | null;
  company: string | null;
  role: string | null;
}

interface Stand {
  id: string;
  company_name: string | null;
  stand_name: string | null;
}

const EventLandingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  const { user, loading: authLoading } = useAuth();
  const { event, organization, paymentInfo, landingConfig, loading, error, isRestricted } = useEventPublicData(eventId || '');
  const publicContent = useEventPublicContent(eventId || '');
  const { isParticipating, loading: participationLoading } = useEventParticipation(eventId || '');
  const { isFavorite, toggleFavorite } = useEventFavorite(eventId || '');
  const { isFavorite: isOrgFavorite, toggleFavorite: toggleOrgFavorite } = useOrganizerFavorite(event?.organization_id || null);
  const isInternalEvent = event?.internal_event === true;
  const matchEventIds = useMemo(() => isInternalEvent && eventId ? [eventId] : [], [isInternalEvent, eventId]);
  const { stats: matchStats } = useEventMatchStats(matchEventIds);
  const currentMatchStats = eventId ? matchStats[eventId] : undefined;
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [stands, setStands] = useState<Stand[]>([]);

  // Fetch participants & stands
  useEffect(() => {
    if (!eventId) return;
    const fetchLandingExtras = async () => {
      const [participantsRes, standsRes] = await Promise.all([
        supabase
          .from('event_participants')
          .select('id, user_id, role')
          .eq('event_id', eventId)
          .eq('status', 'participating'),
        supabase
          .from('event_stands')
          .select('id, company_name, stand_name')
          .eq('event_id', eventId)
          .eq('is_active', true),
      ]);

      const parts = participantsRes.data || [];
      setParticipantCount(parts.length);

      if (parts.length > 0) {
        const userIds = parts.slice(0, 8).map(p => p.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, full_name, avatar_url, headline')
          .in('id', userIds);

        if (profiles) {
          setParticipants(profiles.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || 'Participante',
            photo: p.avatar_url,
            company: null,
            role: p.headline,
          })));
        }
      }
      setStands(standsRes.data || []);
    };
    fetchLandingExtras();
  }, [eventId]);

  const handleParticipate = async () => {
    if (!user) return;
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const response = await fetch(
        `https://xhcqhmbhivxbwnoifcoc.supabase.co/functions/v1/join-event`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId, invitationCode: inviteCode }),
        }
      );
      if (!response.ok) throw new Error('Failed to join');
      setJustJoined(true);
      toast({ title: "Inscrição confirmada!", description: "Agora és participante deste evento." });
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível inscrever-se no evento.", variant: "destructive" });
    }
  };

  const handleLoginSuccess = () => { window.location.reload(); };
  const handleRegistrationSuccess = () => {
    toast({ title: "Conta criada!", description: "Verifica o teu email para confirmar a conta e depois volta a esta página." });
  };

  const shouldShowGoToEvent = justJoined || (user && isParticipating && !participationLoading);

  // Auto-redirect participants
  useEffect(() => {
    if (!authLoading && !participationLoading && user && isParticipating && eventId) {
      navigate(`/events/${eventId}/app`, { replace: true });
    }
  }, [authLoading, participationLoading, user, isParticipating, eventId, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: displayName || 'Evento', url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado!' });
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-72 w-full" />
        <div className="flex justify-center -mt-10">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-2xl font-bold">Evento não encontrado</h2>
          <p className="text-muted-foreground">O link pode estar incorreto ou o evento já não está disponível.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  // Resolve display values
  const displayLogo = landingConfig?.logo_url || organization?.logo_url;
  const displayName = landingConfig?.event_name || event?.title;
  const displayDescription = landingConfig?.description || event?.description;
  const eventDate = event ? new Date(event.event_date) : null;
  const endDate = event?.end_date ? new Date(event.end_date) : null;

  // Restricted invite-only (no event data)
  if (isRestricted && !event) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>Evento por Convite | PocketCV Events</title></Helmet>
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={pocketcvLogoBlack} alt="PocketCV" className="h-8 dark:hidden" />
            <img src="/lovable-uploads/pocketcv-logo-white.png" alt="PocketCV" className="h-8 hidden dark:block" />
          </div>
          <div className="text-center space-y-4 mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Foste convidado para um evento</h1>
            <p className="text-muted-foreground">Entra na tua conta ou cria uma nova para aceder ao evento.</p>
            <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />Evento por convite</Badge>
          </div>
          <div className="space-y-6">
            {user ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">Não tens permissão para aceder a este evento.</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline">Ir para o Dashboard</Button>
              </div>
            ) : showRegister ? (
              <EventRegistrationForm eventId={eventId || ''} onSuccess={handleRegistrationSuccess} onBackToLogin={() => setShowRegister(false)} />
            ) : (
              <EventLoginForm onSuccess={handleLoginSuccess} onRegister={() => setShowRegister(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Parse timeline items
  const timelineItems = publicContent.timeline.flatMap((t: any) => {
    const content = t.content;
    if (Array.isArray(content)) return content;
    if (content?.sessions) return content.sessions;
    return [];
  }).slice(0, 6);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'talk': return <Mic className="w-4 h-4" />;
      case 'workshop': return <Users className="w-4 h-4" />;
      case 'networking': return <Handshake className="w-4 h-4" />;
      case 'break': return <Coffee className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <Helmet>
        <title>{displayName || 'Evento'} | PocketCV Events</title>
        <meta name="description" content={displayDescription || 'Página do evento'} />
      </Helmet>

      {/* ── Hero Image ── */}
      <div className="relative h-64 sm:h-80">
        {event?.image_url ? (
          <img src={event.image_url} alt={displayName || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/15 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/20" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            >
              <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />Partilhar evento
                </DropdownMenuItem>
                {event?.organization_id && (
                  <DropdownMenuItem onClick={toggleOrgFavorite} className="gap-2">
                    <Star className={`h-4 w-4 ${isOrgFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    {isOrgFavorite ? 'Remover organizador' : 'Seguir organizador'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="gap-2 text-muted-foreground">
                  <Flag className="h-4 w-4" />Reportar evento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Organizer Avatar (overlapping hero) ── */}
      <div className="flex justify-center -mt-12 relative z-10">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary shadow-xl">
            <AvatarImage src={displayLogo || organization?.logo_url || undefined} alt={organization?.name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {(organization?.name || event?.organization || displayName || 'E').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
        </div>
      </div>

      {/* ── Event Info ── */}
      <div className="px-4 pt-4 pb-2 text-center max-w-lg mx-auto">
        {/* Org name */}
        {(organization?.name || event?.organization) && (
          <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">
            {organization?.name || event?.organization}
          </p>
        )}

        <h1 className="text-2xl font-bold mb-2">{displayName}</h1>

        {displayDescription && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{displayDescription}</p>
        )}

        {/* Participant avatars row */}
        {participants.length > 0 && (
          <div className="flex items-center justify-center gap-1 mb-4">
            <div className="flex -space-x-2">
              {participants.slice(0, 5).map((p) => (
                <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={p.photo || undefined} alt={p.name} />
                  <AvatarFallback className="text-xs bg-muted">{p.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {participantCount > 5 && (
              <span className="text-xs text-muted-foreground ml-2 font-medium">+{participantCount - 5}</span>
            )}
          </div>
        )}

        {/* Networking Match Insight */}
        {isInternalEvent && user && currentMatchStats && currentMatchStats.goodMatches > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
              <span className="text-sm">🎯</span>
              <span className="text-xs font-medium text-primary">
                {currentMatchStats.goodMatches} {currentMatchStats.goodMatches === 1 ? 'pessoa combina' : 'pessoas combinam'} com o teu perfil
              </span>
            </div>
          </div>
        )}
        {isInternalEvent && user && currentMatchStats && (currentMatchStats.topRoles.length > 0 || currentMatchStats.topIndustries.length > 0) && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-2">
            {[...currentMatchStats.topRoles.slice(0, 2), ...currentMatchStats.topIndustries.slice(0, 2)].map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Meta info line */}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
          {event?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
          {eventDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(eventDate, "d MMM", { locale: pt })}
            </span>
          )}
          {eventDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(eventDate, 'HH:mm')}
              {endDate && ` - ${format(endDate, 'HH:mm')}`}
            </span>
          )}
          {event?.access_type === 'invite_only' && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 gap-0.5">
              <Lock className="h-2.5 w-2.5" />Convite
            </Badge>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="px-4 max-w-lg mx-auto mt-4">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide border-b border-border bg-transparent p-0 h-auto gap-0">
            <TabsTrigger value="about" className="text-xs px-3 py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent -mb-px">
              Sobre
            </TabsTrigger>
            {timelineItems.length > 0 && (
              <TabsTrigger value="schedule" className="text-xs px-3 py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent -mb-px">
                Programa
              </TabsTrigger>
            )}
            {stands.length > 0 && (
              <TabsTrigger value="companies" className="text-xs px-3 py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent -mb-px">
                Empresas
              </TabsTrigger>
            )}
            <TabsTrigger value="participants" className="text-xs px-3 py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent -mb-px">
              Participantes
            </TabsTrigger>
            <TabsTrigger value="join" className="text-xs px-3 py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent -mb-px">
              Inscrição
            </TabsTrigger>
          </TabsList>

          {/* ── About Tab ── */}
          <TabsContent value="about" className="pt-4 space-y-6">
            {displayDescription && (
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">{displayDescription}</p>
              </div>
            )}

            {/* Networking promo */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <img src={pocketcvLogoBlack} alt="PocketCV" className="h-5 dark:hidden" />
                  <img src="/lovable-uploads/pocketcv-logo-white.png" alt="PocketCV" className="h-5 hidden dark:block" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Networking antes do evento</h3>
                <p className="text-xs text-muted-foreground mb-4">Conecte-se agora. Chegue preparado.</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: '✨', label: 'Matches' },
                    { icon: '📅', label: 'Agenda' },
                    { icon: '💬', label: 'Chat' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="p-2 rounded-xl bg-background/60 backdrop-blur-sm">
                      <span className="text-lg">{icon}</span>
                      <p className="text-[10px] font-medium mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Areas */}
            {publicContent.areas.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Áreas de Interesse</h3>
                <div className="flex flex-wrap gap-2">
                  {publicContent.areas.map((area: any) => (
                    <Badge key={area.id} variant="secondary" className="text-xs px-3 py-1">{area.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Event details card */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              {eventDate && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{format(eventDate, "EEEE, d 'de' MMMM", { locale: pt })}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(eventDate, 'HH:mm')}
                      {endDate && ` - ${format(endDate, 'HH:mm')}`}
                    </p>
                  </div>
                </div>
              )}
              {event?.location && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{event.location}</p>
                </div>
              )}
              {participantCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{participantCount} inscritos</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Schedule Tab ── */}
          {timelineItems.length > 0 && (
            <TabsContent value="schedule" className="pt-4 space-y-3">
              {timelineItems.map((session: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    session.type === 'networking' ? 'bg-primary/5 border-primary/20' : 'bg-card'
                  }`}
                >
                  <div className="flex flex-col items-center text-xs min-w-[44px] pt-0.5">
                    <span className="font-semibold">{session.startTime || session.time || ''}</span>
                    {session.endTime && <span className="text-muted-foreground">{session.endTime}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getSessionIcon(session.type || 'default')}
                      <h4 className="font-medium text-sm truncate">{session.title || session.name || ''}</h4>
                    </div>
                    {session.location && (
                      <p className="text-xs text-muted-foreground mt-1">{session.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          )}

          {/* ── Companies Tab ── */}
          {stands.length > 0 && (
            <TabsContent value="companies" className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {stands.map((stand) => (
                  <div
                    key={stand.id}
                    className="h-16 rounded-xl bg-card border flex items-center justify-center text-sm font-medium px-3 text-center"
                  >
                    {stand.company_name || stand.stand_name || 'Stand'}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {stands.length} empresa{stands.length !== 1 ? 's' : ''} confirmada{stands.length !== 1 ? 's' : ''}
              </p>
            </TabsContent>
          )}

          {/* ── Participants Tab ── */}
          <TabsContent value="participants" className="pt-4">
            {participants.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {participants.map((p) => (
                    <div key={p.id} className="text-center">
                      <Avatar className="w-14 h-14 mx-auto ring-2 ring-background shadow-md">
                        <AvatarImage src={p.photo || undefined} alt={p.name} className="blur-[2px] opacity-80" />
                        <AvatarFallback className="blur-sm text-sm">{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-xs truncate mt-1.5">{p.name.split(' ')[0]}</p>
                      {p.role && <p className="text-[10px] text-muted-foreground truncate">{p.role}</p>}
                    </div>
                  ))}
                </div>
                {participantCount > participants.length && (
                  <p className="text-center text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">+{participantCount - participants.length}</span> participantes
                  </p>
                )}
                <p className="text-center text-[10px] text-muted-foreground">
                  Registe-se para ver os perfis completos
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Ainda sem participantes inscritos.</p>
            )}
          </TabsContent>

          {/* ── Join Tab ── */}
          <TabsContent value="join" className="pt-4">
            <div className="space-y-4">
              {user ? (
                <>
                  {participationLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : shouldShowGoToEvent ? (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                      <p className="font-semibold">Já estás inscrito!</p>
                      <Button onClick={() => navigate(`/events/${eventId}/app`)} size="lg" className="w-full gap-2">
                        Ir para o Evento <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleParticipate} size="lg" className="w-full gap-2">
                      Participar no Evento <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                  <EventPaymentSection paymentInfo={paymentInfo} event={event || undefined} landingConfig={landingConfig} />
                </>
              ) : showRegister ? (
                <>
                  <EventRegistrationForm eventId={eventId || ''} onSuccess={handleRegistrationSuccess} onBackToLogin={() => setShowRegister(false)} />
                  <EventPaymentSection paymentInfo={paymentInfo} event={event || undefined} landingConfig={landingConfig} />
                </>
              ) : (
                <>
                  <EventLoginForm onSuccess={handleLoginSuccess} onRegister={() => setShowRegister(true)} />
                  <EventPaymentSection paymentInfo={paymentInfo} event={event || undefined} landingConfig={landingConfig} />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
        <button
          onClick={handleShare}
          className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 hover:bg-muted/80 transition-colors"
        >
          <Share2 className="h-5 w-5 text-muted-foreground" />
        </button>

        {user ? (
          shouldShowGoToEvent ? (
            <Button onClick={() => navigate(`/events/${eventId}/app`)} size="lg" className="flex-1 h-12 gap-2 text-base font-semibold">
              Ir para o Evento <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button onClick={handleParticipate} size="lg" className="flex-1 h-12 gap-2 text-base font-semibold">
              Participar <ArrowRight className="w-5 h-5" />
            </Button>
          )
        ) : (
          <Button
            onClick={() => {
              const el = document.querySelector('[data-value="join"]');
              el?.scrollIntoView({ behavior: 'smooth' });
              (el as HTMLElement)?.click();
            }}
            size="lg" className="flex-1 h-12 gap-2 text-base font-semibold"
          >
            <LogIn className="w-5 h-5" /> Entrar e Participar
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 mt-8">
        <p className="text-[10px] text-muted-foreground">
          Powered by <a href="https://pocketcv.pt" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">PocketCV</a>
        </p>
      </div>
    </div>
  );
};

export default EventLandingPage;
