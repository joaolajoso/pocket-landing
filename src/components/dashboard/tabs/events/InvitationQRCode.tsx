import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvitationQRCodeProps {
  code: string;
  eventId: string;
}

export const InvitationQRCode = ({ code, eventId }: InvitationQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const invitationUrl = `${window.location.origin}/events/${eventId}?invite=${code}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, invitationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    }
  }, [invitationUrl]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `invitation-${code}.png`;
      link.href = url;
      link.click();
      
      toast({
        title: 'Success',
        description: 'QR code downloaded',
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationUrl);
    toast({
      title: 'Success',
      description: 'Invitation link copied to clipboard',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border rounded-lg p-2" />
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopyLink}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Share this QR code or link to invite participants
        </p>
      </div>
    </div>
  );
};
