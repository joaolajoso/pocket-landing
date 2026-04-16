import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentLink {
  title: string;
  url: string;
}

export interface EventLandingConfig {
  id?: string;
  event_id: string;
  logo_url: string | null;
  event_name: string | null;
  description: string | null;
  payment_amount: string | null;
  payment_deadline: string | null;
  payment_url: string | null;
  payment_links: PaymentLink[];
  show_payment: boolean;
}

export const useEventLandingConfig = (eventId: string) => {
  const [config, setConfig] = useState<EventLandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_landing_config')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConfig({
          ...data,
          payment_links: (data.payment_links as unknown as PaymentLink[]) || [],
        });
      } else {
        setConfig(null);
      }
    } catch (err: any) {
      console.error('Error fetching landing config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [eventId]);

  const saveConfig = async (updates: Partial<EventLandingConfig>) => {
    try {
      const dbUpdates = {
        ...updates,
        payment_links: updates.payment_links ? JSON.parse(JSON.stringify(updates.payment_links)) : undefined,
      };
      if (config?.id) {
        const { error } = await supabase
          .from('event_landing_config')
          .update(dbUpdates as any)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_landing_config')
          .insert({ event_id: eventId, ...dbUpdates } as any);
        if (error) throw error;
      }
      await fetchConfig();
      toast({ title: 'Configuração guardada', description: 'As alterações foram guardadas com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro ao guardar', description: err.message, variant: 'destructive' });
    }
  };

  return { config, loading, saveConfig, refetch: fetchConfig };
};
