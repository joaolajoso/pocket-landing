import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * CRITICAL SECURITY COMPONENT
 * This component MUST run FIRST in the application to clean OAuth tokens from URL
 * Prevents token exposure even if the application crashes after authentication
 */
export const OAuthTokenCleaner = () => {
  const cleaned = useRef(false);

  useEffect(() => {
    if (cleaned.current) return;
    cleaned.current = true;

    const cleanOAuthTokens = async () => {
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      
      // Check if URL contains OAuth tokens
      if (hash && (hash.includes('access_token=') || hash.includes('refresh_token='))) {
        console.log('[Auth] OAuth tokens detected in URL');
        
        // CRITICAL: Check if this is a password recovery flow
        const isRecovery = hashParams.get('type') === 'recovery';
        
        if (isRecovery) {
          console.log('[Auth] Recovery flow detected, redirecting to login...');
          // Preserve the hash for the login page to process
          window.location.href = '/login?type=recovery' + window.location.hash;
          return; // Don't process here, let login page handle it
        }
        
        // Regular OAuth flow - process and clean
        try {
          await supabase.auth.getSession();
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            console.log('[Auth] OAuth tokens cleaned from URL');
          }
        } catch (error) {
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          console.error('[Auth] Error processing OAuth tokens:', error);
        }
      }
    };

    cleanOAuthTokens();
  }, []);

  return null;
};
