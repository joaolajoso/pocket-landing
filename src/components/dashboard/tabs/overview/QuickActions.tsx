
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit3, Eye, PlusCircle, Share2, QrCode } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserProfileForm } from "./UserProfileForm";
import { useToast } from "@/hooks/use-toast";
import { getProfileUrl } from "@/lib/supabase";
import { useState } from "react";
import ProfileQRCode from "@/components/profile/ProfileQRCode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuickActionsProps {
  userData: {
    name: string;
    bio: string;
    username: string;
    avatarUrl: string;
  };
  onOpenLinkEditor: () => void;
}

const QuickActions = ({ userData, onOpenLinkEditor }: QuickActionsProps) => {
  const { toast } = useToast();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const handleCopyProfileLink = () => {
    if (!userData.username) {
      toast({
        title: "Username not set",
        description: "Please set a username in your profile settings first",
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(userData.username);
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copied",
      description: `Your profile link has been copied to clipboard: ${profileUrl}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Manage your PocketCV profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full justify-start" variant="outline" onClick={onOpenLinkEditor}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Link
        </Button>
        
        <Button className="w-full justify-start" variant="outline" asChild>
          <Link to={`/u/${userData.username}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            View Public Profile
          </Link>
        </Button>
        
        <Button className="w-full justify-start" variant="outline" onClick={handleCopyProfileLink}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
        
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Profile QR Code</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <ProfileQRCode 
                profileUrl={`${getProfileUrl(userData.username)}?source=qr`} 
                profileName={userData.name || userData.username} 
              />
            </div>
          </DialogContent>
        </Dialog>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here
              </SheetDescription>
            </SheetHeader>
            
            <UserProfileForm userData={userData} />
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
