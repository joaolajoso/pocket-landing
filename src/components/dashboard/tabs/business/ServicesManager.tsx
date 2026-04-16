import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { X, Plus, Briefcase, Pencil, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/organizationWebsite';
import { UploadButton } from '@/components/UploadButton';
import { supabase } from '@/integrations/supabase/client';

interface ServicesManagerProps {
  services: Service[];
  onServicesChange: (services: Service[]) => void;
  websiteId?: string;
}

const MAX_SERVICES = 6;

const SUGGESTED_SERVICES = [
  'Consultoria',
  'Desenvolvimento Web',
  'Marketing Digital',
  'Design Gráfico',
  'Gestão de Redes Sociais',
  'SEO',
  'Branding',
  'Fotografia',
  'Vídeo Marketing',
  'E-commerce',
  'Suporte Técnico',
  'Formação',
];

export const ServicesManager = ({ services, onServicesChange, websiteId }: ServicesManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    icon: 'briefcase',
    image_url: '',
    url: '',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddService = () => {
    if (!newService.name) return;
    
    const service: Service = {
      id: crypto.randomUUID(),
      name: newService.name,
      description: newService.description || undefined,
      icon: newService.icon || 'briefcase',
      image_url: newService.image_url || undefined,
      url: newService.url || undefined,
    };
    
    onServicesChange([...services, service]);
    setNewService({ name: '', description: '', icon: 'briefcase', image_url: '', url: '' });
    setIsDialogOpen(false);
  };

  const handleEditService = () => {
    if (!editingService) return;
    
    const updated = services.map(s => 
      s.id === editingService.id ? editingService : s
    );
    onServicesChange(updated);
    setEditingService(null);
  };

  const handleRemoveService = (id: string) => {
    onServicesChange(services.filter(s => s.id !== id));
  };

  const handleImageUpload = async (file: File, isEditing: boolean) => {
    if (!websiteId) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `services/${websiteId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('organization-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading service image:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('organization-assets')
      .getPublicUrl(filePath);

    if (isEditing && editingService) {
      setEditingService({ ...editingService, image_url: publicUrl });
    } else {
      setNewService({ ...newService, image_url: publicUrl });
    }
  };

  const filteredSuggestions = SUGGESTED_SERVICES.filter(
    s => 
      s.toLowerCase().includes(newService.name?.toLowerCase() || '') &&
      !services.find(service => service.name === s)
  );

  const isAtLimit = services.length >= MAX_SERVICES;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Serviços ({services.length}/{MAX_SERVICES})</Label>
        {isAtLimit && (
          <Badge variant="secondary">Limite atingido</Badge>
        )}
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service) => (
          <Card key={service.id} className="relative group">
            <CardContent className="p-4 flex items-start gap-4">
              {/* Image or Icon */}
              {service.image_url ? (
                <img 
                  src={service.image_url} 
                  alt={service.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{service.name}</h4>
                {service.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {service.description}
                  </p>
                )}
                {service.url && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">{service.url}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingService(service)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveService(service.id!)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Service Button */}
        {!isAtLimit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Serviço</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2 relative">
                  <Label>Nome do Serviço *</Label>
                  <Input
                    value={newService.name || ''}
                    onChange={(e) => {
                      setNewService({ ...newService, name: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Nome do serviço"
                  />
                  {showSuggestions && newService.name && filteredSuggestions.length > 0 && (
                    <Card className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto">
                      <CardContent className="p-2">
                        {filteredSuggestions.slice(0, 5).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
                            onClick={() => {
                              setNewService({ ...newService, name: suggestion });
                              setShowSuggestions(false);
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newService.description || ''}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Breve descrição do serviço..."
                    rows={3}
                  />
                </div>
                {websiteId && (
                  <div className="space-y-2">
                    <Label>Imagem do Serviço</Label>
                    <div className="flex items-center gap-3">
                      {newService.image_url && (
                        <img src={newService.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                      )}
                      <UploadButton
                        onUpload={(file) => handleImageUpload(file, false)}
                        uploadText="Carregar Imagem"
                        accept="image/*"
                        maxSize={5}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Link do Serviço</Label>
                  <Input
                    value={newService.url || ''}
                    onChange={(e) => setNewService({ ...newService, url: e.target.value })}
                    placeholder="https://exemplo.com/servico"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Adicione um link para mais detalhes sobre este serviço.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddService} disabled={!newService.name}>
                  Adicionar Serviço
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Serviço *</Label>
                <Input
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  rows={3}
                />
              </div>
              {websiteId && (
                <div className="space-y-2">
                  <Label>Imagem do Serviço</Label>
                  <div className="flex items-center gap-3">
                    {editingService.image_url && (
                      <img src={editingService.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                    )}
                    <UploadButton
                      onUpload={(file) => handleImageUpload(file, true)}
                      uploadText="Alterar Imagem"
                      accept="image/*"
                      maxSize={5}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Link do Serviço</Label>
                <Input
                  value={editingService.url || ''}
                  onChange={(e) => setEditingService({ ...editingService, url: e.target.value })}
                  placeholder="https://exemplo.com/servico"
                  type="url"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingService(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditService}>
              Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        {isAtLimit 
          ? '⚠️ Atingiu o limite máximo de 6 serviços.'
          : `Pode adicionar até ${MAX_SERVICES - services.length} serviço(s) mais.`}
      </p>
    </div>
  );
};
