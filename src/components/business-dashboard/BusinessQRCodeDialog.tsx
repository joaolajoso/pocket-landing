import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Download, Loader2, Package, QrCode, IdCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import JSZip from 'jszip';

interface BusinessQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyUrl: string;
  companyName: string;
  companyLogo?: string | null;
  slogan?: string | null;
  primaryColor?: string | null;
  trigger?: React.ReactNode;
}

const DEFAULT_COLOR = '#8c52ff';

const BusinessQRCodeDialog = ({
  open,
  onOpenChange,
  companyUrl,
  companyName,
  companyLogo,
  slogan,
  primaryColor,
  trigger,
}: BusinessQRCodeDialogProps) => {
  const brandColor = primaryColor || DEFAULT_COLOR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>QR Code da Empresa</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="card" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="card" className="gap-2 text-sm">
              <IdCard className="h-4 w-4" />
              Share Card
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2 text-sm">
              <QrCode className="h-4 w-4" />
              QR Only
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="mt-0">
            <BusinessShareCard
              companyUrl={companyUrl}
              companyName={companyName}
              companyLogo={companyLogo}
              slogan={slogan}
              brandColor={brandColor}
            />
          </TabsContent>
          
          <TabsContent value="qr" className="mt-0">
            <BusinessQRCode
              companyUrl={companyUrl}
              companyName={companyName}
              companyLogo={companyLogo}
              brandColor={brandColor}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// ─── QR CODE TAB ────────────────────────────────────────────

interface BusinessQRCodeProps {
  companyUrl: string;
  companyName: string;
  companyLogo?: string | null;
  brandColor: string;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  const b = Math.max(0, (num & 0x0000FF) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const BusinessQRCode = ({ companyUrl, companyName, companyLogo, brandColor }: BusinessQRCodeProps) => {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDownloadingMultiple, setIsDownloadingMultiple] = useState(false);

  const gradientStart = brandColor;
  const gradientEnd = darkenColor(brandColor, 60);

  const generateQRCode = async (withNumber?: number): Promise<string> => {
    const qrSize = 1080;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = qrSize;
    canvas.height = qrSize;

    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, companyUrl, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    });

    const qrCtx = qrCanvas.getContext('2d');
    if (qrCtx) {
      const qrImageData = qrCtx.getImageData(0, 0, qrSize, qrSize);
      const qrData = qrImageData.data;
      ctx.clearRect(0, 0, qrSize, qrSize);

      const qrGradient = ctx.createLinearGradient(0, 0, qrSize, qrSize);
      qrGradient.addColorStop(0, gradientStart);
      qrGradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = qrGradient;

      for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
          const i = (y * qrSize + x) * 4;
          if (qrData[i] < 128) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }

    // Center logo
    const photoSize = 240;
    const photoX = (qrSize - photoSize) / 2;
    const photoY = (qrSize - photoSize) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2 + 22, 0, 2 * Math.PI);
    ctx.fill();

    const ringGradient = ctx.createLinearGradient(photoX - 4, photoY - 4, photoX + photoSize + 4, photoY + photoSize + 4);
    ringGradient.addColorStop(0, gradientStart);
    ringGradient.addColorStop(1, gradientEnd);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2 + 10, 0, 2 * Math.PI);
    ctx.stroke();

    const drawPlaceholder = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2, 0, 2 * Math.PI);
      ctx.clip();
      const pg = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
      pg.addColorStop(0, gradientStart);
      pg.addColorStop(1, gradientEnd);
      ctx.fillStyle = pg;
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      const initials = companyName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 90px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, qrSize / 2, qrSize / 2);
      ctx.restore();
    };

    if (companyLogo) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          ctx.restore();
          resolve();
        };
        img.onerror = () => { drawPlaceholder(); resolve(); };
        img.src = companyLogo;
      });
    } else {
      drawPlaceholder();
    }

    if (withNumber !== undefined) {
      const badgeSize = 120;
      const badgeX = qrSize - badgeSize - 30;
      const badgeY = qrSize - badgeSize - 30;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      const bg = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeSize, badgeY + badgeSize);
      bg.addColorStop(0, gradientStart);
      bg.addColorStop(1, gradientEnd);
      ctx.strokeStyle = bg;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2 - 4, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = gradientEnd;
      ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(withNumber).padStart(2, '0'), badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    }

    return canvas.toDataURL('image/png');
  };

  const handleGenerateQR = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      const dataUrl = await generateQRCode();
      setQrDataUrl(dataUrl);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({ title: 'Erro ao gerar QR code', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: companyName, text: `Conheça ${companyName}`, url: companyUrl });
      } else {
        await navigator.clipboard.writeText(companyUrl);
        toast({ title: 'Link copiado!' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const downloadSingleQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMultipleQRCodes = async () => {
    if (quantity < 1 || quantity > 100) return;
    try {
      setIsDownloadingMultiple(true);
      const zip = new JSZip();
      const baseName = companyName.replace(/\s+/g, '-').toLowerCase();
      for (let i = 1; i <= quantity; i++) {
        const dataUrl = await generateQRCode(i);
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        zip.file(`${baseName}-qr-${String(i).padStart(3, '0')}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${baseName}-qr-codes-${quantity}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: `${quantity} QR codes descarregados!` });
    } catch (error) {
      toast({ title: 'Erro ao gerar QR codes', variant: 'destructive' });
    } finally {
      setIsDownloadingMultiple(false);
    }
  };

  // Auto-generate on mount
  useEffect(() => { handleGenerateQR(); }, [companyUrl]);

  return (
    <div className="mt-2">
      {!showQR ? (
        <Button variant="outline" className="gap-2 w-full" onClick={handleGenerateQR} disabled={isGenerating}>
          <QrCode className="h-4 w-4" />
          {isGenerating ? 'Gerando...' : 'Gerar QR Code'}
        </Button>
      ) : (
        <Card className="text-center border-0 shadow-none bg-transparent">
          <CardContent className="pt-2 px-0">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-4 bg-white rounded-2xl shadow-sm">
                <img src={qrDataUrl} alt={`QR Code ${companyName}`} className="w-[200px] h-[200px]" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Scan para visitar a página da empresa</p>

              <div className="flex gap-2 w-full mb-4">
                <Button variant="outline" className="gap-1 w-full" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" /> Partilhar
                </Button>
                <Button variant="outline" className="gap-1 w-full" size="sm" onClick={downloadSingleQR}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>

              <div className="w-full border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Download múltiplos QR codes
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number" min={1} max={100} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center" placeholder="1"
                  />
                  <Button variant="default" className="gap-2 flex-1" size="sm" onClick={downloadMultipleQRCodes} disabled={isDownloadingMultiple}>
                    {isDownloadingMultiple ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                    {isDownloadingMultiple ? 'Gerando...' : `Download ${quantity} QRs`}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  QR codes numerados descarregados como ZIP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── SHARE CARD TAB ─────────────────────────────────────────

interface BusinessShareCardProps {
  companyUrl: string;
  companyName: string;
  companyLogo?: string | null;
  slogan?: string | null;
  brandColor: string;
}

const BusinessShareCard = ({ companyUrl, companyName, companyLogo, slogan, brandColor }: BusinessShareCardProps) => {
  const { toast } = useToast();
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const gradientStart = brandColor;
  const gradientEnd = darkenColor(brandColor, 60);
  const CARD_BG = '#0f1419';
  const TEXT_WHITE = '#ffffff';
  const TEXT_MUTED = 'rgba(255, 255, 255, 0.6)';

  const generateShareCard = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const cardWidth = 810;
      const cardHeight = 1080;
      canvas.width = cardWidth;
      canvas.height = cardHeight;

      ctx.fillStyle = CARD_BG;
      ctx.roundRect(0, 0, cardWidth, cardHeight, 24);
      ctx.fill();

      // Accent bar with brand color
      const accentGradient = ctx.createLinearGradient(0, 0, cardWidth, 0);
      accentGradient.addColorStop(0, gradientStart);
      accentGradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = accentGradient;
      ctx.roundRect(0, 0, cardWidth, 12, [48, 48, 0, 0]);
      ctx.fill();

      // Logo section
      const photoSize = 160;
      const photoX = (cardWidth - photoSize) / 2;
      const photoY = 80;

      const ringGradient = ctx.createLinearGradient(photoX - 4, photoY - 4, photoX + photoSize + 4, photoY + photoSize + 4);
      ringGradient.addColorStop(0, gradientStart);
      ringGradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = ringGradient;
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 4, 0, 2 * Math.PI);
      ctx.fill();

      const drawPlaceholder = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        const pg = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
        pg.addColorStop(0, '#2a2f35');
        pg.addColorStop(1, '#1a1f25');
        ctx.fillStyle = pg;
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
        const initials = companyName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        ctx.fillStyle = TEXT_WHITE;
        ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
        ctx.restore();
      };

      if (companyLogo) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
            ctx.restore();
            resolve();
          };
          img.onerror = () => { drawPlaceholder(); resolve(); };
          img.src = companyLogo;
        });
      } else {
        drawPlaceholder();
      }

      // Company name
      ctx.fillStyle = TEXT_WHITE;
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxNameWidth = cardWidth - 80;
      let displayName = companyName;
      while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      if (displayName !== companyName) displayName += '...';
      ctx.fillText(displayName, cardWidth / 2, photoY + photoSize + 32);

      // Slogan
      if (slogan) {
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
        let displaySlogan = slogan;
        const maxSloganWidth = cardWidth - 120;
        while (ctx.measureText(displaySlogan).width > maxSloganWidth && displaySlogan.length > 0) {
          displaySlogan = displaySlogan.slice(0, -1);
        }
        if (displaySlogan !== slogan) displaySlogan += '...';
        ctx.fillText(displaySlogan, cardWidth / 2, photoY + photoSize + 96);
      }

      // QR code
      const qrSize = 360;
      const qrX = (cardWidth - qrSize) / 2;
      const qrY = slogan ? photoY + photoSize + 160 : photoY + photoSize + 120;

      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, companyUrl, {
        width: qrSize, margin: 2, errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });

      const qrPadding = 28;
      ctx.fillStyle = TEXT_WHITE;
      ctx.beginPath();
      ctx.roundRect(qrX - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 32);
      ctx.fill();

      const qrCtx = qrCanvas.getContext('2d');
      if (qrCtx) {
        const qrImageData = qrCtx.getImageData(0, 0, qrSize, qrSize);
        const qrData = qrImageData.data;
        const qrGradient = ctx.createLinearGradient(qrX, qrY, qrX + qrSize, qrY + qrSize);
        qrGradient.addColorStop(0, gradientStart);
        qrGradient.addColorStop(1, gradientEnd);
        ctx.fillStyle = qrGradient;
        for (let y = 0; y < qrSize; y++) {
          for (let x = 0; x < qrSize; x++) {
            const i = (y * qrSize + x) * 4;
            if (qrData[i] < 128) {
              ctx.fillRect(qrX + x, qrY + y, 1, 1);
            }
          }
        }
      }

      // "Scan to connect" text
      const scanTextY = qrY + qrSize + qrPadding + 40;
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Scan para visitar a página da empresa', cardWidth / 2, scanTextY);

      // Bottom branding
      const bottomGradient = ctx.createLinearGradient(0, cardHeight - 80, cardWidth, cardHeight - 80);
      bottomGradient.addColorStop(0, gradientStart);
      bottomGradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = bottomGradient;
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('PocketCV', cardWidth / 2, cardHeight - 40);

      setCardDataUrl(canvas.toDataURL('image/png'));
      setShowCard(true);
    } catch (error) {
      console.error('Error generating share card:', error);
      toast({ title: 'Erro ao gerar share card', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => { generateShareCard(); }, [companyUrl, companyName, companyLogo]);

  const downloadCard = () => {
    if (!cardDataUrl) return;
    const link = document.createElement('a');
    link.href = cardDataUrl;
    link.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-share-card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (!cardDataUrl) return;
      const response = await fetch(cardDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${companyName}-share-card.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: companyName });
      } else {
        await navigator.clipboard.writeText(companyUrl);
        toast({ title: 'Link copiado!' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="mt-2">
      {isGenerating ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : showCard ? (
        <div className="flex flex-col items-center">
          <div className="mb-4 rounded-2xl overflow-hidden shadow-lg max-w-[280px]">
            <img src={cardDataUrl} alt={`Share Card ${companyName}`} className="w-full h-auto" />
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="gap-1 w-full" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Partilhar
            </Button>
            <Button variant="outline" className="gap-1 w-full" size="sm" onClick={downloadCard}>
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BusinessQRCodeDialog;
