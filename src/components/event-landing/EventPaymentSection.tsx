import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { LandingConfig, PaymentLink } from '@/hooks/useEventPublicData';
import { supabase } from '@/integrations/supabase/client';

interface EventPaymentSectionProps {
  paymentInfo?: {
    method: string;
    key: string;
  } | null;
  event?: {
    id: string;
    title: string;
    event_url?: string | null;
  };
  landingConfig?: LandingConfig | null;
}

const EventPaymentSection = ({ paymentInfo, event, landingConfig }: EventPaymentSectionProps) => {

  const hasLandingPayment = landingConfig?.show_payment && (landingConfig.payment_url || landingConfig.payment_amount || (landingConfig.payment_links?.length ?? 0) > 0);
  const hasOrgPayment = paymentInfo?.key;

  if (!hasLandingPayment && !hasOrgPayment) return null;

  const getPaymentLabel = () => {
    if (!paymentInfo) return 'Pagamento';
    switch (paymentInfo.method) {
      case 'mbway': return 'MB WAY';
      case 'pix': return 'PIX';
      default: return 'Pagamento';
    }
  };

  const trackPaymentClick = async (url: string, title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !event?.id) return null;

      const { data, error } = await supabase
        .from('event_payments')
        .insert({
          event_id: event.id,
          user_id: user.id,
          payment_link_title: title,
          payment_link_url: url,
          status: 'clicked',
        } as any)
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking payment:', error);
        return null;
      }
      return data?.id;
    } catch (err) {
      console.error('Error tracking payment:', err);
      return null;
    }
  };

  const updatePaymentStatus = async (paymentId: string, responseCode: number) => {
    try {
      await supabase
        .from('event_payments')
        .update({
          response_code: responseCode,
          status: responseCode >= 200 && responseCode < 300 ? 'success' : 'error',
        } as any)
        .eq('id', paymentId);
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handlePaymentClick = async (url: string, title: string) => {
    await trackPaymentClick(url, title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const allPaymentLinks: PaymentLink[] = [];
  if (landingConfig?.payment_url) {
    allPaymentLinks.push({ title: 'Pagar', url: landingConfig.payment_url });
  }
  if (landingConfig?.payment_links?.length) {
    allPaymentLinks.push(...landingConfig.payment_links);
  }

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Pagamento</h3>
          </div>

          {hasLandingPayment && (
            <>
              {landingConfig.payment_amount && (
                <p className="text-lg font-bold text-foreground">
                  {landingConfig.payment_amount}
                </p>
              )}
              {landingConfig.payment_deadline && (
                <p className="text-sm text-muted-foreground">
                  Pagamento até{' '}
                  <span className="font-medium text-foreground">
                    {format(new Date(landingConfig.payment_deadline), "d 'de' MMMM, yyyy", { locale: pt })}
                  </span>
                </p>
              )}
              {allPaymentLinks.length > 0 && (
                <div className="space-y-2">
                  {allPaymentLinks.map((link, index) => (
                    <Button
                      key={index}
                      onClick={() => handlePaymentClick(link.url, link.title)}
                      variant={index === 0 ? 'default' : 'outline'}
                      className="w-full gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.title || 'Pagar'}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          {hasOrgPayment && !hasLandingPayment && (
            <>
              <p className="text-sm text-muted-foreground">
                Este evento requer pagamento via <span className="font-medium">{getPaymentLabel()}</span>.
              </p>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Chave {getPaymentLabel()}</p>
                <p className="font-mono text-sm font-medium select-all">{paymentInfo!.key}</p>
              </div>
              {event?.event_url && (
                <Button onClick={() => handlePaymentClick(event.event_url!, 'Pagar')} variant="default" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Pagar
                </Button>
              )}
            </>
          )}

          <p className="text-xs text-muted-foreground text-center">
            O pagamento é gerido pela entidade organizadora do evento.
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default EventPaymentSection;
