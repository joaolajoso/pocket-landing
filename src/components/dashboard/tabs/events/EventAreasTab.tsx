import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEventAreas } from '@/hooks/useEventAreas';
import { useEventParticipants } from '@/hooks/useEventParticipants';
import { Plus, Edit, Trash2, Building2, Users, Eye } from 'lucide-react';
import MapUpload from './content-editor/MapUpload';

interface EventAreasTabProps {
  eventId: string;
}

export const EventAreasTab = ({ eventId }: EventAreasTabProps) => {
  const { areas, loading: areasLoading, createArea, updateArea, deleteArea } = useEventAreas(eventId);
  const { participants, loading: participantsLoading } = useEventParticipants(eventId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data: areaVisitors } = useQuery({
    queryKey: ['area-visitors', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data: metrics } = await supabase
        .from('event_participant_metrics')
        .select('participant_id, metadata')
        .eq('event_id', eventId)
        .eq('metric_type', 'profile_view')
        .eq('is_during_event', true);
      return metrics || [];
    },
    enabled: !!eventId,
  });

  const handleCreate = async () => {
    try {
      await createArea(formData.name, formData.description);
      setFormData({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating area:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingArea) return;
    try {
      await updateArea(editingArea.id, formData.name, formData.description);
      setFormData({ name: '', description: '' });
      setEditingArea(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating area:', error);
    }
  };

  const handleDelete = async (areaId: string) => {
    if (confirm('Tem certeza que deseja remover esta área?')) {
      try {
        await deleteArea(areaId);
      } catch (error) {
        console.error('Error deleting area:', error);
      }
    }
  };

  const openEditDialog = (area: any) => {
    setEditingArea(area);
    setFormData({ name: area.name, description: area.description || '' });
    setIsEditDialogOpen(true);
  };

  const getAreaParticipants = (areaId: string) => {
    return participants.filter(p => p.area_id === areaId);
  };

  const getAreaBusinessCount = (areaId: string) => {
    const areaParticipants = getAreaParticipants(areaId);
    return new Set(areaParticipants.filter(p => p.user?.organization_id).map(p => p.user.organization_id)).size;
  };

  if (areasLoading || participantsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Áreas & Configurações</h2>
          <p className="text-sm text-white/40">Gerir áreas, mapa do evento e configurações adicionais</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] text-white/80 text-sm hover:bg-white/[0.05] transition-all">
              <Plus className="h-4 w-4" />
              Nova Área
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Área</DialogTitle>
              <DialogDescription>
                Adicione uma nova área para organizar os participantes do evento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Área</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Zona de Tecnologia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da área..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!formData.name}>Criar Área</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Areas Table */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        {areas.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-white/50">Nome</TableHead>
                  <TableHead className="text-white/50">Descrição</TableHead>
                  <TableHead className="text-center text-white/50">Participantes</TableHead>
                  <TableHead className="text-center text-white/50">Empresas</TableHead>
                  <TableHead className="text-center text-white/50">Visitantes</TableHead>
                  <TableHead className="text-right text-white/50">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => {
                  const areaParticipants = getAreaParticipants(area.id);
                  const businessCount = getAreaBusinessCount(area.id);
                  const visitorsToArea = areaVisitors?.filter(v => {
                    const viewedParticipant = participants.find(p =>
                      p.user_id === (v.metadata as any)?.viewed_user_id
                    );
                    return viewedParticipant?.area_id === area.id;
                  }) || [];
                  const uniqueVisitors = new Set(visitorsToArea.map(v => v.participant_id)).size;

                  return (
                    <TableRow key={area.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                      <TableCell className="font-medium text-white">{area.name}</TableCell>
                      <TableCell className="text-white/40">{area.description || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-white/[0.1] text-white/50">
                          <Users className="h-3 w-3 mr-1" />
                          {areaParticipants.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-white/[0.1] text-white/50">
                          <Building2 className="h-3 w-3 mr-1" />
                          {businessCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-white/[0.1] text-white/50">
                          <Eye className="h-3 w-3 mr-1" />
                          {uniqueVisitors}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditDialog(area)}
                            className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(area.id)}
                            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="h-10 w-10 mx-auto text-white/20 mb-3" />
            <p className="text-white/40">Nenhuma área configurada ainda.</p>
            <p className="text-xs text-white/30 mt-2">Crie áreas para organizar os participantes do evento.</p>
          </div>
        )}
      </div>

      {/* Map Upload */}
      <MapUpload eventId={eventId} />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Área</DialogTitle>
            <DialogDescription>Atualize as informações da área</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Área</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Zona de Tecnologia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da área..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={!formData.name}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};