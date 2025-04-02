
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  Eye, 
  Share2, 
  LogOut, 
  Settings,
  Edit3,
  User,
  LayoutDashboard,
  Link as LinkIcon,
  Image,
  Palette,
  BarChart,
  QrCode,
  Bell,
  Mail,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LinkCard, { LinkType } from "@/components/LinkCard";
import LinkEditor from "@/components/LinkEditor";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { toast } = useToast();
  
  // Mock user data
  const [userData, setUserData] = useState({
    id: "user-1",
    name: "Alex Johnson",
    bio: "Product Designer & Developer",
    email: "alex@example.com",
    avatarUrl: "",
    username: "alexjohnson",
    profileViews: 246,
    totalClicks: 124,
  });
  
  // Mock links data
  const [links, setLinks] = useState<LinkType[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
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
          title: "LinkedIn Profile",
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

  // Mock analytics data
  const mockAnalyticsData = {
    weeklyViews: [24, 32, 45, 12, 67, 45, 32],
    topLinks: [
      { name: "LinkedIn", clicks: 68 },
      { name: "Resume", clicks: 42 },
      { name: "Portfolio", clicks: 14 }
    ],
    referrers: [
      { name: "Direct", count: 142 },
      { name: "LinkedIn", count: 67 },
      { name: "Instagram", count: 37 }
    ]
  };

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
    window.location.href = '/';
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
      {/* Dashboard Header/Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center text-xl font-bold">
              <span className="text-primary">Pocket</span>CV
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                  <AvatarFallback>
                    {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col h-full">
                  <div className="py-6 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                        <AvatarFallback>
                          {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{userData.name}</h3>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 py-6">
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/support">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t">
                    <div className="text-xs text-muted-foreground text-center">
                      <p>PocketCV © {new Date().getFullYear()}</p>
                      <p className="mt-1">Version 1.0.0</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-64 shrink-0 border-r flex-col">
          <div className="py-6 px-4 flex-1">
            <nav className="space-y-1">
              <Button 
                variant={activeTab === "overview" ? "secondary" : "ghost"} 
                className="w-full justify-start mb-1"
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </Button>
              
              <Button 
                variant={activeTab === "links" ? "secondary" : "ghost"} 
                className="w-full justify-start mb-1"
                onClick={() => setActiveTab("links")}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Links
              </Button>
              
              <Button 
                variant={activeTab === "appearance" ? "secondary" : "ghost"} 
                className="w-full justify-start mb-1"
                onClick={() => setActiveTab("appearance")}
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              
              <Button 
                variant={activeTab === "analytics" ? "secondary" : "ghost"} 
                className="w-full justify-start mb-1"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              
              <Button 
                variant={activeTab === "settings" ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <div className="bg-secondary/80 rounded-md p-4 text-center">
              <QrCode className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h4 className="text-sm font-medium">Share your profile</h4>
              <p className="text-xs text-muted-foreground mb-3">Scan or share your PocketCV</p>
              <Button size="sm" className="w-full" onClick={handleCopyProfileLink}>
                Copy Link
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-b sticky top-16 bg-background z-30">
          <ScrollArea className="px-4">
            <div className="flex items-center gap-4 py-2">
              <Button 
                variant={activeTab === "overview" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </Button>
              
              <Button 
                variant={activeTab === "links" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("links")}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Links
              </Button>
              
              <Button 
                variant={activeTab === "appearance" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("appearance")}
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              
              <Button 
                variant={activeTab === "analytics" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              
              <Button 
                variant={activeTab === "settings" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </ScrollArea>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 py-8 px-4 md:px-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
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
                          onEdit={handleOpenLinkEditor}
                          onDelete={handleDeleteLink}
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
                      onClick={() => setActiveTab("links")} 
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
                    <Button className="w-full justify-start" variant="outline" onClick={() => handleOpenLinkEditor()}>
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
                      <Button size="sm" onClick={() => handleOpenLinkEditor()}>Add Link</Button>
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
          )}
          
          {/* Links Tab */}
          {activeTab === "links" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Manage Links</h1>
                  <p className="text-muted-foreground">Add and organize your professional links</p>
                </div>
                
                <Button onClick={() => handleOpenLinkEditor()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Link
                </Button>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  {links.length > 0 ? (
                    <div className="space-y-3">
                      {links.map(link => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          onEdit={handleOpenLinkEditor}
                          onDelete={handleDeleteLink}
                        />
                      ))}
                    </div>
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Link Templates</CardTitle>
                  <CardDescription>
                    Quick-add common professional links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => handleOpenLinkEditor()}>
                      <User className="h-8 w-8 mb-2" />
                      <span className="font-medium">LinkedIn</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => handleOpenLinkEditor()}>
                      <Image className="h-8 w-8 mb-2" />
                      <span className="font-medium">Portfolio</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => handleOpenLinkEditor()}>
                      <Mail className="h-8 w-8 mb-2" />
                      <span className="font-medium">Contact Email</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Appearance</h1>
                <p className="text-muted-foreground">Customize how your profile looks</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Profile Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center py-8">
                    <div className="w-72 h-[500px] border rounded-xl shadow-sm bg-background overflow-hidden">
                      <div className="p-4 flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                          <AvatarFallback className="text-xl">
                            {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{userData.name}</h2>
                        <p className="text-sm text-center text-muted-foreground mt-1">{userData.bio}</p>
                        
                        <div className="w-full mt-8 space-y-3">
                          {links.map(link => (
                            <div key={link.id} className="w-full p-3 border rounded-md flex items-center gap-3 hover:bg-muted/50 transition-colors">
                              {link.icon}
                              <span>{link.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button asChild>
                      <Link to="/preview">Open Full Preview</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                          <div className="h-12 bg-white rounded mb-2"></div>
                          <p className="text-xs font-medium text-center">Light</p>
                        </div>
                        <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                          <div className="h-12 bg-zinc-900 rounded mb-2"></div>
                          <p className="text-xs font-medium text-center">Dark</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Colors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Background Color</Label>
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            <div className="h-6 w-6 rounded-full bg-purple-500 cursor-pointer ring-2 ring-offset-2 ring-purple-500"></div>
                            <div className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer"></div>
                            <div className="h-6 w-6 rounded-full bg-green-500 cursor-pointer"></div>
                            <div className="h-6 w-6 rounded-full bg-yellow-500 cursor-pointer"></div>
                            <div className="h-6 w-6 rounded-full bg-red-500 cursor-pointer"></div>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Button Color</Label>
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            <div className="h-6 w-6 rounded-full bg-purple-500 cursor-pointer ring-2 ring-offset-2 ring-purple-500"></div>
                            <div className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer"></div>
                            <div className="h-6 w-6 rounded-full bg-green-500 cursor-pointer"></div>
                            <div className="h-6 w-6 rounded-full bg-yellow-500 cursor-pointer"></div>
                            <div className="h-6 w-6 rounded-full bg-red-500 cursor-pointer"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Layout</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Font</Label>
                          <select className="w-full mt-2 p-2 border rounded-md">
                            <option value="inter">Inter (Default)</option>
                            <option value="roboto">Roboto</option>
                            <option value="poppins">Poppins</option>
                            <option value="opensans">Open Sans</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label>Button Style</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                              <div className="h-8 border rounded-md mb-1"></div>
                              <p className="text-xs font-medium text-center">Rounded</p>
                            </div>
                            <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                              <div className="h-8 border rounded-sm mb-1"></div>
                              <p className="text-xs font-medium text-center">Square</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Track your profile performance</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Profile Views</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {/* Placeholder for chart */}
                    <div className="h-full border-2 rounded-md border-dashed flex items-center justify-center">
                      <p className="text-muted-foreground">Weekly views chart will appear here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalyticsData.topLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <LinkIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{link.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold">{link.clicks}</span>
                            <span className="text-muted-foreground ml-1">clicks</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Referrers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalyticsData.referrers.map((referrer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{referrer.name}</span>
                          <div className="flex items-center">
                            <span className="font-bold">{referrer.count}</span>
                            <span className="text-muted-foreground ml-1">visits</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Visitor Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    {/* Placeholder for map */}
                    <div className="h-full border-2 rounded-md border-dashed flex items-center justify-center">
                      <p className="text-muted-foreground">Location map will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="settings-name">Full Name</Label>
                      <Input id="settings-name" value={userData.name} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="settings-email">Email Address</Label>
                      <Input id="settings-email" type="email" value={userData.email} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="settings-username">Username</Label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                          {window.location.host}/u/
                        </span>
                        <Input
                          id="settings-username"
                          className="rounded-l-none"
                          value={userData.username}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <Button>Update Password</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Be careful with these actions, they cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
                    <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      
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

// Helper component for mobile scroll area
const ScrollArea = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`overflow-auto flex w-full ${className || ''}`}>
      {children}
    </div>
  );
};

export default Dashboard;
