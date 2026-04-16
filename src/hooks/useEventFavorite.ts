import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEventFavorite = (eventId: string) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !eventId) return;
    supabase
      .from('event_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, eventId]);

  const toggleFavorite = useCallback(async () => {
    if (!user || !eventId || loading) return;
    setLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('event_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('event_favorites')
          .insert({ user_id: user.id, event_id: eventId });
        setIsFavorite(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, eventId, isFavorite, loading]);

  return { isFavorite, toggleFavorite, loading };
};
