import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useDepartments = (organizationId?: string) => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os departamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    if (!organizationId) return { success: false, error: 'No organization' };

    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          organization_id: organizationId,
          name,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Departamento "${name}" criado`,
      });

      await fetchDepartments();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating department:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao criar departamento',
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  };

  const updateDepartment = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update({ name, description })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Departamento atualizado",
      });

      await fetchDepartments();
      return { success: true };
    } catch (err) {
      console.error('Error updating department:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao atualizar departamento',
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Departamento removido",
      });

      await fetchDepartments();
      return { success: true };
    } catch (err) {
      console.error('Error deleting department:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao remover departamento',
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchDepartments();
    }
  }, [organizationId]);

  return {
    departments,
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchDepartments,
  };
};
