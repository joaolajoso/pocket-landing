import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Ticket, BarChart3, Settings, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventParticipantsTab } from '@/components/dashboard/tabs/events/EventParticipantsTab';
import { EventInvitationsTab } from '@/components/dashboard/tabs/events/EventInvitationsTab';
import { EventOverviewTab } from '@/components/dashboard/tabs/events/EventOverviewTab';
import { EventAreasTab } from '@/components/dashboard/tabs/events/EventAreasTab';
import EventFeedbackTab from '@/components/dashboard/tabs/events/EventFeedbackTab';
import { Card, CardContent } from '@/components/ui/card';

interface EventManageTabProps {
  eventId: string;
}

const EventManageTab = ({ eventId }: EventManageTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event-manage', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Evento não encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-2 text-xs">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Resumo</span>
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex flex-col gap-1 py-2 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Participantes</span>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex flex-col gap-1 py-2 text-xs">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Convites</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex flex-col gap-1 py-2 text-xs">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="areas" className="flex flex-col gap-1 py-2 text-xs">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Áreas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <EventOverviewTab event={event} />
        </TabsContent>
        <TabsContent value="participants" className="mt-4">
          <EventParticipantsTab eventId={eventId} />
        </TabsContent>
        <TabsContent value="invitations" className="mt-4">
          <EventInvitationsTab eventId={eventId} />
        </TabsContent>
        <TabsContent value="feedback" className="mt-4">
          <EventFeedbackTab eventId={eventId} />
        </TabsContent>
        <TabsContent value="areas" className="mt-4">
          <EventAreasTab eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventManageTab;
