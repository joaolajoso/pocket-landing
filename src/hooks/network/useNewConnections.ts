import { useState, useEffect, useCallback } from 'react';
import { useNetworkConnections } from './useNetworkConnections';

const STORAGE_KEY = 'network_last_viewed';

export const useNewConnections = () => {
  const { connections } = useNetworkConnections();
  const [lastViewedTime, setLastViewedTime] = useState<Date>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default to 7 days ago if never viewed
    return stored ? new Date(stored) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  });

  // Count connections created after last viewed time
  const newConnectionsCount = connections.filter(connection => {
    const connectionDate = new Date(connection.created_at);
    return connectionDate > lastViewedTime;
  }).length;

  // Mark network as viewed (call this when user opens network tab)
  const markNetworkAsViewed = useCallback(() => {
    const now = new Date();
    setLastViewedTime(now);
    localStorage.setItem(STORAGE_KEY, now.toISOString());
  }, []);

  return {
    newConnectionsCount,
    hasNewConnections: newConnectionsCount > 0,
    markNetworkAsViewed,
    lastViewedTime
  };
};
