import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EventTabNavigation from '@/components/event-public/EventTabNavigation';
import EventHeader from '@/components/event-public/EventHeader';
import { useEventPublicContent } from '@/hooks/useEventPublicContent';
import { Helmet } from 'react-helmet';
import EventMessenger from '@/components/event-public/messenger/EventMessenger';
import { useEventMessenger } from '@/hooks/network/useEventMessenger';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import MobileBottomDock from '@/components/shared/MobileBottomDock';

const EventPublicPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [participantId, setParticipantId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const publicContent = useEventPublicContent(eventId || '');
  const [showMessenger, setShowMessenger] = useState(false);
  const { totalUnread } = useEventMessenger(eventId || '');
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [showParticipantSheet, setShowParticipantSheet] = useState(false);

  // Fetch event participants with profiles
  useEffect(() => {
    if (!eventId || !isParticipant) return;
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'active')
        .limit(30);
      
      if (!data || data.length === 0) return;
      
      const userIds = data.map(p => p.user_id).filter(id => id !== user?.id);
      if (userIds.length === 0) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, avatar_url, headline, slug, linkedin')
        .in('id', userIds);
      
      setParticipants(profiles || []);
    };
    fetchParticipants();
  }, [eventId, isParticipant, user?.id]);

  // Fetch user slug for public page link
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('slug').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.slug) setUserSlug(data.slug); });
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setIsParticipant(false);
        setLoading(false);
        return;
      }

      try {
        // Run event fetch and participant check in PARALLEL
        const eventPromise = (async () => {
          const { data: eventData } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .maybeSingle();

          if (eventData) return eventData;

          // Fallback to edge function
          try {
            const response = await fetch(
              `https://xhcqhmbhivxbwnoifcoc.supabase.co/functions/v1/get-event-public?eventId=${eventId}`,
              {
                headers: {
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo',
                  'Content-Type': 'application/json',
                },
              }
            );
            if (response.ok) {
              const result = await response.json();
              return result.event;
            }
          } catch (fnErr) {
            console.error('Edge function fallback failed:', fnErr);
          }
          return null;
        })();

        const participantPromise = (async () => {
          if (!user) return null;
          const { data: participant } = await supabase
            .from('event_participants')
            .select('id, role')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .maybeSingle();
          return participant;
        })();

        const [resolvedEvent, participant] = await Promise.all([eventPromise, participantPromise]);

        if (!resolvedEvent) throw new Error('Event not found');

        setEvent(resolvedEvent);

        if (user && participant) {
          setIsParticipant(true);
          setParticipantId(participant.id);
          setIsOrganizer(
            participant.role === 'organizer' || 
            participant.role === 'admin' ||
            resolvedEvent.created_by === user.id
          );
        } else {
          setIsParticipant(false);
          if (user && !participant) {
            setIsOrganizer(resolvedEvent.created_by === user.id);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setIsParticipant(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  if (loading || publicContent.loading || isParticipant === null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Evento não encontrado</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{event.title} | PocketCV Events</title>
        <meta name="description" content={event.description || `${event.title} - Event page`} />
      </Helmet>

      <div className="container mx-auto px-4 py-4 max-w-2xl">

        {/* Participant Avatars Row */}
        {isParticipant && participants.length > 0 && (
          <div className="mb-4 overflow-x-auto scrollbar-none -mx-4 px-4" data-no-swipe style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex items-center gap-3 pb-1">
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedParticipant(p); setShowParticipantSheet(true); }}
                  className="flex flex-col items-center gap-1 shrink-0 group"
                >
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-primary/60 to-primary/20">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={p.photo_url || p.avatar_url} />
                      <AvatarFallback className="text-xs bg-muted">
                        {(p.name || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors w-14 truncate text-center">
                    {(p.name || 'User').split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show header only for non-participants */}
        {!isParticipant && (
          <div className="mb-6">
            <EventHeader event={event} isParticipant={isParticipant} />
          </div>
        )}

        {/* Tab Navigation for participants */}
        {isParticipant ? (
          <EventTabNavigation
            event={event}
            isParticipant={isParticipant}
            isOrganizer={isOrganizer}
            publicContent={publicContent}
            participantId={participantId}
          />
        ) : (
          // Non-participant view - just show basic event info
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Participe do evento para aceder a todas as funcionalidades
            </p>
          </div>
        )}
      </div>

      {/* Participant Profile Sheet */}
      <Sheet open={showParticipantSheet} onOpenChange={setShowParticipantSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          {selectedParticipant && (
            <div className="flex flex-col items-center py-4 space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedParticipant.photo_url || selectedParticipant.avatar_url} />
                <AvatarFallback className="text-2xl bg-muted">
                  {(selectedParticipant.name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">{selectedParticipant.name || 'User'}</h3>
                {selectedParticipant.headline && (
                  <p className="text-sm text-muted-foreground">{selectedParticipant.headline}</p>
                )}
              </div>
              <div className="flex gap-2 w-full max-w-xs">
                {selectedParticipant.slug && (
                  <Button 
                    className="flex-1" 
                    onClick={() => { 
                      setShowParticipantSheet(false); 
                      navigate(`/u/${selectedParticipant.slug}`); 
                    }}
                  >
                    View Profile
                  </Button>
                )}
                {selectedParticipant.linkedin && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={selectedParticipant.linkedin} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Global Messenger */}
      {isParticipant && eventId && (
        <EventMessenger
          eventId={eventId}
          open={showMessenger}
          onOpenChange={setShowMessenger}
        />
      )}

      {/* Shared Bottom Navigation Dock */}
      <MobileBottomDock />
    </div>
  );
};

export default EventPublicPage;
