import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit3, Eye, PlusCircle, Share2, QrCode, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserProfileForm } from "./UserProfileForm";
import { useToast } from "@/hooks/use-toast";
import { getProfileUrl } from "@/lib/supabase";
import { useState } from "react";
import QRCodeDialog from "@/components/profile/QRCodeDialog";

interface QuickActionsProps {
  userData: {
    name: string;
    bio: string;
    username: string;
    avatarUrl: string;
    headline?: string;
  };
  onEditProfile: () => void;
  onOpenLinkEditor: () => void;
  onRefreshMetrics?: () => void;
}

const QuickActions = ({ userData, onEditProfile, onOpenLinkEditor, onRefreshMetrics }: QuickActionsProps) => {
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

  const handleViewPublicProfile = () => {
    if (!userData.username) {
      toast({
        title: "Username not set",
        description: "Please set a username in your profile settings first",
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(userData.username);
    window.open(profileUrl, '_blank');
  };

  // Add a refresh button option
  const handleRefreshMetrics = () => {
    if (onRefreshMetrics) {
      onRefreshMetrics();
      toast({
        title: "Metrics refreshed",
        description: "Your profile metrics have been updated"
      });
    }
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
        
        <Button 
          className="w-full justify-start" 
          variant="outline" 
          onClick={handleViewPublicProfile}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Public Profile
        </Button>
        
        <Button className="w-full justify-start" variant="outline" onClick={handleCopyProfileLink}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
        
        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          profileUrl={`${getProfileUrl(userData.username)}?source=qr`}
          profileName={userData.name || userData.username}
          profilePhoto={userData.avatarUrl}
          headline={userData.headline}
          title="Share Profile"
          trigger={
            <Button className="w-full justify-start" variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          }
        />
        
        {onRefreshMetrics && (
          <Button className="w-full justify-start" variant="outline" onClick={handleRefreshMetrics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Metrics
          </Button>
        )}
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full justify-start" variant="outline" onClick={onEditProfile}>
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
            
            <UserProfileForm userData={userData} onClose={() => {}} />
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
