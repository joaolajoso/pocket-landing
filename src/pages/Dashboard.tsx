
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Eye, 
  Share2, 
  LogOut, 
  Settings,
  Edit3,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LinkCard, { LinkType } from "@/components/LinkCard";
import LinkEditor from "@/components/LinkEditor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock user data
  const [userData, setUserData] = useState({
    id: "user-1",
    name: "Alex Johnson",
    bio: "Product Designer & Developer",
    email: "alex@example.com",
    avatarUrl: "",
    username: "alexjohnson",
  });
  
  // Mock links data
  const [links, setLinks] = useState<LinkType[]>([]);
  
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<LinkType | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: userData.name,
    bio: userData.bio,
    username: userData.username,
  });

  // Load links on mount (mock data)
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setLinks([
        {
          id: "1",
          title: "My LinkedIn",
          url: "https://linkedin.com/in/alexjohnson",
          icon: <User className="h-4 w-4" />,
        },
        {
          id: "2",
          title: "Portfolio Website",
          url: "https://alexjohnson.design",
          icon: <User className="h-4 w-4" />,
        },
        {
          id: "3",
          title: "Resume/CV",
          url: "https://alexjohnson.design/resume.pdf",
          icon: <User className="h-4 w-4" />,
        },
      ]);
    }, 500);
  }, []);

  const handleOpenLinkEditor = (linkId?: string) => {
    if (linkId) {
      const linkToEdit = links.find(link => link.id === linkId);
      setCurrentEditingLink(linkToEdit);
    } else {
      setCurrentEditingLink(undefined);
    }
    setIsLinkEditorOpen(true);
  };

  const handleCloseLinkEditor = () => {
    setIsLinkEditorOpen(false);
    setCurrentEditingLink(undefined);
  };

  const handleSaveLink = (linkData: Omit<LinkType, "id"> & { id?: string }) => {
    if (linkData.id) {
      // Updating existing link
      setLinks(prevLinks => 
        prevLinks.map(link => 
          link.id === linkData.id ? { ...linkData, id: link.id } as LinkType : link
        )
      );
      toast({
        title: "Link updated",
        description: "Your link has been updated successfully",
      });
    } else {
      // Adding new link
      const newLink = {
        ...linkData,
        id: `link-${Date.now()}`,
      } as LinkType;
      
      setLinks(prevLinks => [...prevLinks, newLink]);
      toast({
        title: "Link added",
        description: "Your new link has been added successfully",
      });
    }
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
    toast({
      title: "Link deleted",
      description: "Your link has been removed",
    });
  };

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
      setUserData(prev => ({
        ...prev,
        name: profileFormData.name,
        bio: profileFormData.bio,
        username: profileFormData.username,
      }));
      
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }, 1000);
  };

  const handleSignOut = () => {
    // In a real app, this would clear auth tokens/sessions
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate('/');
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 mt-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar / Profile Card */}
            <div className="w-full lg:w-1/3">
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm sticky top-24">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                    <AvatarFallback>
                      {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  {userData.bio && (
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">{userData.bio}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium">Your profile URL</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCopyProfileLink}
                    >
                      Copy
                    </Button>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to="/preview">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Profile
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={handleCopyProfileLink}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Profile
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>
                          Make changes to your profile here. Click save when you're done.
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
                  
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main Content - Links Management */}
            <div className="w-full lg:w-2/3">
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Your Links</h1>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Your First Link</DialogTitle>
                        <DialogDescription>
                          Start by adding your most important professional link.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <Button
                          onClick={() => handleOpenLinkEditor()}
                          className="w-full justify-start"
                        >
                          <User className="mr-2 h-4 w-4" />
                          LinkedIn Profile
                        </Button>
                        
                        <Button
                          onClick={() => handleOpenLinkEditor()}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Resume / CV
                        </Button>
                        
                        <Button
                          onClick={() => handleOpenLinkEditor()}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Portfolio Website
                        </Button>
                        
                        <Button
                          onClick={() => handleOpenLinkEditor()}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Custom Link
                        </Button>
                      </div>
                      
                      <DialogFooter className="gap-2 sm:gap-0">
                        <DialogTrigger asChild>
                          <Button variant="secondary">Close</Button>
                        </DialogTrigger>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-3">
                  {links.length > 0 ? (
                    links.map(link => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onEdit={handleOpenLinkEditor}
                        onDelete={handleDeleteLink}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium mb-2">No links yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Add your first link to start building your profile
                      </p>
                      <Button onClick={() => handleOpenLinkEditor()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Your First Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <LinkEditor 
        isOpen={isLinkEditorOpen} 
        onClose={handleCloseLinkEditor}
        onSave={handleSaveLink}
        editingLink={currentEditingLink}
      />
      
      <Footer />
    </div>
  );
};

export default Dashboard;
