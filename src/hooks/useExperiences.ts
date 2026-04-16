import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Experience {
  id: string;
  user_id: string;
  company_name: string;
  role: string;
  experience_type: 'current_job' | 'past_job' | 'education' | 'project' | 'award' | 'other';
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  logo_url: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useExperiences = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExperiences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setExperiences((data || []) as Experience[]);
    } catch (error: any) {
      console.error('Error fetching experiences:', error);
      toast({
        title: 'Erro ao carregar experiências',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addExperience = async (experience: Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'position'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const position = experiences.length;

      const { data, error } = await supabase
        .from('experiences')
        .insert({
          ...experience,
          user_id: user.id,
          position,
        })
        .select()
        .single();

      if (error) throw error;

      setExperiences([...experiences, data as Experience]);
      toast({
        title: 'Sucesso',
        description: 'Experiência adicionada com sucesso',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateExperience = async (id: string, updates: Partial<Experience>) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setExperiences(experiences.map(exp => 
        exp.id === id ? { ...exp, ...updates } as Experience : exp
      ));
      toast({
        title: 'Sucesso',
        description: 'Experiência atualizada com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExperiences(experiences.filter(exp => exp.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Experiência removida com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  return {
    experiences,
    loading,
    addExperience,
    updateExperience,
    deleteExperience,
    refreshExperiences: fetchExperiences,
  };
};
