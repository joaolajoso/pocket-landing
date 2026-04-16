import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GenerateInvitationsOptions {
  eventId: string;
  emails?: string[];
  quantity?: number;
  expiresAt?: string;
}

export const useEventInvitations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInvitations = async (options: GenerateInvitationsOptions) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const invitations = [];
      
      if (options.emails && options.emails.length > 0) {
        // Generate invitations for specific emails
        for (const email of options.emails) {
          invitations.push({
            event_id: options.eventId,
            invited_by: user.id,
            email: email.trim(),
            expires_at: options.expiresAt || null,
          });
        }
      } else if (options.quantity && options.quantity > 0) {
        // Generate bulk invitations
        for (let i = 0; i < options.quantity; i++) {
          invitations.push({
            event_id: options.eventId,
            invited_by: user.id,
            expires_at: options.expiresAt || null,
          });
        }
      }

      const { data, error } = await supabase
        .from('event_invitations')
        .insert(invitations)
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Generated ${data.length} invitation${data.length > 1 ? 's' : ''}`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const validateInvitation = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('event_invitations')
        .select(`
          *,
          event:event_id (
            id,
            title,
            description,
            event_date,
            end_date,
            location,
            image_url,
            access_type
          )
        `)
        .eq('code', code)
        .eq('used', false)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      return null;
    }
  };

  const useInvitation = async (code: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_invitations')
        .update({
          used: true,
          used_by: user.id,
          used_at: new Date().toISOString(),
        })
        .eq('code', code);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invitation accepted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchEventInvitations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  };

  return {
    generateInvitations,
    validateInvitation,
    useInvitation,
    fetchEventInvitations,
    loading,
  };
};