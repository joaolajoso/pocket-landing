import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown } from 'lucide-react';

interface EventAreasProps {
  areas: any[];
}

const INITIAL_VISIBLE = 3;

const EventAreas = ({ areas }: EventAreasProps) => {
  const [expanded, setExpanded] = useState(false);

  if (areas.length === 0) return null;

  const visibleAreas = expanded ? areas : areas.slice(0, INITIAL_VISIBLE);
  const hasMore = areas.length > INITIAL_VISIBLE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Áreas do Evento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleAreas.map((area) => (
            <div
              key={area.id}
              className="p-4 rounded-lg border bg-card hover:border-primary transition-colors"
            >
              <h3 className="font-semibold mb-1">{area.name}</h3>
              {area.description && (
                <p className="text-sm text-muted-foreground">{area.description}</p>
              )}
            </div>
          ))}
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4 text-xs text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ver menos' : `Ver mais (${areas.length - INITIAL_VISIBLE})`}
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventAreas;
