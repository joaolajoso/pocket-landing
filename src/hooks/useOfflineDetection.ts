import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
}

export const useOfflineDetection = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => {
        if (prev.wasOffline) {
          toast({
            title: "Back online",
            description: "Your connection has been restored. Any pending changes will be saved."
          });
        }
        return { isOnline: true, wasOffline: prev.wasOffline };
      });
    };

    const handleOffline = () => {
      setState({ isOnline: false, wasOffline: true });
      toast({
        title: "Connection lost",
        description: "You're offline. Changes will be saved when connection is restored.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return state;
};