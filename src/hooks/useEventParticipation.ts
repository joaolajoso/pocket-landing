import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEventParticipation = (eventId: string, initialParticipating?: boolean) => {
  const { user } = useAuth();
  const hasInitial = initialParticipating !== undefined;
  const [isParticipating, setIsParticipating] = useState(hasInitial ? initialParticipating : false);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (!hasInitial) {
      checkParticipation();
    }
  }, [eventId]);

  const checkParticipation = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsParticipating(!!data);
    } catch (error) {
      console.error('Error checking participation:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipation = async (
    invitationCode?: string,
    registrationData?: {
      academicDegree?: string;
      educationAreas?: string[];
      opportunityInterests?: string[];
    }
  ) => {
    if (!user) throw new Error('User not authenticated');

    const previousState = isParticipating;
    setIsParticipating(!isParticipating);

    try {
      if (previousState) {
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const insertData: any = {
          event_id: eventId,
          user_id: user.id,
          status: 'participating',
          invitation_code: invitationCode || null,
        };

        if (registrationData) {
          insertData.registration_data = {
            academic_degree: registrationData.academicDegree || null,
            education_areas: registrationData.educationAreas || [],
            opportunity_interests: registrationData.opportunityInterests || []
          };
        }

        const { error } = await supabase
          .from('event_participants')
          .insert(insertData);

        if (error) throw error;
      }
    } catch (error) {
      setIsParticipating(previousState);
      throw error;
    }
  };

  const validateAccess = async (code?: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_event_access', {
        _event_id: eventId,
        _user_id: user.id,
        _invitation_code: code || null,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating access:', error);
      return false;
    }
  };

  const trackClick = async () => {
    if (!user) return;

    try {
      await supabase
        .from('event_clicks')
        .insert({
          event_id: eventId,
          user_id: user.id
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  return {
    isParticipating,
    loading,
    toggleParticipation,
    trackClick,
    validateAccess,
  };
};
