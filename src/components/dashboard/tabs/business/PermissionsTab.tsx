import { Card } from '@/components/ui/card';
import { Shield, Eye, Users, TrendingUp, Link as LinkIcon, UserPlus } from 'lucide-react';

export const PermissionsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Controlo de Permissões de Dados</h2>
        <p className="text-muted-foreground">
          Gerir que dados cada colaborador partilha com a organização
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Sistema de Permissões</h3>
            <p className="text-muted-foreground">
              Os colaboradores controlam que dados partilham através do sistema de convites.
              Ao aceitar um convite, podem escolher quais permissões conceder à organização.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Eye className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Ver Métricas da Empresa</h4>
              <p className="text-sm text-muted-foreground">
                Permite ao colaborador visualizar estatísticas gerais da organização
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Ver Métricas de Outros Colaboradores</h4>
              <p className="text-sm text-muted-foreground">
                Permite visualizar o desempenho de outros membros da equipa
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <UserPlus className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Gerir Colaboradores</h4>
              <p className="text-sm text-muted-foreground">
                Permite adicionar e remover membros da organização
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Eye className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Visualizações de Perfil</h4>
              <p className="text-sm text-muted-foreground">
                Partilha dados sobre quem visualizou o perfil do colaborador
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Users className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Leads</h4>
              <p className="text-sm text-muted-foreground">
                Partilha informações de contactos capturados pelo colaborador
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <LinkIcon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Conexões</h4>
              <p className="text-sm text-muted-foreground">
                Partilha dados sobre conexões feitas na rede
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Métricas de Desempenho</h4>
              <p className="text-sm text-muted-foreground">
                Partilha métricas detalhadas de desempenho e atividade
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h4 className="font-semibold mb-2">Como Funciona</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>O owner ou admin envia um convite ao colaborador</li>
          <li>O colaborador recebe o convite e pode ver as permissões solicitadas</li>
          <li>O colaborador escolhe quais permissões quer conceder</li>
          <li>O owner/admin pode ajustar permissões posteriormente na gestão de equipa</li>
        </ol>
      </Card>
    </div>
  );
};
