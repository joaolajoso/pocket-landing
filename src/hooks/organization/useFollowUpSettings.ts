import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FollowUpSettings {
  id: string;
  organization_id: string;
  default_follow_up_days: number;
  email_notifications_enabled: boolean;
  webapp_notifications_enabled: boolean;
  reminder_days_before: number;
}

export const useFollowUpSettings = (organizationId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["follow-up-settings", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await (supabase as any)
        .from("organization_follow_up_settings")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (error) throw error;
      return data as FollowUpSettings | null;
    },
    enabled: !!organizationId,
  });

  const upsertSettings = useMutation({
    mutationFn: async (updates: Partial<FollowUpSettings>) => {
      if (!organizationId) throw new Error("No organization");
      
      const payload = {
        organization_id: organizationId,
        ...updates,
      };

      const { data, error } = await (supabase as any)
        .from("organization_follow_up_settings")
        .upsert(payload, { onConflict: "organization_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-settings", organizationId] });
      toast.success("Configurações atualizadas");
    },
    onError: () => {
      toast.error("Erro ao atualizar configurações");
    },
  });

  return {
    settings,
    isLoading,
    upsertSettings,
    defaultDays: settings?.default_follow_up_days ?? 7,
    emailEnabled: settings?.email_notifications_enabled ?? false,
    webappEnabled: settings?.webapp_notifications_enabled ?? true,
    reminderDaysBefore: settings?.reminder_days_before ?? 2,
  };
};
