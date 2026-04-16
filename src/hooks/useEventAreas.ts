import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventArea {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventAreas = (eventId: string | undefined) => {
  const [areas, setAreas] = useState<EventArea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAreas = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_areas')
        .select('*')
        .eq('event_id', eventId)
        .order('name');

      if (error) throw error;
      setAreas(data || []);
    } catch (error: any) {
      console.error('Error fetching event areas:', error);
      toast({
        title: "Error loading areas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [eventId]);

  const createArea = async (name: string, description?: string) => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from('event_areas')
        .insert([{ event_id: eventId, name, description }])
        .select()
        .single();

      if (error) throw error;

      setAreas([...areas, data]);
      toast({
        title: "Área criada",
        description: `A área "${name}" foi criada com sucesso.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar área",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateArea = async (areaId: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('event_areas')
        .update({ name, description })
        .eq('id', areaId);

      if (error) throw error;

      setAreas(areas.map(a => a.id === areaId ? { ...a, name, description } : a));
      toast({
        title: "Área atualizada",
        description: "A área foi atualizada com sucesso.",
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

  const deleteArea = async (areaId: string) => {
    try {
      const { error } = await supabase
        .from('event_areas')
        .delete()
        .eq('id', areaId);

      if (error) throw error;

      setAreas(areas.filter(a => a.id !== areaId));
      toast({
        title: "Área removida",
        description: "A área foi removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover área",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    areas,
    loading,
    createArea,
    updateArea,
    deleteArea,
    refreshAreas: fetchAreas,
  };
};
