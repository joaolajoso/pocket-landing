import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEventAreas } from '@/hooks/useEventAreas';
import { toast } from 'sonner';

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingRequestId: string;
  eventId: string;
  otherUserName?: string;
}

const ScheduleMeetingDialog = ({ open, onOpenChange, meetingRequestId, eventId, otherUserName }: ScheduleMeetingDialogProps) => {
  const { user } = useAuth();
  const { areas } = useEventAreas(eventId);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [areaId, setAreaId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSchedule = async () => {
    if (!user || !date || !startTime) {
      toast.error('Seleciona a data e hora de início');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('event_scheduled_meetings')
        .insert({
          meeting_request_id: meetingRequestId,
          event_id: eventId,
          scheduled_by: user.id,
          meeting_date: format(date, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime || null,
          area_id: areaId || null,
          status: 'proposed'
        });

      if (error) throw error;

      // Send a system-like message about the scheduled meeting
      const areaName = areas.find(a => a.id === areaId)?.name;
      const meetingInfo = `📅 Meeting marcada!\n📆 ${format(date, "d 'de' MMMM", { locale: pt })}\n⏰ ${startTime}${endTime ? ` - ${endTime}` : ''}${areaName ? `\n📍 ${areaName}` : ''}`;
      
      await supabase.from('event_messages').insert({
        meeting_request_id: meetingRequestId,
        sender_id: user.id,
        content: meetingInfo
      });

      toast.success('Meeting agendada com sucesso!');
      onOpenChange(false);
      setDate(undefined);
      setStartTime('');
      setEndTime('');
      setAreaId('');
    } catch (error: any) {
      console.error('Error scheduling meeting:', error);
      toast.error('Erro ao agendar meeting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Marcar Meeting
          </DialogTitle>
          {otherUserName && (
            <p className="text-sm text-muted-foreground">com {otherUserName}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "d 'de' MMMM, yyyy", { locale: pt }) : 'Escolher data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  locale={pt}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Início</Label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Fim (opcional)</Label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Area */}
          {areas.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Área do evento
              </Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar área (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button className="w-full" onClick={handleSchedule} disabled={saving || !date || !startTime}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            {saving ? 'A agendar...' : 'Confirmar Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetingDialog;
