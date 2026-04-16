import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventStand {
  id: string;
  event_id: string;
  stand_number: number;
  stand_name: string | null;
  onboarding_link_id: string;
  company_name: string | null;
  company_email: string | null;
  assigned_user_id: string | null;
  is_active: boolean;
  send_review: boolean;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventStands = (eventId: string) => {
  const [stands, setStands] = useState<EventStand[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_stands')
        .select('*')
        .eq('event_id', eventId)
        .order('stand_number', { ascending: true });

      if (error) throw error;
      setStands(data || []);
    } catch (error: any) {
      console.error('Error fetching stands:', error);
      toast({
        title: "Erro ao carregar stands",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStands = async (totalStands: number) => {
    try {
      setLoading(true);

      // Check if stands already exist
      const { data: existingStands } = await supabase
        .from('event_stands')
        .select('id')
        .eq('event_id', eventId);

      if (existingStands && existingStands.length > 0) {
        toast({
          title: "Stands já existem",
          description: "Este evento já tem stands configurados. Use 'Adicionar Stands' para adicionar mais.",
          variant: "destructive"
        });
        return;
      }

      const standsToCreate = [];

      for (let i = 1; i <= totalStands; i++) {
        // Generate unique link ID with full UUID for better security
        const linkId = `stand-${eventId.substring(0, 8)}-${i}-${crypto.randomUUID()}`;

        // Create stand record
        standsToCreate.push({
          event_id: eventId,
          stand_number: i,
          stand_name: `Stand ${i}`,
          onboarding_link_id: linkId,
          is_active: true,
          send_review: true
        });
      }

      // Insert all stands first
      const { data: createdStands, error: standsError } = await supabase
        .from('event_stands')
        .insert(standsToCreate)
        .select();

      if (standsError) throw standsError;

      // Now create onboarding records with the stand IDs
      const onboardingRecords = createdStands?.map(stand => ({
        signup_link_id: stand.onboarding_link_id,
        event_id: eventId,
        event_stand_id: stand.id,
        registration_type: 'event_stand'
      })) || [];

      const { error: onboardingError } = await supabase
        .from('onboarding')
        .insert(onboardingRecords);

      if (onboardingError) throw onboardingError;

      // Update event total_stands
      await supabase
        .from('events')
        .update({ total_stands: totalStands })
        .eq('id', eventId);

      toast({
        title: "Stands criados com sucesso",
        description: `${totalStands} stands foram criados para o evento.`
      });

      await fetchStands();
    } catch (error: any) {
      console.error('Error generating stands:', error);
      toast({
        title: "Erro ao gerar stands",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addStands = async (count: number) => {
    try {
      setLoading(true);

      // Get current max stand number
      const { data: existingStands } = await supabase
        .from('event_stands')
        .select('stand_number')
        .eq('event_id', eventId)
        .order('stand_number', { ascending: false })
        .limit(1);

      const startNumber = existingStands && existingStands.length > 0 
        ? existingStands[0].stand_number + 1 
        : 1;

      const standsToCreate = [];

      for (let i = 0; i < count; i++) {
        const standNumber = startNumber + i;
        // Generate unique link ID with full UUID for better security
        const linkId = `stand-${eventId.substring(0, 8)}-${standNumber}-${crypto.randomUUID()}`;

        standsToCreate.push({
          event_id: eventId,
          stand_number: standNumber,
          stand_name: `Stand ${standNumber}`,
          onboarding_link_id: linkId,
          is_active: true,
          send_review: true
        });
      }

      // Insert all stands first
      const { data: createdStands, error: standsError } = await supabase
        .from('event_stands')
        .insert(standsToCreate)
        .select();

      if (standsError) throw standsError;

      // Now create onboarding records with the stand IDs
      const onboardingRecords = createdStands?.map(stand => ({
        signup_link_id: stand.onboarding_link_id,
        event_id: eventId,
        event_stand_id: stand.id,
        registration_type: 'event_stand'
      })) || [];

      const { error: onboardingError } = await supabase
        .from('onboarding')
        .insert(onboardingRecords);

      if (onboardingError) throw onboardingError;

      // Update event total_stands
      const newTotal = startNumber + count - 1;
      await supabase
        .from('events')
        .update({ total_stands: newTotal })
        .eq('id', eventId);

      toast({
        title: "Stands adicionados",
        description: `${count} stands foram adicionados ao evento.`
      });

      await fetchStands();
    } catch (error: any) {
      console.error('Error adding stands:', error);
      toast({
        title: "Erro ao adicionar stands",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeStand = async (standId: string) => {
    try {
      setLoading(true);

      // Check if stand is occupied
      const { data: stand } = await supabase
        .from('event_stands')
        .select('assigned_user_id, stand_number')
        .eq('id', standId)
        .single();

      if (stand?.assigned_user_id) {
        toast({
          title: "Não é possível remover",
          description: "Este stand já está ocupado por uma empresa.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Delete stand (CASCADE will delete onboarding record)
      const { error } = await supabase
        .from('event_stands')
        .delete()
        .eq('id', standId);

      if (error) throw error;

      // Update total_stands count
      const { data: remainingStands } = await supabase
        .from('event_stands')
        .select('id')
        .eq('event_id', eventId);

      await supabase
        .from('events')
        .update({ total_stands: remainingStands?.length || 0 })
        .eq('id', eventId);

      toast({
        title: "Stand removido",
        description: "O stand foi removido com sucesso."
      });

      await fetchStands();
    } catch (error: any) {
      console.error('Error removing stand:', error);
      toast({
        title: "Erro ao remover stand",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStand = async (standId: string, updates: Partial<EventStand>) => {
    try {
      const { error } = await supabase
        .from('event_stands')
        .update(updates)
        .eq('id', standId);

      if (error) throw error;

      toast({
        title: "Stand atualizado",
        description: "As alterações foram guardadas com sucesso."
      });

      await fetchStands();
    } catch (error: any) {
      console.error('Error updating stand:', error);
      toast({
        title: "Erro ao atualizar stand",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAllStands = async () => {
    try {
      setLoading(true);

      // Delete all stands for this event
      const { error } = await supabase
        .from('event_stands')
        .delete()
        .eq('event_id', eventId);

      if (error) throw error;

      // Update event total_stands to 0
      await supabase
        .from('events')
        .update({ total_stands: 0 })
        .eq('id', eventId);

      toast({
        title: "Stands eliminados",
        description: "Todos os stands foram removidos."
      });

      setStands([]);
    } catch (error: any) {
      console.error('Error deleting stands:', error);
      toast({
        title: "Erro ao eliminar stands",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchStands();
    }
  }, [eventId]);

  return {
    stands,
    loading,
    fetchStands,
    generateStands,
    addStands,
    removeStand,
    updateStand,
    deleteAllStands
  };
};
