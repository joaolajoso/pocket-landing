import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Loader2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ProfileShareCardProps {
  profileUrl: string;
  profileName: string;
  profilePhoto?: string | null;
  headline?: string | null;
}

const ProfileShareCard = ({ 
  profileUrl, 
  profileName, 
  profilePhoto,
  headline 
}: ProfileShareCardProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWallpaper, setIsGeneratingWallpaper] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [showCard, setShowCard] = useState(false);

  // Brand colors
  const BRAND_GRADIENT_START = '#ff5757';
  const BRAND_GRADIENT_END = '#8c52ff';
  const CARD_BG = '#0f1419';
  const TEXT_WHITE = '#ffffff';
  const TEXT_MUTED = 'rgba(255, 255, 255, 0.6)';

  const generateShareCard = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Card dimensions (1080p quality - 3:4 aspect ratio)
      const cardWidth = 810;
      const cardHeight = 1080;
      canvas.width = cardWidth;
      canvas.height = cardHeight;

      // Draw background
      ctx.fillStyle = CARD_BG;
      ctx.roundRect(0, 0, cardWidth, cardHeight, 24);
      ctx.fill();

      // Draw gradient accent bar at top
      const accentGradient = ctx.createLinearGradient(0, 0, cardWidth, 0);
      accentGradient.addColorStop(0, BRAND_GRADIENT_START);
      accentGradient.addColorStop(1, BRAND_GRADIENT_END);
      ctx.fillStyle = accentGradient;
      ctx.roundRect(0, 0, cardWidth, 12, [48, 48, 0, 0]);
      ctx.fill();

      // Profile photo section (scaled for 1080p)
      const photoSize = 160;
      const photoX = (cardWidth - photoSize) / 2;
      const photoY = 80;

      // Draw photo placeholder/ring with gradient
      const ringGradient = ctx.createLinearGradient(
        photoX - 4, photoY - 4, 
        photoX + photoSize + 4, photoY + photoSize + 4
      );
      ringGradient.addColorStop(0, BRAND_GRADIENT_START);
      ringGradient.addColorStop(1, BRAND_GRADIENT_END);
      
      ctx.fillStyle = ringGradient;
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw profile photo or placeholder
      const drawPhotoOrPlaceholder = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        
        // Placeholder with initials
        const placeholderGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
        placeholderGradient.addColorStop(0, '#2a2f35');
        placeholderGradient.addColorStop(1, '#1a1f25');
        ctx.fillStyle = placeholderGradient;
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
        
        // Draw initials
        const initials = profileName
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        ctx.fillStyle = TEXT_WHITE;
        ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
        
        ctx.restore();
      };

      // Try to load profile photo
      if (profilePhoto) {
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
          img.onerror = () => {
            drawPhotoOrPlaceholder();
            resolve();
          };
          img.src = profilePhoto;
        });
      } else {
        drawPhotoOrPlaceholder();
      }

      // Draw name (scaled for 1080p)
      ctx.fillStyle = TEXT_WHITE;
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Truncate name if too long
      const maxNameWidth = cardWidth - 80;
      let displayName = profileName;
      while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      if (displayName !== profileName) displayName += '...';
      
      ctx.fillText(displayName, cardWidth / 2, photoY + photoSize + 32);

      // Draw headline if available
      if (headline) {
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
        
        // Truncate headline
        let displayHeadline = headline;
        const maxHeadlineWidth = cardWidth - 120;
        while (ctx.measureText(displayHeadline).width > maxHeadlineWidth && displayHeadline.length > 0) {
          displayHeadline = displayHeadline.slice(0, -1);
        }
        if (displayHeadline !== headline) displayHeadline += '...';
        
        ctx.fillText(displayHeadline, cardWidth / 2, photoY + photoSize + 96);
      }

      // Generate QR code (scaled for 1080p)
      const qrSize = 360;
      const qrX = (cardWidth - qrSize) / 2;
      const qrY = headline ? photoY + photoSize + 160 : photoY + photoSize + 120;

      // Create QR code canvas with proper size
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, profileUrl, {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Draw white rounded background for QR with proper padding
      const qrPadding = 28;
      ctx.fillStyle = TEXT_WHITE;
      ctx.beginPath();
      ctx.roundRect(qrX - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 32);
      ctx.fill();

      // Draw QR code with gradient - improved pixel processing
      const qrCtx = qrCanvas.getContext('2d');
      if (qrCtx) {
        const qrImageData = qrCtx.getImageData(0, 0, qrSize, qrSize);
        const qrData = qrImageData.data;
        
        // Create a temp canvas for the gradient QR
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = qrSize;
        tempCanvas.height = qrSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Fill with white background first
          tempCtx.fillStyle = TEXT_WHITE;
          tempCtx.fillRect(0, 0, qrSize, qrSize);
          
          // Create gradient for dark pixels
          const qrGradient = tempCtx.createLinearGradient(0, 0, qrSize, qrSize);
          qrGradient.addColorStop(0, BRAND_GRADIENT_START);
          qrGradient.addColorStop(1, BRAND_GRADIENT_END);
          tempCtx.fillStyle = qrGradient;
          
          // Draw dark pixels with gradient
          for (let y = 0; y < qrSize; y++) {
            for (let x = 0; x < qrSize; x++) {
              const i = (y * qrSize + x) * 4;
              // Check if pixel is dark (QR code module)
              if (qrData[i] < 128) {
                tempCtx.fillRect(x, y, 1, 1);
              }
            }
          }
          
          // Draw the processed QR onto main canvas
          ctx.drawImage(tempCanvas, qrX, qrY);
        }
      }

      // Draw "Scan to connect" text
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Scan to connect', cardWidth / 2, qrY + qrSize + qrPadding + 40);

      // Draw PocketCV logo at bottom
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          // Calculate logo dimensions (maintain aspect ratio, max width 240px for 1080p)
          const maxLogoWidth = 240;
          const logoAspect = logoImg.width / logoImg.height;
          const logoWidth = Math.min(maxLogoWidth, logoImg.width);
          const logoHeight = logoWidth / logoAspect;
          const logoX = (cardWidth - logoWidth) / 2;
          const logoY = cardHeight - logoHeight - 40;
          
          ctx.globalAlpha = 0.7;
          ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          ctx.globalAlpha = 1.0;
          resolve();
        };
        logoImg.onerror = () => {
          // Fallback to text if logo fails
          ctx.fillStyle = TEXT_MUTED;
          ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillText('pocketcv.pt', cardWidth / 2, cardHeight - 48);
          resolve();
        };
        logoImg.src = '/lovable-uploads/pocketcv-logo-white-slogan.png';
      });

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setCardDataUrl(dataUrl);
      setShowCard(true);
      setIsGenerating(false);

    } catch (error) {
      console.error('Error generating share card:', error);
      setIsGenerating(false);
      toast({
        title: 'Error generating card',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && cardDataUrl) {
        // Convert data URL to blob for sharing
        const response = await fetch(cardDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${profileName.replace(/\s+/g, '-').toLowerCase()}-pocketcv.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `${profileName}'s PocketCV`,
          text: `Connect with ${profileName}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${profileName}'s Profile`,
          text: `Check out ${profileName}'s profile`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: 'Link copied!',
          description: 'Share your profile link',
        });
      }
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  const downloadCard = () => {
    if (!cardDataUrl) return;
    
    const link = document.createElement('a');
    link.href = cardDataUrl;
    link.download = `${profileName.replace(/\s+/g, '-').toLowerCase()}-pocketcv-card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Card downloaded!',
      description: 'Share it on social media or messaging apps',
    });
  };

  const generateWallpaper = async () => {
    if (isGeneratingWallpaper) return;
    
    try {
      setIsGeneratingWallpaper(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Phone wallpaper dimensions (1080x2340 for modern phones - 9:19.5 ratio)
      const wallpaperWidth = 1080;
      const wallpaperHeight = 2340;
      canvas.width = wallpaperWidth;
      canvas.height = wallpaperHeight;

      // Draw gradient background (purple to dark)
      const bgGradient = ctx.createLinearGradient(0, 0, wallpaperWidth, wallpaperHeight);
      bgGradient.addColorStop(0, '#7C3AED');    // Purple
      bgGradient.addColorStop(0.4, '#6D28D9');  // Darker purple
      bgGradient.addColorStop(1, '#0f0f1a');    // Near black
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, wallpaperWidth, wallpaperHeight);

      // Add decorative blur circles
      const drawBlurCircle = (x: number, y: number, radius: number, color: string, alpha: number) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Top-right pink blur
      drawBlurCircle(wallpaperWidth * 0.85, wallpaperHeight * 0.08, 300, '#ff5757', 0.4);
      // Left purple blur
      drawBlurCircle(wallpaperWidth * 0.1, wallpaperHeight * 0.3, 350, '#8c52ff', 0.3);
      // Bottom-right subtle blur
      drawBlurCircle(wallpaperWidth * 0.9, wallpaperHeight * 0.85, 400, '#6D28D9', 0.25);

      // Card dimensions and position (centered, slightly above middle)
      const cardScale = 0.82;
      const cardWidth = 810 * cardScale;
      const cardHeight = 1080 * cardScale;
      const cardX = (wallpaperWidth - cardWidth) / 2;
      const cardY = (wallpaperHeight - cardHeight) / 2 - 120;

      // Draw card background with shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = CARD_BG;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24 * cardScale);
      ctx.fill();
      ctx.restore();

      // Draw gradient accent bar at top of card
      const accentGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY);
      accentGradient.addColorStop(0, BRAND_GRADIENT_START);
      accentGradient.addColorStop(1, BRAND_GRADIENT_END);
      ctx.fillStyle = accentGradient;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, 12 * cardScale, [24 * cardScale, 24 * cardScale, 0, 0]);
      ctx.fill();

      // Profile photo section
      const photoSize = 160 * cardScale;
      const photoX = cardX + (cardWidth - photoSize) / 2;
      const photoY = cardY + 80 * cardScale;

      // Draw photo ring with gradient
      const ringGradient = ctx.createLinearGradient(
        photoX - 4, photoY - 4, 
        photoX + photoSize + 4, photoY + photoSize + 4
      );
      ringGradient.addColorStop(0, BRAND_GRADIENT_START);
      ringGradient.addColorStop(1, BRAND_GRADIENT_END);
      
      ctx.fillStyle = ringGradient;
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 4 * cardScale, 0, 2 * Math.PI);
      ctx.fill();

      // Draw profile photo or placeholder
      const drawWallpaperPhoto = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        
        const placeholderGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
        placeholderGradient.addColorStop(0, '#2a2f35');
        placeholderGradient.addColorStop(1, '#1a1f25');
        ctx.fillStyle = placeholderGradient;
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
        
        const initials = profileName
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        ctx.fillStyle = TEXT_WHITE;
        ctx.font = `bold ${56 * cardScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
        
        ctx.restore();
      };

      if (profilePhoto) {
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
          img.onerror = () => {
            drawWallpaperPhoto();
            resolve();
          };
          img.src = profilePhoto;
        });
      } else {
        drawWallpaperPhoto();
      }

      // Draw name
      ctx.fillStyle = TEXT_WHITE;
      ctx.font = `bold ${48 * cardScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const maxNameWidth = cardWidth - 80 * cardScale;
      let displayName = profileName;
      while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      if (displayName !== profileName) displayName += '...';
      
      ctx.fillText(displayName, cardX + cardWidth / 2, photoY + photoSize + 32 * cardScale);

      // Draw headline
      if (headline) {
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = `${28 * cardScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
        
        let displayHeadline = headline;
        const maxHeadlineWidth = cardWidth - 120 * cardScale;
        while (ctx.measureText(displayHeadline).width > maxHeadlineWidth && displayHeadline.length > 0) {
          displayHeadline = displayHeadline.slice(0, -1);
        }
        if (displayHeadline !== headline) displayHeadline += '...';
        
        ctx.fillText(displayHeadline, cardX + cardWidth / 2, photoY + photoSize + 96 * cardScale);
      }

      // Generate QR code
      const qrSize = 360 * cardScale;
      const qrX = cardX + (cardWidth - qrSize) / 2;
      const qrY = headline 
        ? photoY + photoSize + 160 * cardScale 
        : photoY + photoSize + 120 * cardScale;

      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, profileUrl, {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Draw white rounded background for QR
      const qrPadding = 28 * cardScale;
      ctx.fillStyle = TEXT_WHITE;
      ctx.beginPath();
      ctx.roundRect(qrX - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 32 * cardScale);
      ctx.fill();

      // Draw QR code with gradient
      const qrCtx = qrCanvas.getContext('2d');
      if (qrCtx) {
        const qrImageData = qrCtx.getImageData(0, 0, qrSize, qrSize);
        const qrData = qrImageData.data;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = qrSize;
        tempCanvas.height = qrSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.fillStyle = TEXT_WHITE;
          tempCtx.fillRect(0, 0, qrSize, qrSize);
          
          const qrGradient = tempCtx.createLinearGradient(0, 0, qrSize, qrSize);
          qrGradient.addColorStop(0, BRAND_GRADIENT_START);
          qrGradient.addColorStop(1, BRAND_GRADIENT_END);
          tempCtx.fillStyle = qrGradient;
          
          for (let y = 0; y < qrSize; y++) {
            for (let x = 0; x < qrSize; x++) {
              const i = (y * qrSize + x) * 4;
              if (qrData[i] < 128) {
                tempCtx.fillRect(x, y, 1, 1);
              }
            }
          }
          
          ctx.drawImage(tempCanvas, qrX, qrY);
        }
      }

      // Draw "Scan to connect" text
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = `${26 * cardScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText('Scan to connect', cardX + cardWidth / 2, qrY + qrSize + qrPadding + 40 * cardScale);

      // Draw PocketCV logo at bottom of card
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          const maxLogoWidth = 240 * cardScale;
          const logoAspect = logoImg.width / logoImg.height;
          const logoWidth = Math.min(maxLogoWidth, logoImg.width * cardScale);
          const logoHeight = logoWidth / logoAspect;
          const logoX = cardX + (cardWidth - logoWidth) / 2;
          const logoY = cardY + cardHeight - logoHeight - 40 * cardScale;
          
          ctx.globalAlpha = 0.7;
          ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          ctx.globalAlpha = 1.0;
          resolve();
        };
        logoImg.onerror = () => {
          ctx.fillStyle = TEXT_MUTED;
          ctx.font = `${24 * cardScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillText('pocketcv.pt', cardX + cardWidth / 2, cardY + cardHeight - 48 * cardScale);
          resolve();
        };
        logoImg.src = '/lovable-uploads/pocketcv-logo-white-slogan.png';
      });

      // Add small PocketCV branding at bottom of wallpaper
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = TEXT_WHITE;
      ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('pocketcv.pt', wallpaperWidth / 2, wallpaperHeight - 80);
      ctx.globalAlpha = 1.0;

      // Download the wallpaper
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${profileName.replace(/\s+/g, '-').toLowerCase()}-pocketcv-wallpaper.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Wallpaper downloaded!',
        description: 'Set it as your phone background',
      });

      setIsGeneratingWallpaper(false);

    } catch (error) {
      console.error('Error generating wallpaper:', error);
      setIsGeneratingWallpaper(false);
      toast({
        title: 'Error generating wallpaper',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Auto-generate on mount
    generateShareCard();
  }, [profileUrl, profileName, profilePhoto]);

  return (
    <div className="flex flex-col items-center">
      {isGenerating ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : showCard && cardDataUrl ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={cardDataUrl} 
              alt={`${profileName}'s share card`}
              className="w-full max-w-[280px]"
            />
          </div>
          
          <div className="flex flex-col gap-2 w-full max-w-[280px]">
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                size="sm"
                onClick={downloadCard}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50" 
              size="sm"
              onClick={generateWallpaper}
              disabled={isGeneratingWallpaper}
            >
              {isGeneratingWallpaper ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              {isGeneratingWallpaper ? 'Generating...' : 'Phone Wallpaper'}
            </Button>
          </div>
        </div>
      ) : null}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ProfileShareCard;
