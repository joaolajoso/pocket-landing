
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit3, Eye, PlusCircle, Share2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserProfileForm } from "./UserProfileForm";
import { useToast } from "@/hooks/use-toast";

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

  const handleCopyProfileLink = () => {
    const profileUrl = `${window.location.origin}/u/${userData.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copied",
      description: "Your profile link has been copied to clipboard",
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
          <Link to="/preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview Profile
          </Link>
        </Button>
        
        <Button className="w-full justify-start" variant="outline" onClick={handleCopyProfileLink}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
        
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
