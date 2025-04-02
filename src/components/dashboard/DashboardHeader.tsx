
import { Link } from "react-router-dom";
import { Bell, HelpCircle, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  userData: {
    name: string;
    email: string;
    avatarUrl: string;
  };
}

const DashboardHeader = ({ userData }: DashboardHeaderProps) => {
  const { toast } = useToast();

  const handleSignOut = () => {
    // In a real app, this would clear auth tokens/sessions
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    window.location.href = '/';
  };

  return (
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
  );
};

export default DashboardHeader;
