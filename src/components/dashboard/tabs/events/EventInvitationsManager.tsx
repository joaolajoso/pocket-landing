import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEventInvitations } from '@/hooks/useEventInvitations';
import { Copy, Download, QrCode, Mail, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface EventInvitationsManagerProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventInvitationsManager = ({ eventId, open, onOpenChange }: EventInvitationsManagerProps) => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [emails, setEmails] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [loading, setLoading] = useState(false);
  const { generateInvitations, fetchEventInvitations } = useEventInvitations();
  const { toast } = useToast();

  const loadInvitations = async () => {
    const data = await fetchEventInvitations(eventId);
    setInvitations(data);
  };

  useEffect(() => {
    if (open) {
      loadInvitations();
    }
  }, [open, eventId]);

  const handleGenerateWithEmails = async () => {
    if (!emails.trim()) return;
    setLoading(true);
    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
      await generateInvitations({ eventId, emails: emailList });
      setEmails('');
      loadInvitations();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulk = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) return;
    setLoading(true);
    try {
      await generateInvitations({ eventId, quantity: qty });
      loadInvitations();
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = (code: string) => {
    const url = `${window.location.origin}/events/join?code=${code}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied',
      description: 'Invitation link copied to clipboard',
    });
  };

  const downloadQRCode = async (code: string) => {
    const url = `${window.location.origin}/events/join?code=${code}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 512 });
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `invitation-${code}.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Event Invitations</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generate by Email */}
          <div className="space-y-2">
            <Label>Invite by Email (comma-separated)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
              />
              <Button onClick={handleGenerateWithEmails} disabled={loading || !emails.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Generate Bulk */}
          <div className="space-y-2">
            <Label>Generate Bulk Invitations</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-32"
              />
              <Button onClick={handleGenerateBulk} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Generate {quantity} Codes
              </Button>
            </div>
          </div>

          {/* Invitations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No invitations yet. Generate some above.
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.code}</TableCell>
                      <TableCell>{inv.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={inv.used ? 'secondary' : 'default'}>
                          {inv.used ? 'Used' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{inv.used_by || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInvitationLink(inv.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadQRCode(inv.code)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};