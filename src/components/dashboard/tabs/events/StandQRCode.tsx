import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import pocketcvLogo from '@/assets/pocketcv-logo-gradient.png';

interface StandQRCodeProps {
  onboardingLinkId?: string;
  standNumber: number;
  profileSlug?: string;
}

export const StandQRCode = ({ onboardingLinkId, standNumber, profileSlug }: StandQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const standUrl = profileSlug 
    ? `https://pocketcv.pt/u/${profileSlug}`
    : `https://pocketcv.pt/events/stand-invite/${onboardingLinkId}`;

  useEffect(() => {
    const generateQRWithLogo = async () => {
      if (!canvasRef.current) return;

      try {
        // Generate QR code to a temporary canvas
        const tempCanvas = document.createElement('canvas');
        await QRCode.toCanvas(
          tempCanvas,
          standUrl,
          {
            width: 512,
            margin: 2,
            errorCorrectionLevel: 'H', // High error correction for logo overlay
            color: {
              dark: '#8B5CF6', // Purple from PWA theme
              light: '#FFFFFF',
            },
          }
        );

        // Get final canvas context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 512;
        canvas.height = 580; // Extra height for stand number text

        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        ctx.drawImage(tempCanvas, 0, 0);

        // Load and draw logo in center
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = 100;
          const x = (512 - logoSize) / 2;
          const y = (512 - logoSize) / 2;
          
          // Draw white circle background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(256, 256, logoSize / 2 + 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw logo
          ctx.drawImage(logo, x, y, logoSize, logoSize);

          // Draw stand number below QR code
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 48px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(standNumber === 0 ? 'Convite Empresas' : `Stand ${standNumber}`, 256, 546);
        };
        logo.src = pocketcvLogo;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRWithLogo();
  }, [standUrl, standNumber]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = standNumber === 0 ? 'convite-empresas-qrcode.png' : `stand-${standNumber}-qrcode.png`;
      link.href = url;
      link.click();
      
      toast({
        title: "QR Code descarregado",
        description: standNumber === 0 
          ? "QR Code de convite para empresas foi descarregado."
          : `QR Code do Stand ${standNumber} foi descarregado.`
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(standUrl);
    toast({
      title: "Link copiado",
      description: "O link de registo do stand foi copiado para a área de transferência."
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>
      
      <div className="flex flex-col gap-2 w-full">
        <p className="text-sm text-muted-foreground text-center break-all">
          {standUrl}
        </p>
        
        <div className="flex gap-2">
          <Button onClick={handleCopyLink} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Descarregar QR
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Partilhe este QR code ou link com empresas para se registarem como stand neste evento.
      </p>
    </div>
  );
};
