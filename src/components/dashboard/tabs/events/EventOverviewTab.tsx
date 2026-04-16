import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventPublicPageTab } from './EventPublicPageTab';
import { EventAnnouncementsSection } from './EventAnnouncementsSection';

interface EventOverviewTabProps {
  event: any;
}

export const EventOverviewTab = ({ event }: EventOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="bg-white/[0.03] border border-white/[0.08] p-1 rounded-lg">
          <TabsTrigger
            value="announcements"
            className="rounded-md data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 text-sm"
          >
            Avisos
          </TabsTrigger>
          <TabsTrigger
            value="public"
            className="rounded-md data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 text-sm"
          >
            Página Pública
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          <EventAnnouncementsSection eventId={event.id} />
        </TabsContent>

        <TabsContent value="public" className="mt-4">
          <EventPublicPageTab eventId={event.id} event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
};