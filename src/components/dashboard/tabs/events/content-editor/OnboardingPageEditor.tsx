import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Image, Save, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEventLandingConfig, PaymentLink } from '@/hooks/useEventLandingConfig';
import { EventImageUpload } from '../EventImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingPageEditorProps {
  eventId: string;
  event: any;
}

const OnboardingPageEditor = ({ eventId, event }: OnboardingPageEditorProps) => {
  const { config, loading, saveConfig } = useEventLandingConfig(eventId);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl] = useState('');
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDeadline, setPaymentDeadline] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setLogoUrl(config.logo_url || '');
      setEventName(config.event_name || event?.title || '');
      setDescription(config.description || event?.description || '');
      setShowPayment(config.show_payment || false);
      setPaymentAmount(config.payment_amount || '');
      setPaymentDeadline(config.payment_deadline ? config.payment_deadline.split('T')[0] : '');
      setPaymentUrl(config.payment_url || '');
      setPaymentLinks(config.payment_links || []);
    } else if (!loading) {
      setEventName(event?.title || '');
      setDescription(event?.description || '');
    }
    setCoverImageUrl(event?.image_url || '');
    setLocation(event?.location || '');
  }, [config, loading, event]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${eventId}/landing-logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      toast({ title: 'Logo carregado', description: 'O logo foi carregado com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro ao carregar logo', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const addPaymentLink = () => {
    setPaymentLinks([...paymentLinks, { title: '', url: '' }]);
  };

  const updatePaymentLink = (index: number, field: keyof PaymentLink, value: string) => {
    const updated = [...paymentLinks];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentLinks(updated);
  };

  const removePaymentLink = (index: number) => {
    setPaymentLinks(paymentLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: eventError } = await supabase
        .from('events')
        .update({
          image_url: coverImageUrl || null,
          location: location || null,
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      await saveConfig({
        logo_url: logoUrl || null,
        event_name: eventName || null,
        description: description || null,
        show_payment: showPayment,
        payment_amount: paymentAmount || null,
        payment_deadline: paymentDeadline ? new Date(paymentDeadline).toISOString() : null,
        payment_url: paymentUrl || null,
        payment_links: paymentLinks.filter(l => l.url),
      });
    } catch (err: any) {
      toast({ title: 'Erro ao guardar', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações da Página</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo do Evento</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg border border-dashed bg-muted flex items-center justify-center">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'A carregar...' : 'Carregar Logo'}
                </Button>
              </div>
            </div>
          </div>

          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event-name">Nome do Evento</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Nome do evento"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description">Descrição</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do evento para a página pública"
              rows={4}
            />
          </div>

          {/* Cover Image */}
          <EventImageUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            label="Imagem de Capa do Evento"
          />

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="event-location">Localização</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="event-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Universidade de Aveiro"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Pagamento</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar secção de pagamento na página pública
              </p>
            </div>
            <Switch checked={showPayment} onCheckedChange={setShowPayment} />
          </div>

          {showPayment && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Valor</Label>
                <Input
                  id="payment-amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Ex: 25€"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-deadline">Data limite de pagamento</Label>
                <Input
                  id="payment-deadline"
                  type="date"
                  value={paymentDeadline}
                  onChange={(e) => setPaymentDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-url">Link de pagamento principal</Label>
                <Input
                  id="payment-url"
                  value={paymentUrl}
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Multiple Payment Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Links de pagamento adicionais</Label>
                  <Button variant="outline" size="sm" onClick={addPaymentLink} type="button">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar link
                  </Button>
                </div>
                {paymentLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={link.title}
                        onChange={(e) => updatePaymentLink(index, 'title', e.target.value)}
                        placeholder="Título (ex: Pagamento MB WAY)"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updatePaymentLink(index, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePaymentLink(index)}
                      className="mt-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {saving ? 'A guardar...' : 'Guardar Configuração'}
      </Button>
    </div>
  );
};

export default OnboardingPageEditor;
