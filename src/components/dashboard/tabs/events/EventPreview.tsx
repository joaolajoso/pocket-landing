import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface EventPreviewProps {
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  country?: string;
  city?: string;
  image_url?: string;
  event_type?: string;
  access_type: 'public' | 'invite_only';
}

export const EventPreview = ({
  title,
  description,
  event_date,
  end_date,
  location,
  country,
  city,
  image_url,
  event_type,
  access_type,
}: EventPreviewProps) => {
  // Build location display string
  const locationDisplay = [location, city, country].filter(Boolean).join(', ');
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Preview</h3>
      <Card className="overflow-hidden">
        {image_url && (
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={image_url}
              alt={title || 'Event preview'}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold line-clamp-2">
              {title || 'Event Title'}
            </h4>
            <Badge variant={access_type === 'public' ? 'default' : 'secondary'} className="shrink-0">
              {access_type === 'public' ? 'Public' : 'Invite Only'}
            </Badge>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            {event_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(event_date), 'PPp')}
                  {end_date && ` - ${format(new Date(end_date), 'PPp')}`}
                </span>
              </div>
            )}
            {locationDisplay && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{locationDisplay}</span>
              </div>
            )}
            {event_type && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="capitalize">{event_type.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
