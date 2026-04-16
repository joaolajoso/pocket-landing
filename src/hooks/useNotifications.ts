import { useState, useEffect } from 'react';
import { useNetworkConnections } from '@/hooks/network/useNetworkConnections';
import { useContactSubmissions } from '@/hooks/network/useContactSubmissions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'notifications_last_seen';

export const useNotifications = () => {
  const { user } = useAuth();
  
  // Only run on dashboard routes to prevent queries on landing page
  const isDashboard = window.location.pathname.startsWith('/dashboard');
  
  const { connections } = useNetworkConnections();
  const { submissions } = useContactSubmissions();
  const [lastSeenTime, setLastSeenTime] = useState<Date>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Date(stored) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24h ago
  });
  const [profileViews, setProfileViews] = useState<number>(0);

  // Get new connections since last seen
  const newConnections = connections.filter(connection => {
    const connectionDate = new Date(connection.created_at);
    return connectionDate > lastSeenTime;
  });

  // Get new submissions since last seen
  const newSubmissions = submissions.filter(submission => {
    const submissionDate = new Date(submission.created_at);
    return submissionDate > lastSeenTime;
  });

  // Get profile views since last seen
  useEffect(() => {
    if (!isDashboard || !user) return; // Only fetch on dashboard
    
    const fetchProfileViews = async () => {
      try {
        const { count } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', user.id)
          .gte('timestamp', lastSeenTime.toISOString());

        setProfileViews(count || 0);
      } catch (error) {
        console.error('Error fetching profile views:', error);
        setProfileViews(0);
      }
    };

    fetchProfileViews();
  }, [user, lastSeenTime, isDashboard]);

  // Event notifications count (read from localStorage to avoid circular deps)
  const [eventNotifCount, setEventNotifCount] = useState(0);

  const totalNotifications = newConnections.length + newSubmissions.length + profileViews + eventNotifCount;

  const setEventNotificationCount = (count: number) => {
    setEventNotifCount(count);
  };

  const markAsRead = () => {
    const now = new Date();
    setLastSeenTime(now);
    localStorage.setItem(STORAGE_KEY, now.toISOString());
  };

  return {
    newConnections,
    newSubmissions,
    profileViews,
    totalNotifications,
    markAsRead,
    lastSeenTime,
    setEventNotificationCount
  };
};