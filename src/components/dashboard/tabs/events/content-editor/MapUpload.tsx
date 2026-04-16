import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2 } from 'lucide-react';
import { useEventCustomContent } from '@/hooks/useEventCustomContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface MapUploadProps {
  eventId: string;
}

const MapUpload = ({ eventId }: MapUploadProps) => {
  const { content, loading, createSection, updateSection, deleteSection } = useEventCustomContent(eventId);
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [mapId, setMapId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const mapContent = content.find(c => c.section_type === 'map');
    if (mapContent) {
      setMapId(mapContent.id);
      setImageUrl(mapContent.content?.image_url || '');
      setCaption(mapContent.content?.caption || '');
    }
  }, [content]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-map-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast({
        title: "Imagem carregada",
        description: "O mapa foi carregado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl) {
      toast({
        title: "Erro",
        description: "Por favor, carregue uma imagem do mapa",
        variant: "destructive",
      });
      return;
    }

    const data = {
      title: 'Mapa do Evento',
      content: { image_url: imageUrl, caption },
    };

    if (mapId) {
      await updateSection(mapId, data);
    } else {
      const newSection = await createSection('map', 'Mapa do Evento', { image_url: imageUrl, caption });
      if (newSection) {
        setMapId(newSection.id);
      }
    }
  };

  const handleRemove = async () => {
    if (mapId) {
      await deleteSection(mapId);
      setMapId(null);
      setImageUrl('');
      setCaption('');
    }
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa do Evento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="map-upload">Imagem do Mapa</Label>
          <div className="mt-2">
            <Input
              id="map-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos aceitos: JPG, PNG (máx. 5MB)
          </p>
        </div>

        {imageUrl && (
          <>
            <div className="border rounded-lg overflow-hidden">
              <img src={imageUrl} alt="Mapa do evento" className="w-full h-auto" />
            </div>

            <div>
              <Label htmlFor="map-caption">Legenda (opcional)</Label>
              <Input
                id="map-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Planta do pavilhão principal"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!imageUrl || uploading}>
            {uploading ? 'Carregando...' : 'Salvar Mapa'}
          </Button>
          {mapId && (
            <Button onClick={handleRemove} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Mapa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapUpload;