import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileQRCode from "./ProfileQRCode";
import ProfileShareCard from "./ProfileShareCard";
import { QrCode, IdCard } from "lucide-react";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileUrl: string;
  profileName: string;
  profilePhoto?: string | null;
  headline?: string | null;
  trigger?: React.ReactNode;
  title?: string;
}

const QRCodeDialog = ({
  open,
  onOpenChange,
  profileUrl,
  profileName,
  profilePhoto,
  headline,
  trigger,
  title = "Share Profile"
}: QRCodeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
            <ProfileShareCard
              profileUrl={profileUrl}
              profileName={profileName}
              profilePhoto={profilePhoto}
              headline={headline}
            />
          </TabsContent>
          
          <TabsContent value="qr" className="mt-0">
            <ProfileQRCode
              profileUrl={profileUrl}
              profileName={profileName}
              profilePhoto={profilePhoto}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
