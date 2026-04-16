import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';
import { useEventCustomContent } from '@/hooks/useEventCustomContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OnboardingPageEditor from './content-editor/OnboardingPageEditor';

interface EventPublicPageTabProps {
  eventId: string;
  event: any;
}

export const EventPublicPageTab = ({ eventId, event }: EventPublicPageTabProps) => {
  const { content, loading } = useEventCustomContent(eventId);
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);

  const handlePreview = () => {
    window.open(`/events/${eventId}`, '_blank');
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { error } = await supabase
        .from('event_custom_content')
        .update({ is_active: true })
        .eq('event_id', eventId);

      if (error) throw error;

      toast({
        title: "Página publicada",
        description: "A página pública do evento está agora visível para os participantes.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao publicar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Página Pública do Evento</h2>
          <p className="text-sm text-white/40">
            Personalize a página que os participantes verão
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] text-white/70 text-sm hover:bg-white/[0.05] transition-all">
            <Eye className="h-4 w-4" />
            Pré-visualizar
          </button>
          <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600 transition-all disabled:opacity-50">
            <ExternalLink className="h-4 w-4" />
            {publishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      <OnboardingPageEditor eventId={eventId} event={event} />
    </div>
  );
};