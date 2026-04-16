import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { OrganizationMember } from '@/hooks/organization/useOrganization';
import { Department } from '@/hooks/organization/useDepartments';
import { useEmployeePermissions, PermissionType } from '@/hooks/organization/useEmployeePermissions';
import { useRolePermissions } from '@/hooks/organization/useRolePermissions';
import { Eye, Users, TrendingUp } from 'lucide-react';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember;
  departments: Department[];
  organizationId: string;
  onUpdateRole: (memberId: string, role: 'admin' | 'manager' | 'employee') => Promise<any>;
  onUpdateDepartment: (memberId: string, departmentId: string | null) => Promise<any>;
  onRemove: (memberId: string) => Promise<any>;
  isOwner: boolean;
}

type MemberRole = 'owner' | 'admin' | 'manager' | 'employee';

export const EditMemberDialog = ({
  open,
  onOpenChange,
  member,
  departments,
  organizationId,
  onUpdateRole,
  onUpdateDepartment,
  onRemove,
  isOwner,
}: EditMemberDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<MemberRole>(member.role);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    member.department_id || 'none'
  );
  const [saving, setSaving] = useState(false);

  const { permissions, updatePermission } = useEmployeePermissions(organizationId);
  const { userRole } = useRolePermissions(organizationId);
  const memberPermissions = permissions.filter(p => p.organization_member_id === member.id);

  const getPermissionValue = (permissionType: string) => {
    const perm = memberPermissions.find(p => p.permission_type === permissionType);
    return perm?.granted || false;
  };

  // Determinar se o utilizador atual pode editar este membro
  const canEditMember = userRole === 'owner' || userRole === 'admin' || 
    (userRole === 'manager' && member.role === 'employee');

  useEffect(() => {
    setSelectedRole(member.role);
    setSelectedDepartment(member.department_id || 'none');
  }, [member]);

  const handleSave = async () => {
    setSaving(true);
    
    if (selectedRole !== member.role && canEditMember) {
      await onUpdateRole(member.id, selectedRole as 'admin' | 'manager' | 'employee');
    }
    
    const deptId = selectedDepartment === 'none' ? null : selectedDepartment;
    if (deptId !== member.department_id && canEditMember) {
      await onUpdateDepartment(member.id, deptId);
    }

    setSaving(false);
    onOpenChange(false);
  };

  const handleRemove = async () => {
    if (confirm(`Tem certeza que deseja remover ${member.profile?.name || 'este membro'}?`)) {
      setSaving(true);
      await onRemove(member.id);
      setSaving(false);
      onOpenChange(false);
    }
  };

  const handlePermissionToggle = async (permissionType: PermissionType, granted: boolean) => {
    if (!canEditMember) return;
    await updatePermission(member.id, permissionType, granted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerir Membro</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <div className="flex items-center gap-4 pb-4 border-b">
            {member.profile?.photo_url && (
              <img
                src={member.profile.photo_url}
                alt={member.profile.name || ''}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{member.profile?.name || 'Sem nome'}</h3>
              <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
            </div>
          </div>

          {/* Role Selection */}
          {(userRole === 'owner' || userRole === 'admin') && member.role !== 'owner' && (
            <div className="space-y-2">
              <Label>Função</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(val) => setSelectedRole(val as MemberRole)}
                disabled={!canEditMember}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Colaborador</SelectItem>
                  {(userRole === 'owner' || userRole === 'admin') && (
                    <SelectItem value="manager">Gestor</SelectItem>
                  )}
                  {userRole === 'owner' && (
                    <SelectItem value="admin">Administrador</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Department Selection */}
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Select 
              value={selectedDepartment} 
              onValueChange={setSelectedDepartment}
              disabled={!canEditMember}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem departamento</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissions */}
          {member.role === 'owner' || member.role === 'admin' ? (
            <div className="space-y-4">
              <h4 className="font-semibold">Permissões</h4>
              <p className="text-sm text-muted-foreground">
                {member.role === 'owner' ? 'O owner' : 'Os administradores'} têm todas as permissões por defeito.
              </p>
            </div>
          ) : member.role === 'manager' ? (
            <div className="space-y-4">
              <h4 className="font-semibold">Permissões do Gestor</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Os gestores têm as seguintes permissões automáticas:
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">Gerir Colaboradores</span>
                  </div>
                  <Badge variant="secondary">Ativa</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm">Ver Métricas da Empresa</span>
                  </div>
                  <Badge variant="secondary">Ativa</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm">Ver Métricas de Colaboradores</span>
                  </div>
                  <Badge variant="secondary">Ativa</Badge>
                </div>
              </div>
            </div>
          ) : (
            (userRole === 'owner' || userRole === 'admin' || userRole === 'manager') && (
              <div className="space-y-4">
                <h4 className="font-semibold">Permissões</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ver métricas da empresa</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite visualizar estatísticas gerais da organização
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('view_company_metrics')}
                      onCheckedChange={(checked) => handlePermissionToggle('view_company_metrics', checked)}
                      disabled={!canEditMember}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ver métricas de outros colaboradores</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite visualizar o desempenho de outros membros da equipa
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('view_employee_metrics')}
                      onCheckedChange={(checked) => handlePermissionToggle('view_employee_metrics', checked)}
                      disabled={!canEditMember}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Gerir colaboradores</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite adicionar e remover membros da organização
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('manage_employees')}
                      onCheckedChange={(checked) => handlePermissionToggle('manage_employees', checked)}
                      disabled={!canEditMember}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ver visualizações de perfil</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite visualizar quem viu os perfis
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('profile_views')}
                      onCheckedChange={(checked) => handlePermissionToggle('profile_views', checked)}
                      disabled={!canEditMember}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ver leads</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite visualizar leads capturados
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('leads')}
                      onCheckedChange={(checked) => handlePermissionToggle('leads', checked)}
                      disabled={!canEditMember}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ver conexões</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite visualizar conexões da rede
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('connections')}
                      onCheckedChange={(checked) => handlePermissionToggle('connections', checked)}
                      disabled={!canEditMember}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ver métricas de desempenho</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite visualizar métricas detalhadas de desempenho
                      </p>
                    </div>
                    <Switch
                      checked={getPermissionValue('performance_metrics')}
                      onCheckedChange={(checked) => handlePermissionToggle('performance_metrics', checked)}
                      disabled={!canEditMember}
                    />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {canEditMember && member.role !== 'owner' && (
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={saving}
              >
                Remover Membro
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
