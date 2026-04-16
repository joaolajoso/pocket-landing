import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventCustomContent {
  id: string;
  event_id: string;
  section_type: 'timeline' | 'map' | 'info' | 'sponsors';
  title: string | null;
  content: any;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEventCustomContent = (eventId: string) => {
  const [content, setContent] = useState<EventCustomContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('event_custom_content')
        .select('*')
        .eq('event_id', eventId)
        .order('position', { ascending: true });

      if (error) throw error;
      setContent((data as EventCustomContent[]) || []);
    } catch (error: any) {
      console.error('Error fetching custom content:', error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [eventId]);

  const createSection = async (
    section_type: EventCustomContent['section_type'],
    title: string | null,
    content_data: any
  ) => {
    try {
      const maxPosition = Math.max(...(content.map((c: EventCustomContent) => c.position) || [0]), 0);
      
      const { data, error } = await supabase
        .from('event_custom_content')
        .insert({
          event_id: eventId,
          section_type,
          title,
          content: content_data,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setContent([...content, data as EventCustomContent]);
      toast({
        title: "Seção criada",
        description: "A seção foi adicionada com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar seção",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSection = async (id: string, updates: Partial<EventCustomContent>) => {
    try {
      const { data, error } = await supabase
        .from('event_custom_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContent(content.map(c => c.id === id ? (data as EventCustomContent) : c));
      toast({
        title: "Seção atualizada",
        description: "As alterações foram salvas.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar seção",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_custom_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContent(content.filter(c => c.id !== id));
      toast({
        title: "Seção removida",
        description: "A seção foi excluída com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover seção",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderSections = async (newOrder: EventCustomContent[]) => {
    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        position: index,
      }));

      for (const update of updates) {
        await supabase
          .from('event_custom_content')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      setContent(newOrder);
      toast({
        title: "Ordem atualizada",
        description: "As seções foram reordenadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reordenar seções",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    content,
    loading,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    refreshContent: fetchContent,
  };
};