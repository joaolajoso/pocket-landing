import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrganizerFavorite = (organizationId: string | null) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !organizationId) return;
    supabase
      .from('organizer_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, organizationId]);

  const toggleFavorite = useCallback(async () => {
    if (!user || !organizationId || loading) return;
    setLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('organizer_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('organization_id', organizationId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('organizer_favorites')
          .insert({ user_id: user.id, organization_id: organizationId });
        setIsFavorite(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, organizationId, isFavorite, loading]);

  return { isFavorite, toggleFavorite, loading };
};
