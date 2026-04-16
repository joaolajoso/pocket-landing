import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: 'participant' | 'stand' | 'organizer';
  area_id: string | null;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    organization_id: string | null;
    photo_url: string | null;
    linkedin: string | null;
    headline: string | null;
    job_title: string | null;
    onboarding_completed: boolean;
    bio: string | null;
  };
  permissions: {
    permission_type: string;
    granted: boolean;
  }[];
}

export const useEventParticipants = (eventId: string | undefined) => {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchParticipants = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all participants (for stats/insights) with count
      const { data: participantsData, error: participantsError, count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (participantsError) throw participantsError;

      setTotalCount(count || 0);

      // Fetch user profiles in batch
      const userIds = participantsData?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, organization_id, photo_url, linkedin, headline, job_title, onboarding_completed, bio')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch ALL permissions in one batch query instead of N+1
      const participantIds = participantsData?.map(p => p.id) || [];
      const { data: allPermissions } = await supabase
        .from('event_participant_permissions')
        .select('event_participant_id, permission_type, granted')
        .in('event_participant_id', participantIds);

      const permissionsMap = new Map<string, { permission_type: string; granted: boolean }[]>();
      (allPermissions || []).forEach((perm: any) => {
        const existing = permissionsMap.get(perm.event_participant_id) || [];
        existing.push({ permission_type: perm.permission_type, granted: perm.granted });
        permissionsMap.set(perm.event_participant_id, existing);
      });

      const participantsWithData = (participantsData || []).map((participant: any) => ({
        ...participant,
        user: profilesMap.get(participant.user_id) || null,
        permissions: permissionsMap.get(participant.id) || [],
      }));

      setParticipants(participantsWithData as EventParticipant[]);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Erro ao carregar participantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const updateParticipantRole = async (participantId: string, role: 'participant' | 'stand' | 'organizer') => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ role })
        .eq('id', participantId);

      if (error) throw error;

      setParticipants(participants.map(p => 
        p.id === participantId ? { ...p, role } : p
      ));

      toast({
        title: "Papel atualizado",
        description: "O papel do participante foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar papel",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateParticipantArea = async (participantId: string, areaId: string | null) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ area_id: areaId })
        .eq('id', participantId);

      if (error) throw error;

      setParticipants(participants.map(p => 
        p.id === participantId ? { ...p, area_id: areaId } : p
      ));

      toast({
        title: "Área atualizada",
        description: "A área do participante foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar área",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePermission = async (participantId: string, permissionType: string, granted: boolean) => {
    try {
      // First, check if permission exists
      const { data: existing } = await supabase
        .from('event_participant_permissions')
        .select('id')
        .eq('event_participant_id', participantId)
        .eq('permission_type', permissionType)
        .maybeSingle();

      if (existing) {
        // Update existing permission
        const { error } = await supabase
          .from('event_participant_permissions')
          .update({ granted, granted_at: granted ? new Date().toISOString() : null })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new permission
        const { error } = await supabase
          .from('event_participant_permissions')
          .insert({
            event_participant_id: participantId,
            permission_type: permissionType,
            granted,
            granted_at: granted ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      // Refresh participants
      await fetchParticipants();

      toast({
        title: "Permissão atualizada",
        description: "A permissão foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      setParticipants(participants.filter(p => p.id !== participantId));

      toast({
        title: "Participante removido",
        description: "O participante foi removido do evento com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover participante",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    participants,
    totalCount,
    loading,
    updateParticipantRole,
    updateParticipantArea,
    updatePermission,
    removeParticipant,
    refreshParticipants: fetchParticipants,
  };
};
