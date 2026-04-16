
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@/hooks/profile/useProfileData';

export interface ConnectionLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
}

export interface ConnectionInterests {
  professional_roles: string[];
  industries: string[];
  networking_goals: string[];
}

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  connected_organization_id?: string | null;
  note?: string | null;
  tag?: string | null;
  follow_up_date?: string | null;
  created_at: string;
  profile?: ProfileData | null;
  links?: ConnectionLink[];
  interests?: ConnectionInterests | null;
  businessSubdomain?: string | null;
}

interface ConnectionUpdate {
  note?: string;
  tag?: string;
  follow_up_date?: string | null;
}

export const useNetworkConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Batch-fetch all connections with profile data, links, and interests
  const fetchConnections = useCallback(async () => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch all connection rows
      const { data: rawConnections, error: connError } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (connError) throw connError;
      if (!rawConnections || rawConnections.length === 0) {
        setConnections([]);
        setLoading(false);
        return;
      }

      const connectedUserIds = rawConnections.map(c => c.connected_user_id);
      const businessOrgIds = rawConnections
        .filter(c => !!c.connected_organization_id)
        .map(c => c.connected_organization_id!);

      // 2. Batch-fetch all related data in parallel (4 queries instead of N*3-5)
      const [profilesResult, linksResult, interestsResult, orgsResult, websitesResult] = await Promise.all([
        // All profiles at once
        supabase
          .from('profiles')
          .select('*, organization_id')
          .in('id', connectedUserIds),
        // All active links at once
        supabase
          .from('links')
          .select('id, title, url, icon, active, user_id')
          .in('user_id', connectedUserIds)
          .eq('active', true)
          .order('position'),
        // All interests at once
        supabase
          .from('user_interests')
          .select('user_id, professional_roles, industries, networking_goals')
          .in('user_id', connectedUserIds),
        // All business orgs at once (if any)
        businessOrgIds.length > 0
          ? supabase
              .from('organizations')
              .select('id, name, logo_url, description')
              .in('id', businessOrgIds)
          : Promise.resolve({ data: [], error: null }),
        // All org websites at once - collect all org IDs (business + personal)
        supabase
          .from('organization_websites')
          .select('organization_id, subdomain, is_published')
          .eq('is_published', true)
      ]);

      // 3. Build lookup maps for O(1) access
      const profilesMap = new Map<string, any>();
      (profilesResult.data || []).forEach(p => profilesMap.set(p.id, p));

      const linksMap = new Map<string, ConnectionLink[]>();
      (linksResult.data || []).forEach(link => {
        const userId = (link as any).user_id;
        if (!linksMap.has(userId)) linksMap.set(userId, []);
        linksMap.get(userId)!.push({
          id: link.id,
          title: link.title,
          url: link.url,
          icon: link.icon,
          active: link.active ?? true,
        });
      });

      const interestsMap = new Map<string, ConnectionInterests>();
      (interestsResult.data || []).forEach((i: any) => {
        interestsMap.set(i.user_id, {
          professional_roles: i.professional_roles || [],
          industries: i.industries || [],
          networking_goals: i.networking_goals || [],
        });
      });

      const orgsMap = new Map<string, any>();
      ((orgsResult as any).data || []).forEach((o: any) => orgsMap.set(o.id, o));

      const websitesMap = new Map<string, string>();
      (websitesResult.data || []).forEach((w: any) => {
        websitesMap.set(w.organization_id, w.subdomain);
      });

      // 4. Assemble connections client-side
      const assembled: Connection[] = rawConnections.map(connection => {
        const isBusinessConnection = !!connection.connected_organization_id;
        const profileData = profilesMap.get(connection.connected_user_id);
        const links = linksMap.get(connection.connected_user_id) || [];
        const interests = interestsMap.get(connection.connected_user_id) || null;

        let businessSubdomain: string | null = null;
        let mappedProfile: ProfileData | null = null;

        if (isBusinessConnection && connection.connected_organization_id) {
          const orgData = orgsMap.get(connection.connected_organization_id);
          businessSubdomain = websitesMap.get(connection.connected_organization_id) || null;

          if (orgData) {
            mappedProfile = {
              id: connection.connected_user_id,
              name: orgData.name,
              bio: orgData.description,
              headline: orgData.description,
              photo_url: orgData.logo_url,
              avatar_url: orgData.logo_url,
              username: businessSubdomain || undefined,
              slug: profileData?.slug || undefined,
              email: profileData?.email || undefined,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              view_count: 0,
              link_click_count: 0,
              card_created: false,
              links_added: false,
              design_customized: false,
              settings_filled: false,
              theme_id: null,
              custom_theme: null,
              linkedin_title: null,
              website_title: null,
              email_title: null,
              phone: null,
              location: null,
            } as any;
          }
        }

        if (!mappedProfile && profileData) {
          // Personal connection - check for business subdomain via org
          if (profileData.organization_id) {
            businessSubdomain = websitesMap.get(profileData.organization_id) || null;
          }

          mappedProfile = {
            ...profileData,
            username: profileData.slug,
            id: profileData.id,
            updated_at: profileData.updated_at || new Date().toISOString(),
            created_at: profileData.created_at || new Date().toISOString(),
            view_count: 0,
            link_click_count: 0,
            card_created: false,
            links_added: false,
            design_customized: false,
            settings_filled: false,
            theme_id: null,
            custom_theme: null,
            linkedin_title: null,
            website_title: null,
            email_title: null,
            phone: null,
            location: null,
          };
        }

        return {
          ...connection,
          connected_organization_id: connection.connected_organization_id,
          profile: mappedProfile,
          links,
          interests,
          businessSubdomain,
        };
      });
      
      setConnections(assembled);
    } catch (err: any) {
      console.error('Error fetching connections:', err);
      setError(err.message);
      toast({
        title: 'Error fetching connections',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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
      
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: profileId,
          note,
          tag,
        });
      
      if (error) throw error;

      // Add reverse connection (bidirectional), ignore duplicates
      await supabase
        .from('connections')
        .insert({
          user_id: profileId,
          connected_user_id: user.id,
        })
        .then(() => {});
      
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

  // Update a connection
  const updateConnection = async (connectionId: string, updates: ConnectionUpdate): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to update connections',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .update(updates)
        .eq('id', connectionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, ...updates } 
            : conn
        )
      );
      
      toast({
        title: 'Connection updated',
        description: 'Connection details have been updated',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating connection:', err);
      toast({
        title: 'Error updating connection',
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
    const isDashboard = window.location.pathname.startsWith('/dashboard');
    if (!isDashboard) return;
    
    fetchConnections();
    
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
  }, [user?.id, fetchConnections]);

  return {
    connections,
    loading,
    error,
    addConnection,
    updateConnection,
    removeConnection,
    refreshConnections: fetchConnections,
    isConnected,
  };
};
