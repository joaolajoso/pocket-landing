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

interface RolePermissions {
  userRole: string | null;
  loading: boolean;
  hasPermission: (permission: PermissionType) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  canManageEmployees: boolean;
  canEditWebsite: boolean;
  canViewMetrics: boolean;
}

export const useRolePermissions = (organizationId?: string): RolePermissions => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || !organizationId) {
      setLoading(false);
      return;
    }
    
    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', organizationId)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (error) throw error;
        setUserRole(data?.role || null);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRole();
  }, [user, organizationId]);
  
  const hasPermission = (permission: PermissionType): boolean => {
    if (!userRole) return false;
    
    // Owner tem todas as permissões
    if (userRole === 'owner') return true;
    
    // Admin tem todas as permissões
    if (userRole === 'admin') return true;
    
    // Manager tem permissões específicas
    if (userRole === 'manager') {
      return [
        'manage_employees',
        'view_employee_metrics',
        'view_company_metrics',
        'profile_views',
        'leads',
        'connections',
        'performance_metrics'
      ].includes(permission);
    }
    
    // Employee: apenas permissões explícitas (verificadas via RLS)
    return false;
  };
  
  return {
    userRole,
    loading,
    hasPermission,
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isEmployee: userRole === 'employee',
    canManageEmployees: hasPermission('manage_employees'),
    canEditWebsite: hasPermission('edit_company_website'),
    canViewMetrics: hasPermission('view_company_metrics')
  };
};
