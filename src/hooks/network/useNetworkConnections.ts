
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileData } from '@/hooks/useProfile';

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  created_at: string;
  note: string | null;
  tag: string | null;
  profile?: ProfileData;
}

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all connections for current user
  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get connections
      const { data: connectionData, error: connectionError } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (connectionError) throw connectionError;
      
      if (connectionData && connectionData.length > 0) {
        // Get profiles for each connection
        const profilePromises = connectionData.map(async (connection) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', connection.connected_user_id)
            .single();
            
          return { ...connection, profile: profileData || undefined };
        });
        
        const connectionsWithProfiles = await Promise.all(profilePromises);
        setConnections(connectionsWithProfiles);
      } else {
        setConnections([]);
      }
    } catch (err: any) {
      console.error('Error fetching connections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a connection
  const addConnection = async (connectedUserId: string, note?: string, tag?: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to save connections",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Check if connected user allows being saved
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('allow_network_saves')
        .eq('id', connectedUserId)
        .single();
      
      if (profileError) throw profileError;
      
      if (profileData && !profileData.allow_network_saves) {
        toast({
          title: "Cannot save connection",
          description: "This user does not allow their profile to be saved",
          variant: "destructive"
        });
        return false;
      }
      
      // Insert the connection
      const { error: insertError } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: connectedUserId,
          note: note || null,
          tag: tag || null
        });
      
      if (insertError) {
        // If it's a unique constraint violation, it means the connection already exists
        if (insertError.code === '23505') {
          toast({
            title: "Connection already exists",
            description: "This profile is already in your network",
            variant: "default"
          });
          return true;
        }
        throw insertError;
      }
      
      toast({
        title: "Connection saved",
        description: "Profile added to your network",
      });
      
      // Refresh connections
      await fetchConnections();
      return true;
    } catch (err: any) {
      console.error('Error adding connection:', err);
      toast({
        title: "Error saving connection",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Update connection note or tag
  const updateConnection = async (connectionId: string, updates: { note?: string, tag?: string }): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('connections')
        .update(updates)
        .eq('id', connectionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Connection updated",
        description: "Your connection details have been updated",
      });
      
      // Refresh connections
      await fetchConnections();
      return true;
    } catch (err: any) {
      console.error('Error updating connection:', err);
      toast({
        title: "Error updating connection",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Remove a connection
  const removeConnection = async (connectionId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Connection removed",
        description: "Profile removed from your network",
      });
      
      // Update local state
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      return true;
    } catch (err: any) {
      console.error('Error removing connection:', err);
      toast({
        title: "Error removing connection",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if a user is already connected
  const isConnected = (connectedUserId: string): boolean => {
    return connections.some(c => c.connected_user_id === connectedUserId);
  };

  // Setup real-time subscription to connection changes
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('network-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Refresh connections when changes occur
        fetchConnections();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user?.id]);

  return {
    connections,
    loading,
    error,
    addConnection,
    updateConnection,
    removeConnection,
    isConnected,
    refreshConnections: fetchConnections
  };
};
