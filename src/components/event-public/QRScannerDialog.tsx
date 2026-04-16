import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { checkAndRecordStandVisit } from '@/hooks/useStandVisitMessenger';

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId?: string;
  onOpenChat?: (receiverId: string) => void;
}

const QRScannerDialog = ({ open, onOpenChange, eventId, onOpenChat }: QRScannerDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const readerId = 'qr-reader';

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const startScanner = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setError('Não foi possível aceder à câmara. Verifique as permissões.');
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner();
    onOpenChange(false);

    let slug: string | null = null;
    let onboardingLinkId: string | null = null;

    try {
      const url = new URL(decodedText);
      const pathParts = url.pathname.split('/').filter(Boolean);

      // Handle /u/{slug} format
      if (pathParts[0] === 'u' && pathParts[1]) {
        slug = pathParts[1];
      }

      // Handle /events/stand-invite/{onboardingLinkId} format
      if (pathParts[0] === 'events' && pathParts[1] === 'stand-invite' && pathParts[2]) {
        onboardingLinkId = pathParts[2];
      }
    } catch {
      // Not a valid URL, try as onboardingLinkId or slug directly
      const trimmedValue = decodedText.trim();
      if (trimmedValue) {
        if (trimmedValue.startsWith('stand-')) {
          onboardingLinkId = trimmedValue;
        } else {
          slug = trimmedValue;
        }
      }
    }

    // QR points to stand invite link — resolve stand owner and open chat directly
    if (onboardingLinkId) {
      if (user && eventId && onOpenChat) {
        try {
          const { data: stand } = await supabase
            .from('event_stands')
            .select('assigned_user_id')
            .eq('event_id', eventId)
            .eq('onboarding_link_id', onboardingLinkId)
            .eq('is_active', true)
            .maybeSingle();

          if (stand?.assigned_user_id) {
            await checkAndRecordStandVisit(user.id, stand.assigned_user_id);
            onOpenChat(stand.assigned_user_id);
            return;
          }
        } catch (err) {
          console.error('Error resolving stand invite QR:', err);
        }
      }

      navigate(`/events/stand-invite/${onboardingLinkId}`);
      return;
    }

    if (!slug) return;

    // Check if this profile belongs to a stand
    if (user && eventId && onOpenChat) {
      try {
        // Get the user ID from the slug
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (profile) {
          // Check if this user is a stand in the current event
          const { data: stand } = await supabase
            .from('event_stands')
            .select('id, stand_name, company_name, assigned_user_id')
            .eq('assigned_user_id', profile.id)
            .eq('event_id', eventId)
            .eq('is_active', true)
            .maybeSingle();

          if (stand) {
            // It's a stand! Record visit and open chat
            await checkAndRecordStandVisit(user.id, profile.id);
            onOpenChat(profile.id);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking stand:', err);
      }
    }

    // Not a stand or no event context — navigate to profile
    navigate(`/u/${slug}`);
  };

  useEffect(() => {
    if (open) {
      setTimeout(startScanner, 300);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            id={readerId}
            className="w-full rounded-lg overflow-hidden bg-muted"
            style={{ minHeight: 280 }}
          />

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm text-center p-3 bg-destructive/10 rounded-lg w-full">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Aponte a câmara para o QR Code de outro participante
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerDialog;
