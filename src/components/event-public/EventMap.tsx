import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

interface EventMapProps {
  mapData: any;
}

const EventMap = ({ mapData }: EventMapProps) => {
  if (!mapData?.content?.image_url) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          {mapData.title || 'Mapa do Evento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border">
          <img
            src={mapData.content.image_url}
            alt={mapData.content.caption || 'Mapa do evento'}
            className="w-full h-auto"
          />
        </div>
        {mapData.content.caption && (
          <p className="text-sm text-muted-foreground mt-2">
            {mapData.content.caption}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EventMap;