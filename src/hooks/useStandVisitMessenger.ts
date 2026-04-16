import { supabase } from '@/integrations/supabase/client';

/**
 * When a participant visits a stand's profile (via QR or link),
 * auto-create a meeting request and send "Olá! Visitei o stand [name]" message.
 */
export const recordStandVisit = async (
  visitorUserId: string,
  standUserId: string,
  eventId: string,
  standName: string
) => {
  try {
    // Check if conversation already exists between these users for this event
    const { data: existing } = await supabase
      .from('event_meeting_requests')
      .select('id')
      .eq('event_id', eventId)
      .or(`and(sender_id.eq.${visitorUserId},receiver_id.eq.${standUserId}),and(sender_id.eq.${standUserId},receiver_id.eq.${visitorUserId})`)
      .maybeSingle();

    if (existing) {
      // Already have a conversation, skip
      return existing.id;
    }

    const message = `Olá! Visitei o stand ${standName} 👋`;

    // Create meeting request
    const { data: request, error: requestError } = await supabase
      .from('event_meeting_requests')
      .insert({
        event_id: eventId,
        sender_id: visitorUserId,
        receiver_id: standUserId,
        message,
        status: 'accepted' // Auto-accept stand visit conversations
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Send initial message
    await supabase.from('event_messages').insert({
      meeting_request_id: request.id,
      sender_id: visitorUserId,
      content: message
    });

    return request.id;
  } catch (error) {
    console.error('Error recording stand visit message:', error);
    return null;
  }
};

/**
 * Check if a profile belongs to a stand in any active event,
 * and if so, trigger the auto-message.
 */
export const checkAndRecordStandVisit = async (
  viewerUserId: string,
  profileOwnerId: string
) => {
  try {
    // Don't message yourself
    if (viewerUserId === profileOwnerId) return;

    // Check if profileOwner is a stand in any active event
    const { data: stands } = await supabase
      .from('event_stands')
      .select('id, event_id, stand_name, company_name, assigned_user_id')
      .eq('assigned_user_id', profileOwnerId)
      .eq('is_active', true);

    if (!stands || stands.length === 0) return;

    // Check if viewer is a participant of the same event
    for (const stand of stands) {
      const { data: participant } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', stand.event_id)
        .eq('user_id', viewerUserId)
        .maybeSingle();

      if (participant) {
        const standDisplayName = stand.company_name || stand.stand_name || 'Stand';
        
        // Deduplicate: only once per day per stand
        const visitKey = `stand-visit-${stand.id}-${viewerUserId}`;
        const lastVisit = localStorage.getItem(visitKey);
        const today = new Date().toISOString().split('T')[0];
        
        if (lastVisit === today) continue;

        await recordStandVisit(viewerUserId, profileOwnerId, stand.event_id, standDisplayName);
        localStorage.setItem(visitKey, today);
      }
    }
  } catch (error) {
    console.error('Error in checkAndRecordStandVisit:', error);
  }
};
