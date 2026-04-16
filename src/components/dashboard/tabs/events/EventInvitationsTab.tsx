import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, QrCode, Link2, RefreshCw, Upload, Download, Users, ArrowUpRight, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EventInvitationsTabProps {
  eventId: string;
}

const PLAN_LIMITS: Record<string, { label: string; maxParticipants: number }> = {
  free: { label: 'Free', maxParticipants: 50 },
  xs: { label: 'XS', maxParticipants: 500 },
  s: { label: 'S', maxParticipants: 2000 },
  m: { label: 'M', maxParticipants: 6000 },
  l: { label: 'L', maxParticipants: 15000 },
  xl: { label: 'XL', maxParticipants: Infinity },
};

function detectPlan(staffCount: number): string {
  if (staffCount <= 1) return 'free';
  if (staffCount <= 3) return 'xs';
  if (staffCount <= 10) return 's';
  if (staffCount <= 30) return 'm';
  if (staffCount <= 80) return 'l';
  return 'xl';
}

export const EventInvitationsTab = ({ eventId }: EventInvitationsTabProps) => {
  const { user } = useAuth();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<string>('public');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [planLabel, setPlanLabel] = useState('Free');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [desiredCapacity, setDesiredCapacity] = useState<number>(50);
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [manualEmails, setManualEmails] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const eventLink = `${window.location.origin}/events/${eventId}`;

  useEffect(() => {
    const fetchData = async () => {
      // Fetch event data
      const { data: eventData } = await supabase
        .from('events')
        .select('invitation_code, access_type, organization_id')
        .eq('id', eventId)
        .single();

      if (eventData) {
        setInvitationCode(eventData.invitation_code);
        setAccessType(eventData.access_type);

        // Get participant count
        const { count } = await supabase
          .from('event_participants')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', eventId);
        setParticipantCount(count || 0);

        // Get plan limits based on org staff count
        if (eventData.organization_id) {
          const { count: staffCount } = await supabase
            .from('organization_members')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', eventData.organization_id)
            .eq('status', 'active');
          const plan = detectPlan(staffCount || 1);
          const limits = PLAN_LIMITS[plan];
          setMaxParticipants(limits.maxParticipants);
          setPlanLabel(limits.label);
          setDesiredCapacity(Math.min(limits.maxParticipants === Infinity ? 10000 : limits.maxParticipants, Math.max(count || 0, 50)));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [eventId]);

  const remaining = Math.max(0, maxParticipants - participantCount);
  const inviteLink = invitationCode
    ? `${window.location.origin}/events/${eventId}?code=${invitationCode}`
    : null;

  const copyLink = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: 'Copiado', description: `${label} copiado` });
  };

  const downloadQR = async (url: string, filename: string) => {
    const qrDataUrl = await QRCode.toDataURL(url, { width: 512 });
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = filename;
    link.click();
  };

  const regenerateCode = async () => {
    setRegenerating(true);
    try {
      const newCode = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const { error } = await supabase
        .from('events')
        .update({ invitation_code: newCode })
        .eq('id', eventId);
      if (error) throw error;
      setInvitationCode(newCode);
      toast({ title: 'Código regenerado', description: 'O link de convite anterior foi invalidado.' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setRegenerating(false);
    }
  };

  const generateCode = async () => {
    setRegenerating(true);
    try {
      const newCode = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const { error } = await supabase
        .from('events')
        .update({ invitation_code: newCode })
        .eq('id', eventId);
      if (error) throw error;
      setInvitationCode(newCode);
      toast({ title: 'Código gerado', description: 'Link de convite criado com sucesso.' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const emails: string[] = [];

      for (const line of lines) {
        // Support CSV with email in any column
        const parts = line.split(/[,;|\t]/);
        for (const part of parts) {
          const trimmed = part.trim().replace(/["']/g, '');
          if (trimmed.includes('@') && trimmed.includes('.')) {
            emails.push(trimmed.toLowerCase());
          }
        }
      }

      const unique = [...new Set(emails)];
      setCsvEmails(unique);

      if (unique.length === 0) {
        toast({ title: 'Nenhum email encontrado', description: 'O ficheiro não contém emails válidos.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addManualEmails = () => {
    if (!manualEmails.trim()) return;
    const newEmails = manualEmails
      .split(/[,;\n]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@') && e.includes('.'));
    const merged = [...new Set([...csvEmails, ...newEmails])];
    setCsvEmails(merged);
    setManualEmails('');
  };

  const handleImportParticipants = async () => {
    if (csvEmails.length === 0) return;

    const allowedCount = Math.min(csvEmails.length, remaining);
    if (allowedCount === 0) {
      toast({ title: 'Limite atingido', description: `O plano ${planLabel} permite no máximo ${maxParticipants} participantes.`, variant: 'destructive' });
      return;
    }

    const emailsToImport = csvEmails.slice(0, allowedCount);
    setImporting(true);

    try {
      // Look up existing users by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('email', emailsToImport);

      const existingUsers = profiles || [];
      const existingEmails = new Set(existingUsers.map(p => p.email));

      // Check which users are already participants
      if (existingUsers.length > 0) {
        const { data: alreadyParticipating } = await supabase
          .from('event_participants')
          .select('user_id')
          .eq('event_id', eventId)
          .in('user_id', existingUsers.map(u => u.id));

        const alreadySet = new Set((alreadyParticipating || []).map(p => p.user_id));

        // Insert only non-participating existing users
        const toInsert = existingUsers
          .filter(u => !alreadySet.has(u.id))
          .map(u => ({
            event_id: eventId,
            user_id: u.id,
            status: 'participating',
            role: 'participant',
          }));

        if (toInsert.length > 0) {
          const { error } = await supabase
            .from('event_participants')
            .insert(toInsert);
          if (error) throw error;
        }

        const notFound = emailsToImport.filter(e => !existingEmails.has(e));
        const addedCount = toInsert.length;
        const alreadyCount = existingUsers.length - toInsert.length;

        let description = `${addedCount} participante${addedCount !== 1 ? 's' : ''} adicionado${addedCount !== 1 ? 's' : ''}.`;
        if (alreadyCount > 0) description += ` ${alreadyCount} já inscrito${alreadyCount !== 1 ? 's' : ''}.`;
        if (notFound.length > 0) description += ` ${notFound.length} email${notFound.length !== 1 ? 's' : ''} sem conta na plataforma.`;

        toast({ title: 'Importação concluída', description });
        setParticipantCount(prev => prev + addedCount);
      } else {
        toast({ title: 'Nenhum utilizador encontrado', description: 'Os emails fornecidos não correspondem a contas existentes na plataforma.', variant: 'destructive' });
      }

      setCsvEmails([]);
      setImportDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csv = 'email\nexemplo1@email.com\nexemplo2@email.com\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo-participantes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Inscrição & Convites</h2>
          <p className="text-sm text-white/40">Gerir links de acesso e importar participantes</p>
        </div>
        <Button
          onClick={() => { setCsvEmails([]); setImportDialogOpen(true); }}
          className="shrink-0"
        >
          <Users className="h-4 w-4 mr-2" />
          Convidar Participantes
        </Button>
      </div>

      {/* Capacity indicator */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">Capacidade do Evento</h3>
            <p className="text-xs text-muted-foreground">Defina o número máximo de participantes</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Plano {planLabel}
          </span>
        </div>

        {/* Current usage */}
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">{participantCount}</span>
          <span className="text-sm text-muted-foreground pb-1">/ {maxParticipants === Infinity ? '∞' : maxParticipants} participantes</span>
        </div>
        {maxParticipants !== Infinity && (
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (participantCount / maxParticipants) * 100)}%`,
                backgroundColor: participantCount >= maxParticipants ? 'hsl(var(--destructive))' : participantCount > maxParticipants * 0.8 ? '#f59e0b' : 'hsl(var(--primary))',
              }}
            />
          </div>
        )}

        {/* Desired capacity controls */}
        {maxParticipants !== Infinity && (
          <div className="pt-2 border-t border-border/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Capacidade desejada</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={desiredCapacity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    setDesiredCapacity(Math.max(1, v));
                  }}
                  className="w-24 h-8 text-sm text-center bg-background/50 border-border/50 tabular-nums"
                />
                <span className="text-xs text-muted-foreground">pessoas</span>
              </div>
            </div>

            <div className="relative">
              <Slider
                value={[desiredCapacity]}
                onValueChange={([v]) => setDesiredCapacity(v)}
                min={1}
                max={2000}
                step={10}
                className="w-full"
              />
              {/* Plan limit marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary/80 pointer-events-none z-10"
                style={{ left: `${(maxParticipants / 2000) * 100}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-primary bg-background/90 px-1.5 py-0.5 rounded border border-primary/30">
                  Limite: {maxParticipants}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
              <span>1</span>
              <span>2.000</span>
            </div>

            {/* Exceeds plan */}
            {desiredCapacity > maxParticipants && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Zap className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Precisa de mais {desiredCapacity - maxParticipants} vagas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      O seu plano {planLabel} suporta até {maxParticipants} participantes. Atualize para acomodar {desiredCapacity} pessoas.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    toast({ title: 'Em breve', description: 'A funcionalidade de compra de créditos estará disponível em breve.' });
                  }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Aumentar Plano
                </Button>
              </div>
            )}

            {/* Near limit warning */}
            {desiredCapacity <= maxParticipants && remaining <= 10 && remaining > 0 && (
              <p className="text-xs text-amber-400">⚠ Apenas {remaining} vaga{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}</p>
            )}
            {remaining === 0 && desiredCapacity <= maxParticipants && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-destructive">Limite atingido</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => {
                    toast({ title: 'Em breve', description: 'A funcionalidade de compra de créditos estará disponível em breve.' });
                  }}
                >
                  <ArrowUpRight className="h-3 w-3" />
                  Aumentar Plano
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Public Event Link */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="h-4 w-4 text-white/50" />
          <span className="text-sm font-medium text-white">Link Público do Evento</span>
        </div>
        <div className="flex gap-2">
          <Input value={eventLink} readOnly className="font-mono text-sm bg-white/[0.05] border-white/[0.1] text-white/70" />
          <button onClick={() => copyLink(eventLink, 'Link do evento')} className="px-3 py-2 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={() => downloadQR(eventLink, `evento-${eventId.slice(0, 8)}.png`)} className="px-3 py-2 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors">
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Invite Link */}
      {accessType === 'invite_only' && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Link de Convite</span>
            </div>
            {inviteLink && (
              <Button variant="outline" size="sm" onClick={regenerateCode} disabled={regenerating} className="border-white/[0.1] text-white/50 hover:text-white">
                <RefreshCw className={`h-3 w-3 mr-1 ${regenerating ? 'animate-spin' : ''}`} />
                Regenerar
              </Button>
            )}
          </div>
          <p className="text-xs text-white/40">
            Partilhe este link para permitir que pessoas acedam ao evento privado.
          </p>
          {inviteLink ? (
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="font-mono text-sm bg-white/[0.05] border-white/[0.1] text-white/70" />
              <button onClick={() => copyLink(inviteLink, 'Link de convite')} className="px-3 py-2 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors">
                <Copy className="h-4 w-4" />
              </button>
              <button onClick={() => downloadQR(inviteLink, `convite-${eventId.slice(0, 8)}.png`)} className="px-3 py-2 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors">
                <QrCode className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button onClick={generateCode} disabled={regenerating} className="w-full">
              {regenerating ? 'A gerar...' : 'Gerar Link de Convite'}
            </Button>
          )}
        </div>
      )}

      {/* Import Participants Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/[0.1]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">Convidar Participantes</DialogTitle>
              {maxParticipants !== Infinity && (
                <span className="text-xs text-white/40 bg-white/[0.06] px-3 py-1 rounded-full">
                  {remaining} restante{remaining !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Add emails manually */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Adicionar e-mails</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Cole ou insira emails aqui"
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                  className="bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/20"
                  onKeyDown={(e) => e.key === 'Enter' && addManualEmails()}
                />
                <Button onClick={addManualEmails} variant="secondary" className="shrink-0">
                  Adicionar
                </Button>
              </div>
            </div>

            {/* CSV Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70">Importar CSV</label>
              <div
                className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-white/[0.2] hover:bg-white/[0.02] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && fileInputRef.current) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInputRef.current.files = dt.files;
                    fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }}
              >
                <Upload className="h-8 w-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-white/60">Importar Arquivo CSV</p>
                <p className="text-xs text-white/30 mt-1">Solte o arquivo ou clique aqui para escolher o arquivo.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={downloadCsvTemplate}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar Modelo CSV
              </button>
            </div>

            {/* Preview imported emails */}
            {csvEmails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">{csvEmails.length} email{csvEmails.length !== 1 ? 's' : ''} encontrado{csvEmails.length !== 1 ? 's' : ''}</span>
                  {csvEmails.length > remaining && maxParticipants !== Infinity && (
                    <span className="text-xs text-amber-400">Apenas {remaining} serão importados (limite do plano)</span>
                  )}
                </div>
                <div className="max-h-32 overflow-y-auto rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-1">
                  {csvEmails.slice(0, 20).map((email, i) => (
                    <div key={i} className="text-xs text-white/50 font-mono">{email}</div>
                  ))}
                  {csvEmails.length > 20 && (
                    <div className="text-xs text-white/30">...e mais {csvEmails.length - 20}</div>
                  )}
                </div>
              </div>
            )}

            {/* Import button */}
            <Button
              onClick={handleImportParticipants}
              disabled={importing || csvEmails.length === 0 || (remaining === 0 && maxParticipants !== Infinity)}
              className="w-full"
            >
              {importing ? 'A importar...' : `Importar ${Math.min(csvEmails.length, remaining)} participante${Math.min(csvEmails.length, remaining) !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
