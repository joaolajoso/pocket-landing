import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useEventCustomContent } from '@/hooks/useEventCustomContent';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomSectionEditorProps {
  eventId: string;
}

const CustomSectionEditor = ({ eventId }: CustomSectionEditorProps) => {
  const { content, loading, createSection, updateSection, deleteSection } = useEventCustomContent(eventId);
  const [newSectionType, setNewSectionType] = useState<'info' | 'sponsors'>('info');

  const customSections = content.filter(c => c.section_type === 'info' || c.section_type === 'sponsors');

  const handleCreateSection = async () => {
    const title = newSectionType === 'info' ? 'Informações' : 'Patrocinadores';
    const initialContent = newSectionType === 'info' 
      ? { text: '' }
      : { items: [] };

    await createSection(newSectionType, title, initialContent);
    setNewSectionType('info'); // Reset after creation
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Seção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Tipo de Seção</Label>
            <Select value={newSectionType} onValueChange={(v: any) => setNewSectionType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informações / Texto</SelectItem>
                <SelectItem value="sponsors">Patrocinadores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateSection}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Seção
          </Button>
        </CardContent>
      </Card>

      {customSections.map((section) => (
        <SectionEditCard
          key={section.id}
          section={section}
          onUpdate={updateSection}
          onDelete={deleteSection}
        />
      ))}
    </div>
  );
};

interface SectionEditCardProps {
  section: any;
  onUpdate: (id: string, updates: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const SectionEditCard = ({ section, onUpdate, onDelete }: SectionEditCardProps) => {
  const [title, setTitle] = useState(section.title || '');
  const [text, setText] = useState(section.content?.text || '');

  const handleSave = async () => {
    await onUpdate(section.id, {
      title,
      content: { text },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{section.section_type === 'info' ? 'Informações' : 'Patrocinadores'}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(section.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Título da Seção</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Informações Importantes"
          />
        </div>

        {section.section_type === 'info' && (
          <div>
            <Label>Conteúdo</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o texto da seção..."
              rows={6}
            />
          </div>
        )}

        <Button onClick={handleSave}>
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomSectionEditor;