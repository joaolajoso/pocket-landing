import { useState } from 'react';
import { useAuditLogs, AuditFilters } from '@/hooks/useAuditLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export const AuditLogViewer = () => {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const { logs, loading, isAdmin, currentPage, setCurrentPage, totalCount, pageSize, exportToCSV } = useAuditLogs(filters);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = () => {
    setFilters({
      ...filters,
      searchTerm: searchTerm || undefined,
      fieldChanged: selectedField !== 'all' ? selectedField : undefined,
      actionType: selectedAction !== 'all' ? selectedAction : undefined,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedField('all');
    setSelectedAction('all');
    setFilters({});
    setCurrentPage(1);
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Acesso negado. Apenas administradores podem visualizar logs de auditoria.
        </AlertDescription>
      </Alert>
    );
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'UPDATE':
        return 'default';
      case 'DELETE':
        return 'destructive';
      case 'INSERT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria GDPR</CardTitle>
          <CardDescription>
            Registo completo de alterações em dados sensíveis dos utilizadores. Retenção: 2 anos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar valores antigos ou novos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os campos</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone_number">Telefone</SelectItem>
                <SelectItem value="bio">Bio</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="share_email_publicly">Partilha Email</SelectItem>
                <SelectItem value="share_phone_publicly">Partilha Telefone</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Eliminação</SelectItem>
                <SelectItem value="INSERT">Criação</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="default">
              <Search className="h-4 w-4 mr-2" />
              Pesquisar
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button onClick={exportToCSV} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-4 text-sm text-muted-foreground">
            Total de registos: <span className="font-semibold">{totalCount}</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhum log encontrado com os filtros aplicados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor Antigo</TableHead>
                    <TableHead>Valor Novo</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{log.profiles?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{log.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action_type)}>
                          {log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.field_changed}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">
                        {log.old_value || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">
                        {log.new_value || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
