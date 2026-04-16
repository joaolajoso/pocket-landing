import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

interface TimelineItem {
  time: string;
  title: string;
  description?: string;
}

interface EventTimelineProps {
  timeline: any[];
}

const INITIAL_VISIBLE = 3;

const EventTimeline = ({ timeline }: EventTimelineProps) => {
  const [expanded, setExpanded] = useState(false);

  if (timeline.length === 0) return null;

  const items: TimelineItem[] = timeline[0]?.content?.items || [];

  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, INITIAL_VISIBLE);
  const hasMore = items.length > INITIAL_VISIBLE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {timeline[0]?.title || 'Programação do Evento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleItems.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                {index < visibleItems.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-primary">{item.time}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ver menos' : `Ver mais (${items.length - INITIAL_VISIBLE})`}
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventTimeline;
