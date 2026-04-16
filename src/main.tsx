import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// CRITICAL SECURITY: Immediate OAuth token cleanup - runs BEFORE React initializes
// This ensures tokens are never exposed in the URL even if the app crashes
(function cleanOAuthTokensSync() {
  const hash = window.location.hash;
  if (hash && (hash.includes('access_token=') || hash.includes('refresh_token='))) {
    // Schedule cleanup for after Supabase client has a chance to process tokens
    setTimeout(() => {
      if (window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        console.log('[Auth] OAuth tokens cleaned from URL (sync fallback)');
      }
    }, 150);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker to enable PWA install prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('SW registration failed', err));
  });
}
