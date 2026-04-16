import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreateEventData {
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  country?: string;
  city?: string;
  image_url?: string;
  event_type?: string;
  access_type: 'public' | 'invite_only';
  event_url?: string | null;
  internal_event?: boolean;
  logo_url_landing?: string;
  show_payment?: boolean;
  payment_amount?: string;
  payment_deadline?: string;
  payment_url?: string;
}

export type EventSource = 'personal' | 'organization' | 'co-organizer';

export interface EventWithSource {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  image_url: string | null;
  event_type: string | null;
  access_type: string;
  internal_event: boolean | null;
  created_by: string | null;
  organization_id: string | null;
  source: EventSource;
}

export const useEventManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createEvent = async (eventData: CreateEventData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Only attach organization_id if user is admin/owner of the org
      // Regular members should create personal events to avoid RLS failures
      let organizationId: string | null = null;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('role', ['owner', 'admin'])
        .maybeSingle();

      if (membership) {
        organizationId = membership.organization_id;
      }

      const { logo_url_landing, show_payment, payment_amount, payment_deadline, payment_url, ...eventFields } = eventData;
      const desiredAccessType = eventFields.access_type;
      const insertAccessType = desiredAccessType === 'invite_only' ? 'public' : desiredAccessType;

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventFields,
          access_type: insertAccessType,
          created_by: user.id,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;

      let createdEvent = data;

      if (desiredAccessType === 'invite_only' && data?.id) {
        // Generate invitation code for invite-only events
        const invCode = Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const { error: updateError } = await supabase
          .from('events')
          .update({ access_type: 'invite_only', invitation_code: invCode })
          .eq('id', data.id);

        if (updateError) throw updateError;
        createdEvent = { ...data, access_type: 'invite_only' };

        await supabase.from('event_landing_config').insert({
          event_id: data.id,
          logo_url: logo_url_landing || null,
          event_name: eventFields.title,
          description: eventFields.description || null,
          show_payment: show_payment || false,
          payment_amount: payment_amount || null,
          payment_deadline: payment_deadline || null,
          payment_url: payment_url || null,
        });
      }

      if (data?.id) {
        await supabase
          .from('event_participants')
          .insert({
            event_id: data.id,
            user_id: user.id,
            role: 'organizer',
            status: 'participating',
            checked_in: false,
          });
      }

      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      return createdEvent;
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

  const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event updated successfully',
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

  const deleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event deleted successfully',
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

  /**
   * Fetch events with clear source attribution:
   * - owner/admin: see all org events (source: 'organization' or 'personal' if created_by = user)
   * - other roles: only events they created (personal) + events where they're co-organizer
   */
  const fetchMyEvents = async (): Promise<EventWithSource[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const orgId = profile?.organization_id;

      // Check user's org role
      let orgRole: string | null = null;
      if (orgId) {
        const { data: memberData } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', orgId)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        orgRole = memberData?.role || null;
      }

      const isOrgAdmin = orgRole === 'owner' || orgRole === 'admin';

      // Fetch events created by the user (personal)
      const personalPromise = supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('event_date', { ascending: false });

      // Fetch events where user is co-organizer (but not creator)
      const coOrgPromise = supabase
        .from('event_participants')
        .select('event_id, events!inner(*)')
        .eq('user_id', user.id)
        .eq('role', 'organizer')
        .neq('events.created_by', user.id);

      // Fetch all org events if admin/owner
      const orgPromise = isOrgAdmin && orgId
        ? supabase
            .from('events')
            .select('*')
            .eq('organization_id', orgId)
            .neq('created_by', user.id)
            .order('event_date', { ascending: false })
        : null;

      const [personalRes, coOrgRes, orgRes] = await Promise.all([
        personalPromise,
        coOrgPromise,
        orgPromise,
      ]);

      const seenIds = new Set<string>();
      const result: EventWithSource[] = [];

      // 1. Personal events (created by user)
      for (const evt of personalRes.data || []) {
        if (!seenIds.has(evt.id)) {
          seenIds.add(evt.id);
          result.push({ ...evt, source: 'personal' });
        }
      }

      // 2. Co-organizer events
      for (const row of coOrgRes.data || []) {
        const evt = (row as any).events;
        if (evt && !seenIds.has(evt.id)) {
          seenIds.add(evt.id);
          result.push({ ...evt, source: 'co-organizer' });
        }
      }

      // 3. Organization events (only for admins/owners)
      if (orgRes?.data) {
        for (const evt of orgRes.data) {
          if (!seenIds.has(evt.id)) {
            seenIds.add(evt.id);
            result.push({ ...evt, source: 'organization' });
          }
        }
      }

      result.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      return result;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  const fetchEventMetrics = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_participant_metrics')
        .select(`
          *,
          participant:participant_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      return [];
    }
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    fetchMyEvents,
    fetchEventMetrics,
    loading,
  };
};
