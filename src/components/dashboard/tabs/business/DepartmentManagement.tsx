import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, Pencil, Trash2, MoreHorizontal, Users } from 'lucide-react';
import { useDepartments, Department } from '@/hooks/organization/useDepartments';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DepartmentManagementProps {
  organizationId: string;
}

export const DepartmentManagement = ({ organizationId }: DepartmentManagementProps) => {
  const { departments, loading, createDepartment, updateDepartment, deleteDepartment } = useDepartments(organizationId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDepartment) {
      await updateDepartment(editingDepartment.id, formData.name, formData.description);
    } else {
      await createDepartment(formData.name, formData.description);
    }

    setIsDialogOpen(false);
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este departamento? Os membros não serão removidos.')) {
      await deleteDepartment(id);
    }
  };

  const openNewDialog = () => {
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Departamentos</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openNewDialog}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo
        </Button>
      </div>

      {departments.length === 0 ? (
        <button
          type="button"
          onClick={openNewDialog}
          className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium">Criar primeiro departamento</span>
          <span className="text-xs text-muted-foreground/60">Organize a sua equipa por áreas</span>
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 transition-all hover:bg-white/10 hover:border-white/15"
              )}
            >
              <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Building2 className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{dept.name}</span>
              {dept.description && (
                <span className="text-xs text-muted-foreground hidden sm:inline">· {dept.description}</span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-white/10"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => handleEdit(dept)} className="gap-2 text-xs">
                    <Pencil className="h-3 w-3" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(dept.id)} className="gap-2 text-xs text-destructive focus:text-destructive">
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {/* Inline add button */}
          <button
            type="button"
            onClick={openNewDialog}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-white/10 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name" className="text-xs">Nome</Label>
              <Input
                id="dept-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Marketing, Vendas, Engenharia"
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc" className="text-xs">Descrição (opcional)</Label>
              <Textarea
                id="dept-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição do departamento"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                {editingDepartment ? 'Guardar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
