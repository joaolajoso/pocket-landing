
import { Link } from "react-router-dom";
import { Eye, Share2, PlusCircle, User, LinkIcon, Mail, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LinkCard, { LinkType } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface OverviewTabProps {
  userData: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  };
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string) => void;
  onDeleteLink: (linkId: string) => void;
}

const OverviewTab = ({ userData, links, onOpenLinkEditor, onDeleteLink }: OverviewTabProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: userData.name,
    bio: userData.bio,
    username: userData.username,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }, 1000);
  };

  const handleCopyProfileLink = () => {
    const profileUrl = `${window.location.origin}/u/${userData.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copied",
      description: "Your profile link has been copied to clipboard",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userData.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Manage your PocketCV profile and links</p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="/preview">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.profileViews}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Link Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <Progress value={80} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions & Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>
              Manage your professional links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {links.length > 0 ? (
              links.slice(0, 3).map(link => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={onOpenLinkEditor}
                  onDelete={onDeleteLink}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No links added yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => onOpenLinkEditor()} 
              variant="outline" 
              className="w-full"
            >
              View All Links
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your PocketCV profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => onOpenLinkEditor()}>
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
                
                <form onSubmit={handleUpdateProfile} className="space-y-6 py-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                        <AvatarFallback>
                          {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        variant="secondary"
                        type="button"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileFormData.name}
                      onChange={handleProfileChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                        {window.location.host}/u/
                      </span>
                      <Input
                        id="username"
                        name="username"
                        value={profileFormData.username}
                        onChange={handleProfileChange}
                        className="rounded-l-none"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileFormData.bio}
                      onChange={handleProfileChange}
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      </div>
      
      {/* Completion Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Take these steps to get the most out of your PocketCV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Add a profile picture</h4>
                  <p className="text-sm text-muted-foreground">Help others recognize you</p>
                </div>
              </div>
              <Button size="sm">Upload</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Add more links</h4>
                  <p className="text-sm text-muted-foreground">Connect all your professional profiles</p>
                </div>
              </div>
              <Button size="sm" onClick={() => onOpenLinkEditor()}>Add Link</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Verify your email</h4>
                  <p className="text-sm text-muted-foreground">Confirm your email address</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Resend</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
