import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EventDashboardTab from '@/components/dashboard/tabs/events/EventDashboardTab';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const EventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        let access = false;

        if (eventData.created_by === user.id) {
          access = true;
        }

        if (!access && eventData.organization_id) {
          const { data: memberData } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', eventData.organization_id)
            .eq('user_id', user.id)
            .single();

          if (memberData && ['owner', 'admin'].includes(memberData.role)) {
            access = true;
          }
        }

        if (!access) {
          const { data: participantData } = await supabase
            .from('event_participants')
            .select('role')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .eq('role', 'organizer')
            .maybeSingle();

          if (participantData) {
            access = true;
          }
        }

        setHasAccess(access);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'hsl(240, 20%, 7%)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!event || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(240, 20%, 7%)' }}>
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
            <ShieldX className="h-8 w-8 text-white/30" />
          </div>
          <h2 className="text-xl font-semibold text-white">Acesso Negado</h2>
          <p className="text-sm text-white/40">
            Você não tem permissão para acessar este painel de eventos.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(240, 20%, 7%)' }}>
      <EventDashboardTab eventId={eventId!} eventTitle={event.title} event={event} />
    </div>
  );
};

export default EventDashboard;
