
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PermissionType = 
  | 'profile_views'
  | 'link_clicks'
  | 'leads'
  | 'connections'
  | 'contact_info'
  | 'analytics'
  | 'performance_metrics'
  | 'view_company_metrics'
  | 'view_employee_metrics'
  | 'manage_employees'
  | 'edit_company_website'
  | 'manage_departments';

export interface EmployeeDataPermission {
  id: string;
  organization_member_id: string;
  permission_type: PermissionType;
  granted: boolean;
  granted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AcceptInvitationResult {
  success: boolean;
  error?: string;
  member_id?: string;
}

export const useEmployeePermissions = (organizationId?: string) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<EmployeeDataPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!user || !organizationId) return;

    try {
      setLoading(true);
      const { data, error: permissionsError } = await supabase
        .from('employee_data_permissions')
        .select(`
          *,
          organization_member:organization_members(*)
        `)
        .eq('organization_members.organization_id', organizationId);

      if (permissionsError) throw permissionsError;
      setPermissions(data as EmployeeDataPermission[] || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (memberId: string, permissionType: string, granted: boolean) => {
    try {
      const { error } = await supabase
        .from('employee_data_permissions')
        .upsert({
          organization_member_id: memberId,
          permission_type: permissionType,
          granted,
          granted_at: granted ? new Date().toISOString() : null
        }, {
          onConflict: 'organization_member_id,permission_type'
        });

      if (error) throw error;
      await fetchPermissions();
      return { success: true };
    } catch (err) {
      console.error('Error updating permission:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update permission' 
      };
    }
  };

  const acceptInvitation = async (invitationToken: string, permissionsGranted: string[]): Promise<AcceptInvitationResult> => {
    try {
      const { data, error } = await supabase.rpc('accept_organization_invitation', {
        invitation_token_param: invitationToken,
        permissions_granted: permissionsGranted
      });

      if (error) throw error;
      
      // Type guard to ensure data has the expected structure
      if (data && typeof data === 'object' && 'success' in data) {
        return data as unknown as AcceptInvitationResult;
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to accept invitation' 
      };
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user, organizationId]);

  return {
    permissions,
    loading,
    error,
    updatePermission,
    acceptInvitation,
    refetch: fetchPermissions
  };
};
