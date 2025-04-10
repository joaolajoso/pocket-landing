
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackProfileView } from '@/lib/supabase';

/**
 * Hook to track profile views from different sources
 */
export const useProfileViewTracking = (profileId?: string) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const trackView = async () => {
      try {
        if (profileId) {
          const urlParams = new URLSearchParams(location.search);
          const source = urlParams.get('source');
          
          if (source === 'qr' || source === 'nfc') {
            console.log(`${source === 'qr' ? 'QR code scan' : 'NFC tap'} for profile:`, profileId);
            await trackProfileView(profileId, source);
            
            // Remove source param from URL without refreshing page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('source');
            navigate(newUrl.pathname + newUrl.search, { replace: true });
          } else {
            // Regular view tracking
            const utmSource = urlParams.get('utm_source') || urlParams.get('source') || 'direct';
            await trackProfileView(profileId, utmSource);
          }
        }
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    };
    
    if (profileId) {
      trackView();
    }
  }, [profileId, location.search, navigate]);
};
