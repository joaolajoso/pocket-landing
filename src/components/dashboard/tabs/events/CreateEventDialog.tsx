import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEventManagement } from '@/hooks/useEventManagement';
import { EventImageUpload } from './EventImageUpload';
import { EventTypeSelect } from './EventTypeSelect';
import { EventPreview } from './EventPreview';
import { InvitationQRCode } from './InvitationQRCode';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateEventDialog = ({ open, onOpenChange, onSuccess }: CreateEventDialogProps) => {
  const { createEvent, loading } = useEventManagement();
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    country: '',
    city: '',
    event_type: '',
    image_url: '',
    access_type: 'public' as 'public' | 'invite_only',
    // Invite-only payment fields
    logo_url_landing: '',
    show_payment: false,
    payment_amount: '',
    payment_deadline: '',
    payment_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createEvent({
        ...formData,
        internal_event: true,
        event_url: null,
      });
      
      if (formData.access_type === 'invite_only' && result?.id) {
        setCreatedEventId(result.id);
        // Generate an initial invitation code
        const code = Math.random().toString(36).substring(2, 15);
        setInvitationCode(code);
      } else {
        resetAndClose();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const resetAndClose = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      end_date: '',
      location: '',
      country: '',
      city: '',
      event_type: '',
      image_url: '',
      access_type: 'public',
      logo_url_landing: '',
      show_payment: false,
      payment_amount: '',
      payment_deadline: '',
      payment_url: '',
    });
    setCreatedEventId(null);
    setInvitationCode(null);
    onOpenChange(false);
    onSuccess?.();
  };

  // Show QR code after creating invite-only event
  if (createdEventId && invitationCode) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Event Created Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your invite-only event has been created. Share this QR code or link with participants:
            </p>
            
            <InvitationQRCode code={invitationCode} eventId={createdEventId} />

            <Button onClick={resetAndClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Tech Summit 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Describe your event..."
                  rows={4}
                />
              </div>

              <EventImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />

              <EventTypeSelect
                value={formData.event_type}
                onChange={(value) => setFormData({ ...formData, event_type: value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date & Time *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={formData.event_date ? new Date(formData.event_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const time = formData.event_date ? formData.event_date.split('T')[1] || '09:00' : '09:00';
                              setFormData({ ...formData, event_date: format(date, 'yyyy-MM-dd') + 'T' + time });
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <div className="flex gap-2">
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={formData.end_date ? new Date(formData.end_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const time = formData.end_date ? formData.end_date.split('T')[1] || '18:00' : '18:00';
                              setFormData({ ...formData, end_date: format(date, 'yyyy-MM-dd') + 'T' + time });
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Venue name or address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    placeholder="Portugal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    placeholder="Aveiro"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Access Type *</Label>
                <RadioGroup
                  value={formData.access_type}
                  onValueChange={(value) => setFormData({ ...formData, access_type: value as 'public' | 'invite_only' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-normal cursor-pointer">
                      Public - Anyone can join
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invite_only" id="invite_only" />
                    <Label htmlFor="invite_only" className="font-normal cursor-pointer">
                      Invite Only - Generate QR code and invitation link
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.access_type === 'invite_only' && (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <EventImageUpload
                    value={formData.logo_url_landing}
                    onChange={(url) => setFormData({ ...formData, logo_url_landing: url })}
                    label="Logo do Evento"
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Pagamento</Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="show_payment" className="text-sm font-normal text-muted-foreground">Ativar Pagamento</Label>
                        <Switch
                          id="show_payment"
                          checked={formData.show_payment}
                          onCheckedChange={(checked) => setFormData({ ...formData, show_payment: checked })}
                        />
                      </div>
                    </div>

                    {formData.show_payment && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="payment_amount">Valor em €</Label>
                          <Input
                            id="payment_amount"
                            value={formData.payment_amount}
                            onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                            placeholder="25.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Data limite de pagamento</Label>
                          <div className="flex gap-2">
                            <Input
                              type="date"
                              value={formData.payment_deadline}
                              onChange={(e) => setFormData({ ...formData, payment_deadline: e.target.value })}
                              className="flex-1"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                  <CalendarIcon className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
                                <CalendarComponent
                                  mode="single"
                                  selected={formData.payment_deadline ? new Date(formData.payment_deadline) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setFormData({ ...formData, payment_deadline: format(date, 'yyyy-MM-dd') });
                                    }
                                  }}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="payment_url">Link de pagamento externo</Label>
                          <Input
                            id="payment_url"
                            value={formData.payment_url}
                            onChange={(e) => setFormData({ ...formData, payment_url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <EventPreview
              title={formData.title}
              description={formData.description}
              event_date={formData.event_date}
              end_date={formData.end_date}
              location={formData.location}
              country={formData.country}
              city={formData.city}
              image_url={formData.image_url}
              event_type={formData.event_type}
              access_type={formData.access_type}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};