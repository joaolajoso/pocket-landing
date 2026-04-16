import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  image_url: string | null;
  event_url: string | null;
  event_type?: string | null;
  category: string | null;
  organization: string | null;
  is_featured: boolean;
  source: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  organization_id?: string | null;
  access_type?: 'public' | 'invite_only';
  invitation_code?: string | null;
  internal_event?: boolean | null;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error loading events',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    toast({
      title: 'Refreshing events...',
      description: 'Fetching latest events from Portugal Tech Week',
    });

    try {
      const { error } = await supabase.functions.invoke('scrape-events');
      if (error) throw error;
      
      await fetchEvents();
      
      toast({
        title: 'Events updated',
        description: 'Successfully refreshed event listings',
      });
    } catch (error: any) {
      console.error('Error refreshing events:', error);
      toast({
        title: 'Error refreshing events',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    refreshEvents,
  };
};
