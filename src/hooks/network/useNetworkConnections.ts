
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  note?: string | null;
  tag?: string | null;
  created_at: string;
}

export const useNetworkConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all connections
  const fetchConnections = async () => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setConnections(data || []);
    } catch (err: any) {
      console.error('Error fetching connections:', err);
      toast({
        title: 'Error fetching connections',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a connection
  const addConnection = async (profileId: string, note: string = '', tag: string = ''): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to save profiles',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from('connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('connected_user_id', profileId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingConnection) {
        toast({
          title: 'Already saved',
          description: 'This profile is already in your network',
        });
        return true;
      }
      
      // Add new connection
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: profileId,
          note,
          tag,
        });
      
      if (error) throw error;
      
      // Refresh connections
      await fetchConnections();
      
      toast({
        title: 'Profile added',
        description: 'Profile has been added to your network',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding connection:', err);
      toast({
        title: 'Error adding connection',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remove a connection
  const removeConnection = async (connectionId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      toast({
        title: 'Connection removed',
        description: 'Profile has been removed from your network',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error removing connection:', err);
      toast({
        title: 'Error removing connection',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Check if a profile is connected
  const isConnected = (profileId: string): boolean => {
    return connections.some(conn => conn.connected_user_id === profileId);
  };

  // Load connections on mount and when user changes
  useEffect(() => {
    fetchConnections();
    
    // Set up subscription for real-time updates
    if (user) {
      const channel = supabase
        .channel('connections-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchConnections();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    connections,
    loading,
    addConnection,
    removeConnection,
    refreshConnections: fetchConnections,
    isConnected,
  };
};
