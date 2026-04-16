import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const EVENT_TYPES = [
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'networking', label: 'Networking' },
  { value: 'job_fair', label: 'Job Fair' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'training', label: 'Training' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'expo', label: 'Expo/Exhibition' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Other' },
];

export const EventTypeSelect = ({ value, onChange }: EventTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="event-type">Event Type *</Label>
      <Select value={value} onValueChange={onChange} required>
        <SelectTrigger id="event-type">
          <SelectValue placeholder="Select event type" />
        </SelectTrigger>
        <SelectContent>
          {EVENT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
