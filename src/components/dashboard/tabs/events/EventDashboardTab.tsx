import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Eye, Network, MapPin, RefreshCw, Ticket, ArrowLeft, Calendar, Globe, ExternalLink, Megaphone, Share2, Mail, AlertTriangle, Copy, Check, MessageCircle } from "lucide-react";
import { useEventMetrics } from "@/hooks/useEventMetrics";
import { useEventAreas } from "@/hooks/useEventAreas";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

import { EventParticipantsTab } from './EventParticipantsTab';
import { EventLiveTab } from './EventLiveTab';
import { EventAreasTab } from './EventAreasTab';
import { EventStandsTab } from './EventStandsTab';
import { EventInvitationsTab } from './EventInvitationsTab';
import TimelineEditor from './content-editor/TimelineEditor';
import { toast } from 'sonner';

interface EventDashboardTabProps {
  eventId: string;
  eventTitle: string;
  event: any;
}

const EventDashboardTab = ({ eventId, eventTitle, event }: EventDashboardTabProps) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const { metrics, refreshMetrics } = useEventMetrics(eventId);
  const { areas } = useEventAreas(eventId);
  const navigate = useNavigate();

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim() || !user) return;
    setSendingAnnouncement(true);
    const { error } = await supabase.from('event_announcements').insert({
      event_id: eventId,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      created_by: user.id,
    });
    if (error) {
      toast.error('Não foi possível enviar o comunicado.');
    } else {
      toast.success('Comunicado enviado com sucesso!');
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setAnnouncementDialogOpen(false);
    }
    setSendingAnnouncement(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMetrics();
    setTimeout(() => setRefreshing(false), 500);
  };

  const eventDate = event.event_date ? new Date(event.event_date) : null;
  const endDate = event.end_date ? new Date(event.end_date) : null;

  const publicUrl = `${window.location.origin}/events/${eventId}`;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEvent = () => {
    setShareDialogOpen(true);
  };

  const shareText = encodeURIComponent(`${eventTitle}`);
  const shareUrl = encodeURIComponent(publicUrl);

  const socialNetworks = [
    { name: 'WhatsApp', url: `https://wa.me/?text=${shareText}%20${shareUrl}`, bg: 'bg-[#25D366]',
      svg: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, bg: 'bg-[#0A66C2]',
      svg: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { name: 'X', url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, bg: 'bg-black dark:bg-white',
      svg: <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-white dark:fill-black"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, bg: 'bg-[#1877F2]',
      svg: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { name: 'Telegram', url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`, bg: 'bg-[#26A5E4]',
      svg: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { name: 'Email', url: `mailto:?subject=${shareText}&body=${shareUrl}`, bg: 'bg-muted',
      svg: <Mail className="h-5 w-5 text-foreground" /> },
  ];

  return (
    <div className="space-y-0">
      {/* Header: Back breadcrumb + Title + Event Page button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Eventos</span>
        </button>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
          {eventTitle}
        </h1>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-white/[0.08] mb-0">
            <TabsList className="bg-transparent p-0 h-auto gap-0 rounded-none w-full justify-start overflow-x-auto">
              {[
                { value: 'overview', label: 'Visão Geral' },
                { value: 'participants', label: 'Convidados' },
                { value: 'invitations', label: 'Inscrição' },
                { value: 'timeline', label: 'Programação' },
                { value: 'stands', label: 'Stands' },
                { value: 'insights', label: 'Insights' },
                { value: 'areas', label: 'Mais' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none bg-transparent text-white/40 hover:text-white/60 px-4 py-3 text-sm font-medium transition-colors"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* OVERVIEW TAB - Luma-style layout */}
          <TabsContent value="overview" className="mt-6 space-y-8">
            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('invitations')}
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div className="h-9 w-9 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">Convidar Convidados</span>
              </button>

              <button
                onClick={() => setAnnouncementDialogOpen(true)}
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">Enviar Comunicado</span>
              </button>

              <button
                onClick={handleShareEvent}
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div className="h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">Compartilhar Evento</span>
              </button>
            </div>

            {/* Event Preview + When & Where - Side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Preview Card */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                {event.image_url && (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={eventTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-white text-base">{eventTitle}</h3>
                  <div className="space-y-2">
                    {eventDate ? (
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(eventDate, "EEEE, dd 'de' MMMM", { locale: pt })}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-400/80 text-sm">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Data do evento não definida</span>
                      </div>
                    )}
                    {event.location ? (
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-400/80 text-sm">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Registre-se para ver o endereço</span>
                      </div>
                    )}
                    {!event.description && (
                      <div className="flex items-center gap-2 text-amber-400/80 text-sm">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Descrição do evento ausente</span>
                      </div>
                    )}
                  </div>

                  {/* Public link */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/40 hover:text-white/60 truncate max-w-[200px] flex items-center gap-1"
                    >
                      {publicUrl.replace('https://', '').slice(0, 30)}…
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="text-xs text-white/40 hover:text-white/70 uppercase tracking-wider font-medium flex items-center gap-1"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* When & Where */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white">Quando e Onde</h2>

                {/* Date card */}
                <div className="flex items-start gap-4">
                  {eventDate && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl border border-white/[0.08] bg-white/[0.03] flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                        {format(eventDate, 'MMM', { locale: pt }).toUpperCase()}
                      </span>
                      <span className="text-xl font-bold text-white leading-none">
                        {format(eventDate, 'dd')}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {eventDate && format(eventDate, "EEEE", { locale: pt }).replace(/^\w/, c => c.toUpperCase())}
                    </p>
                    <p className="text-sm text-white/50">
                      {eventDate && format(eventDate, "HH:mm", { locale: pt })}
                      {endDate && ` — ${format(endDate, "HH:mm", { locale: pt })}`}
                      {endDate && eventDate && eventDate.toDateString() !== endDate.toDateString() && (
                        <span className="text-white/30">
                          {` · ${format(endDate, "dd MMM", { locale: pt })}`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Location card */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white/40" />
                  </div>
                  <div>
                    {event.location ? (
                      <>
                        <p className="font-medium text-white">{event.location}</p>
                        <p className="text-sm text-white/50">
                          {[event.city, event.country].filter(Boolean).join(', ')}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          Localização Ausente
                        </p>
                        <p className="text-sm text-white/40">
                          Insira o local do evento antes que ele comece.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Access type */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white/40" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {event.access_type === 'public' ? 'Público' : event.access_type === 'invite_only' ? 'Apenas Convite' : 'Privado'}
                    </p>
                    <p className="text-sm text-white/50">
                      {event.access_type === 'public' ? 'Qualquer pessoa pode se inscrever' : 'Acesso restrito por convite'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share row */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <span className="text-sm text-white/40">Compartilhar Evento</span>
              <div className="flex items-center gap-4">
                <button onClick={handleShareEvent} className="text-white/30 hover:text-white/60 transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Announcement Dialog */}
            <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Comunicado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="Título do comunicado"
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Mensagem do comunicado..."
                    value={announcementMessage}
                    onChange={e => setAnnouncementMessage(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSendAnnouncement}
                    disabled={sendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publicar Comunicado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4 mt-6">
            <EventParticipantsTab eventId={eventId} />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4 mt-6">
            <EventInvitationsTab eventId={eventId} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-6">
            <div className="space-y-1 mb-4">
              <h2 className="text-lg font-semibold text-white">Programação</h2>
              <p className="text-sm text-white/40">Configure o cronograma e sessões do evento</p>
            </div>
            <TimelineEditor eventId={eventId} />
          </TabsContent>

          <TabsContent value="stands" className="space-y-4 mt-6">
            <EventStandsTab eventId={eventId} />
          </TabsContent>

          {/* Insights tab - metrics + live */}
          <TabsContent value="insights" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Participantes",
                  value: metrics?.totalParticipants || 0,
                  icon: Users,
                  color: "from-blue-500/20 to-blue-600/5",
                  iconColor: "text-blue-400",
                },
                {
                  label: "Views",
                  value: metrics?.totalViews || 0,
                  icon: Eye,
                  color: "from-purple-500/20 to-purple-600/5",
                  iconColor: "text-purple-400",
                },
                {
                  label: "Conexões",
                  value: metrics?.totalConnections || 0,
                  icon: Network,
                  color: "from-emerald-500/20 to-emerald-600/5",
                  iconColor: "text-emerald-400",
                },
                {
                  label: "Áreas",
                  value: areas?.length || 0,
                  icon: MapPin,
                  color: "from-amber-500/20 to-amber-600/5",
                  iconColor: "text-amber-400",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${card.color} backdrop-blur-xl p-4 sm:p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">{card.label}</p>
                    <card.icon className={`h-4 w-4 ${card.iconColor} opacity-60`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <EventLiveTab eventId={eventId} />
          </TabsContent>

          <TabsContent value="areas" className="space-y-4 mt-6">
            <EventAreasTab eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <Input value={publicUrl} readOnly className="text-sm" />
              <Button variant="outline" size="sm" onClick={() => { handleCopyLink(); }} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Social Networks Grid */}
            <div className="grid grid-cols-3 gap-3">
              {socialNetworks.map((network) => (
                <a
                  key={network.name}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-all group"
                >
                  <span className={`h-10 w-10 rounded-full ${network.bg} flex items-center justify-center`}>
                    {network.svg}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{network.name}</span>
                </a>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDashboardTab;
