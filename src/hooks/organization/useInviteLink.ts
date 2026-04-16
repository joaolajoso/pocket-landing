import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface InviteData {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_logo?: string;
  role: string;
  department?: string;
  position?: string;
  permissions_requested: string[];
  expires_at: string;
  is_valid: boolean;
}

export interface GenerateInviteLinkParams {
  organizationId: string;
  role: string;
  department?: string;
  position?: string;
  permissionsRequested: string[];
  email?: string;
}

export const useInviteLink = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Generate a new invitation link
   */
  const generateInviteLink = async ({
    organizationId,
    role,
    department,
    position,
    permissionsRequested,
    email
  }: GenerateInviteLinkParams): Promise<{ success: boolean; token?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    try {
      setLoading(true);

      // Create invitation without specific email (using placeholder)
      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organizationId,
          email: email || `pending-${Date.now()}@invite.pocketcv.app`, // Use provided email or placeholder
          role: role,
          department: department || null,
          position: position || null,
          permissions_requested: permissionsRequested,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select('invitation_token')
        .single();

      if (error) throw error;

      return { success: true, token: data.invitation_token };
    } catch (err) {
      console.error('Error generating invite link:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar link de convite';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get invitation details by token
   */
  const getInvitationByToken = async (token: string): Promise<InviteData | null> => {
    try {
      setLoading(true);

      // Use security definer function to bypass RLS
      const { data, error } = await supabase.rpc('get_invitation_by_token', {
        token_param: token
      });

      if (error || !data) {
        console.error('Invitation not found:', error);
        return null;
      }

      const invitation = data as any;

      return {
        id: invitation.id,
        organization_id: invitation.organization_id,
        organization_name: invitation.organization_name,
        organization_logo: invitation.organization_logo || undefined,
        role: invitation.role,
        department: invitation.department || undefined,
        position: invitation.position || undefined,
        permissions_requested: invitation.permissions_requested || [],
        expires_at: invitation.expires_at,
        is_valid: true
      };
    } catch (err) {
      console.error('Error fetching invitation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accept an invitation with selected permissions
   */
  const acceptInvitation = async (
    token: string,
    permissionsGranted: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('accept_organization_invitation', {
        invitation_token_param: token,
        permissions_granted: permissionsGranted
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (!result.success) {
        return { success: false, error: result.error || 'Erro ao aceitar convite' };
      }

      toast({
        title: "Bem-vindo!",
        description: "Foi adicionado à organização com sucesso.",
      });

      return { success: true };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aceitar convite';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Build the full invitation URL
   */
  const buildInviteUrl = (token: string): string => {
    return `${window.location.origin}/join/${token}`;
  };

  return {
    loading,
    generateInviteLink,
    getInvitationByToken,
    acceptInvitation,
    buildInviteUrl
  };
};
