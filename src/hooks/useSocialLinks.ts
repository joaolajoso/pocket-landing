import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
}

// Social network icon types
const SOCIAL_ICONS = ["linkedin", "github", "instagram", "twitter", "facebook", "youtube", "tiktok", "whatsapp", "telegram"];

export const useSocialLinks = () => {
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSocialLinks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .in("icon", SOCIAL_ICONS)
        .order("position");

      if (error) throw error;

      setSocialLinks(
        data.map((link) => ({
          id: link.id,
          title: link.title,
          url: link.url,
          icon: link.icon,
          position: link.position || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching social links:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  const saveSocialLink = async (linkData: Omit<SocialLink, "id" | "position"> & { id?: string }) => {
    if (!user) return null;

    try {
      if (linkData.id) {
        // Update existing link
        const { error } = await supabase
          .from("links")
          .update({
            title: linkData.title,
            url: linkData.url,
            icon: linkData.icon,
            updated_at: new Date().toISOString(),
          })
          .eq("id", linkData.id);

        if (error) throw error;

        toast({
          title: "Link updated",
          description: "Social network link updated successfully.",
        });
      } else {
        // Create new link (without group)
        const { error } = await supabase.from("links").insert({
          user_id: user.id,
          title: linkData.title,
          url: linkData.url,
          icon: linkData.icon,
          position: socialLinks.length,
          group_id: null,
        });

        if (error) throw error;

        toast({
          title: "Link added",
          description: "Social network link added successfully.",
        });
      }

      await fetchSocialLinks();
      return true;
    } catch (error) {
      console.error("Error saving social link:", error);
      toast({
        title: "Error",
        description: "Failed to save social network link.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSocialLink = async (linkId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("links").delete().eq("id", linkId);

      if (error) throw error;

      toast({
        title: "Link removed",
        description: "Social network link removed successfully.",
      });

      await fetchSocialLinks();
      return true;
    } catch (error) {
      console.error("Error deleting social link:", error);
      toast({
        title: "Error",
        description: "Failed to remove social network link.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    socialLinks,
    loading,
    saveSocialLink,
    deleteSocialLink,
    refetch: fetchSocialLinks,
  };
};
