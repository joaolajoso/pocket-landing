import { useState, useEffect } from 'react';
import { useEventStands, EventStand } from '@/hooks/useEventStands';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { StandQRCode } from './StandQRCode';
import { Store, QrCode, Copy, Edit, Trash2, CheckCircle2, XCircle, Download, Link, Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import pocketcvLogo from '@/assets/pocketcv-logo-gradient.png';

interface EventStandsTabProps {
  eventId: string;
}

export const EventStandsTab = ({ eventId }: EventStandsTabProps) => {
  const { stands, loading, generateStands, updateStand, deleteAllStands } = useEventStands(eventId);
  const { toast } = useToast();
  const [totalStands, setTotalStands] = useState<number>(10);
  const [editingStand, setEditingStand] = useState<EventStand | null>(null);
  const [editName, setEditName] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showInviteQR, setShowInviteQR] = useState(false);
  const [userSlugs, setUserSlugs] = useState<Record<string, string>>({});

  useEffect(() => {
    const assignedUserIds = stands
      .filter(s => s.assigned_user_id)
      .map(s => s.assigned_user_id as string);
    if (assignedUserIds.length === 0) { setUserSlugs({}); return; }
    const fetchSlugs = async () => {
      const { data } = await supabase.from('profiles').select('id, slug').in('id', assignedUserIds);
      if (data) {
        const slugMap: Record<string, string> = {};
        data.forEach(p => { if (p.slug) slugMap[p.id] = p.slug; });
        setUserSlugs(slugMap);
      }
    };
    fetchSlugs();
  }, [stands]);

  const generalInviteLink = stands.length > 0
    ? `https://pocketcv.pt/events/stand-invite/${stands.find(s => !s.assigned_user_id)?.onboarding_link_id || stands[0].onboarding_link_id}`
    : '';

  const handleCopyGeneralLink = () => {
    if (!generalInviteLink) return;
    navigator.clipboard.writeText(generalInviteLink);
    setLinkCopied(true);
    toast({ title: "Link copiado!", description: "O link de convite para empresas foi copiado." });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleGenerateStands = async () => {
    if (totalStands < 1 || totalStands > 1000) {
      toast({ title: "Número inválido", description: "O número de stands deve estar entre 1 e 1000.", variant: "destructive" });
      return;
    }
    await generateStands(totalStands);
  };

  const handleCopyLink = (linkId: string) => {
    const url = `https://pocketcv.pt/events/stand-invite/${linkId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado", description: "O link de convite com onboarding foi copiado." });
  };

  const handleToggleActive = async (stand: EventStand) => {
    await updateStand(stand.id, { is_active: !stand.is_active });
  };

  const handleSaveEdit = async () => {
    if (editingStand) {
      await updateStand(editingStand.id, { stand_name: editName });
      setEditingStand(null);
      setEditName('');
    }
  };

  const openEditDialog = (stand: EventStand) => {
    setEditingStand(stand);
    setEditName(stand.stand_name || '');
  };

  const handleDownloadAllQRCodes = async () => {
    try {
      const zip = new JSZip();
      toast({ title: "A gerar QR Codes...", description: `A processar ${stands.length} QR codes. Aguarde...` });
      const logoResponse = await fetch(pocketcvLogo);
      const logoBlob = await logoResponse.blob();
      const logoImg = await createImageBitmap(logoBlob);

      for (const stand of stands) {
        const standUrl = `https://pocketcv.pt/events/stand-invite/${stand.onboarding_link_id}`;
        const tempCanvas = document.createElement('canvas');
        await QRCode.toCanvas(tempCanvas, standUrl, { width: 512, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#8B5CF6', light: '#FFFFFF' } });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        canvas.width = 512; canvas.height = 580;
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        const logoSize = 100;
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(256, 256, logoSize / 2 + 8, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(logoImg, (512 - logoSize) / 2, (512 - logoSize) / 2, logoSize, logoSize);
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 48px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`Stand ${stand.stand_number}`, 256, 546);
        const blob = await new Promise<Blob>((resolve) => { canvas.toBlob((b) => resolve(b!), 'image/png'); });
        zip.file(`stand-${stand.stand_number}-qrcode.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url; link.download = `qrcodes-stands-evento.zip`; link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download concluído", description: `${stands.length} QR codes foram descarregados em ZIP.` });
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast({ title: "Erro ao gerar QR codes", description: "Ocorreu um erro ao gerar o arquivo ZIP.", variant: "destructive" });
    }
  };

  if (loading && stands.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-32 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="h-96 w-full rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Gestão de Stands</h2>
        <p className="text-sm text-white/40">Configure e gerencie os stands disponíveis para este evento</p>
      </div>

      {/* Configuration */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Store className="h-4 w-4 text-white/50" />
          <span className="text-sm font-medium text-white">Configuração</span>
        </div>

        {stands.length === 0 ? (
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Número de Stands</label>
              <Input
                type="number" min="1" max="1000"
                value={totalStands}
                onChange={(e) => setTotalStands(parseInt(e.target.value) || 0)}
                placeholder="Ex: 50"
                className="bg-white/[0.05] border-white/[0.1] text-white"
              />
            </div>
            <Button onClick={handleGenerateStands} disabled={loading}>Gerar Stands</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">{stands.length} Stands Configurados</p>
              <p className="text-sm text-white/40">
                {stands.filter(s => s.assigned_user_id).length} ocupados • {stands.filter(s => !s.assigned_user_id).length} disponíveis
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownloadAllQRCodes} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] text-white/70 text-sm hover:bg-white/[0.05] transition-all">
                <Download className="h-4 w-4" />
                Download ZIP
              </button>
              <button onClick={deleteAllStands} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400/80 text-sm hover:bg-red-500/10 transition-all">
                <Trash2 className="h-4 w-4" />
                Eliminar Todos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* General Invite Link */}
      {stands.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-white/50" />
            <span className="text-sm font-medium text-white">Link de Convite para Empresas</span>
          </div>
          <p className="text-xs text-white/40">Partilhe este link com as empresas convidadas para criarem conta business.</p>
          <div className="flex items-center gap-3">
            <Input readOnly value={generalInviteLink} className="font-mono text-sm bg-white/[0.05] border-white/[0.1] text-white/70" />
            <button onClick={handleCopyGeneralLink} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${linkCopied ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-white/[0.1] text-white/70 hover:bg-white/[0.05]'}`}>
              {linkCopied ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
            </button>
            <Dialog open={showInviteQR} onOpenChange={setShowInviteQR}>
              <DialogTrigger asChild>
                <button className="shrink-0 px-3 py-2 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors">
                  <QrCode className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>QR Code de Convite</DialogTitle>
                  <DialogDescription>Partilhe este QR code com as empresas para se registarem no evento.</DialogDescription>
                </DialogHeader>
                <StandQRCode
                  onboardingLinkId={stands.find(s => !s.assigned_user_id)?.onboarding_link_id || stands[0]?.onboarding_link_id}
                  standNumber={0}
                  profileSlug={undefined}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Stands Table */}
      {stands.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="w-16 text-white/50">#</TableHead>
                  <TableHead className="text-white/50">Nome</TableHead>
                  <TableHead className="text-white/50">Empresa</TableHead>
                  <TableHead className="text-white/50">Email</TableHead>
                  <TableHead className="text-white/50">Status</TableHead>
                  <TableHead className="text-center w-20 text-white/50">
                    <span className="flex items-center gap-1 justify-center"><Star className="h-3.5 w-3.5" />Review</span>
                  </TableHead>
                  <TableHead className="text-right text-white/50">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stands.map((stand) => (
                  <TableRow key={stand.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                    <TableCell className="font-medium text-white">{stand.stand_number}</TableCell>
                    <TableCell className="text-white/60">{stand.stand_name || '-'}</TableCell>
                    <TableCell className="text-white/60">{stand.company_name || '-'}</TableCell>
                    <TableCell className="text-sm text-white/40">{stand.company_email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {stand.assigned_user_id ? (
                          <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />Ocupado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-white/[0.1] text-white/40">
                            <XCircle className="h-3 w-3" />Disponível
                          </Badge>
                        )}
                        {!stand.is_active && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inativo</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={stand.send_review || false}
                        onCheckedChange={(checked) => updateStand(stand.id, { send_review: checked })}
                        disabled={!stand.assigned_user_id}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleCopyLink(stand.onboarding_link_id)} className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors">
                          <Copy className="h-4 w-4" />
                        </button>
                        {stand.assigned_user_id && userSlugs[stand.assigned_user_id] ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                <QrCode className="h-4 w-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>QR Code - {stand.company_name || 'Stand ' + stand.stand_number}</DialogTitle>
                                <DialogDescription>
                                  QR Code do perfil público deste stand
                                </DialogDescription>
                              </DialogHeader>
                              <StandQRCode
                                standNumber={stand.stand_number}
                                profileSlug={userSlugs[stand.assigned_user_id]}
                              />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <button className="p-2 rounded-lg text-muted-foreground/30 cursor-not-allowed" disabled>
                            <QrCode className="h-4 w-4" />
                          </button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button onClick={() => openEditDialog(stand)} className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Stand {stand.stand_number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Nome do Stand</label>
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ex: Stand Premium A" />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveEdit} className="flex-1">Guardar</Button>
                                <Button variant="outline" onClick={() => handleToggleActive(stand)} className="flex-1">
                                  {stand.is_active ? 'Desativar' : 'Ativar'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};