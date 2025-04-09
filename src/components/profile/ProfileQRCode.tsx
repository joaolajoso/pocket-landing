
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ProfileQRCodeProps {
  profileUrl: string;
  profileName: string;
}

const ProfileQRCode = ({ profileUrl, profileName }: ProfileQRCodeProps) => {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0ea5e9',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error generating QR code',
        description: 'Please try again later',
        variant: 'destructive',
      });
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

  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${profileName.replace(/\s+/g, '-').toLowerCase()}-profile-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6">
      {!showQR ? (
        <Button 
          variant="outline" 
          className="gap-2 w-full" 
          onClick={generateQRCode}
        >
          <QrCode className="h-4 w-4" />
          Generate QR Code
        </Button>
      ) : (
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-3 bg-white rounded-lg shadow-sm">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${profileName}'s profile`}
                  className="w-[180px] h-[180px]"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Scan to view this profile
              </p>
              <div className="flex gap-2 w-full">
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
                  onClick={downloadQRCode}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileQRCode;
