import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackProfileView } from '@/lib/supabase';
import { useEventParticipantContext } from '@/hooks/useEventParticipantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to track profile views from different sources
 * Also captures event metrics if the profile belongs to an active event participant
 */
export const useProfileViewTracking = (profileId?: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId, isParticipant } = useEventParticipantContext(profileId);
  const { user } = useAuth();

  useEffect(() => {
    const trackView = async () => {
      console.log('👁️ [useProfileViewTracking] Tracking view for profile:', profileId);
      console.log('👤 [useProfileViewTracking] Current user:', user?.id);
      console.log('📍 [useProfileViewTracking] Event context:', { eventId, isParticipant });
      
      try {
        if (profileId) {
          const urlParams = new URLSearchParams(location.search);
          const source = urlParams.get('source');
          
          // Pass the current user ID to trackProfileView for sync owner check
          const currentUserId = user?.id;
          
          if (source === 'qr' || source === 'nfc') {
            console.log(`${source === 'qr' ? 'QR code scan' : 'NFC tap'} for profile:`, profileId);
            await trackProfileView(profileId, source, currentUserId);
            
            // Remove source param from URL without refreshing page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('source');
            navigate(newUrl.pathname + newUrl.search, { replace: true });
          } else {
            // Regular view tracking
            const utmSource = urlParams.get('utm_source') || urlParams.get('source') || 'direct';
            await trackProfileView(profileId, utmSource, currentUserId);
          }
          
          // Track event metric if this is an event participant
          if (eventId && isParticipant) {
            console.log('🎯 [useProfileViewTracking] Capturing event metric...');
            
            const metricParams = {
              _event_id: eventId,
              _participant_id: profileId,
              _metric_type: 'profile_view' as const,
              _metadata: {
                source: urlParams.get('source') || 'direct',
                timestamp: new Date().toISOString(),
                viewer_id: currentUserId || null,
              }
            };
            
            console.log('📤 [useProfileViewTracking] RPC params:', metricParams);
            
            const { data, error } = await supabase.rpc('capture_event_metric', metricParams);
            
            if (error) {
              console.error('❌ [useProfileViewTracking] Failed to capture event metric:', error);
            } else {
              console.log('✅ [useProfileViewTracking] Event metric captured successfully:', { data, eventId, profileId });
            }
          } else {
            console.log('⏭️ [useProfileViewTracking] Skipping event metric (no active event or not participant)');
          }
        }
      } catch (error) {
        console.error('❌ [useProfileViewTracking] Error tracking profile view:', error);
      }
    };
    
    if (profileId) {
      trackView();
    }
  }, [profileId, location.search, navigate, eventId, isParticipant, user?.id]);
};
