import { useState } from "react";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, MapPin, Target } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterExternalEventDialog = ({ open, onOpenChange }: Props) => {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    event_date: "",
    end_date: "",
    location: "",
    city: "",
    country: "",
    description: "",
    leads_goal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id || !user?.id) return;
    if (!form.title || !form.event_date) {
      toast.error("Preencha o nome e a data do evento");
      return;
    }

    setLoading(true);
    try {
      // Two-step insert: first as 'public' (RLS visibility), then update to 'invite_only'
      const { data, error } = await supabase.from("events").insert({
        title: form.title,
        event_date: new Date(form.event_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        location: form.location || null,
        city: form.city || null,
        country: form.country || null,
        description: form.description || null,
        organization_id: organization.id,
        created_by: user.id,
        internal_event: true,
        source: "external",
        access_type: "public" as const,
        total_stands: form.leads_goal ? parseInt(form.leads_goal) : 0,
      }).select().single();

      if (error) throw error;

      // Update to invite_only
      const { error: updateError } = await supabase
        .from("events")
        .update({ access_type: "invite_only" as const })
        .eq("id", data.id);

      if (updateError) throw updateError;

      toast.success("Evento registado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["business-events"] });
      onOpenChange(false);
      setForm({ title: "", event_date: "", end_date: "", location: "", city: "", country: "", description: "", leads_goal: "" });
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao registar evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Registar evento externo</DialogTitle>
          <DialogDescription className="text-white/40 text-xs">
            Registe um evento que a sua empresa irá participar fora do PocketCV para acompanhar leads e métricas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Event name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/50">Nome do evento *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Web Summit 2036"
              className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-white/50">Data início *</Label>
              <Input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-white/50">Data fim</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm h-9"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-white/50">Local</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: FIL"
                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-white/50">Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex: Lisboa"
                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
              />
            </div>
          </div>

          {/* Leads goal */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/50 flex items-center gap-1.5">
              <Target className="h-3 w-3" />
              Meta de leads
            </Label>
            <Input
              type="number"
              min="0"
              value={form.leads_goal}
              onChange={(e) => setForm({ ...form, leads_goal: e.target.value })}
              placeholder="Ex: 50"
              className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
            />
            <p className="text-[10px] text-white/25">Quantos leads pretende captar neste evento?</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/50">Notas</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Notas internas sobre o evento..."
              className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 min-h-[60px] resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 text-xs font-medium"
          >
            {loading ? "A registar..." : "Registar evento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
