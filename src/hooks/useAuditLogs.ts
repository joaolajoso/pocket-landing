import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  user_id: string;
  timestamp: string;
  action_type: string;
  table_name: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  change_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  profiles?: {
    name: string;
    email: string;
  };
}

export interface AuditFilters {
  userId?: string;
  fieldChanged?: string;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export const useAuditLogs = (filters: AuditFilters = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pageSize = 50;

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, []);

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let query = supabase
          .from('profile_audit_log')
          .select('*', { count: 'exact' })
          .order('timestamp', { ascending: false })
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        // Apply filters
        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }
        if (filters.fieldChanged) {
          query = query.eq('field_changed', filters.fieldChanged);
        }
        if (filters.actionType) {
          query = query.eq('action_type', filters.actionType);
        }
        if (filters.startDate) {
          query = query.gte('timestamp', filters.startDate.toISOString());
        }
        if (filters.endDate) {
          query = query.lte('timestamp', filters.endDate.toISOString());
        }
        if (filters.searchTerm) {
          query = query.or(`old_value.ilike.%${filters.searchTerm}%,new_value.ilike.%${filters.searchTerm}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        // Fetch profile data for each log
        const logsWithProfiles = await Promise.all(
          (data || []).map(async (log) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', log.user_id)
              .single();
            
            return {
              ...log,
              profiles: profile,
            } as AuditLog;
          })
        );

        setLogs(logsWithProfiles);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: 'Erro ao carregar logs',
          description: 'Não foi possível carregar os logs de auditoria',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [isAdmin, currentPage, filters, toast]);

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há logs para exportar',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Timestamp',
      'User ID',
      'User Name',
      'User Email',
      'Action',
      'Field Changed',
      'Old Value',
      'New Value',
      'Change Reason',
      'IP Address',
    ];

    const csvData = logs.map(log => [
      log.timestamp,
      log.user_id,
      log.profiles?.name || 'N/A',
      log.profiles?.email || 'N/A',
      log.action_type,
      log.field_changed,
      log.old_value || '',
      log.new_value || '',
      log.change_reason || '',
      log.ip_address || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export completo',
      description: 'Os logs foram exportados com sucesso',
    });
  };

  return {
    logs,
    loading,
    isAdmin,
    currentPage,
    setCurrentPage,
    totalCount,
    pageSize,
    exportToCSV,
  };
};
