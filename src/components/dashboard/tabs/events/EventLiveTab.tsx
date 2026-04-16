import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEventMetrics } from '@/hooks/useEventMetrics';
import { Users, Eye, MousePointerClick, UserPlus, TrendingUp, MessageSquare, Mail, CalendarCheck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortKey = 'user_name' | 'role' | 'views' | 'clicks' | 'leads' | 'connections' | 'meetingRequests' | 'messages' | 'scheduledMeetings' | 'total';
type SortDir = 'asc' | 'desc';

interface EventLiveTabProps {
  eventId: string;
}

export const EventLiveTab = ({ eventId }: EventLiveTabProps) => {
  const { metrics, loading } = useEventMetrics(eventId);
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const getMetricValue = (metric: any, key: SortKey): string | number => {
    switch (key) {
      case 'user_name': return metric.user_name || '';
      case 'role': return metric.role || '';
      case 'views': return metric.views_during_event;
      case 'clicks': return metric.clicks_during_event;
      case 'leads': return metric.leads_during_event;
      case 'connections': return metric.connections_during_event;
      case 'meetingRequests': return metric.meeting_requests_during_event;
      case 'messages': return metric.messages_during_event;
      case 'scheduledMeetings': return metric.scheduled_meetings_during_event;
      case 'total':
        return metric.views_during_event + metric.clicks_during_event + metric.leads_during_event +
          metric.connections_during_event + metric.meeting_requests_during_event +
          metric.messages_during_event + metric.scheduled_meetings_during_event;
      default: return 0;
    }
  };

  const sortedMetrics = useMemo(() => {
    return [...metrics.liveMetrics].sort((a, b) => {
      const aVal = getMetricValue(a, sortKey);
      const bVal = getMetricValue(b, sortKey);
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [metrics.liveMetrics, sortKey, sortDir]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 ml-1 inline opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 inline text-purple-400" />
      : <ArrowDown className="h-3 w-3 ml-1 inline text-purple-400" />;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'organizer': return 'Organizador';
      case 'stand': return 'Stand';
      default: return 'Participante';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics by Role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {metrics.participantMetrics.map((roleMetric) => (
          <div key={roleMetric.role} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{getRoleLabel(roleMetric.role)}</span>
              <Badge variant="outline" className="border-white/[0.1] text-white/50 text-[10px]">
                {getRoleLabel(roleMetric.role)}
              </Badge>
            </div>
            <div className="space-y-2">
              {[
                { icon: Eye, label: 'Visualizações', value: roleMetric.views },
                { icon: MousePointerClick, label: 'Clicks', value: roleMetric.clicks },
                { icon: UserPlus, label: 'Leads', value: roleMetric.leads },
                { icon: Users, label: 'Conexões', value: roleMetric.connections },
                { icon: MessageSquare, label: 'Pedidos de Meeting', value: roleMetric.meetingRequests },
                { icon: Mail, label: 'Mensagens', value: roleMetric.messages },
                { icon: CalendarCheck, label: 'Meetings Agendadas', value: roleMetric.scheduledMeetings },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Live Metrics Table */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-medium text-white">Métricas em Tempo Real</h3>
          <p className="text-xs text-white/40 mt-0.5">Dados capturados durante o período do evento</p>
        </div>

        {metrics.liveMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('user_name')}>
                    Participante <SortIcon column="user_name" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('role')}>
                    Papel <SortIcon column="role" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('views')}>
                    <Eye className="h-3.5 w-3.5 inline mr-1" />Views <SortIcon column="views" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('clicks')}>
                    <MousePointerClick className="h-3.5 w-3.5 inline mr-1" />Clicks <SortIcon column="clicks" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('leads')}>
                    <UserPlus className="h-3.5 w-3.5 inline mr-1" />Leads <SortIcon column="leads" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('connections')}>
                    <Users className="h-3.5 w-3.5 inline mr-1" />Conexões <SortIcon column="connections" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('meetingRequests')}>
                    <MessageSquare className="h-3.5 w-3.5 inline mr-1" />Pedidos <SortIcon column="meetingRequests" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('messages')}>
                    <Mail className="h-3.5 w-3.5 inline mr-1" />Msgs <SortIcon column="messages" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('scheduledMeetings')}>
                    <CalendarCheck className="h-3.5 w-3.5 inline mr-1" />Meetings <SortIcon column="scheduledMeetings" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none text-white/50 hover:text-white/70 transition-colors" onClick={() => handleSort('total')}>
                    <TrendingUp className="h-3.5 w-3.5 inline mr-1" />Total <SortIcon column="total" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMetrics.map((metric) => {
                  const total =
                    metric.views_during_event +
                    metric.clicks_during_event +
                    metric.leads_during_event +
                    metric.connections_during_event +
                    metric.meeting_requests_during_event +
                    metric.messages_during_event +
                    metric.scheduled_meetings_during_event;

                  return (
                    <TableRow key={metric.user_id} className="border-white/[0.06] hover:bg-white/[0.03]">
                      <TableCell className="font-medium text-white">{metric.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/[0.1] text-white/50 text-[10px]">
                          {getRoleLabel(metric.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-white/60">{metric.views_during_event}</TableCell>
                      <TableCell className="text-right text-white/60">{metric.clicks_during_event}</TableCell>
                      <TableCell className="text-right text-white/60">{metric.leads_during_event}</TableCell>
                      <TableCell className="text-right text-white/60">{metric.connections_during_event}</TableCell>
                      <TableCell className="text-right text-white/60">{metric.meeting_requests_during_event}</TableCell>
                      <TableCell className="text-right text-white/60">{metric.messages_during_event}</TableCell>
                      <TableCell className="text-right text-white/60">{metric.scheduled_meetings_during_event}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-bold border-white/[0.1] text-white">
                          {total}
                        </Badge>
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
            <p className="text-white/40">Nenhuma métrica capturada durante o evento ainda.</p>
            <p className="text-xs text-white/30 mt-2">As métricas aparecerão aqui durante o período do evento.</p>
          </div>
        )}
      </div>
    </div>
  );
};