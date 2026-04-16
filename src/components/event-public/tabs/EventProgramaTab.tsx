import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, Star, Check, CalendarDays, Users, Map, ZoomIn, X } from 'lucide-react';
import SessionFeedback from '@/components/event-public/SessionFeedback';
import { format, isSameDay, isAfter, isBefore, parseISO, eachDayOfInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface Session {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  speakers?: string[];
  area_id?: string;
  date?: string;
  feedback_enabled?: boolean;
  session_index: number;
}

interface ScheduledMeeting {
  id: string;
  meeting_date: string;
  start_time: string;
  end_time: string | null;
  area_name: string | null;
  other_user_name: string;
  other_user_photo: string | null;
  other_user_headline: string | null;
  status: string;
}

interface EventProgramaTabProps {
  event: any;
  publicContent: {
    timeline: any[];
    areas: any[];
    map: any | null;
  };
}

const EventProgramaTab = ({ event, publicContent }: EventProgramaTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [localAreas, setLocalAreas] = useState<{id: string; name: string}[]>([]);

  const mapContent = publicContent.map?.content as Record<string, any> | null;
  const mapImageUrl = mapContent?.image_url;
  const mapCaption = mapContent?.caption;

  const eventStart = new Date(event.event_date);
  const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;
  
  const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });

  useEffect(() => {
    if (eventDays.length > 0 && !selectedDay) {
      setSelectedDay(format(eventDays[0], 'yyyy-MM-dd'));
    }

    const timelineItems = publicContent.timeline[0]?.content?.items || [];
    const mappedSessions: Session[] = timelineItems.map((item: any, index: number) => ({
      id: `session-${index}`,
      title: item.title,
      description: item.description,
      start_time: item.time,
      end_time: item.end_time,
      location: item.location,
      speakers: item.speakers,
      area_id: item.area_id,
      date: item.date,
      feedback_enabled: item.feedback_enabled || false,
      session_index: index,
    }));
    setSessions(mappedSessions);
    setLoading(false);

    if (user) {
      loadFavorites();
      loadScheduledMeetings();
    }
  }, [event.id, publicContent.timeline, user]);

  // Load areas independently to bypass RLS restrictions for non-participants
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data } = await supabase
          .from('event_areas')
          .select('id, name')
          .eq('event_id', event.id)
          .order('name');
        if (data) setLocalAreas(data);
      } catch (e) {
        // fallback to publicContent.areas
      }
    };
    fetchAreas();
  }, [event.id]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`event-favorites-${event.id}-${user.id}`);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadScheduledMeetings = async () => {
    if (!user) return;
    try {
      // Fetch meetings where user is sender or receiver
      const { data, error } = await supabase
        .from('event_scheduled_meetings')
        .select(`
          id, meeting_date, start_time, end_time, status, area_id,
          event_meeting_requests!inner(sender_id, receiver_id)
        `)
        .eq('event_id', event.id)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`, { referencedTable: 'event_meeting_requests' });

      if (error) throw error;
      if (!data || data.length === 0) return;

      // Get area names
      const areaIds = data.map((m: any) => m.area_id).filter(Boolean);
      let areasMap: Record<string, string> = {};
      if (areaIds.length > 0) {
        const { data: areasData } = await supabase
          .from('event_areas')
          .select('id, name')
          .in('id', areaIds);
        if (areasData) {
          areasMap = Object.fromEntries(areasData.map((a: any) => [a.id, a.name]));
        }
      }

      // Get other user profiles
      const otherUserIds = data.map((m: any) => {
        const req = m.event_meeting_requests;
        return req.sender_id === user.id ? req.receiver_id : req.sender_id;
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, headline')
        .in('id', otherUserIds);

      const profilesMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.id, p])
      );

      const mapped: ScheduledMeeting[] = data.map((m: any) => {
        const req = m.event_meeting_requests;
        const otherId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
        const otherProfile = profilesMap[otherId];
        return {
          id: m.id,
          meeting_date: m.meeting_date,
          start_time: m.start_time,
          end_time: m.end_time,
          area_name: m.area_id ? areasMap[m.area_id] || null : null,
          other_user_name: otherProfile?.name || 'Utilizador',
          other_user_photo: otherProfile?.photo_url || null,
          other_user_headline: otherProfile?.headline || null,
          status: m.status
        };
      });

      setMeetings(mapped);
    } catch (error) {
      console.error('Error loading scheduled meetings:', error);
    }
  };

  const toggleFavorite = (sessionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sessionId)) {
      newFavorites.delete(sessionId);
      toast({ title: 'Removido dos favoritos', description: 'Sessão removida da sua agenda' });
    } else {
      newFavorites.add(sessionId);
      toast({ title: 'Adicionado aos favoritos', description: 'Sessão adicionada à sua agenda' });
    }
    setFavorites(newFavorites);
    if (user) {
      localStorage.setItem(`event-favorites-${event.id}-${user.id}`, JSON.stringify([...newFavorites]));
    }
  };

  const getSessionStatus = (startTime: string, sessionDate?: string): 'finished' | 'now' | 'upcoming' => {
    const now = new Date();
    const dateStr = sessionDate || selectedDay;
    const [hours, minutes] = startTime.split(':').map(Number);

    let sessionTime: Date;
    if (dateStr) {
      sessionTime = new Date(`${dateStr}T${startTime.padStart(5, '0')}:00`);
    } else {
      sessionTime = new Date();
      sessionTime.setHours(hours, minutes, 0, 0);
    }

    if (now > sessionTime) {
      if (now < new Date(sessionTime.getTime() + 60 * 60 * 1000)) {
        return 'now';
      }
      return 'finished';
    }
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finished':
        return <Badge variant="secondary" className="text-xs">Finalizado</Badge>;
      case 'now':
        return <Badge variant="default" className="text-xs bg-green-600">A Decorrer</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="text-xs">Em breve</Badge>;
      default:
        return null;
    }
  };

  // Filter meetings for selected day
  const meetingsForDay = meetings.filter(m => m.meeting_date === selectedDay);

  return (
    <div className="space-y-6">
      {/* Day Tabs */}
      {eventDays.length > 1 && (
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {eventDays.map((day) => (
              <TabsTrigger
                key={format(day, 'yyyy-MM-dd')}
                value={format(day, 'yyyy-MM-dd')}
                className="flex-shrink-0"
              >
                {format(day, "EEE, d MMM", { locale: pt })}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* My Meetings Section */}
      {meetingsForDay.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Minhas Meetings
          </h2>
          <div className="space-y-2">
            {meetingsForDay
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((meeting) => {
                const timeStatus = getSessionStatus(meeting.start_time, meeting.meeting_date);
                return (
                  <Card
                    key={meeting.id}
                    className={`border-primary/20 bg-primary/5 transition-colors ${timeStatus === 'now' ? 'border-green-500 bg-green-500/5' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {meeting.other_user_photo ? (
                          <img
                            src={meeting.other_user_photo}
                            alt={meeting.other_user_name}
                            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{meeting.other_user_name}</span>
                            {getStatusBadge(timeStatus)}
                          </div>
                          {meeting.other_user_headline && (
                            <p className="text-xs text-muted-foreground truncate">{meeting.other_user_headline}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meeting.start_time.slice(0, 5)}{meeting.end_time ? ` - ${meeting.end_time.slice(0, 5)}` : ''}
                            </span>
                            {meeting.area_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {meeting.area_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Programação</h2>
        
        {(() => {
          const filteredSessions = sessions.filter(s => {
            if (!s.date) return true;
            return s.date === selectedDay;
          });
          return filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma sessão programada para este dia
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const status = getSessionStatus(session.start_time, session.date || selectedDay);
              const isFavorite = favorites.has(session.id);
              
              const areas = localAreas.length > 0 ? localAreas : publicContent.areas;
              const areaName = session.area_id
                ? areas.find((a: any) => a.id === session.area_id)?.name || session.location
                : session.location;

              return (
                <Card
                  key={session.id}
                  className={`transition-colors ${status === 'now' ? 'border-green-500 bg-green-500/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            {session.start_time}{session.end_time ? ` – ${session.end_time}` : ''}
                          </div>
                          {getStatusBadge(status)}
                        </div>
                        
                        <h3 className="font-semibold">{session.title}</h3>
                        
                        {session.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {session.speakers && session.speakers.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {session.speakers.join(', ')}
                            </div>
                          )}
                          {areaName && (
                            <Badge variant="secondary" className="text-xs gap-1 py-0.5">
                              <MapPin className="h-3 w-3" />
                              {areaName}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant={isFavorite ? 'default' : 'outline'}
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => toggleFavorite(session.id)}
                      >
                        {isFavorite ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {status === 'finished' && session.feedback_enabled && (
                      <SessionFeedback
                        eventId={event.id}
                        sessionIndex={session.session_index}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
        })()}
      </div>

      {/* Areas & Map Section — moved to bottom */}
      {(publicContent.areas.length > 0 || mapImageUrl) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Áreas do Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publicContent.areas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {publicContent.areas.map((area: any) => (
                  <Badge key={area.id} variant="outline" className="py-1.5 px-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {area.name}
                  </Badge>
                ))}
              </div>
            )}

            {mapImageUrl && (
              <>
                <button
                  onClick={() => setMapOpen(true)}
                  className="relative w-full rounded-lg overflow-hidden border border-border group cursor-zoom-in"
                >
                  <img
                    src={mapImageUrl}
                    alt={mapCaption || 'Mapa do evento'}
                    className="w-full h-auto max-h-48 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  {mapCaption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
                      <p className="text-xs text-white">{mapCaption}</p>
                    </div>
                  )}
                </button>

                <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                  <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-auto">
                    <DialogTitle className="sr-only">Mapa do Evento</DialogTitle>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full"
                        onClick={() => setMapOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <img
                        src={mapImageUrl}
                        alt={mapCaption || 'Mapa do evento'}
                        className="w-full h-auto"
                        style={{ touchAction: 'pinch-zoom' }}
                      />
                      {mapCaption && (
                        <p className="text-sm text-muted-foreground p-3 text-center">{mapCaption}</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventProgramaTab;
