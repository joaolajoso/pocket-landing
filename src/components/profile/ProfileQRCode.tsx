import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, QrCode, Download, Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import JSZip from 'jszip';

interface ProfileQRCodeProps {
  profileUrl: string;
  profileName: string;
  profilePhoto?: string | null;
}

// Brand colors
const BRAND_GRADIENT_START = '#ff5757';
const BRAND_GRADIENT_END = '#8c52ff';

const ProfileQRCode = ({ profileUrl, profileName, profilePhoto }: ProfileQRCodeProps) => {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDownloadingMultiple, setIsDownloadingMultiple] = useState(false);

  const generateQRCode = async (withNumber?: number): Promise<string> => {
    // 1080p quality QR code
    const qrSize = 1080;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = qrSize;
    canvas.height = qrSize;

    // Generate base QR code
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, profileUrl, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: 'H', // High error correction for logo overlay
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Create gradient QR with transparent background
    const qrCtx = qrCanvas.getContext('2d');
    if (qrCtx) {
      const qrImageData = qrCtx.getImageData(0, 0, qrSize, qrSize);
      const qrData = qrImageData.data;
      
      // Clear canvas for transparent background
      ctx.clearRect(0, 0, qrSize, qrSize);
      
      // Create gradient for dark pixels
      const qrGradient = ctx.createLinearGradient(0, 0, qrSize, qrSize);
      qrGradient.addColorStop(0, BRAND_GRADIENT_START);
      qrGradient.addColorStop(1, BRAND_GRADIENT_END);
      ctx.fillStyle = qrGradient;
      
      // Draw dark pixels with gradient (keeping white pixels transparent)
      for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
          const i = (y * qrSize + x) * 4;
          if (qrData[i] < 128) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }

    // Draw profile photo in center (scaled for 1080p)
    const photoSize = 240;
    const photoX = (qrSize - photoSize) / 2;
    const photoY = (qrSize - photoSize) / 2;

    // Draw white circle background for photo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2 + 22, 0, 2 * Math.PI);
    ctx.fill();

    // Draw gradient ring around photo
    const ringGradient = ctx.createLinearGradient(
      photoX - 4, photoY - 4,
      photoX + photoSize + 4, photoY + photoSize + 4
    );
    ringGradient.addColorStop(0, BRAND_GRADIENT_START);
    ringGradient.addColorStop(1, BRAND_GRADIENT_END);
    
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2 + 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw photo or initials
    const drawPhotoOrPlaceholder = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(qrSize / 2, qrSize / 2, photoSize / 2, 0, 2 * Math.PI);
      ctx.clip();
      
      // Placeholder gradient
      const placeholderGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
      placeholderGradient.addColorStop(0, BRAND_GRADIENT_START);
      placeholderGradient.addColorStop(1, BRAND_GRADIENT_END);
      ctx.fillStyle = placeholderGradient;
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      
      // Draw initials
      const initials = profileName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 90px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, qrSize / 2, qrSize / 2);
      
      ctx.restore();
    };

    // Load profile photo
    if (profilePhoto) {
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
        img.onerror = () => {
          drawPhotoOrPlaceholder();
          resolve();
        };
        img.src = profilePhoto;
      });
    } else {
      drawPhotoOrPlaceholder();
    }

    // Add number badge if provided (scaled for 1080p)
    if (withNumber !== undefined) {
      const badgeSize = 120;
      const badgeX = qrSize - badgeSize - 30;
      const badgeY = qrSize - badgeSize - 30;
      
      // White background circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Gradient border
      const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeSize, badgeY + badgeSize);
      badgeGradient.addColorStop(0, BRAND_GRADIENT_START);
      badgeGradient.addColorStop(1, BRAND_GRADIENT_END);
      ctx.strokeStyle = badgeGradient;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2 - 4, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Number text
      ctx.fillStyle = BRAND_GRADIENT_END;
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
      toast({
        title: 'Error generating QR code',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileName}'s Profile`,
          text: `Check out ${profileName}'s professional profile`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: 'Link copied!',
          description: 'You can now share this URL',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const downloadSingleQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${profileName.replace(/\s+/g, '-').toLowerCase()}-pocketcv-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMultipleQRCodes = async () => {
    if (quantity < 1 || quantity > 100) {
      toast({
        title: 'Invalid quantity',
        description: 'Please enter a number between 1 and 100',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDownloadingMultiple(true);
      
      const zip = new JSZip();
      const baseName = profileName.replace(/\s+/g, '-').toLowerCase();
      
      // Generate QR codes with numbering
      for (let i = 1; i <= quantity; i++) {
        const dataUrl = await generateQRCode(i);
        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        zip.file(`${baseName}-qr-${String(i).padStart(3, '0')}.png`, blob);
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download zip
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${baseName}-qr-codes-${quantity}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast({
        title: 'QR Codes downloaded!',
        description: `${quantity} QR codes saved as ZIP file`,
      });
    } catch (error) {
      console.error('Error generating multiple QR codes:', error);
      toast({
        title: 'Error generating QR codes',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingMultiple(false);
    }
  };

  return (
    <div className="mt-2">
      {!showQR ? (
        <Button 
          variant="outline" 
          className="gap-2 w-full" 
          onClick={handleGenerateQR}
          disabled={isGenerating}
        >
          <QrCode className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </Button>
      ) : (
        <Card className="text-center border-0 shadow-none bg-transparent">
          <CardContent className="pt-2 px-0">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-4 bg-white rounded-2xl shadow-sm">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${profileName}'s profile`}
                  className="w-[200px] h-[200px]"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Scan to view this profile
              </p>
              
              {/* Single QR Actions */}
              <div className="flex gap-2 w-full mb-4">
                <Button 
                  variant="outline" 
                  className="gap-1 w-full" 
                  size="sm" 
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-1 w-full" 
                  size="sm" 
                  onClick={downloadSingleQR}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              
              {/* Multiple QR Download */}
              <div className="w-full border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Download multiple QR codes
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center"
                    placeholder="1"
                  />
                  <Button 
                    variant="default" 
                    className="gap-2 flex-1" 
                    size="sm"
                    onClick={downloadMultipleQRCodes}
                    disabled={isDownloadingMultiple}
                  >
                    {isDownloadingMultiple ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                    {isDownloadingMultiple ? 'Generating...' : `Download ${quantity} QRs`}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  QR codes will be numbered and downloaded as a ZIP file
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileQRCode;
