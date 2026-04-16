import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
}

// Social icons that are handled by useSocialLinks hook
const SOCIAL_ICONS = ["linkedin", "github", "instagram", "twitter", "facebook", "youtube", "x"];

export const useCustomLinks = () => {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomLinks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("links")
        .select("id, title, url, icon, position")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("position", { ascending: true });

      if (error) throw error;

      const filtered = (data || []).filter(
        (link) => !SOCIAL_ICONS.includes(link.icon.toLowerCase())
      );

      setCustomLinks(filtered);
    } catch (error) {
      console.error("Error fetching custom links:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCustomLinks();
  }, [fetchCustomLinks]);

  const saveCustomLink = async (linkData: Omit<CustomLink, "id" | "position"> & { id?: string }): Promise<CustomLink | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive"
      });
      return null;
    }

    try {
      const normalizedIcon = linkData.icon.toLowerCase().replace("icon", "");

      if (linkData.id) {
        const { data, error } = await supabase
          .from("links")
          .update({
            title: linkData.title,
            url: linkData.url,
            icon: normalizedIcon,
            updated_at: new Date().toISOString()
          })
          .eq("id", linkData.id)
          .eq("user_id", user.id)
          .select("id, title, url, icon, position")
          .single();

        if (error) throw error;
        
        await fetchCustomLinks();
        return data;
      } else {
        const maxPosition = customLinks.length > 0 
          ? Math.max(...customLinks.map(l => l.position)) + 1 
          : 0;

        const { data, error } = await supabase
          .from("links")
          .insert({
            user_id: user.id,
            title: linkData.title,
            url: linkData.url,
            icon: normalizedIcon,
            position: maxPosition,
            active: true
          })
          .select("id, title, url, icon, position")
          .single();

        if (error) throw error;
        
        await fetchCustomLinks();
        return data;
      }
    } catch (error) {
      console.error("Error saving custom link:", error);
      toast({
        title: "Erro",
        description: "Não foi possível guardar o link",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteCustomLink = async (linkId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", linkId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchCustomLinks();
      return true;
    } catch (error) {
      console.error("Error deleting custom link:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o link",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    customLinks,
    loading,
    saveCustomLink,
    deleteCustomLink,
    refetch: fetchCustomLinks
  };
};
