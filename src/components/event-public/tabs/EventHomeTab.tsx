import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Calendar, Bell, ChevronRight, Navigation, CalendarDays, ScanLine, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import EventTimeline from '../EventTimeline';
import EventAreas from '../EventAreas';
import EventQRMetrics from '../EventQRMetrics';
import QRScannerDialog from '../QRScannerDialog';
import EventMessenger from '../messenger/EventMessenger';

interface EventHomeTabProps {
  event: any;
  publicContent: {
    timeline: any[];
    areas: any[];
    map: any;
    customSections: any[];
  };
  participantId?: string;
  onNavigateToProgram?: () => void;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: 'info' | 'warning' | 'urgent';
}

const EventHomeTab = ({ event, publicContent, participantId, onNavigateToProgram }: EventHomeTabProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatReceiverId, setChatReceiverId] = useState<string | undefined>();
  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isEventOver = (endDate || eventDate) < new Date();

  // Generate QR code URL pointing to user's public profile page
  const personalQRUrl = profile?.slug
    ? `${window.location.origin}/u/${profile.slug}`
    : '';

  // Load real announcements from event_announcements table
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('event_announcements')
        .select('id, title, message, created_at')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setAnnouncements(data.map(a => ({ ...a, type: 'info' as const })));
      }
    };
    fetchAnnouncements();
  }, [event.id]);

  const handleGetDirections = () => {
    if (event.location) {
      const encodedLocation = encodeURIComponent(event.location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
    }
  };

  const handleMySchedule = () => {
    if (onNavigateToProgram) {
      onNavigateToProgram();
    }
  };

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-destructive bg-destructive/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-primary bg-primary/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Post-event Recap CTA */}
      {isEventOver && user && participantId && (
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">O evento terminou!</p>
              <p className="text-xs text-muted-foreground">Vê o teu recap e partilha os teus resultados</p>
            </div>
            <Button size="sm" onClick={() => navigate(`/events/${event.id}/recap`)}>
              Ver Recap
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Event Hero Card */}
      <Card className="overflow-hidden">
        {event.image_url && (
          <div className="aspect-[21/9] overflow-hidden bg-muted">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {event.category && <Badge variant="outline">{event.category}</Badge>}
            {event.event_type && <Badge variant="secondary">{event.event_type}</Badge>}
          </div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          {event.description && (
            <p className="text-muted-foreground text-sm">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {format(eventDate, "d 'de' MMMM", { locale: pt })}
                {endDate && ` - ${format(endDate, "d 'de' MMMM", { locale: pt })}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal QR Code for Check-in */}
      {user && participantId && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="default" className="h-6">QR Code</Badge>
                Credencial
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG
                    value={personalQRUrl}
                    size={160}
                    level="H"
                    includeMargin
                  />
                </div>
                {/* Scan QR icon button */}
                <Button
                  variant="default"
                  size="icon"
                  className="absolute -bottom-3 -right-3 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 border-2 border-background"
                  onClick={() => setScannerOpen(true)}
                  aria-label="Scan QR Code"
                >
                  <ScanLine className="h-5 w-5 text-primary-foreground" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Apresente este QR Code e faz networking
              </p>
              <EventQRMetrics userId={user?.id} />
            </CardContent>
          </Card>
          <QRScannerDialog
            open={scannerOpen}
            onOpenChange={setScannerOpen}
            eventId={event.id}
            onOpenChat={(receiverId) => {
              setChatReceiverId(receiverId);
              setChatOpen(true);
            }}
          />
          <EventMessenger
            eventId={event.id}
            open={chatOpen}
            onOpenChange={setChatOpen}
            initialReceiverId={chatReceiverId}
            initialMessage={chatReceiverId ? undefined : undefined}
          />
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={handleGetDirections}
          disabled={!event.location}
        >
          <Navigation className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Como chegar</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={handleMySchedule}
        >
          <CalendarDays className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Minha Agenda</span>
        </Button>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Avisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-3 rounded-lg border ${getAnnouncementStyle(announcement.type)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {announcement.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(announcement.created_at), 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Program Preview */}
      {publicContent.timeline.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Programação</h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={handleMySchedule}>
              Ver tudo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <EventTimeline timeline={publicContent.timeline.slice(0, 1)} />
        </div>
      )}

      {/* Areas Preview */}
      {publicContent.areas.length > 0 && (
        <EventAreas areas={publicContent.areas} />
      )}
    </div>
  );
};

export default EventHomeTab;
