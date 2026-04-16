import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  industry?: string;
  size_category?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'employee';
  department?: string;
  department_id?: string;
  position?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'pending';
  invited_by?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  profile?: {
    name?: string;
    email?: string;
    photo_url?: string;
    slug?: string;
  };
}

// Singleton pattern to prevent multiple instances
let organizationInstance: any = null;

export interface UserOrgMembership {
  organization_id: string;
  org_name: string;
  org_logo: string | null;
  role: string;
}

export const useOrganization = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allOrganizations, setAllOrganizations] = useState<UserOrgMembership[]>([]);
  
  const fetchInProgress = useRef(false);
  const initialized = useRef(false);

  const fetchOrganization = async (force: boolean = false) => {
    if (!user || !isAuthenticated) {
      return;
    }
    
    if (fetchInProgress.current && !force) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);
      
      // Get user's profile to check for organization_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Fetch all active memberships for org switcher
      const { data: allMemberships } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(name, logo_url)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (allMemberships) {
        setAllOrganizations(allMemberships.map((m: any) => ({
          organization_id: m.organization_id,
          org_name: m.organizations?.name || 'Organização',
          org_logo: m.organizations?.logo_url || null,
          role: m.role,
        })));
      }

      const organizationId = profileData?.organization_id;
      
      if (!organizationId) {
        setOrganization(null);
        setMembers([]);
        setUserRole(null);
        return;
      }

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .maybeSingle();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        return;
      }

      if (orgData) {
        setOrganization(orgData as Organization);
        
        // Get user's role
        const { data: membershipData } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .eq('organization_id', organizationId)
          .eq('status', 'active')
          .maybeSingle();

        if (membershipData) {
          setUserRole(membershipData.role);
        }

        // Fetch organization members
        const { data: membersData } = await supabase
          .from('organization_members')
          .select(`
            *,
            profile:profiles(name, email, photo_url, slug)
          `)
          .eq('organization_id', organizationId)
          .eq('status', 'active');

        if (membersData) {
          setMembers(membersData as OrganizationMember[]);
        }
      }
    } catch (err) {
      console.error('Error in fetchOrganization:', err);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: organizationId })
        .eq('id', user.id);

      if (profileError) throw profileError;

      initialized.current = false;
      await fetchOrganization(true);
      return { success: true };
    } catch (err) {
      console.error('Error switching organization:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to switch' };
    }
  };

  const createOrganization = async (organizationData: Partial<Organization>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationData.name!,
          description: organizationData.description,
          website: organizationData.website,
          industry: organizationData.industry,
          size_category: organizationData.size_category,
          created_by: user.id
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      // Update user's profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: orgData.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await fetchOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error creating organization:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create organization' 
      };
    }
  };

  const inviteEmployee = async (
    email: string, 
    role: 'admin' | 'manager' | 'employee', 
    department?: string, 
    position?: string,
    message?: string,
    permissions?: string[]
  ) => {
    if (!user || !organization) return { success: false, error: 'Missing requirements' };

    try {
      // Get current user's profile for name
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      // Check if email already exists in the platform
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, email, organization_id')
        .eq('email', email)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking existing profile:', profileCheckError);
      }

      // Check if already an active member
      if (existingProfile?.organization_id === organization.id) {
        const { data: existingMember } = await supabase
          .from('organization_members')
          .select('status')
          .eq('user_id', existingProfile.id)
          .eq('organization_id', organization.id)
          .maybeSingle();

        if (existingMember?.status === 'active') {
          toast({
            title: "Aviso",
            description: "Este utilizador já é membro ativo da organização.",
            variant: "destructive",
          });
          return { success: false, error: 'User already member' };
        }
      }

      // Overwrite any existing pending invitation for this email/org
      const { error: deleteError } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('organization_id', organization.id)
        .eq('email', email)
        .is('accepted_at', null);

      if (deleteError) {
        console.error('Error deleting old invitations:', deleteError);
        toast({
          title: "Aviso",
          description: "Não foi possível remover convites antigos.",
          variant: "destructive",
        });
      } else {
        console.log('Old invitations deleted successfully (overwrite)');
      }

      // Create fresh invitation record
      const { data: invitation, error: invitationError } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organization.id,
          email,
          role,
          department,
          position,
          message,
          permissions_requested: permissions || ['profile_views', 'leads', 'connections', 'performance_metrics'],
          invited_by: user.id
        })
        .select()
        .single();

      if (invitationError) throw invitationError;

      if (existingProfile) {
        // User already exists - create internal notification
        const { error: notificationError } = await supabase
          .from('organization_notifications')
          .insert({
            user_id: existingProfile.id,
            invitation_id: invitation.id,
            type: 'invitation_pending',
            read: false
          });

        if (notificationError) {
          console.error("Error creating notification:", notificationError);
        }
      } else {
        // User doesn't exist - send signup email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
            body: {
              email,
              organizationName: organization.name,
              role,
              invitationToken: invitation.invitation_token,
              permissions: permissions || ['profile_views', 'leads', 'connections', 'performance_metrics'],
              invitedByName: inviterProfile?.name || 'Administrador'
            }
          });

          if (emailError) {
            console.error("Error sending email:", emailError);
          }
        } catch (emailError) {
          console.error("Error invoking email function:", emailError);
        }
      }

      toast({
        title: "Convite enviado",
        description: deleteError 
          ? `Novo convite criado para ${email}` 
          : `Convite reenviado (overwrite) para ${email}`,
      });

      return { success: true, invitation };
    } catch (err) {
      console.error('Error inviting employee:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao enviar convite',
        variant: "destructive",
      });
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to invite employee' 
      };
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'manager' | 'employee') => {
    if (!user || !organization) return { success: false, error: 'Missing requirements' };

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('organization_id', organization.id);

      if (error) throw error;

      await fetchOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error updating member role:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update member role' 
      };
    }
  };

  const updateMemberDepartment = async (memberId: string, departmentId: string | null) => {
    if (!user || !organization) return { success: false, error: 'Missing requirements' };

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ department_id: departmentId })
        .eq('id', memberId)
        .eq('organization_id', organization.id);

      if (error) throw error;

      await fetchOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error updating member department:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update member department' 
      };
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user || !organization) return { success: false, error: 'Missing requirements' };

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ status: 'inactive' })
        .eq('id', memberId)
        .eq('organization_id', organization.id);

      if (error) throw error;

      await fetchOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error removing member:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to remove member' 
      };
    }
  };

  const updateOrganizationName = async (newName: string) => {
    if (!user || !organization) return { success: false, error: 'Missing requirements' };

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: newName })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Nome atualizado",
        description: "O nome da organização foi atualizado com sucesso.",
      });

      await fetchOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error updating organization name:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao atualizar nome',
        variant: "destructive",
      });
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update organization name' 
      };
    }
  };

  const leaveOrganization = async () => {
    if (!user || !organization) return { success: false, error: 'Missing requirements' };

    try {
      // Set member status to inactive
      const { error: memberError } = await supabase
        .from('organization_members')
        .update({ status: 'inactive' })
        .eq('user_id', user.id)
        .eq('organization_id', organization.id);

      if (memberError) throw memberError;

      // Remove organization from profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: null })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Saiu da organização",
        description: "Você saiu da organização com sucesso.",
      });

      setOrganization(null);
      setMembers([]);
      setUserRole(null);
      
      return { success: true };
    } catch (err) {
      console.error('Error leaving organization:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao sair da organização',
        variant: "destructive",
      });
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to leave organization' 
      };
    }
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    
    if (isAuthenticated && user && !fetchInProgress.current) {
      initialized.current = true;
      fetchOrganization();
    } else if (!isAuthenticated || !user) {
      initialized.current = false;
      setOrganization(null);
      setMembers([]);
      setUserRole(null);
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [user, isAuthenticated]);

  // Reset on user change
  useEffect(() => {
    initialized.current = false;
  }, [user?.id]);

  return {
    organization,
    members,
    userRole,
    loading,
    error,
    allOrganizations,
    createOrganization,
    inviteEmployee,
    updateMemberRole,
    updateMemberDepartment,
    removeMember,
    updateOrganizationName,
    leaveOrganization,
    switchOrganization,
    refetch: fetchOrganization
  };
};
